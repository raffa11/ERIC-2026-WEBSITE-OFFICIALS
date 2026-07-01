/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { COMPETITION_DIVISIONS } from '../data';
import { Member, Registration } from '../types';
import { 
  Trophy, User, Trash2, Edit2, X, Plus, CreditCard, Download, MessageCircle
} from 'lucide-react';

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
  const [editingReg, setEditingReg] = useState<Registration | null>(null);

  if (!isOpen || !currentUser) return null;

  // Filter registrations that belong to the current user
  const myRegistrations = registrations.filter(
    (reg) => reg.leader.email.toLowerCase() === currentUser.email.toLowerCase()
  );

  // Delete registration handler
  const handleDeleteRegistration = (id: string) => {
    if (confirm(t('Are you sure you want to withdraw this registration? This cannot be undone.', 'Apakah Anda yakin ingin menarik pendaftaran ini? Tindakan ini tidak dapat dibatalkan.'))) {
      const updated = registrations.filter(r => r.id !== id);
      onUpdateRegistrations(updated);
    }
  };

  // Save edited registration
  const saveEditedForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReg) return;

    const updated = registrations.map(r => r.id === editingReg.id ? editingReg : r);
    onUpdateRegistrations(updated);
    setEditingReg(null);
    alert(t(' Roster changes synchronized successfully!', ' Perubahan roster berhasil disinkronkan!'));
  };

  // Form helper state modifiers
  const handleEditInput = (field: string, value: any) => {
    if (!editingReg) return;
    setEditingReg({ ...editingReg, [field]: value });
  };

  const handleEditLeaderInput = (field: string, value: string) => {
    if (!editingReg) return;
    setEditingReg({
      ...editingReg,
      leader: { ...editingReg.leader, [field]: value }
    });
  };

  const addMemberToEditing = () => {
    if (!editingReg) return;
    const newMember: Member = {
      id: `member-${Date.now()}`,
      name: '',
      email: '',
      whatsapp: '',
      institution: editingReg.leader.institution || ''
    };
    setEditingReg({
      ...editingReg,
      members: [...editingReg.members, newMember]
    });
  };

  const removeMemberFromEditing = (memberId: string) => {
    if (!editingReg) return;
    setEditingReg({
      ...editingReg,
      members: editingReg.members.filter(m => m.id !== memberId)
    });
  };

  const updateMemberInEditing = (memberId: string, field: keyof Member, value: string) => {
    if (!editingReg) return;
    setEditingReg({
      ...editingReg,
      members: editingReg.members.map(m => m.id === memberId ? { ...m, [field]: value } : m)
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto select-none"
      >
        <div className="absolute inset-0 cursor-default" onClick={onClose} />
        
        <div className="bg-[#0C0C0C] border border-white/10 rounded-3xl p-6 md:p-8 max-w-2xl w-full relative z-10 overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.95)]">
          
          {/* Header */}
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-[#00FF88] uppercase tracking-widest block font-black">
                CANDIDATE PANEL
              </span>
              <h4 className="text-xl font-sans font-black text-white uppercase tracking-tight">
                {t('MY TEAM REGISTRATIONS', 'PENDAFTARAN TIM SAYA')}
              </h4>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Registrations List / Grid */}
          <div className="py-6 space-y-6">
            {myRegistrations.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl space-y-4">
                <Trophy className="w-10 h-10 text-zinc-600 mx-auto animate-pulse" />
                <div className="space-y-1">
                  <p className="text-sm font-sans font-black text-white/80 uppercase">
                    {t('No Active Registrations Found', 'Belum Ada Tim Yang Anda Daftarkan')}
                  </p>
                  <p className="text-[10px] font-mono text-zinc-500 max-w-sm mx-auto uppercase leading-relaxed">
                    {t('To register, simply select your desired division in the competition category on the home page and click register.', 'Untuk mendaftar, silakan pilih divisi kategori kompetisi yang Anda inginkan di halaman utama dan klik daftar.')}
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onRegisterNewTeamClick();
                  }}
                  className="px-4 py-2 bg-[#00FF88]/10 hover:bg-[#00FF88]/20 border border-[#00FF88]/20 text-xs font-mono text-[#00FF88] rounded-xl cursor-pointer font-bold"
                >
                  {t('REGISTER NEW TEAM NOW', 'DAFTAR TIM BARU SEKARANG')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-1">
                {myRegistrations.map((reg) => {
                  const divObj = COMPETITION_DIVISIONS.find(d => d.id === reg.divisionId);
                  return (
                    <div key={reg.id} className="p-5 bg-zinc-950 border border-white/5 rounded-2xl space-y-4 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#00FF88] to-[#0047AB]" />
                      
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[8px] font-mono text-[#00FF88] uppercase tracking-widest block font-black">
                            {divObj?.title || reg.divisionId}
                          </span>
                          <h5 className="text-base font-sans font-black text-white uppercase tracking-tight mt-1">
                            {reg.teamName}
                          </h5>
                        </div>
                        <span className="px-1.5 py-0.5 text-[7.5px] font-mono bg-emerald-950/40 text-[#00FF88] border border-emerald-500/25 rounded uppercase font-bold">
                          {reg.paymentStatus}
                        </span>
                      </div>

                      <div className="text-[10px] font-mono text-zinc-400 space-y-1.5 border-t border-b border-white/5 py-3">
                        <div>LEADER: <span className="text-white font-bold">{reg.leader.name}</span></div>
                        <div>INSTITUTION: <span className="text-white">{reg.leader.institution}</span></div>
                        {reg.subCategory && <div>SUB-CATEGORY: <span className="text-[#00FF88] font-bold">{reg.subCategory}</span></div>}
                        {reg.level && <div>LEVEL: <span className="text-[#C5A059] font-bold">{reg.level}</span></div>}
                        {reg.lecturerName && (
                          <div className="text-zinc-500 text-[9.5px] border-t border-white/5 mt-1 pt-1">
                            ADVISOR: <span className="text-white">{reg.lecturerName} ({reg.lecturerWhatsapp})</span>
                          </div>
                        )}
                        <div>ROSTER SIZE: <span className="text-[#00FF88] font-bold">{reg.members.length + 1} Members</span></div>
                        {reg.paymentProofUrl && (
                          <div className="text-emerald-400 font-bold">
                            PROOF:{' '}
                            <a
                              href={reg.paymentProofUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white underline hover:text-[#00FF88] inline-flex items-center gap-1 font-mono cursor-pointer"
                            >
                              <Download className="w-2.5 h-2.5" />
                              {reg.paymentProofName || 'Download File'}
                            </a>
                          </div>
                        )}
                        <div>REF CODE: <span className="text-[#00FF88] select-all font-bold">{reg.refCode}</span></div>
                      </div>

                      {divObj?.whatsappGroup && (
                        <a
                          href={divObj.whatsappGroup}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-950/20 border border-emerald-500/20 hover:border-emerald-400/40 rounded-xl text-[10px] font-mono text-emerald-300 hover:text-emerald-200 transition-all group cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          {t('JOIN DIVISION WHATSAPP GROUP', 'GABUNG GROUP WHATSAPP DIVISI')}
                        </a>
                      )}

                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <div>GATEWAY: <span className="text-white uppercase">{reg.paymentMethod}</span></div>
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingReg(JSON.parse(JSON.stringify(reg)))}
                            className="p-1.5 bg-zinc-900 border border-white/5 hover:border-[#00FF88]/20 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Edit Roster"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteRegistration(reg.id)}
                            className="p-1.5 bg-zinc-900 border border-white/5 hover:border-red-500/20 text-zinc-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                            title="Withdraw Team"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
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

        {/* INNER OVERLAY DIALOG: EDIT ROSTER */}
        <AnimatePresence>
          {editingReg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto"
            >
              <div className="absolute inset-0 cursor-default" onClick={() => setEditingReg(null)} />
              <div className="bg-[#0C0C0C] border border-white/10 rounded-3xl p-6 md:p-8 max-w-xl w-full relative z-10 overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.95)]">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono text-[#00FF88] uppercase tracking-widest block font-black">
                      AMENDMENT OVERLAY
                    </span>
                    <h4 className="text-lg font-sans font-black text-white uppercase tracking-tight">
                      {t('EDIT TEAM ROSTER', 'EDIT DATA ROSTER')}: {editingReg.teamName}
                    </h4>
                  </div>
                  <button
                    onClick={() => setEditingReg(null)}
                    className="p-1.5 bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={saveEditedForm} className="space-y-5 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[200px] overflow-y-auto pr-1">
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[8.5px] font-mono text-zinc-400 uppercase block">Team Name</label>
                      <input
                        type="text"
                        required
                        value={editingReg.teamName}
                        onChange={(e) => handleEditInput('teamName', e.target.value.toUpperCase())}
                        className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8.5px] font-mono text-zinc-400 uppercase block">Leader Name</label>
                      <input
                        type="text"
                        required
                        value={editingReg.leader.name}
                        onChange={(e) => handleEditLeaderInput('name', e.target.value)}
                        className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8.5px] font-mono text-zinc-400 uppercase block">Leader Whatsapp</label>
                      <input
                        type="tel"
                        required
                        value={editingReg.leader.whatsapp}
                        onChange={(e) => handleEditLeaderInput('whatsapp', e.target.value)}
                        className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[8.5px] font-mono text-zinc-400 uppercase block">Institution</label>
                      <input
                        type="text"
                        required
                        value={editingReg.leader.institution}
                        onChange={(e) => handleEditLeaderInput('institution', e.target.value)}
                        className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Members list */}
                  <div className="space-y-3 pt-3 border-t border-white/5">
                    <div className="flex justify-between items-center">
                      <span className="text-[9.5px] font-mono text-white font-bold uppercase">
                        {t('TEAM MEMBERS', 'ANGGOTA ROSTER')} ({editingReg.members.length})
                      </span>
                      {(() => {
                        const division = COMPETITION_DIVISIONS.find(d => d.id === editingReg.divisionId);
                        const limit = division?.maxStaff ?? 5;
                        return editingReg.members.length < limit ? (
                          <button
                            type="button"
                            onClick={addMemberToEditing}
                            className="px-2.5 py-1 bg-[#00FF88]/10 border border-[#00FF88]/20 text-[8px] font-mono text-[#00FF88] font-bold rounded"
                          >
                            + ADD ROSTER
                          </button>
                        ) : (
                          <span className="text-[8px] font-mono text-amber-500 uppercase font-bold">
                            MAX STAFF REACHED ({limit})
                          </span>
                        );
                      })()}
                    </div>

                    <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                      {editingReg.members.map((member, i) => (
                        <div key={member.id} className="p-3 bg-zinc-950 border border-white/5 rounded-xl relative space-y-2">
                          <button
                            type="button"
                            onClick={() => removeMemberFromEditing(member.id)}
                            className="absolute top-2 right-2 p-1 hover:bg-red-950 hover:text-red-400 text-zinc-500 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>

                          <span className="text-[8px] font-mono text-zinc-500 uppercase block">Roster #0{i + 1}</span>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Name"
                              required
                              value={member.name}
                              onChange={(e) => updateMemberInEditing(member.id, 'name', e.target.value)}
                              className="bg-zinc-900 border border-white/5 px-2.5 py-1.5 text-[11px] text-white rounded-lg focus:outline-none"
                            />
                            <input
                              type="text"
                              placeholder="Institution"
                              required
                              value={member.institution}
                              onChange={(e) => updateMemberInEditing(member.id, 'institution', e.target.value)}
                              className="bg-zinc-900 border border-white/5 px-2.5 py-1.5 text-[11px] text-white rounded-lg focus:outline-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-2.5 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setEditingReg(null)}
                      className="px-4 py-2 border border-white/5 hover:border-white/10 text-xs font-mono text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer"
                    >
                      {t('CLOSE', 'TUTUP')}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#00FF88] text-black font-sans font-black text-xs tracking-wider uppercase rounded-xl hover:scale-101 transition-transform cursor-pointer"
                    >
                      {t('SAVE CHANGES', 'SIMPAN PERUBAHAN')}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </AnimatePresence>
  );
}
