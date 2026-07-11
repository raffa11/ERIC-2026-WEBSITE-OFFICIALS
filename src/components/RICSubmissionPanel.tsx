/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { useAlert } from './AlertModal';
import { Registration, RicSubmission } from '../types';
import { syncToGoogleSheet } from '../lib/googleSheet';
import {
  Upload, Check, Lock, FileText, Video, Image,
  AlertCircle, ExternalLink, X, Link as LinkIcon
} from 'lucide-react';

const RIC_DIVISION_ID = 'research-innovation';

interface StageConfig {
  key: 'stage1' | 'stage2' | 'stage3';
  label: string;
  labelID: string;
  statusField: 'stage1Status' | 'stage2Status' | 'stage3Status';
  acceptedFormat: string;
  uploadLabel: string;
  uploadLabelID: string;
  hasVideoLink?: boolean;
  description: string;
  descriptionID: string;
}

const STAGES: StageConfig[] = [
  {
    key: 'stage1',
    label: 'Abstract Submission',
    labelID: 'Pengumpulan Abstrak',
    statusField: 'stage1Status',
    acceptedFormat: '.pdf',
    uploadLabel: 'Upload Abstract (PDF)',
    uploadLabelID: 'Unggah Abstrak (PDF)',
    description: 'Submit your research abstract in PDF format (max 5MB).',
    descriptionID: 'Kumpulkan abstrak penelitian Anda dalam format PDF (maks 5MB).'
  },
  {
    key: 'stage2',
    label: 'Full Proposal & Video Prototype',
    labelID: 'Proposal Lengkap & Video Prototipe',
    statusField: 'stage2Status',
    acceptedFormat: '.pdf',
    uploadLabel: 'Upload Full Proposal (PDF)',
    uploadLabelID: 'Unggah Proposal Lengkap (PDF)',
    hasVideoLink: true,
    description: 'Submit your full proposal PDF and a link to your prototype video.',
    descriptionID: 'Kumpulkan proposal lengkap PDF dan tautan video prototipe.'
  },
  {
    key: 'stage3',
    label: 'Digital Poster & PPT',
    labelID: 'Poster Digital & PPT',
    statusField: 'stage3Status',
    acceptedFormat: '.pdf',
    uploadLabel: 'Upload Poster (PDF)',
    uploadLabelID: 'Unggah Poster (PDF)',
    hasVideoLink: false,
    description: 'Submit your digital poster and presentation slides in PDF format.',
    descriptionID: 'Kumpulkan poster digital dan slide presentasi dalam format PDF.'
  }
];

const STATUS_CONFIG: Record<string, { color: string; label: string; labelID: string; icon: string }> = {
  locked: { color: 'text-zinc-600 border-zinc-800', label: 'LOCKED', labelID: 'TERKUNCI', icon: 'lock' },
  open: { color: 'text-[#FFD700] border-[#FFD700]/30', label: 'OPEN', labelID: 'TERBUKA', icon: 'open' },
  submitted: { color: 'text-green-400 border-green-400/30', label: 'SUBMITTED', labelID: 'TERKIRIM', icon: 'check' },
};

function processFileUpload(
  file: File,
  onSetFilename: (name: string) => void,
  onSetUrl: (url: string) => void,
  showAlert: (msg: { message: string; type: string }) => void
) {
  if (file.size > 5 * 1024 * 1024) {
    showAlert({ message: 'File size must be under 5MB! / Ukuran file harus di bawah 5MB!', type: 'error' });
    return;
  }
  onSetFilename(file.name);
  const reader = new FileReader();
  reader.onload = (event) => {
    if (event.target?.result) {
      onSetUrl(event.target.result as string);
    }
  };
  reader.readAsDataURL(file);
}

interface RICSubmissionPanelProps {
  registration: Registration;
  onUpdate: (updated: Registration) => void;
}

export default function RICSubmissionPanel({ registration, onUpdate }: RICSubmissionPanelProps) {
  const { t, lang } = useLanguage();
  const { showAlert } = useAlert();
  const [submittingStage, setSubmittingStage] = useState<string | null>(null);
  const [videoLink, setVideoLink] = useState(registration.ric?.videoLink || '');

  const isRIC = registration.divisionId === RIC_DIVISION_ID;
  if (!isRIC) return null;

  const ric = registration.ric || {
    stage1Status: 'open' as const,
    stage2Status: 'locked' as const,
    stage3Status: 'locked' as const,
  };

  const stage1Files = useFileState('stage1', ric, registration, onUpdate, showAlert);
  const stage2Files = useFileState('stage2', ric, registration, onUpdate, showAlert);
  const stage3Files = useFileState('stage3', ric, registration, onUpdate, showAlert);

  const handleSubmitStage = async (stageKey: 'stage1' | 'stage2' | 'stage3') => {
    setSubmittingStage(stageKey);
    try {
      const statusField = `${stageKey}Status` as keyof RicSubmission;
      const updated: Registration = {
        ...registration,
        ric: {
          ...ric,
          [statusField]: 'submitted',
          ...(stageKey === 'stage2' ? { videoLink: videoLink } : {}),
        },
      };
      await syncToGoogleSheet(updated);
      onUpdate(updated);
      showAlert({ message: t('Stage submitted successfully!', 'Tahap berhasil dikirim!'), type: 'success' });
    } catch (err) {
      showAlert({ message: t('Failed to submit stage.', 'Gagal mengirim tahap.'), type: 'error' });
    } finally {
      setSubmittingStage(null);
    }
  };

  const renderStage = (stage: StageConfig, fileState: FileState) => {
    const status = ric[stage.statusField];
    const cfg = STATUS_CONFIG[status];
    const isOpen = status === 'open';
    const isSubmitted = status === 'submitted';

    return (
      <div
        key={stage.key}
        className={`p-4 bg-zinc-900/40 border rounded-2xl space-y-4 transition-all ${
          isOpen ? 'border-[#FFD700]/30' : isSubmitted ? 'border-green-500/20' : 'border-white/5 opacity-60'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${cfg.color} bg-zinc-950`}>
              {status === 'locked' ? <Lock className="w-4 h-4 text-zinc-500" /> :
               status === 'submitted' ? <Check className="w-4 h-4 text-green-400" /> :
               <FileText className="w-4 h-4 text-[#FFD700]" />}
            </div>
            <div>
              <h4 className="font-sans font-black text-sm text-white uppercase tracking-tight">
                {t(stage.label, stage.labelID)}
              </h4>
              <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                {t(stage.description, stage.descriptionID)}
              </p>
            </div>
          </div>
          <div className={`px-2.5 py-1 rounded-lg border text-[9px] font-mono font-black uppercase tracking-wider ${cfg.color}`}>
            {t(cfg.label, cfg.labelID)}
          </div>
        </div>

        {isOpen && (
          <div className="space-y-4">
            <FileUploadField
              label={t(stage.uploadLabel, stage.uploadLabelID)}
              fileName={fileState.fileName}
              fileUrl={fileState.fileUrl}
              onSelect={(file) => fileState.onFileSelect(file)}
              onClear={fileState.onClear}
              id={`ric-${stage.key}-input`}
              accept={stage.acceptedFormat}
            />

            {stage.hasVideoLink && (
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">
                  {t('Video Prototype Link (YouTube/Drive)', 'Tautan Video Prototipe (YouTube/Drive)')} <span className="text-[#FFD700]">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 bg-zinc-950 border border-white/5 rounded-xl px-3 py-2.5">
                    <LinkIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <input
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      value={videoLink}
                      onChange={(e) => setVideoLink(e.target.value)}
                      className="flex-1 bg-transparent text-xs text-white focus:outline-none placeholder-zinc-600"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => handleSubmitStage(stage.key)}
              disabled={submittingStage === stage.key || !fileState.fileUrl || (stage.hasVideoLink && !videoLink)}
              className="w-full py-3 bg-[#FFD700] text-black font-sans font-black text-xs tracking-widest uppercase rounded-xl hover:scale-[1.01] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submittingStage === stage.key ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  {t('SUBMITTING...', 'MENGIRIM...')}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" />
                  {t('SUBMIT', 'KIRIM')}
                </span>
              )}
            </button>
          </div>
        )}

        {isSubmitted && fileState.fileUrl && (
          <div className="flex items-center gap-2 text-xs">
            <Check className="w-4 h-4 text-green-400 shrink-0" />
            <span className="font-mono text-zinc-400 truncate">{fileState.fileName || 'File uploaded'}</span>
            {fileState.fileUrl.startsWith('data:') ? (
              <a
                href={fileState.fileUrl}
                download={fileState.fileName}
                className="ml-auto text-[#FFD700] hover:text-white font-mono text-[10px] uppercase font-bold flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" /> {t('VIEW', 'LIHAT')}
              </a>
            ) : (
              <span className="ml-auto text-[10px] font-mono text-zinc-500">[FILE SAVED]</span>
            )}
            {stage.hasVideoLink && registration.ric?.videoLink && (
              <a
                href={registration.ric.videoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-[#FFD700] hover:text-white font-mono text-[10px] uppercase font-bold flex items-center gap-1"
              >
                <Video className="w-3 h-3" /> {t('VIDEO', 'VIDEO')}
              </a>
            )}
          </div>
        )}

        {status === 'locked' && (
          <p className="text-[10px] font-mono text-zinc-600 italic">
            {t('This stage is not yet available.', 'Tahap ini belum tersedia.')}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="mt-6 space-y-4 border-t border-[#FFD700]/20 pt-6">
      <div className="flex items-center gap-3 mb-2 select-none">
        <div className="p-2 bg-amber-950/30 border border-amber-500/20 rounded-lg">
          <FileText className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="font-sans font-black text-base text-white uppercase tracking-tight">
            {t('RIC SUBMISSION PORTAL', 'PORTAL PENGUMPULAN RIC')}
          </h3>
          <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
            {t('Research Innovation Challenge — File Collection', 'Research Innovation Challenge — Kumpulan Berkas')}
          </p>
        </div>
      </div>

      {STAGES.map((stage) => renderStage(stage, getFileStateForStage(stage.key, stage1Files, stage2Files, stage3Files)))}
    </div>
  );
}

/* ─── File State Helpers ─── */

interface FileState {
  fileName: string;
  fileUrl: string;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}

function useFileState(
  stageKey: string,
  ric: RicSubmission,
  registration: Registration,
  onUpdate: (updated: Registration) => void,
  showAlert: (msg: { message: string; type: string }) => void
): FileState {
  const nameMap: Record<string, keyof RicSubmission> = {
    stage1: 'abstractName',
    stage2: 'proposalName',
    stage3: 'posterName',
  };
  const urlMap: Record<string, keyof RicSubmission> = {
    stage1: 'abstractUrl',
    stage2: 'proposalUrl',
    stage3: 'posterUrl',
  };

  const [fileName, setFileName] = useState<string>((ric[nameMap[stageKey]] as string) || '');
  const [fileUrl, setFileUrl] = useState<string>((ric[urlMap[stageKey]] as string) || '');

  const persist = (name: string, url: string) => {
    setFileName(name);
    setFileUrl(url);
    const updated: Registration = {
      ...registration,
      ric: {
        ...ric,
        [nameMap[stageKey]]: name,
        [urlMap[stageKey]]: url,
      },
    };
    onUpdate(updated);
    syncToGoogleSheet(updated).catch(() => {});
  };

  return {
    fileName,
    fileUrl,
    onFileSelect: (file: File) => {
      processFileUpload(file, (name) => {
        setFileName(name);
      }, (url) => {
        persist(file.name, url);
      }, showAlert);
    },
    onClear: () => {
      persist('', '');
    },
  };
}

function getFileStateForStage(key: string, s1: FileState, s2: FileState, s3: FileState): FileState {
  if (key === 'stage1') return s1;
  if (key === 'stage2') return s2;
  return s3;
}

/* ─── Reusable File Upload Field ─── */

function FileUploadField({
  label, fileName, fileUrl, onSelect, onClear, id, accept
}: {
  label: string;
  fileName: string;
  fileUrl: string;
  onSelect: (file: File) => void;
  onClear: () => void;
  id: string;
  accept: string;
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
        className={`border border-dashed rounded-xl p-2.5 text-center transition-all cursor-pointer ${
          dragging ? 'border-[#FFD700] bg-[#FFD700]/5 scale-[0.99]' :
          fileUrl ? 'border-amber-500/30 bg-amber-950/5' :
          'border-white/10 hover:border-white/20 bg-zinc-950/40'
        }`}
      >
        <input type="file" id={id} className="hidden" accept={accept}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onSelect(f); }}
        />
        {fileUrl ? (
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[10px] font-mono text-white truncate max-w-[140px]">{fileName || 'Uploaded'}</span>
            </div>
            <button type="button" onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="text-[9px] font-mono text-zinc-500 hover:text-red-400 uppercase">[Clear]</button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-0.5 text-zinc-500">
            <Upload className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[9.5px] font-mono uppercase">{t('UPLOAD FILE', 'UNGGAH FILE')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
