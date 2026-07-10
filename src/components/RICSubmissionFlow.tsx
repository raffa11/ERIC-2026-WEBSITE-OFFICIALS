import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { useAlert } from './AlertModal';
import { RIC_STAGES } from '../data';
import { RICSubmission } from '../types';
import { fetchRICSubmissions, syncRICToSheet, fetchActiveStage } from '../lib/ricSheet';
import {
  X, FileText, CheckCircle2, Lock, Upload, Send, Clock, Link2, Check
} from 'lucide-react';

interface RICSubmissionFlowProps {
  isOpen: boolean;
  onClose: () => void;
  registrationId: string;
  teamName: string;
  leaderEmail: string;
  divisionId: string;
}

function newSubmission(registrationId: string, teamName: string, leaderEmail: string, divisionId: string): RICSubmission {
  return {
    id: `ric-${registrationId}`,
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
}

export default function RICSubmissionFlow({
  isOpen, onClose, registrationId, teamName, leaderEmail, divisionId
}: RICSubmissionFlowProps) {
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const [submission, setSubmission] = useState<RICSubmission | null>(null);
  const [activeStage, setActiveStage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [submittedStages, setSubmittedStages] = useState<Set<number>>(new Set());

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

  const loadData = useCallback(async () => {
    if (!registrationId) return;
    setSyncing(true);
    try {
      const [stage, rows] = await Promise.all([
        fetchActiveStage(),
        fetchRICSubmissions(),
      ]);
      setActiveStage(stage);

      const submitted = new Set<number>();
      if (rows && Array.isArray(rows)) {
        for (const row of rows as any[]) {
          if (row.registrationId === registrationId && row.id !== '__config__') {
            const sIdx = (parseInt(row.stage) || 1) - 1;
            submitted.add(sIdx);
          }
        }
      }
      setSubmittedStages(submitted);
      setSubmission(newSubmission(registrationId, teamName, leaderEmail, divisionId));
    } catch (err) {
      console.error('[RIC] loadData error:', err);
      setSubmission(newSubmission(registrationId, teamName, leaderEmail, divisionId));
    } finally {
      setSyncing(false);
    }
  }, [registrationId, teamName, leaderEmail, divisionId]);

  useEffect(() => {
    if (!isOpen) return;
    loadData();
  }, [isOpen, loadData]);

  const safeSub = submission;

  const getStageStatus = (idx: number): 'past-submitted' | 'past-missing' | 'active' | 'future' => {
    const stageNum = idx + 1;
    if (submittedStages.has(idx)) return 'past-submitted';
    if (stageNum < activeStage) return 'past-missing';
    if (stageNum === activeStage) return 'active';
    return 'future';
  };

  const currentStageData = safeSub?.stages[activeStage - 1];

  const updateField = (field: string, value: any) => {
    if (!safeSub || !currentStageData) return;
    const updatedStages = [...safeSub.stages];
    updatedStages[activeStage - 1] = { ...currentStageData, [field]: value };
    setSubmission({ ...safeSub, stages: updatedStages, currentStage: activeStage - 1 });
  };

  const handleSubmit = async () => {
    if (!safeSub || !currentStageData) return;
    const stageIdx = activeStage - 1;

    if (stageIdx === 0 && !currentStageData.abstractFileUrl) {
      showAlert({ message: t('Please upload your abstract PDF file.', 'Mohon unggah file abstrak PDF Anda.'), type: 'error' });
      return;
    }
    if (stageIdx === 1 && (!currentStageData.proposalFileUrl || !currentStageData.videoLink)) {
      showAlert({ message: t('Please upload full proposal PDF and provide video link.', 'Mohon unggah proposal PDF dan tautan video.'), type: 'error' });
      return;
    }
    if (stageIdx === 2 && (!currentStageData.posterFileUrl || !currentStageData.pptFileUrl)) {
      showAlert({ message: t('Please upload both digital poster PDF and PPT file.', 'Mohon unggah poster digital PDF dan file PPT.'), type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedStages = [...safeSub.stages];
      updatedStages[stageIdx] = {
        ...currentStageData,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
      };

      const updated: RICSubmission = {
        ...safeSub,
        stages: updatedStages,
        currentStage: stageIdx,
      };

      setSubmission(updated);
      setSubmittedStages(prev => new Set(prev).add(stageIdx));

      const ok = await syncRICToSheet(updated, stageIdx);
      if (!ok) console.warn('[RIC] sync result false');

      setSuccessMsg(t('Submission sent!', 'Pengumpulan berhasil!'));
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      showAlert({ message: err.message || 'Submission failed', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!safeSub || !currentStageData) return null;

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

              <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-zinc-900 border border-white/5 hover:border-white/10 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer z-20">
                <X className="w-4 h-4" />
              </button>

              <div className="border-b border-white/5 pb-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="space-y-1 flex-1">
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
                  {syncing && (
                    <div className="animate-spin w-4 h-4 border-2 border-[#FFD700] border-t-transparent rounded-full shrink-0 mt-1" />
                  )}
                </div>
              </div>

              {/* Stage Cards */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[0, 1, 2].map((idx) => {
                  const status = getStageStatus(idx);
                  const s = RIC_STAGES[idx];
                  const isActive = status === 'active';

                  return (
                    <div
                      key={idx}
                      className={`relative p-4 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-zinc-900 border-[#FFD700]/40'
                          : status === 'future'
                            ? 'bg-zinc-950/50 border-white/5 opacity-60'
                            : 'bg-zinc-950 border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[8px] font-mono font-black tracking-widest ${isActive ? 'text-[#FFD700]' : 'text-zinc-500'}`}>
                          {t('STAGE', 'TAHAP')} {s.stage}
                        </span>
                        {status === 'past-submitted' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        {status === 'active' && <Clock className="w-3.5 h-3.5 text-[#FFD700]" />}
                        {status === 'future' && <Lock className="w-3.5 h-3.5 text-zinc-600" />}
                      </div>
                      <span className={`text-[10px] font-sans font-bold uppercase block leading-tight ${isActive ? 'text-white' : 'text-zinc-400'}`}>
                        {t(s.titleEn, s.titleId)}
                      </span>

                      {status === 'future' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 mt-2 rounded text-[7px] font-mono font-bold bg-zinc-800 text-zinc-500 border border-zinc-700">
                          {t('AVAILABLE SOON', 'SEGERA HADIR')}
                        </span>
                      )}
                      {status === 'past-submitted' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 mt-2 rounded text-[7px] font-mono font-bold bg-emerald-950/20 text-emerald-400 border border-emerald-500/20">
                          <Check className="w-2.5 h-2.5" />
                          {t('SUBMITTED', 'TERKIRIM')}
                        </span>
                      )}
                      {status === 'past-missing' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 mt-2 rounded text-[7px] font-mono font-bold bg-zinc-800 text-zinc-500 border border-zinc-700">
                          -
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Content Area */}
              <div className="space-y-5">
                {successMsg && (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-[11px] font-mono text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    {successMsg}
                  </div>
                )}

                {getStageStatus(activeStage - 1) === 'active' && (
                  <>
                    {/* Stage description */}
                    <div className="p-4 bg-zinc-900/30 border border-white/5 rounded-2xl">
                      <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                        {t(RIC_STAGES[activeStage - 1].descriptionEn, RIC_STAGES[activeStage - 1].descriptionId)}
                      </p>
                      <ul className="mt-2 space-y-1">
                        {RIC_STAGES[activeStage - 1].requirements.map((req, i) => (
                          <li key={i} className="text-[10px] font-mono text-zinc-500 flex items-center gap-1.5">
                            <span className="w-1 h-1 bg-[#FFD700] rounded-full shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Stage 1: Abstract */}
                    {activeStage === 1 && (
                      <FileUploadField
                        label={t('Abstract PDF', 'Abstrak PDF')}
                        fileName={currentStageData.abstractFileName || ''}
                        fileUrl={currentStageData.abstractFileUrl || ''}
                        onSelect={async (file) => {
                          try { const r = await processFile(file); updateField('abstractFileName', r.name); updateField('abstractFileUrl', r.url); }
                          catch (err: any) { showAlert({ message: err, type: 'error' }); }
                        }}
                        onClear={() => { updateField('abstractFileName', ''); updateField('abstractFileUrl', ''); }}
                        id="ric-abstract-file"
                      />
                    )}

                    {/* Stage 2: Proposal + Video */}
                    {activeStage === 2 && (
                      <div className="space-y-4">
                        <FileUploadField
                          label={t('Full Proposal PDF', 'Proposal Lengkap PDF')}
                          fileName={currentStageData.proposalFileName || ''}
                          fileUrl={currentStageData.proposalFileUrl || ''}
                          onSelect={async (file) => {
                            try { const r = await processFile(file); updateField('proposalFileName', r.name); updateField('proposalFileUrl', r.url); }
                            catch (err: any) { showAlert({ message: err, type: 'error' }); }
                          }}
                          onClear={() => { updateField('proposalFileName', ''); updateField('proposalFileUrl', ''); }}
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
                              onChange={(e) => updateField('videoLink', e.target.value)}
                              className="w-full bg-zinc-900 border border-white/5 focus:border-[#FFD700] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Stage 3: Poster + PPT */}
                    {activeStage === 3 && (
                      <div className="space-y-4">
                        <FileUploadField
                          label={t('Digital Poster PDF', 'Poster Digital PDF')}
                          fileName={currentStageData.posterFileName || ''}
                          fileUrl={currentStageData.posterFileUrl || ''}
                          onSelect={async (file) => {
                            try { const r = await processFile(file); updateField('posterFileName', r.name); updateField('posterFileUrl', r.url); }
                            catch (err: any) { showAlert({ message: err, type: 'error' }); }
                          }}
                          onClear={() => { updateField('posterFileName', ''); updateField('posterFileUrl', ''); }}
                          id="ric-poster-file"
                        />
                        <FileUploadField
                          label={t('Presentation PPT / PDF', 'Presentasi PPT / PDF')}
                          fileName={currentStageData.pptFileName || ''}
                          fileUrl={currentStageData.pptFileUrl || ''}
                          onSelect={async (file) => {
                            try { const r = await processFile(file); updateField('pptFileName', r.name); updateField('pptFileUrl', r.url); }
                            catch (err: any) { showAlert({ message: err, type: 'error' }); }
                          }}
                          onClear={() => { updateField('pptFileName', ''); updateField('pptFileUrl', ''); }}
                          id="ric-ppt-file"
                        />
                      </div>
                    )}

                    {!submittedStages.has(activeStage - 1) && (
                      <div className="flex justify-end pt-4 border-t border-white/5">
                        <button
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className="px-8 py-3.5 bg-[#FFD700] text-black font-sans font-black text-xs tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.25)] hover:scale-101 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {isSubmitting ? (
                            <><Clock className="w-4 h-4 animate-spin" /><span>{t('SUBMITTING...', 'MENGUMPULKAN...')}</span></>
                          ) : (
                            <><Send className="w-4 h-4" /><span>{t(RIC_STAGES[activeStage - 1]?.submitLabelEn || 'SUBMIT', RIC_STAGES[activeStage - 1]?.submitLabelId || 'KUMPULKAN')}</span></>
                          )}
                        </button>
                      </div>
                    )}
                  </>
                )}

                {getStageStatus(activeStage - 1) === 'past-submitted' && (
                  <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-center space-y-1">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                    <p className="text-xs font-sans font-bold text-emerald-400">
                      {t('You have submitted this stage!', 'Anda telah mengumpulkan tahap ini!')}
                    </p>
                    <p className="text-[10px] font-mono text-zinc-500">
                      {t('Wait for the next stage to open.', 'Tunggu tahap berikutnya dibuka.')}
                    </p>
                  </div>
                )}

                {getStageStatus(activeStage - 1) === 'future' && (
                  <div className="p-6 text-center space-y-2">
                    <Lock className="w-8 h-8 text-zinc-600 mx-auto" />
                    <p className="text-sm font-sans font-bold text-zinc-400">
                      {t('This stage is not yet available.', 'Tahap ini belum tersedia.')}
                    </p>
                    <p className="text-[10px] font-mono text-zinc-600">
                      {t('Please complete the previous stage first.', 'Silakan selesaikan tahap sebelumnya terlebih dahulu.')}
                    </p>
                  </div>
                )}

                {getStageStatus(activeStage - 1) === 'past-missing' && (
                  <div className="p-6 text-center space-y-2">
                    <p className="text-sm font-sans font-bold text-zinc-500">
                      {t('This stage was not submitted.', 'Tahap ini tidak dikumpulkan.')}
                    </p>
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
