import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { useAlert } from './AlertModal';
import { RIC_STAGES } from '../data';
import { RICSubmission } from '../types';
import {
  FileText, CheckCircle2, X, ThumbsUp, ThumbsDown,
  ExternalLink, Search, Clock, AlertCircle, Download,
  Globe, RefreshCw
} from 'lucide-react';
import { getRICScriptUrl, setRICScriptUrl, fetchRICSubmissions } from '../lib/ricSheet';
import { ricUpsertLocal, ricFetchAllLocal } from '../lib/ricStorage';

interface RICAdminPanelProps {
  submissions: RICSubmission[];
  onUpdateSubmissions: (subs: RICSubmission[], stageIdx?: number, changedSubId?: string) => void;
}

export default function RICAdminPanel({ submissions, onUpdateSubmissions }: RICAdminPanelProps) {
  const { t } = useLanguage();
  const { showAlert, showConfirm } = useAlert();
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [reviewNotes, setReviewNotes] = useState('');
  const [activeReview, setActiveReview] = useState<{ sub: RICSubmission; stageIdx: number } | null>(null);
  const [ricScriptUrl, setRicScriptUrlState] = useState(getRICScriptUrl());
  const [syncing, setSyncing] = useState(false);

  const saveRICScriptUrl = (url: string) => {
    setRicScriptUrlState(url);
    setRICScriptUrl(url);
  };

  const mergeSheetData = async (sheetData: any[]) => {
    const local = await ricFetchAllLocal();
    const merged: RICSubmission[] = [...local];

    for (const row of sheetData) {
      if (!row.id) continue;
      const localIdx = merged.findIndex(m => m.id === row.id);
      if (localIdx >= 0) {
        // Update status from sheet for the specific stage
        const stageIdx = (parseInt(row.stage) || 1) - 1;
        if (merged[localIdx].stages[stageIdx]) {
          merged[localIdx].stages[stageIdx].status = row.status || merged[localIdx].stages[stageIdx].status;
          merged[localIdx].stages[stageIdx].notes = row.notes || merged[localIdx].stages[stageIdx].notes;
          merged[localIdx].stages[stageIdx].reviewedAt = row.reviewedAt || merged[localIdx].stages[stageIdx].reviewedAt;
          merged[localIdx].stages[stageIdx].reviewedBy = row.reviewedBy || merged[localIdx].stages[stageIdx].reviewedBy;
        }
      } else {
        // Submission exists in sheet but not locally — add it
        merged.push({
          id: row.id,
          registrationId: row.registrationId || '',
          teamName: row.teamName || 'Unknown',
          leaderEmail: row.leaderEmail || '',
          divisionId: row.divisionId || 'research-innovation',
          stages: [
            { stage: 1, status: row.stage === '1' ? (row.status || 'pending') : 'locked' },
            { stage: 2, status: row.stage === '2' ? (row.status || 'pending') : 'locked' },
            { stage: 3, status: row.stage === '3' ? (row.status || 'pending') : 'locked' },
          ],
          currentStage: 0,
          completed: false,
        });
      }
    }

    // Persist merged data back to localStorage + notify parent
    for (const sub of merged) {
      ricUpsertLocal(sub);
    }
    onUpdateSubmissions(merged);
  };

  const handleSyncFromSheet = async () => {
    const url = getRICScriptUrl();
    if (!url) {
      showAlert({ message: t('Please set the RIC Google Script URL first.', 'Harap isi URL Google Script RIC terlebih dahulu.'), type: 'warning' });
      return;
    }
    setSyncing(true);
    try {
      const data = await fetchRICSubmissions();
      if (data && Array.isArray(data)) {
        await mergeSheetData(data);
      } else {
        showAlert({ message: t('No data returned from sheet. Make sure the URL is correct.', 'Tidak ada data dari sheet. Pastikan URL benar.'), type: 'warning' });
      }
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

  // Auto-fetch from sheet on mount
  useEffect(() => {
    const url = getRICScriptUrl();
    if (url) {
      setRicScriptUrlState(url);
      handleSyncFromSheet().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = submissions.filter((sub) => {
    const matchesSearch =
      sub.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.leaderEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const stageIdx = sub.currentStage;
    const st = sub.stages[stageIdx];
    const matchesStage = stageFilter === 'ALL' || String(st.stage) === stageFilter;
    const matchesStatus = statusFilter === 'ALL' || st.status === statusFilter;

    return matchesSearch && matchesStage && matchesStatus;
  });

  const handleReview = (sub: RICSubmission, stageIdx: number, action: 'approved' | 'rejected') => {
    const stage = sub.stages[stageIdx];
    if (!stage) return;

    const updatedStages = [...sub.stages];
    updatedStages[stageIdx] = {
      ...stage,
      status: action,
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'admin',
      notes: reviewNotes,
    };

    // Unlock next stage if approved
    if (action === 'approved' && stageIdx < 2) {
      updatedStages[stageIdx + 1] = {
        ...updatedStages[stageIdx + 1],
        status: 'pending',
      };
    }

    const updated: RICSubmission = {
      ...sub,
      stages: updatedStages,
      currentStage: action === 'approved' ? Math.min(stageIdx + 1, 2) : stageIdx,
      completed: action === 'approved' && stageIdx === 2,
    };

    const newList = submissions.map(s => s.id === sub.id ? updated : s);
    onUpdateSubmissions(newList, stageIdx, sub.id);
    setActiveReview(null);
    setReviewNotes('');
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-emerald-400 bg-emerald-950/20 border-emerald-500/20';
      case 'rejected': return 'text-red-400 bg-red-950/20 border-red-500/20';
      case 'pending': return 'text-amber-400 bg-amber-950/20 border-amber-500/20';
      default: return 'text-zinc-500 bg-zinc-900 border-zinc-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Google Sheets Sync Config */}
      <div className="p-5 bg-zinc-950 border border-white/5 rounded-2xl space-y-3">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-[#4D90FE]" />
          <h4 className="font-sans font-black text-white uppercase tracking-wider text-xs">
            RIC GOOGLE SHEETS SYNC
          </h4>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="https://script.google.com/macros/s/.../exec"
            value={ricScriptUrl}
            onChange={(e) => saveRICScriptUrl(e.target.value)}
            className="flex-1 bg-zinc-900 border border-white/5 hover:border-white/10 rounded-xl px-3 py-2 text-[11px] font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-[#4D90FE]/30 transition-all"
          />
          <button
            onClick={handleSyncFromSheet}
            disabled={syncing}
            className="px-4 py-2 bg-[#4D90FE]/10 border border-[#4D90FE]/20 text-[#4D90FE] font-mono text-[9px] font-bold uppercase rounded-xl hover:bg-[#4D90FE]/20 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? t('SYNCING...', 'MENYINKRON...') : t('SYNC', 'SINKRON')}
          </button>
        </div>
        <p className="text-[9px] font-mono text-zinc-500 uppercase leading-relaxed">
          {t('Paste your RIC Google Apps Script Web App URL above. Data syncs automatically on page load.', 'Tempel URL Web App Google Apps Script RIC di atas. Data sinkron otomatis saat halaman dimuat.')}
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder={t('Search team or email...', 'Cari tim atau email...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD700] transition-colors"
          />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
        >
          <option value="ALL">{t('ALL STAGES', 'SEMUA TAHAP')}</option>
          <option value="1">{t('Stage 1', 'Tahap 1')}</option>
          <option value="2">{t('Stage 2', 'Tahap 2')}</option>
          <option value="3">{t('Stage 3', 'Tahap 3')}</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
        >
          <option value="ALL">{t('ALL STATUS', 'SEMUA STATUS')}</option>
          <option value="pending">{t('Pending', 'Pending')}</option>
          <option value="approved">{t('Approved', 'Disetujui')}</option>
          <option value="rejected">{t('Rejected', 'Ditolak')}</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-zinc-950 border border-white/5 rounded-xl">
          <div className="text-2xl font-sans font-black text-white">{submissions.length}</div>
          <div className="text-[9px] font-mono text-zinc-500 uppercase">{t('Total Teams', 'Total Tim')}</div>
        </div>
        <div className="p-4 bg-zinc-950 border border-white/5 rounded-xl">
          <div className="text-2xl font-sans font-black text-amber-400">{submissions.filter(s => s.stages.some(st => st.status === 'pending')).length}</div>
          <div className="text-[9px] font-mono text-zinc-500 uppercase">{t('Pending Review', 'Menunggu Review')}</div>
        </div>
        <div className="p-4 bg-zinc-950 border border-white/5 rounded-xl">
          <div className="text-2xl font-sans font-black text-emerald-400">{submissions.filter(s => s.stages.some(st => st.status === 'approved')).length}</div>
          <div className="text-[9px] font-mono text-zinc-500 uppercase">{t('Approved', 'Disetujui')}</div>
        </div>
        <div className="p-4 bg-zinc-950 border border-white/5 rounded-xl">
          <div className="text-2xl font-sans font-black text-red-400">{submissions.filter(s => s.stages.some(st => st.status === 'rejected')).length}</div>
          <div className="text-[9px] font-mono text-zinc-500 uppercase">{t('Rejected', 'Ditolak')}</div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-white/5 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-900 border-b border-white/5 font-mono text-[9px] text-zinc-400 uppercase tracking-wider">
              <th className="p-4">{t('TEAM', 'TIM')}</th>
              <th className="p-4">{t('STAGE', 'TAHAP')}</th>
              <th className="p-4">{t('STATUS', 'STATUS')}</th>
              <th className="p-4">{t('FILES', 'FILE')}</th>
              <th className="p-4">{t('SUBMITTED', 'DIKUMPULKAN')}</th>
              <th className="p-4 text-right">{t('ACTION', 'AKSI')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono text-xs text-zinc-300">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-zinc-500 uppercase">
                  {t('No RIC submissions found.', 'Tidak ada pengumpulan RIC.')}
                </td>
              </tr>
            ) : (
              filtered.map((sub) => {
                const st = sub.stages[sub.currentStage];
                const r = RIC_STAGES[sub.currentStage];
                return (
                  <tr key={sub.id} className="hover:bg-zinc-900/35 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-sans font-black text-white uppercase text-xs">{sub.teamName}</span>
                        <span className="text-[9px] text-zinc-500">{sub.leaderEmail}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-[#FFD700] font-bold">Stage {st.stage}</span>
                      {r && <span className="text-[10px] text-zinc-500 block">/{t(r.titleEn, r.titleId)}</span>}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] border font-bold ${statusColor(st.status)}`}>
                        {st.status === 'approved' && <ThumbsUp className="w-3 h-3" />}
                        {st.status === 'rejected' && <ThumbsDown className="w-3 h-3" />}
                        {st.status === 'pending' && <Clock className="w-3 h-3" />}
                        {st.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        {sub.currentStage === 0 && st.abstractFileUrl && (
                          <a href={st.abstractFileUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] text-[#4D90FE] hover:underline flex items-center gap-1">
                            <FileText className="w-3 h-3" /> {st.abstractFileName || 'Abstract'}
                          </a>
                        )}
                        {sub.currentStage === 1 && (
                          <>
                            {st.proposalFileUrl && <a href={st.proposalFileUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] text-[#4D90FE] hover:underline flex items-center gap-1"><FileText className="w-3 h-3" /> {st.proposalFileName || 'Proposal'}</a>}
                            {st.videoLink && <a href={st.videoLink} target="_blank" rel="noopener noreferrer" className="text-[9px] text-amber-400 hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Video</a>}
                          </>
                        )}
                        {sub.currentStage === 2 && (
                          <>
                            {st.posterFileUrl && <a href={st.posterFileUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] text-[#4D90FE] hover:underline flex items-center gap-1"><FileText className="w-3 h-3" /> {st.posterFileName || 'Poster'}</a>}
                            {st.pptFileUrl && <a href={st.pptFileUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] text-[#4D90FE] hover:underline flex items-center gap-1"><FileText className="w-3 h-3" /> {st.pptFileName || 'PPT'}</a>}
                          </>
                        )}
                        {!st.abstractFileUrl && !st.proposalFileUrl && !st.posterFileUrl && (
                          <span className="text-[9px] text-zinc-600">-</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-[9px] text-zinc-500">
                      {st.submittedAt ? new Date(st.submittedAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-4 text-right">
                      {st.status === 'pending' ? (
                        <button
                          onClick={() => setActiveReview({ sub, stageIdx: sub.currentStage })}
                          className="px-3 py-1.5 bg-[#FFD700]/10 border border-[#FFD700]/20 text-[9px] font-mono text-[#FFD700] font-bold rounded-lg hover:bg-[#FFD700]/20 transition-all cursor-pointer"
                        >
                          {t('REVIEW', 'REVIEW')}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const updatedStages = [...sub.stages];
                            updatedStages[sub.currentStage] = { ...updatedStages[sub.currentStage], status: 'pending', submittedAt: new Date().toISOString() };
                            const updated = { ...sub, stages: updatedStages };
                            onUpdateSubmissions(submissions.map(s => s.id === sub.id ? updated : s));
                          }}
                          className="px-3 py-1.5 bg-zinc-900 border border-white/5 text-[9px] font-mono text-zinc-400 rounded-lg hover:border-white/10 transition-all cursor-pointer"
                        >
                          {t('REOPEN', 'BUKA LAGI')}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {activeReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <div className="absolute inset-0" onClick={() => { setActiveReview(null); setReviewNotes(''); }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_35px_80px_rgba(0,0,0,0.95)] z-10"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FFD700] to-[#0047AB]" />
              <button
                onClick={() => { setActiveReview(null); setReviewNotes(''); }}
                className="absolute top-4 right-4 p-1.5 bg-zinc-900 border border-white/5 hover:border-white/10 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-5 pt-2">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-[#FFD700] uppercase tracking-widest block font-black">
                    {t('REVIEW SUBMISSION', 'REVIEW PENGUMPULAN')}
                  </span>
                  <h4 className="text-lg font-sans font-black text-white uppercase tracking-tight">
                    {activeReview.sub.teamName}
                  </h4>
                  <p className="text-[10px] font-mono text-zinc-500">
                    Stage {activeReview.stageIdx + 1} — {RIC_STAGES[activeReview.stageIdx] && t(RIC_STAGES[activeReview.stageIdx].titleEn, RIC_STAGES[activeReview.stageIdx].titleId)}
                  </p>
                </div>

                {/* Files summary */}
                <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl space-y-2">
                  {activeReview.stageIdx === 0 && activeReview.sub.stages[0]?.abstractFileUrl && (
                    <a href={activeReview.sub.stages[0].abstractFileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-[#4D90FE] hover:underline">
                      <FileText className="w-4 h-4" />
                      {t('View Abstract', 'Lihat Abstrak')}
                    </a>
                  )}
                  {activeReview.stageIdx === 1 && (
                    <>
                      {activeReview.sub.stages[1]?.proposalFileUrl && (
                        <a href={activeReview.sub.stages[1].proposalFileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-[#4D90FE] hover:underline">
                          <FileText className="w-4 h-4" />
                          {t('View Proposal', 'Lihat Proposal')}
                        </a>
                      )}
                      {activeReview.sub.stages[1]?.videoLink && (
                        <a href={activeReview.sub.stages[1].videoLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-amber-400 hover:underline">
                          <ExternalLink className="w-4 h-4" />
                          {t('Watch Video', 'Lihat Video')}
                        </a>
                      )}
                    </>
                  )}
                  {activeReview.stageIdx === 2 && (
                    <>
                      {activeReview.sub.stages[2]?.posterFileUrl && (
                        <a href={activeReview.sub.stages[2].posterFileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-[#4D90FE] hover:underline">
                          <FileText className="w-4 h-4" />
                          {t('View Poster', 'Lihat Poster')}
                        </a>
                      )}
                      {activeReview.sub.stages[2]?.pptFileUrl && (
                        <a href={activeReview.sub.stages[2].pptFileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-[#4D90FE] hover:underline">
                          <FileText className="w-4 h-4" />
                          {t('View PPT', 'Lihat PPT')}
                        </a>
                      )}
                    </>
                  )}
                </div>

                {/* Review Notes */}
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">
                    {t('Review Notes (optional)', 'Catatan Review (opsional)')}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={t('Add notes for the team...', 'Tambahkan catatan untuk tim...')}
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 focus:border-[#FFD700] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleReview(activeReview.sub, activeReview.stageIdx, 'rejected')}
                    className="flex-1 py-3 bg-red-500/10 border border-red-500/20 text-red-400 font-sans font-black text-xs tracking-widest uppercase rounded-xl hover:bg-red-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    {t('REJECT', 'TOLAK')}
                  </button>
                  <button
                    onClick={() => handleReview(activeReview.sub, activeReview.stageIdx, 'approved')}
                    className="flex-1 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-sans font-black text-xs tracking-widest uppercase rounded-xl hover:bg-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    {t('APPROVE', 'SETUJUI')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
