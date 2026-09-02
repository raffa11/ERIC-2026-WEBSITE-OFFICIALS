/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SIDE CONNECT — Upload Proposal / Report
 *
 * Lets already-registered participants (or new ones after the form) submit
 * their report / proposal files using the Ref Code they received at
 * registration. Files are sent to the Apps Script, saved to Google Drive, and
 * the shareable links are recorded on the participant's row in the sheet.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { useAlert } from './AlertModal';
import { UploadCloud, FileText, CheckCircle2, X } from 'lucide-react';
import { uploadSideConnectFiles } from '../lib/sideConnect';

interface SideConnectUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SideConnectUploadModal({ isOpen, onClose }: SideConnectUploadModalProps) {
  const { t } = useLanguage();
  const { showAlert } = useAlert();

  const [refCode, setRefCode] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleClose = () => {
    setRefCode('');
    setFiles([]);
    setIsSubmitting(false);
    setDone(false);
    onClose();
  };

  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked: File[] = Array.from(e.target.files || []) as File[];
    setFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      return [...prev, ...picked.filter((f) => !names.has(f.name))];
    });
  };

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const canSubmit = refCode.trim().length > 0 && files.length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    const res = await uploadSideConnectFiles(refCode.trim().toUpperCase(), files);
    setIsSubmitting(false);
    if (res.success) {
      setDone(true);
    } else {
      showAlert({ message: t(res.message, res.message), type: 'error' });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-black text-white uppercase tracking-tight">
              {t('UPLOAD PROPOSAL / REPORT', 'UPLOAD PROPOSAL / LAPORAN')}
            </h2>
            <button onClick={handleClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          <div className="p-6">
            {done ? (
              /* Success */
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[#00FF88]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-[#00FF88]" />
                </div>
                <h3 className="text-xl font-black text-white uppercase mb-2">{t('FILES UPLOADED!', 'FILE TERUPLOAD!')}</h3>
                <p className="text-zinc-400 text-sm mb-6">
                  {t('Your file(s) have been submitted successfully. Thank you!', 'File Anda berhasil dikirim. Terima kasih!')}
                </p>
                <button
                  onClick={handleClose}
                  className="w-full px-6 py-3 bg-[#00FF88] text-black font-black text-sm uppercase rounded-xl hover:bg-[#00CC6A] transition-colors cursor-pointer"
                >
                  {t('CLOSE', 'TUTUP')}
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <p className="text-xs text-zinc-500">
                  {t(
                    'Enter the Ref Code you received at registration, then attach your report/proposal file(s). Files are saved securely and linked to your registration.',
                    'Masukkan Ref Code yang Anda terima saat mendaftar, lalu lampirkan file laporan/proposal Anda. File disimpan dengan aman dan tertaut ke registrasi Anda.'
                  )}
                </p>

                {/* Ref Code */}
                <div>
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1.5">
                    {t('REF CODE', 'REF CODE')} *
                  </label>
                  <input
                    type="text"
                    value={refCode}
                    onChange={(e) => setRefCode(e.target.value.toUpperCase())}
                    placeholder="e.g. A1B2C3"
                    className="w-full bg-zinc-900 border border-white/5 focus:border-[#00FF88] rounded-xl px-3 py-2.5 text-xs text-white font-mono uppercase tracking-widest focus:outline-none"
                  />
                </div>

                {/* File picker */}
                <div>
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1.5">
                    {t('FILES (MAX 8MB EACH)', 'FILE (MAKS 8MB PER FILE)')} *
                  </label>
                  <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-white/15 bg-zinc-900/40 rounded-xl px-4 py-8 text-center cursor-pointer hover:border-[#00FF88]/40 transition-colors">
                    <UploadCloud className="w-8 h-8 text-[#00FF88]" />
                    <span className="text-xs font-bold text-white uppercase">{t('CLICK TO SELECT FILES', 'KLIK UNTUK PILIH FILE')}</span>
                    <span className="text-[10px] text-zinc-500">{t('PDF, DOCX, PPT, images…', 'PDF, DOCX, PPT, gambar…')}</span>
                    <input type="file" multiple className="hidden" onChange={onFilesChange} />
                  </label>

                  {files.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {files.map((f) => (
                        <div key={f.name} className="flex items-center gap-3 bg-zinc-900/60 border border-white/5 rounded-lg px-3 py-2">
                          <FileText className="w-4 h-4 text-[#00FF88] shrink-0" />
                          <span className="flex-1 min-w-0 text-xs text-white truncate">{f.name}</span>
                          <span className="text-[10px] text-zinc-500 shrink-0">{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                          <button type="button" onClick={() => removeFile(f.name)} className="text-zinc-500 hover:text-[#FF3B30] transition-colors cursor-pointer">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  disabled={!canSubmit}
                  onClick={handleSubmit}
                  className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    canSubmit ? 'bg-[#00FF88] text-black hover:bg-[#00CC6A]' : 'bg-white/5 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      {t('UPLOADING...', 'MENGIRIM...')}
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" /> {t('UPLOAD FILES', 'UPLOAD FILE')}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
