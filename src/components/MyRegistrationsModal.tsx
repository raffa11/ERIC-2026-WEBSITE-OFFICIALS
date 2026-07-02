/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { COMPETITION_DIVISIONS } from '../data';
import { Registration } from '../types';
import { 
  Trophy, X, MessageCircle, CheckCircle, Download
} from 'lucide-react';
import { generateRegistrationPDF } from '../lib/generatePDF';

interface MyRegistrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { name: string; email: string; method: string } | null;
  registrations: Registration[];
  onUpdateRegistrations: (newRegs: Registration[]) => void;
  onRegisterNewTeamClick: () => void;
}

export default function MyRegistrationsModal({
  isOpen,
  onClose,
  currentUser,
  registrations,
  onUpdateRegistrations,
  onRegisterNewTeamClick
}: MyRegistrationsModalProps) {
  const { t } = useLanguage();

  if (!isOpen || !currentUser) return null;

  const myRegistrations = registrations.filter(
    (reg) => reg.leader.email.toLowerCase() === currentUser.email.toLowerCase()
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md overflow-y-auto select-none"
      >
        <div className="min-h-full sm:min-h-screen flex items-center justify-center px-4 py-10">
        <div className="absolute inset-0 cursor-default" onClick={onClose} />
        
        <div className="bg-[#0C0C0C] border border-white/10 rounded-3xl p-6 md:p-8 max-w-2xl w-full relative z-10 shadow-[0_30px_70px_rgba(0,0,0,0.95)]">
          
          {/* Header */}
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-[#00FF88] uppercase tracking-widest block font-black">
                CANDIDATE PANEL
              </span>
              <h4 className="text-xl font-sans font-black text-white uppercase tracking-tight">
                {t('MY REGISTRATIONS', 'DAFTAR PENDAFTARAN')}
              </h4>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="py-6 space-y-6">
            {myRegistrations.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl space-y-4">
                <Trophy className="w-10 h-10 text-zinc-600 mx-auto animate-pulse" />
                <div className="space-y-1">
                  <p className="text-sm font-sans font-black text-white/80 uppercase">
                    {t('No Registrations Found', 'Belum Ada Pendaftaran')}
                  </p>
                  <p className="text-[10px] font-mono text-zinc-500 max-w-sm mx-auto uppercase leading-relaxed">
                    {t('To register, select your desired division on the home page and click register.', 'Untuk mendaftar, pilih divisi yang diinginkan di halaman utama dan klik daftar.')}
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onRegisterNewTeamClick();
                  }}
                  className="px-4 py-2 bg-[#00FF88]/10 hover:bg-[#00FF88]/20 border border-[#00FF88]/20 text-xs font-mono text-[#00FF88] rounded-xl cursor-pointer font-bold"
                >
                  {t('REGISTER NOW', 'DAFTAR SEKARANG')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-1">
                {myRegistrations.map((reg) => {
                  const divObj = COMPETITION_DIVISIONS.find(d => d.id === reg.divisionId);
                  return (
                    <div key={reg.id} className="p-5 bg-zinc-950 border border-white/5 rounded-2xl space-y-4 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#00FF88] to-[#0047AB]" />
                      
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#00FF88] shrink-0" />
                        <div>
                          <span className="text-[8px] font-mono text-[#00FF88] uppercase tracking-widest block font-black">
                            {t('COMPETITION', 'KOMPETISI')}
                          </span>
                          <h5 className="text-base font-sans font-black text-white uppercase tracking-tight">
                            {divObj?.title || reg.divisionId}
                          </h5>
                        </div>
                      </div>

                      <div className="text-[10px] font-mono text-zinc-400 space-y-1.5 border-t border-b border-white/5 py-3">
                        <div>REF CODE: <span className="text-[#C5A059] select-all font-bold">{reg.refCode}</span></div>
                        <div className="text-[9px] text-zinc-500">
                          {t('Confirmed', 'Terkonfirmasi')}: {reg.paymentStatus}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {divObj?.whatsappGroup && (
                          <a
                            href={divObj.whatsappGroup}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-950/20 border border-emerald-500/20 hover:border-emerald-400/40 rounded-xl text-[10px] font-mono text-emerald-300 hover:text-emerald-200 transition-all cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{t('JOIN WHATSAPP', 'GABUNG WA')}</span>
                            <span className="sm:hidden">WA</span>
                          </a>
                        )}
                        <button
                          onClick={() => generateRegistrationPDF(reg)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#00FF88]/10 border border-[#00FF88]/20 hover:bg-[#00FF88]/20 hover:border-[#00FF88]/40 rounded-xl text-[10px] font-mono text-[#00FF88] hover:text-white transition-all cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{t('DOWNLOAD PDF TICKET', 'DOWNLOAD TIKET PDF')}</span>
                          <span className="sm:hidden">PDF</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-zinc-900 border border-white/5 hover:border-white/10 text-xs font-mono text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer"
            >
              {t('CLOSE PANEL', 'TUTUP PANEL')}
            </button>
          </div>
        </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
