import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { RIC_STAGES } from '../data';
import { RICSubmission } from '../types';
import {
  FileText, ExternalLink, RefreshCw, Globe
} from 'lucide-react';
import { getRICScriptUrl, setRICScriptUrl, fetchRICSubmissions, setActiveStageOnSheet, fetchActiveStage } from '../lib/ricSheet';

export default function RICAdminPanel() {
  const { t } = useLanguage();
  const [submissions, setSubmissions] = useState<RICSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [ricScriptUrl, setRicScriptUrlState] = useState(getRICScriptUrl());
  const [activeStage, setActiveStage] = useState(1);
  const [stageSaving, setStageSaving] = useState(false);

  const saveRICScriptUrl = (url: string) => {
    setRicScriptUrlState(url);
    setRICScriptUrl(url);
  };

  const loadFromSheet = async () => {
    const url = getRICScriptUrl();
    if (!url) { setLoading(false); return; }
    setSyncing(true);
    try {
      const [data, stage] = await Promise.all([
        fetchRICSubmissions(),
        fetchActiveStage(),
      ]);
      setActiveStage(stage);
      if (data && Array.isArray(data)) {
        const grouped: Record<string, RICSubmission> = {};
        for (const row of data as any[]) {
          if (!row.registrationId || row.id === '__config__') continue;
          const id = row._submissionId || row.registrationId;
          if (!grouped[id]) {
            grouped[id] = {
              id,
              registrationId: row.registrationId,
              teamName: row.teamName || 'Unknown',
              leaderEmail: row.leaderEmail || '',
              divisionId: row.divisionId || 'research-innovation',
              stages: [
                { stage: 1, status: 'locked' },
                { stage: 2, status: 'locked' },
                { stage: 3, status: 'locked' },
              ],
              currentStage: 0,
              completed: false,
            };
          }
          const stageIdx = (parseInt(row.stage) || 1) - 1;
          if (grouped[id].stages[stageIdx]) {
            grouped[id].stages[stageIdx] = {
              ...grouped[id].stages[stageIdx],
              status: 'submitted',
              submittedAt: row.submittedAt || '',
            };
            if (row.abstractFileUrl) {
              grouped[id].stages[stageIdx].abstractFileName = row.abstractFileName;
              grouped[id].stages[stageIdx].abstractFileUrl = row.abstractFileUrl;
            }
            if (row.proposalFileUrl) {
              grouped[id].stages[stageIdx].proposalFileName = row.proposalFileName;
              grouped[id].stages[stageIdx].proposalFileUrl = row.proposalFileUrl;
            }
            if (row.videoLink) grouped[id].stages[stageIdx].videoLink = row.videoLink;
            if (row.posterFileUrl) {
              grouped[id].stages[stageIdx].posterFileName = row.posterFileName;
              grouped[id].stages[stageIdx].posterFileUrl = row.posterFileUrl;
            }
            if (row.pptFileUrl) {
              grouped[id].stages[stageIdx].pptFileName = row.pptFileName;
              grouped[id].stages[stageIdx].pptFileUrl = row.pptFileUrl;
            }
          }
        }
        setSubmissions(Object.values(grouped));
      }
    } catch (err) {
      console.error('Failed to load RIC submissions:', err);
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const url = getRICScriptUrl();
    if (url) {
      setRicScriptUrlState(url);
      loadFromSheet();
    } else {
      setLoading(false);
    }
  }, []);

  const saveActiveStage = async () => {
    setStageSaving(true);
    const ok = await setActiveStageOnSheet(activeStage);
    if (!ok) console.error('Failed to save active stage');
    setStageSaving(false);
  };

  const getStageData = (sub: RICSubmission, stageIdx: number) => {
    const st = sub.stages[stageIdx];
    const info: {
      submitted: boolean; abstractUrl?: string; abstractName?: string;
      proposalUrl?: string; proposalName?: string; videoLink?: string;
      posterUrl?: string; posterName?: string; pptUrl?: string; pptName?: string;
      submittedAt?: string;
    } = { submitted: false };

    if (!st || !st.submittedAt) return info;
    info.submitted = true;
    info.submittedAt = st.submittedAt;

    if (stageIdx === 0 && st.abstractFileUrl) {
      info.abstractUrl = st.abstractFileUrl;
      info.abstractName = st.abstractFileName;
    }
    if (stageIdx === 1) {
      if (st.proposalFileUrl) { info.proposalUrl = st.proposalFileUrl; info.proposalName = st.proposalFileName; }
      if (st.videoLink) info.videoLink = st.videoLink;
    }
    if (stageIdx === 2) {
      if (st.posterFileUrl) { info.posterUrl = st.posterFileUrl; info.posterName = st.posterFileName; }
      if (st.pptFileUrl) { info.pptUrl = st.pptFileUrl; info.pptName = st.pptFileName; }
    }
    return info;
  };

  return (
    <div className="space-y-6">
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
            onClick={loadFromSheet}
            disabled={syncing}
            className="px-4 py-2 bg-[#4D90FE]/10 border border-[#4D90FE]/20 text-[#4D90FE] font-mono text-[9px] font-bold uppercase rounded-xl hover:bg-[#4D90FE]/20 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? t('LOADING...', 'MEMUAT...') : t('REFRESH', 'REFRESH')}
          </button>
        </div>
      </div>

      <div className="p-5 bg-zinc-950 border border-white/5 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono text-[#FFD700] uppercase tracking-widest font-black block">
              {t('ACTIVE STAGE', 'TAHAP AKTIF')}
            </span>
            <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
              {t('Participants can only submit to the active stage.', 'Peserta hanya dapat mengumpulkan ke tahap yang aktif.')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={activeStage}
              onChange={(e) => setActiveStage(Number(e.target.value))}
              className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD700]"
            >
              <option value={1}>Stage 1 — {t('Abstract', 'Abstrak')}</option>
              <option value={2}>Stage 2 — {t('Proposal & Video', 'Proposal & Video')}</option>
              <option value={3}>Stage 3 — {t('Poster & PPT', 'Poster & PPT')}</option>
            </select>
            <button
              onClick={saveActiveStage}
              disabled={stageSaving}
              className="px-4 py-2.5 bg-[#FFD700] text-black font-sans font-black text-[9px] tracking-wider uppercase rounded-xl hover:scale-101 transition-all cursor-pointer disabled:opacity-50"
            >
              {stageSaving ? '...' : t('SAVE', 'SIMPAN')}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-zinc-950 border border-white/5 rounded-xl">
          <div className="text-2xl font-sans font-black text-white">{submissions.length}</div>
          <div className="text-[9px] font-mono text-zinc-500 uppercase">{t('Teams', 'Tim')}</div>
        </div>
        <div className="p-4 bg-zinc-950 border border-white/5 rounded-xl">
          <div className="text-2xl font-sans font-black text-amber-400">
            {submissions.filter(s => s.stages.some(st => st.status === 'submitted' && st.stage === activeStage)).length}
          </div>
          <div className="text-[9px] font-mono text-zinc-500 uppercase">{t('Stage {n} Submitted', 'Tahap {n} Terkirim').replace('{n}', String(activeStage))}</div>
        </div>
        <div className="p-4 bg-zinc-950 border border-white/5 rounded-xl">
          <div className="text-2xl font-sans font-black text-emerald-400">
            {submissions.filter(s => s.stages[2]?.status === 'submitted').length}
          </div>
          <div className="text-[9px] font-mono text-zinc-500 uppercase">{t('All Stages', 'Semua Tahap')}</div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-[#FFD700] border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-[10px] font-mono text-zinc-500 uppercase">{t('Loading submissions...', 'Memuat pengumpulan...')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-white/5 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900 border-b border-white/5 font-mono text-[9px] text-zinc-400 uppercase tracking-wider">
                <th className="p-4">{t('TEAM', 'TIM')}</th>
                <th className="p-4">Stage 1</th>
                <th className="p-4">Stage 2</th>
                <th className="p-4">Stage 3</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-xs text-zinc-300">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-zinc-500 uppercase">
                    {t('No RIC submissions found.', 'Tidak ada pengumpulan RIC.')}
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-zinc-900/35 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-sans font-black text-white uppercase text-xs">{sub.teamName}</span>
                        <span className="text-[9px] text-zinc-500">{sub.leaderEmail}</span>
                      </div>
                    </td>
                    {[0, 1, 2].map((sIdx) => {
                      const sd = getStageData(sub, sIdx);
                      return (
                        <td key={sIdx} className="p-4">
                          {sd.submitted ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] text-emerald-400">{t('Submitted', 'Terkirim')}</span>
                              <span className="text-[8px] text-zinc-600">{sd.submittedAt ? new Date(sd.submittedAt).toLocaleDateString() : ''}</span>
                              {sd.abstractUrl && <a href={sd.abstractUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] text-[#4D90FE] hover:underline flex items-center gap-1"><FileText className="w-3 h-3" />{sd.abstractName || 'Abstract'}</a>}
                              {sd.proposalUrl && <a href={sd.proposalUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] text-[#4D90FE] hover:underline flex items-center gap-1"><FileText className="w-3 h-3" />{sd.proposalName || 'Proposal'}</a>}
                              {sd.videoLink && <a href={sd.videoLink} target="_blank" rel="noopener noreferrer" className="text-[9px] text-amber-400 hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Video</a>}
                              {sd.posterUrl && <a href={sd.posterUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] text-[#4D90FE] hover:underline flex items-center gap-1"><FileText className="w-3 h-3" />{sd.posterName || 'Poster'}</a>}
                              {sd.pptUrl && <a href={sd.pptUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] text-[#4D90FE] hover:underline flex items-center gap-1"><FileText className="w-3 h-3" />{sd.pptName || 'PPT'}</a>}
                            </div>
                          ) : (
                            <span className="text-[9px] text-zinc-600">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
