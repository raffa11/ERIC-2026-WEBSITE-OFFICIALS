/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SIDE CONNECT — Free Registration Modal
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { useAlert } from './AlertModal';
import { SIDE_CONNECT_DIVISIONS, COUNTRY_CODES } from '../data';
import { SideConnectRegistration } from '../types';
import {
  Lightbulb, BookOpen, Compass, Send, CheckCircle2,
  ArrowRight, ArrowLeft, X, User, Users, Plus, Trash2
} from 'lucide-react';
import { syncSideConnectToSheet } from '../lib/sideConnect';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Lightbulb, BookOpen, Compass,
};

interface SideConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function generateId() {
  return 'SC-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function generatePin() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pin = '';
  for (let i = 0; i < 6; i++) pin += chars[Math.floor(Math.random() * chars.length)];
  return pin;
}

export default function SideConnectModal({ isOpen, onClose }: SideConnectModalProps) {
  const { t } = useLanguage();
  const { showAlert } = useAlert();

  const [step, setStep] = useState(1);
  const [subCompetition, setSubCompetition] = useState('');
  const [participationType, setParticipationType] = useState<'individual' | 'team'>('individual');
  const [teamName, setTeamName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [leaderWhatsapp, setLeaderWhatsapp] = useState('');
  const [leaderInstitution, setLeaderInstitution] = useState('');
  const [leaderCountry, setLeaderCountry] = useState('Indonesia');
  const [leaderAge, setLeaderAge] = useState('');
  const [members, setMembers] = useState<{ name: string; email: string; whatsapp: string; institution: string; country: string; age: string }[]>([]);
  const [abstractTitle, setAbstractTitle] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [howItWorks, setHowItWorks] = useState('');
  const [productDesign, setProductDesign] = useState('');
  const [benefits, setBenefits] = useState('');
  const [experience, setExperience] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [doneRefCode, setDoneRefCode] = useState('');

  const maxMembers = participationType === 'team' ? 2 : 0;

  const addMember = () => {
    if (members.length < maxMembers) {
      setMembers([...members, { name: '', email: '', whatsapp: '', institution: '', country: 'Indonesia', age: '' }]);
    }
  };

  const removeMember = (idx: number) => {
    setMembers(members.filter((_, i) => i !== idx));
  };

  const updateMember = (idx: number, field: string, value: string) => {
    const updated = [...members];
    (updated[idx] as any)[field] = value;
    setMembers(updated);
  };

  const resetForm = () => {
    setStep(1);
    setSubCompetition('');
    setParticipationType('individual');
    setTeamName('');
    setLeaderName('');
    setLeaderEmail('');
    setLeaderWhatsapp('');
    setLeaderInstitution('');
    setLeaderCountry('Indonesia');
    setLeaderAge('');
    setMembers([]);
    setAbstractTitle('');
    setProductDescription('');
    setHowItWorks('');
    setProductDesign('');
    setBenefits('');
    setExperience('');
    setIsSubmitting(false);
    setIsDone(false);
    setDoneRefCode('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const canProceedStep1 = subCompetition !== '';
  const canProceedStep2 = leaderName && leaderEmail && leaderWhatsapp && leaderInstitution && leaderAge &&
    (participationType === 'individual' || (teamName && members.length >= 1));
  const canSubmit = canProceedStep2 && abstractTitle && productDescription && howItWorks && productDesign && benefits;

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);

    const refCode = generatePin();
    const reg: SideConnectRegistration = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      subCompetition: subCompetition as any,
      participationType,
      teamName: participationType === 'team' ? teamName : leaderName,
      leader: {
        name: leaderName,
        email: leaderEmail,
        whatsapp: leaderWhatsapp,
        institution: leaderInstitution,
        country: leaderCountry,
        age: parseInt(leaderAge) || 0,
      },
      members: members.map(m => ({
        name: m.name,
        email: m.email,
        whatsapp: m.whatsapp,
        institution: m.institution,
        country: m.country,
        age: parseInt(m.age) || 0,
      })),
      abstractTitle,
      productDescription,
      howItWorks,
      productDesign,
      benefits,
      experience,
      refCode,
    };

    try {
      await syncSideConnectToSheet(reg);
    } catch (err) {
      console.error('[SideConnect] Sync error:', err);
    }

    setDoneRefCode(refCode);
    setIsDone(true);
    setIsSubmitting(false);
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
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-mono text-[#00FF88] tracking-[0.3em] uppercase bg-[#00FF88]/10 px-2 py-0.5 rounded-full border border-[#00FF88]/20">
                    {t('FREE EVENT', 'GRATIS')}
                  </span>
                </div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight">
                  {t('SIDE CONNECT', 'SIDE CONNECT')} <span className="text-[#00FF88]">Registration</span>
                </h2>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            {/* Progress */}
            {!isDone && (
              <div className="flex gap-2 mt-4">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex-1 h-1 rounded-full overflow-hidden bg-white/5">
                    <div className={`h-full rounded-full transition-all duration-500 ${step >= s ? 'bg-[#00FF88]' : ''}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {isDone ? (
              /* Success State */
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[#00FF88]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-[#00FF88]" />
                </div>
                <h3 className="text-xl font-black text-white uppercase mb-2">Registration Complete!</h3>
                <p className="text-zinc-400 text-sm mb-6">Your SIDE CONNECT registration has been submitted successfully.</p>
                <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 inline-block mb-6">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">Your Reference Code</span>
                  <span className="text-2xl font-mono text-[#00FF88] font-black tracking-widest">{doneRefCode}</span>
                </div>
                <p className="text-zinc-500 text-xs">Save this code for your records.</p>
                <button
                  onClick={handleClose}
                  className="mt-6 px-6 py-3 bg-[#00FF88] text-black font-black text-sm uppercase rounded-xl hover:bg-[#00CC6A] transition-colors cursor-pointer"
                >
                  {t('CLOSE', 'TUTUP')}
                </button>
              </div>
            ) : step === 1 ? (
              /* Step 1: Choose Sub-Competition */
              <div>
                <h3 className="text-sm font-mono text-zinc-400 uppercase tracking-widest mb-1">{t('CHOOSE SUB-COMPETITION', 'PILIH SUB-KOMPETISI')}</h3>
                <p className="text-xs text-zinc-500 mb-5">{t('Select one of the 3 free side events below.', 'Pilih salah satu dari 3 side event gratis di bawah.')}</p>

                <div className="grid grid-cols-1 gap-3 mb-6">
                  {SIDE_CONNECT_DIVISIONS.map((div) => {
                    const Icon = ICON_MAP[div.icon] || Lightbulb;
                    const isSelected = subCompetition === div.id;
                    return (
                      <button
                        key={div.id}
                        type="button"
                        onClick={() => setSubCompetition(div.id)}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#00FF88] bg-[#00FF88]/5'
                            : 'border-white/5 bg-zinc-900/40 hover:border-white/10 hover:bg-zinc-900/60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-xl ${isSelected ? 'bg-[#00FF88]/10' : 'bg-white/5'}`}>
                            <Icon className={`w-5 h-5 ${isSelected ? 'text-[#00FF88]' : 'text-zinc-400'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-black uppercase ${isSelected ? 'text-[#00FF88]' : 'text-white'}`}>
                              {div.title}
                            </div>
                            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                              {t(div.description, div.descriptionID)}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 bg-[#00FF88] rounded-full flex items-center justify-center shrink-0 mt-1">
                              <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  disabled={!canProceedStep1}
                  onClick={() => setStep(2)}
                  className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    canProceedStep1
                      ? 'bg-[#00FF88] text-black hover:bg-[#00CC6A]'
                      : 'bg-white/5 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  {t('NEXT', 'LANJUT')} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : step === 2 ? (
              /* Step 2: Participant Info */
              <div>
                <h3 className="text-sm font-mono text-zinc-400 uppercase tracking-widest mb-1">{t('PARTICIPANT INFO', 'INFO PESERTA')}</h3>
                <p className="text-xs text-zinc-500 mb-5">{t('Individual or team? Fill in your details below.', 'Individual atau tim? Isi data di bawah.')}</p>

                {/* Participation Type */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <button
                    type="button"
                    onClick={() => { setParticipationType('individual'); setMembers([]); }}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      participationType === 'individual'
                        ? 'border-[#00FF88] bg-[#00FF88]/5 text-[#00FF88]'
                        : 'border-white/5 bg-zinc-900/40 text-zinc-400 hover:border-white/10'
                    }`}
                  >
                    <User className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs font-black uppercase">{t('INDIVIDUAL', 'INDIVIDU')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setParticipationType('team')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      participationType === 'team'
                        ? 'border-[#00FF88] bg-[#00FF88]/5 text-[#00FF88]'
                        : 'border-white/5 bg-zinc-900/40 text-zinc-400 hover:border-white/10'
                    }`}
                  >
                    <Users className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs font-black uppercase">{t('TEAM (MAX 3)', 'TIM (MAKS 3)')}</span>
                  </button>
                </div>

                {/* Team Name */}
                {participationType === 'team' && (
                  <div className="mb-4">
                    <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1.5">{t('TEAM NAME', 'NAMA TIM')}</label>
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="e.g. TechInnovators"
                      className="w-full bg-zinc-900 border border-white/5 focus:border-[#00FF88] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                )}

                {/* Leader Fields */}
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1.5">{t('FULL NAME', 'NAMA LENGKAP')} *</label>
                    <input type="text" required value={leaderName} onChange={(e) => setLeaderName(e.target.value)} placeholder="John Doe"
                      className="w-full bg-zinc-900 border border-white/5 focus:border-[#00FF88] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1.5">Email *</label>
                      <input type="email" required value={leaderEmail} onChange={(e) => setLeaderEmail(e.target.value)} placeholder="john@email.com"
                        className="w-full bg-zinc-900 border border-white/5 focus:border-[#00FF88] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1.5">WhatsApp *</label>
                      <input type="tel" required value={leaderWhatsapp} onChange={(e) => setLeaderWhatsapp(e.target.value)} placeholder="+628123456789"
                        className="w-full bg-zinc-900 border border-white/5 focus:border-[#00FF88] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1.5">{t('INSTITUTION', 'INSTITUSI')} *</label>
                      <input type="text" required value={leaderInstitution} onChange={(e) => setLeaderInstitution(e.target.value)} placeholder="University / Company"
                        className="w-full bg-zinc-900 border border-white/5 focus:border-[#00FF88] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1.5">{t('COUNTRY', 'NEGARA')} *</label>
                      <select value={leaderCountry} onChange={(e) => setLeaderCountry(e.target.value)}
                        className="w-full bg-zinc-900 border border-white/5 focus:border-[#00FF88] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22%23666%22%3E%3Cpath%20d%3D%22M7%2010l5%205%205-5z%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_6px_center] bg-[length:14px]">
                        <option value="Indonesia">Indonesia</option>
                        <option value="Malaysia">Malaysia</option>
                        <option value="Singapore">Singapore</option>
                        <option value="Philippines">Philippines</option>
                        <option value="Thailand">Thailand</option>
                        <option value="Vietnam">Vietnam</option>
                        <option value="India">India</option>
                        <option value="Japan">Japan</option>
                        <option value="South Korea">South Korea</option>
                        <option value="China">China</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="w-32">
                    <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1.5">{t('AGE', 'UMUR')} *</label>
                    <input type="number" min={5} max={99} required value={leaderAge} onChange={(e) => setLeaderAge(e.target.value)} placeholder="20"
                      className="w-full bg-zinc-900 border border-white/5 focus:border-[#00FF88] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none" />
                  </div>
                </div>

                {/* Members */}
                {participationType === 'team' && (
                  <div className="border-t border-white/5 pt-4 mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{t('TEAM MEMBERS', 'ANGGOTA TIM')} ({members.length}/{maxMembers})</span>
                      {members.length < maxMembers && (
                        <button type="button" onClick={addMember}
                          className="flex items-center gap-1 text-[10px] font-mono text-[#00FF88] hover:text-[#00CC6A] transition-colors cursor-pointer">
                          <Plus className="w-3 h-3" /> {t('ADD', 'TAMBAH')}
                        </button>
                      )}
                    </div>

                    {members.map((m, idx) => (
                      <div key={idx} className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-mono text-zinc-500 uppercase">Member {idx + 1}</span>
                          <button type="button" onClick={() => removeMember(idx)}
                            className="text-zinc-500 hover:text-[#FF3B30] transition-colors cursor-pointer">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          <input type="text" value={m.name} onChange={(e) => updateMember(idx, 'name', e.target.value)} placeholder="Full Name"
                            className="w-full bg-zinc-900 border border-white/5 focus:border-[#00FF88] rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                          <div className="grid grid-cols-2 gap-2">
                            <input type="email" value={m.email} onChange={(e) => updateMember(idx, 'email', e.target.value)} placeholder="Email"
                              className="w-full bg-zinc-900 border border-white/5 focus:border-[#00FF88] rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                            <input type="tel" value={m.whatsapp} onChange={(e) => updateMember(idx, 'whatsapp', e.target.value)} placeholder="WhatsApp"
                              className="w-full bg-zinc-900 border border-white/5 focus:border-[#00FF88] rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <input type="text" value={m.institution} onChange={(e) => updateMember(idx, 'institution', e.target.value)} placeholder="Institution"
                              className="w-full bg-zinc-900 border border-white/5 focus:border-[#00FF88] rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                            <input type="text" value={m.country} onChange={(e) => updateMember(idx, 'country', e.target.value)} placeholder="Country"
                              className="w-full bg-zinc-900 border border-white/5 focus:border-[#00FF88] rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                            <input type="number" min={5} max={99} value={m.age} onChange={(e) => updateMember(idx, 'age', e.target.value)} placeholder="Age"
                              className="w-full bg-zinc-900 border border-white/5 focus:border-[#00FF88] rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Navigation */}
                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setStep(1)}
                    className="px-4 py-3 bg-white/5 text-zinc-400 font-bold text-sm uppercase rounded-xl hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> {t('BACK', 'KEMBALI')}
                  </button>
                  <button type="button" disabled={!canProceedStep2} onClick={() => setStep(3)}
                    className={`flex-1 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      canProceedStep2 ? 'bg-[#00FF88] text-black hover:bg-[#00CC6A]' : 'bg-white/5 text-zinc-500 cursor-not-allowed'
                    }`}>
                    {t('NEXT', 'LANJUT')} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Step 3: Abstract Submission */
              <div>
                <h3 className="text-sm font-mono text-zinc-400 uppercase tracking-widest mb-1">{t('ABSTRACT SUBMISSION', 'SUBMISI ABSTRAK')}</h3>
                <p className="text-xs text-zinc-500 mb-5">{t('Describe your project idea. Fields with * are required.', 'Deskripsikan ide proyek Anda. Field bertanda * wajib diisi.')}</p>

                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1.5">{t('ABSTRACT TITLE', 'JUDUL ABSTRAK')} *</label>
                    <input type="text" value={abstractTitle} onChange={(e) => setAbstractTitle(e.target.value)}
                      placeholder="e.g. Smart IoT-Based Air Quality Monitor"
                      className="w-full bg-zinc-900 border border-white/5 focus:border-[#00FF88] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none" />
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1.5">{t('PRODUCT DESCRIPTION', 'DESKRIPSI PRODUK')} *</label>
                    <textarea value={productDescription} onChange={(e) => setProductDescription(e.target.value)} rows={3}
                      placeholder="What is your product/project about?"
                      className="w-full bg-zinc-900 border border-white/5 focus:border-[#00FF88] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none resize-none" />
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1.5">{t('HOW IT WORKS', 'CARA KERJA')} *</label>
                    <textarea value={howItWorks} onChange={(e) => setHowItWorks(e.target.value)} rows={3}
                      placeholder="Explain how your product works..."
                      className="w-full bg-zinc-900 border border-white/5 focus:border-[#00FF88] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none resize-none" />
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1.5">{t('PRODUCT DESIGN', 'DESAIN PRODUK')} *</label>
                    <textarea value={productDesign} onChange={(e) => setProductDesign(e.target.value)} rows={3}
                      placeholder="Describe the design approach..."
                      className="w-full bg-zinc-900 border border-white/5 focus:border-[#00FF88] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none resize-none" />
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1.5">{t('BENEFITS', 'MANFAAT')} *</label>
                    <textarea value={benefits} onChange={(e) => setBenefits(e.target.value)} rows={2}
                      placeholder="What are the benefits of your product?"
                      className="w-full bg-zinc-900 border border-white/5 focus:border-[#00FF88] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none resize-none" />
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1.5">{t('EXPERIENCE', 'PENGALAMAN')}</label>
                    <textarea value={experience} onChange={(e) => setExperience(e.target.value)} rows={2}
                      placeholder="Any relevant experience? (optional)"
                      className="w-full bg-zinc-900 border border-white/5 focus:border-[#00FF88] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none resize-none" />
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setStep(2)}
                    className="px-4 py-3 bg-white/5 text-zinc-400 font-bold text-sm uppercase rounded-xl hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> {t('BACK', 'KEMBALI')}
                  </button>
                  <button type="button" disabled={!canSubmit || isSubmitting} onClick={handleSubmit}
                    className={`flex-1 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      canSubmit && !isSubmitting ? 'bg-[#00FF88] text-black hover:bg-[#00CC6A]' : 'bg-white/5 text-zinc-500 cursor-not-allowed'
                    }`}>
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        {t('SUBMITTING...', 'MENGIRIM...')}
                      </span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> {t('SUBMIT REGISTRATION', 'KIRIM REGISTRASI')}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
