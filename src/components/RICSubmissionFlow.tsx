import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { useAlert } from './AlertModal';
import { RIC_STAGES } from '../data';
import { RICSubmission, RICStageSubmission } from '../types';
import { fetchRICSubmissions } from '../lib/ricSheet';
import { ricUpsertLocal, ricFetchAllLocal } from '../lib/ricStorage';
import {
  X, FileText, CheckCircle2, Lock, AlertCircle, Upload,
  ExternalLink, Send, ArrowRight, MessageCircle, Trophy, Check,
  Clock, ThumbsUp, ThumbsDown, Link2, File, RefreshCw
} from 'lucide-react';

interface RICSubmissionFlowProps {
  isOpen: boolean;
  onClose: () => void;
  submission: RICSubmission | null;
  registrationId: string;
  teamName: string;
  leaderEmail: string;
  divisionId: string;
  onSave: (submission: RICSubmission) => void;
}

function stageStatusBadge(status: string, t: (en: string, id: string) => string) {
  switch (status) {
    case 'locked':
      return { label: t('LOCKED', 'TERKUNCI'), cls: 'bg-zinc-800 text-zinc-500 border-zinc-700', icon: Lock };
    case 'pending':
      return { label: t('PENDING REVIEW', 'DALAM REVIEW'), cls: 'bg-amber-950/30 border-amber-500/30 text-amber-400', icon: Clock };
    case 'approved':
      return { label: t('APPROVED', 'DISETUJUI'), cls: 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400', icon: ThumbsUp };
    case 'rejected':
      return { label: t('REJECTED', 'DITOLAK'), cls: 'bg-red-950/30 border-red-500/30 text-red-400', icon: ThumbsDown };
    default:
      return { label: status, cls: 'bg-zinc-800 text-zinc-500 border-zinc-700', icon: Lock };
  }
}

export default function RICSubmissionFlow({
  isOpen, onClose, submission, registrationId, teamName, leaderEmail, divisionId, onSave
}: RICSubmissionFlowProps) {
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const [activeStage, setActiveStage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [syncingFromSheet, setSyncingFromSheet] = useState(false);

  const processFile = (file: File): Promise<{ name: string; url: string }> => {
    return new Promise((resolve, reject) => {
      if (file.size > 10 * 1024 * 1024) {
        reject(t('File size must be under 10MB!', 'Ukuran file harus di bawah 10MB!'));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => resolve({ name: file.name, url: e.target?.result as string });
      reader.onerror = () => reject('File read error');
      reader.readAsDataURL(file);
    });
  };

  // Fetch latest status from sheet
  const syncFromSheet = useCallback(async () => {
    if (!registrationId) return;
    setSyncingFromSheet(true);
    try {
      const result = await fetchRICSubmissions();
      const rows: any[] = result || [];
      console.log('[RIC syncFromSheet] rows from sheet:', rows.length);
      if (rows.length === 0) { console.log('[RIC] sheet returned 0 rows'); return; }

      const myRows = rows.filter((r: any) => r.registrationId === registrationId);
      console.log('[RIC syncFromSheet] myRows:', myRows.length);
      if (myRows.length === 0) return;

      const sheetRow = myRows[0];
      const local = await ricFetchAllLocal();
      const localIdx = local.findIndex(s => s.id === sheetRow.id);
      console.log('[RIC syncFromSheet] found in local:', localIdx, 'sheet id:', sheetRow.id);
      if (localIdx < 0) return;

      for (const row of myRows) {
        const stageIdx = (parseInt(row.stage) || 1) - 1;
        if (row.status && row.status !== 'locked' && local[localIdx].stages[stageIdx]) {
          console.log('[RIC syncFromSheet] update stage', stageIdx, '→', row.status);
          local[localIdx].stages[stageIdx] = {
            ...local[localIdx].stages[stageIdx],
            status: row.status,
            notes: row.notes || local[localIdx].stages[stageIdx].notes,
            reviewedAt: row.reviewedAt || local[localIdx].stages[stageIdx].reviewedAt,
            reviewedBy: row.reviewedBy || local[localIdx].stages[stageIdx].reviewedBy,
          };
        }
      }

      await ricUpsertLocal(local[localIdx]);
      onSave(local[localIdx]);
      console.log('[RIC] syncFromSheet done — status updated');
    } catch (err) {
      console.error('[RIC] syncFromSheet error:', err);
    } finally {
      setSyncingFromSheet(false);
    }
  }, [registrationId, onSave]);

  // Auto-fetch when modal opens
  useEffect(() => {
    if (!isOpen) return;
    syncFromSheet();
  }, [isOpen, syncFromSheet]);

  const safeSubmission: RICSubmission = submission || {
    id: `ric-${Date.now()}`,
    registrationId,
    teamName,
    leaderEmail,
    divisionId,
    stages: [
      { stage: 1, status: 'pending' },
      { stage: 2, status: 'locked' },
      { stage: 3, status: 'locked' },
    ],
    currentStage: 0,
    completed: false,
  };

  // Determine which stages are accessible
  const isStageAccessible = (idx: number): boolean => {
    if (idx === 0) return true; // Stage 1 always accessible for new
    const prev = safeSubmission.stages[idx - 1];
    return prev?.status === 'approved';
  };

  const currentStageData: RICStageSubmission = safeSubmission.stages[activeStage] || { stage: activeStage + 1, status: 'locked' };

  const handleSubmitStage = async () => {
    const stageIdx = activeStage;
    const stage = safeSubmission.stages[stageIdx];

    if (!stage) return;

    // Validate based on stage
    if (stageIdx === 0) {
      if (!stage.abstractFileUrl) {
        showAlert({ message: t('Please upload your abstract PDF file.', 'Mohon unggah file abstrak PDF Anda.'), type: 'error' });
        return;
      }
    } else if (stageIdx === 1) {
      if (!stage.proposalFileUrl || !stage.videoLink) {
        showAlert({ message: t('Please upload full proposal PDF and provide video link.', 'Mohon unggah proposal PDF dan tautan video.'), type: 'error' });
        return;
      }
    } else if (stageIdx === 2) {
      if (!stage.posterFileUrl || !stage.pptFileUrl) {
        showAlert({ message: t('Please upload both digital poster PDF and PPT file.', 'Mohon unggah poster digital PDF dan file PPT.'), type: 'error' });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const updatedStages = [...safeSubmission.stages];
      updatedStages[stageIdx] = {
        ...stage,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      };

      const updated: RICSubmission = {
        ...safeSubmission,
        stages: updatedStages,
        currentStage: stageIdx,
      };

      onSave(updated);
      setSuccessMsg(t('Submission sent! Waiting for admin review.', 'Pengumpulan berhasil! Menunggu review admin.'));
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      showAlert({ message: err.message || 'Submission failed', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStageField = (field: string, value: any) => {
    const updatedStages = [...safeSubmission.stages];
    updatedStages[activeStage] = { ...updatedStages[activeStage], [field]: value };
    onSave({ ...safeSubmission, stages: updatedStages, currentStage: activeStage });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md overflow-y-auto">
          <div className="min-h-full sm:min-h-screen flex items-center justify-center px-4 py-6 sm:py-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-zinc-950 border border-white/10 rounded-3xl p-5 sm:p-6 md:p-8 shadow-[0_35px_80px_rgba(0,0,0,0.95)] z-10"
            >
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:25px_25px] pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FFD700] to-[#0047AB]" />

              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-zinc-900 border border-white/5 hover:border-white/10 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer z-20"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="border-b border-white/5 pb-4 mb-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-[#FFD700] uppercase tracking-[0.25em] font-black block">
                      {t('RESEARCH INNOVATION CHALLENGE', 'RESEARCH INNOVATION CHALLENGE')}
                    </span>
                    <h3 className="text-xl md:text-2xl font-sans font-black text-white uppercase tracking-tight">
                      {t('SUBMISSION PORTAL', 'PORTAL PENGUMPULAN')}
                    </h3>
                    <p className="text-[10px] font-mono text-zinc-500">
                      {teamName} — {t('Registration', 'Registrasi')}: {registrationId.slice(-8)}
                    </p>
                  </div>
                  <button
                    onClick={syncFromSheet}
                    disabled={syncingFromSheet}
                    className="p-2 bg-zinc-900 border border-white/5 hover:border-[#4D90FE]/30 text-zinc-400 hover:text-[#4D90FE] rounded-xl transition-all cursor-pointer disabled:opacity-50 shrink-0"
                    title={t('Sync from Sheet', 'Sinkron dari Sheet')}
                  >
                    <RefreshCw className={`w-4 h-4 ${syncingFromSheet ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Stage Selector Tabs */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {RIC_STAGES.map((s, idx) => {
                  const accessible = isStageAccessible(idx);
                  const st = safeSubmission.stages[idx];
                  const isActive = activeStage === idx;
                  const badge = st ? stageStatusBadge(st.status, t) : null;

                  return (
                    <button
                      key={s.stage}
                      onClick={() => { if (accessible) setActiveStage(idx); }}
                      disabled={!accessible}
                      className={`relative p-3 rounded-xl border text-left transition-all ${
                        isActive
                          ? 'bg-zinc-900 border-[#FFD700]/40 scale-102'
                          : accessible
                            ? 'bg-zinc-950 border-white/10 hover:border-white/20 cursor-pointer'
                            : 'bg-zinc-950/50 border-white/5 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[8px] font-mono font-black tracking-widest ${isActive ? 'text-[#FFD700]' : 'text-zinc-500'}`}>
                          {t('STAGE', 'TAHAP')} {s.stage}
                        </span>
                        {st && st.status !== 'locked' && !isActive && (
                          <div className="flex items-center gap-0.5">
                            {st.status === 'approved' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                            {st.status === 'pending' && <Clock className="w-3 h-3 text-amber-400" />}
                            {st.status === 'rejected' && <AlertCircle className="w-3 h-3 text-red-400" />}
                          </div>
                        )}
                      </div>
                      <span className={`text-[10px] font-sans font-bold uppercase block leading-tight ${isActive ? 'text-white' : 'text-zinc-400'}`}>
                        {t(s.titleEn, s.titleId)}
                      </span>
                      {badge && st && st.status !== 'locked' && (
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[7px] font-mono font-bold mt-1.5 border ${badge.cls}`}>
                          <badge.icon className="w-2.5 h-2.5" />
                          {badge.label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Stage Detail Content */}
              <div className="space-y-5">
                {successMsg && (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-[11px] font-mono text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    {successMsg}
                  </div>
                )}

                {currentStageData.status === 'approved' && (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-[11px] font-mono text-emerald-400">
                    <ThumbsUp className="w-4 h-4 shrink-0" />
                    {t('This stage has been approved! You can proceed to the next stage.', 'Tahap ini telah disetujui! Anda dapat melanjutkan ke tahap berikutnya.')}
                  </div>
                )}

                {currentStageData.status === 'rejected' && (
                  <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl space-y-1">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-red-400">
                      <ThumbsDown className="w-4 h-4 shrink-0" />
                      {t('This submission was not approved.', 'Pengumpulan ini tidak disetujui.')}
                    </div>
                    {currentStageData.notes && (
                      <p className="text-[10px] font-mono text-zinc-400 pl-6">
                        {t('Notes', 'Catatan')}: {currentStageData.notes}
                      </p>
                    )}
                    <p className="text-[10px] font-mono text-amber-400 pl-6">
                      {t('You may resubmit with corrections.', 'Anda dapat mengumpulkan ulang dengan perbaikan.')}
                    </p>
                  </div>
                )}

                {currentStageData.status === 'pending' && (
                  <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl flex items-center gap-2 text-[11px] font-mono text-amber-400">
                    <Clock className="w-4 h-4 shrink-0" />
                    {t('Your submission is being reviewed by the admin.', 'Pengumpulan Anda sedang direview oleh admin.')}
                  </div>
                )}

                {/* Stage 1: Abstract */}
                {activeStage === 0 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-zinc-900/30 border border-white/5 rounded-2xl">
                      <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                        {t(RIC_STAGES[0].descriptionEn, RIC_STAGES[0].descriptionId)}
                      </p>
                      <ul className="mt-2 space-y-1">
                        {RIC_STAGES[0].requirements.map((req, i) => (
                          <li key={i} className="text-[10px] font-mono text-zinc-500 flex items-center gap-1.5">
                            <span className="w-1 h-1 bg-[#FFD700] rounded-full" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <FileUploadField
                      label={t('Abstract PDF', 'Abstrak PDF')}
                      fileName={currentStageData.abstractFileName || ''}
                      fileUrl={currentStageData.abstractFileUrl || ''}
                      onSelect={async (file) => {
                        try {
                          const result = await processFile(file);
                          updateStageField('abstractFileName', result.name);
                          updateStageField('abstractFileUrl', result.url);
                        } catch (err: any) {
                          showAlert({ message: err, type: 'error' });
                        }
                      }}
                      onClear={() => {
                        updateStageField('abstractFileName', '');
                        updateStageField('abstractFileUrl', '');
                      }}
                      id="ric-abstract-file"
                    />
                  </div>
                )}

                {/* Stage 2: Full Proposal + Video */}
                {activeStage === 1 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-zinc-900/30 border border-white/5 rounded-2xl">
                      <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                        {t(RIC_STAGES[1].descriptionEn, RIC_STAGES[1].descriptionId)}
                      </p>
                      <ul className="mt-2 space-y-1">
                        {RIC_STAGES[1].requirements.map((req, i) => (
                          <li key={i} className="text-[10px] font-mono text-zinc-500 flex items-center gap-1.5">
                            <span className="w-1 h-1 bg-[#FFD700] rounded-full" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <FileUploadField
                      label={t('Full Proposal PDF', 'Proposal Lengkap PDF')}
                      fileName={currentStageData.proposalFileName || ''}
                      fileUrl={currentStageData.proposalFileUrl || ''}
                      onSelect={async (file) => {
                        try {
                          const result = await processFile(file);
                          updateStageField('proposalFileName', result.name);
                          updateStageField('proposalFileUrl', result.url);
                        } catch (err: any) {
                          showAlert({ message: err, type: 'error' });
                        }
                      }}
                      onClear={() => {
                        updateStageField('proposalFileName', '');
                        updateStageField('proposalFileUrl', '');
                      }}
                      id="ric-proposal-file"
                    />

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">
                        {t('Video Prototype Link', 'Tautan Video Prototipe')} <span className="text-[#FFD700]">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-zinc-500 shrink-0" />
                        <input
                          type="url"
                          placeholder="https://youtube.com/watch?v=... or https://drive.google.com/..."
                          value={currentStageData.videoLink || ''}
                          onChange={(e) => updateStageField('videoLink', e.target.value)}
                          className="w-full bg-zinc-900 border border-white/5 focus:border-[#FFD700] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Stage 3: Poster + PPT */}
                {activeStage === 2 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-zinc-900/30 border border-white/5 rounded-2xl">
                      <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                        {t(RIC_STAGES[2].descriptionEn, RIC_STAGES[2].descriptionId)}
                      </p>
                      <ul className="mt-2 space-y-1">
                        {RIC_STAGES[2].requirements.map((req, i) => (
                          <li key={i} className="text-[10px] font-mono text-zinc-500 flex items-center gap-1.5">
                            <span className="w-1 h-1 bg-[#FFD700] rounded-full" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <FileUploadField
                      label={t('Digital Poster PDF', 'Poster Digital PDF')}
                      fileName={currentStageData.posterFileName || ''}
                      fileUrl={currentStageData.posterFileUrl || ''}
                      onSelect={async (file) => {
                        try {
                          const result = await processFile(file);
                          updateStageField('posterFileName', result.name);
                          updateStageField('posterFileUrl', result.url);
                        } catch (err: any) {
                          showAlert({ message: err, type: 'error' });
                        }
                      }}
                      onClear={() => {
                        updateStageField('posterFileName', '');
                        updateStageField('posterFileUrl', '');
                      }}
                      id="ric-poster-file"
                    />

                    <FileUploadField
                      label={t('Presentation PPT / PDF', 'Presentasi PPT / PDF')}
                      fileName={currentStageData.pptFileName || ''}
                      fileUrl={currentStageData.pptFileUrl || ''}
                      onSelect={async (file) => {
                        try {
                          const result = await processFile(file);
                          updateStageField('pptFileName', result.name);
                          updateStageField('pptFileUrl', result.url);
                        } catch (err: any) {
                          showAlert({ message: err, type: 'error' });
                        }
                      }}
                      onClear={() => {
                        updateStageField('pptFileName', '');
                        updateStageField('pptFileUrl', '');
                      }}
                      id="ric-ppt-file"
                    />
                  </div>
                )}

                {/* Submit Button (show only if status is not 'approved' and not 'pending') */}
                {currentStageData.status !== 'approved' && (
                  <div className="flex justify-end pt-4 border-t border-white/5">
                    <button
                      onClick={handleSubmitStage}
                      disabled={isSubmitting}
                      className="px-8 py-3.5 bg-[#FFD700] text-black font-sans font-black text-xs tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.25)] hover:scale-101 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin" />
                          <span>{t('SUBMITTING...', 'MENGUMPULKAN...')}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>
                            {currentStageData.status === 'rejected'
                              ? t('RESUBMIT', 'KUMPULKAN ULANG')
                              : t(RIC_STAGES[activeStage]?.submitLabelEn || 'SUBMIT', RIC_STAGES[activeStage]?.submitLabelId || 'KUMPULKAN')}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

function FileUploadField({
  label, fileName, fileUrl, onSelect, onClear, id
}: {
  label: string; fileName: string; fileUrl: string;
  onSelect: (file: File) => void; onClear: () => void; id: string;
}) {
  const { t } = useLanguage();
  const [dragging, setDragging] = useState(false);

  return (
    <div className="space-y-1">
      <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">
        {label} <span className="text-[#FFD700]">*</span>
      </label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) onSelect(f); }}
        onClick={() => document.getElementById(id)?.click()}
        className={`border border-dashed rounded-xl p-3 text-center transition-all cursor-pointer ${
          dragging
            ? 'border-[#FFD700] bg-[#FFD700]/5 scale-[0.99]'
            : fileUrl
              ? 'border-amber-500/30 bg-amber-950/5'
              : 'border-white/10 hover:border-white/20 bg-zinc-950/40'
        }`}
      >
        <input type="file" id={id} className="hidden" accept=".pdf,.ppt,.pptx,image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) onSelect(f); }} />
        {fileUrl ? (
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[10px] font-mono text-white truncate max-w-[180px]">{fileName || t('File uploaded', 'File terunggah')}</span>
            </div>
            <button type="button" onClick={(e) => { e.stopPropagation(); onClear(); }} className="text-[9px] font-mono text-zinc-500 hover:text-red-400 uppercase">[x]</button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-1 text-zinc-500">
            <Upload className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[9.5px] font-mono uppercase">{t('UPLOAD FILE', 'UNGGAH FILE')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
