/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { useAlert } from './AlertModal';
import { COMPETITION_DIVISIONS, MAIN_WHATSAPP_GROUP, COUNTRY_CODES } from '../data';
import { Member, Registration } from '../types';
import { 
  Trophy, User, Code, Terminal, Sparkles, Send, CheckCircle2, 
  Plus, Trash2, ArrowRight, ArrowLeft, CreditCard, 
  AlertCircle, X, Check, Globe, Upload, Copy, MessageCircle
} from 'lucide-react';
import { syncToGoogleSheet } from '../lib/googleSheet';
import { saveDraft, loadDraft, clearDraft } from '../lib/draftStorage';

function WhatsAppField({
  value,
  onChange,
  placeholder,
  required
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  const matched = COUNTRY_CODES.find(c => value.startsWith(c.code));
  const prefix = matched?.code || '+62';
  const number = matched ? value.slice(matched.code.length) : value.replace(/^\+/, '');

  return (
    <div className="flex gap-1.5 items-start">
      <select
        value={prefix}
        onChange={(e) => onChange(e.target.value + number)}
        className="w-[100px] shrink-0 bg-zinc-900 border border-white/5 focus:border-[#FFD700] rounded-xl px-1.5 py-2.5 text-xs text-white focus:outline-none appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22%23666%22%3E%3Cpath%20d%3D%22M7%2010l5%205%205-5z%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_6px_center] bg-[length:14px]"
      >
        {COUNTRY_CODES.map((c) => (
          <option key={c.code} value={c.code} className="bg-zinc-950 text-white">
            {c.flag} {c.code}
          </option>
        ))}
      </select>
      <input
        type="tel"
        required={required}
        placeholder={placeholder}
        value={number}
        onChange={(e) => {
          const cleaned = e.target.value.replace(/\D/g, '');
          onChange(prefix + cleaned);
        }}
        className="flex-1 min-w-0 w-full bg-zinc-900 border border-white/5 focus:border-[#FFD700] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
      />
    </div>
  );
}

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDivisionId: string;
  currentUser: { name: string; email: string; method: string } | null;
  onRegistrationSuccess: (newReg: Registration) => void;
}

export default function RegistrationModal({
  isOpen,
  onClose,
  initialDivisionId,
  currentUser,
  onRegistrationSuccess
}: RegistrationModalProps) {
  const { t } = useLanguage();
  const { showAlert, showConfirm } = useAlert();

  // Wizard Multi-stage Form State
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedDivision, setSelectedDivision] = useState(initialDivisionId);
  const [teamName, setTeamName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [leaderWhatsapp, setLeaderWhatsapp] = useState('');
  const [leaderInstitution, setLeaderInstitution] = useState('');

  // New Leader Fields
  const [leaderIdCardName, setLeaderIdCardName] = useState('');
  const [leaderIdCardUrl, setLeaderIdCardUrl] = useState('');
  const [leaderTwibbonName, setLeaderTwibbonName] = useState('');
  const [leaderTwibbonUrl, setLeaderTwibbonUrl] = useState('');
  const [leaderAddress, setLeaderAddress] = useState('');
  const [leaderCongenitalDisease, setLeaderCongenitalDisease] = useState('');

  const [members, setMembers] = useState<Member[]>([]);

  // Category-specific sub-selections
  const [subCategory, setSubCategory] = useState('');
  const [level, setLevel] = useState('');

  // Lecturer / Dosen Pendamping
  const [lecturerName, setLecturerName] = useState('');
  const [lecturerEmail, setLecturerEmail] = useState('');
  const [lecturerWhatsapp, setLecturerWhatsapp] = useState('');
  const [lecturerIdCardName, setLecturerIdCardName] = useState('');
  const [lecturerIdCardUrl, setLecturerIdCardUrl] = useState('');
  const [lecturerTwibbonName, setLecturerTwibbonName] = useState('');
  const [lecturerTwibbonUrl, setLecturerTwibbonUrl] = useState('');
  const [lecturerCongenitalDisease, setLecturerCongenitalDisease] = useState('');

  // Checkout Payment details
  const [paymentMethod, setPaymentMethod] = useState<'transfer_bank' | 'paypal'>('transfer_bank');
  const [selectedBank, setSelectedBank] = useState<'bca' | 'seabank'>('bca');
  const [paymentProofName, setPaymentProofName] = useState('');
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedText, setCopiedText] = useState('');


  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2000);
  };

  // Success state inside modal
  const [successPopup, setSuccessPopup] = useState<Registration | null>(null);

  // Synchronization error state
  const [syncError, setSyncError] = useState('');

  // Restore draft or reset form on open
  useEffect(() => {
    if (!isOpen) return;
    setSuccessPopup(null);

    const draft = loadDraft(initialDivisionId);
    if (draft) {
      setSelectedDivision(draft.selectedDivision);
      setWizardStep(draft.wizardStep);
      setTeamName(draft.teamName);
      setLeaderName(draft.leaderName);
      setLeaderEmail(draft.leaderEmail);
      setLeaderWhatsapp(draft.leaderWhatsapp);
      setLeaderInstitution(draft.leaderInstitution);
      setLeaderIdCardName(draft.leaderIdCardName);
      setLeaderIdCardUrl(draft.leaderIdCardUrl);
      setLeaderTwibbonName(draft.leaderTwibbonName);
      setLeaderTwibbonUrl(draft.leaderTwibbonUrl);
      setLeaderAddress(draft.leaderAddress);
      setLeaderCongenitalDisease(draft.leaderCongenitalDisease);
      const divForDraft = COMPETITION_DIVISIONS.find(d => d.id === draft.selectedDivision);
      const maxForDraft = divForDraft?.maxMembers ?? 1;
      const trimmedMembers = draft.members ? draft.members.slice(0, maxForDraft) : [];
      setMembers(trimmedMembers);
      setSubCategory(draft.subCategory);
      setLevel(draft.level);
      setLecturerName(draft.lecturerName);
      setLecturerEmail(draft.lecturerEmail);
      setLecturerWhatsapp(draft.lecturerWhatsapp);
      setLecturerIdCardName(draft.lecturerIdCardName);
      setLecturerIdCardUrl(draft.lecturerIdCardUrl);
      setLecturerTwibbonName(draft.lecturerTwibbonName);
      setLecturerTwibbonUrl(draft.lecturerTwibbonUrl);
      setLecturerCongenitalDisease(draft.lecturerCongenitalDisease);
      setPaymentMethod(draft.paymentMethod as 'transfer_bank' | 'paypal');
      setSelectedBank(draft.selectedBank as 'bca' | 'seabank');
      setPaymentProofName(draft.paymentProofName);
      setPaymentProofUrl(draft.paymentProofUrl);

    } else {
      setSelectedDivision(initialDivisionId);
      setWizardStep(1);
      setTeamName('');
      setLeaderName(currentUser?.name || '');
      setLeaderEmail(currentUser?.email || '');
      setLeaderWhatsapp('');
      setLeaderInstitution('');
      setLeaderIdCardName('');
      setLeaderIdCardUrl('');
      setLeaderTwibbonName('');
      setLeaderTwibbonUrl('');
      setLeaderAddress('');
      setLeaderCongenitalDisease('');

      setLecturerName('');
      setLecturerEmail('');
      setLecturerWhatsapp('');
      setLecturerIdCardName('');
      setLecturerIdCardUrl('');
      setLecturerTwibbonName('');
      setLecturerTwibbonUrl('');
      setLecturerCongenitalDisease('');

      setPaymentMethod('transfer_bank');
      setSelectedBank('bca');
      setPaymentProofName('');
      setPaymentProofUrl('');

      const divObjForMembers = COMPETITION_DIVISIONS.find(d => d.id === initialDivisionId);
      const baseMembers: Member[] = [];
      const memberCount = divObjForMembers?.maxMembers ?? 1;
      for (let i = 0; i < memberCount; i++) {
        baseMembers.push({
          id: `member-${i + 1}`,
          name: '',
          whatsapp: '',
          idCardName: '',
          idCardUrl: '',
          twibbonName: '',
          twibbonUrl: '',
          congenitalDisease: ''
        });
      }
      setMembers(baseMembers);
    }
  }, [isOpen, initialDivisionId, currentUser]);

  // Handle dynamic division options and roster capping
  useEffect(() => {
    const divObj = COMPETITION_DIVISIONS.find(d => d.id === selectedDivision);
    if (divObj) {
      if (divObj.hasSubCategory && divObj.subCategories && divObj.subCategories.length > 0) {
        setSubCategory(divObj.subCategories[0]);
      } else {
        setSubCategory('');
      }

      if (divObj.hasLevels && divObj.levels && divObj.levels.length > 0) {
        setLevel(divObj.levels[0]);
      } else {
        setLevel('');
      }

      setMembers(prev => {
        const needed = divObj.maxMembers ?? 1;
        const result = [...prev];
        while (result.length < needed) {
          const idx = result.length + 1;
          result.push({
            id: `member-${idx}`,
            name: '', whatsapp: '', idCardName: '', idCardUrl: '',
            twibbonName: '', twibbonUrl: '', congenitalDisease: ''
          });
        }
        while (result.length > needed) {
          result.pop();
        }
        return result.map((m, i) => ({ ...m, id: `member-${i + 1}` }));
      });
    }
  }, [selectedDivision]);

  // Debounced draft save: persists form progress to localStorage
  useEffect(() => {
    if (!isOpen || successPopup) return;
    const timer = setTimeout(() => {
      saveDraft(selectedDivision, {
        wizardStep,
        selectedDivision,
        teamName,
        leaderName,
        leaderEmail,
        leaderWhatsapp,
        leaderInstitution,
        leaderIdCardName,
        leaderIdCardUrl,
        leaderTwibbonName,
        leaderTwibbonUrl,
        leaderAddress,
        leaderCongenitalDisease,
        members,
        subCategory,
        level,
        lecturerName,
        lecturerEmail,
        lecturerWhatsapp,
        lecturerIdCardName,
        lecturerIdCardUrl,
        lecturerTwibbonName,
        lecturerTwibbonUrl,
        lecturerCongenitalDisease,
        paymentMethod,
        selectedBank,
        paymentProofName,
        paymentProofUrl,
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [
    isOpen, successPopup,
    selectedDivision, wizardStep,
    teamName, leaderName, leaderEmail, leaderWhatsapp, leaderInstitution,
    leaderIdCardName, leaderIdCardUrl, leaderTwibbonName, leaderTwibbonUrl,
    leaderAddress, leaderCongenitalDisease,
    members, subCategory, level,
    lecturerName, lecturerEmail, lecturerWhatsapp,
    lecturerIdCardName, lecturerIdCardUrl, lecturerTwibbonName, lecturerTwibbonUrl,
    lecturerCongenitalDisease,
    paymentMethod, selectedBank, paymentProofName, paymentProofUrl,
  ]);
  const processFileUpload = (
    file: File,
    onSetFilename: (name: string) => void,
    onSetUrl: (url: string) => void
  ) => {
    if (file.size > 5 * 1024 * 1024) {
      showAlert({ message: t('File size must be under 5MB!', 'Ukuran file harus di bawah 5MB!'), type: 'error' });
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
  };

  const handleFileProcess = (file: File) => {
    processFileUpload(file, setPaymentProofName, setPaymentProofUrl);
  };

  const updateMemberField = (id: string, field: keyof Member, value: string) => {
    setMembers(members.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  // Reusable Premium File Upload field with Drag-and-Drop + Clear functionality
  const SafeFileUpload = ({
    label,
    fileName,
    fileUrl,
    onSelect,
    onClear,
    id
  }: {
    label: string;
    fileName: string;
    fileUrl: string;
    onSelect: (file: File) => void;
    onClear: () => void;
    id: string;
  }) => {
    const [localDragging, setLocalDragging] = useState(false);
    return (
      <div className="space-y-1">
        <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">
          {label} <span className="text-[#FFD700]">*</span>
        </label>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setLocalDragging(true);
          }}
          onDragLeave={() => setLocalDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setLocalDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) onSelect(file);
          }}
          onClick={() => document.getElementById(id)?.click()}
          className={`border border-dashed rounded-xl p-2.5 text-center transition-all cursor-pointer relative ${
            localDragging
              ? 'border-[#FFD700] bg-[#FFD700]/5 scale-[0.99]'
              : fileUrl
                ? 'border-amber-500/30 bg-amber-950/5'
                : 'border-white/10 hover:border-white/20 bg-zinc-950/40'
          }`}
        >
          <input
            type="file"
            id={id}
            className="hidden"
            accept="image/*,application/pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onSelect(file);
            }}
          />
          {fileUrl ? (
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-[10px] font-mono text-white truncate max-w-[100px] sm:max-w-[140px] md:max-w-[180px]">
                  {fileName || 'File uploaded'}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className="text-[9px] font-mono text-zinc-500 hover:text-red-400 uppercase"
              >
                [Clear]
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 py-0.5 text-zinc-500">
              <Upload className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[9.5px] font-mono uppercase">
                {t('UPLOAD FILE', 'UNGGAH FILE')}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Submit trigger
  const handleWizardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessingPayment) return;
    if (wizardStep < 4) {
      if (wizardStep === 1 && !selectedDivision) return;
      if (wizardStep === 2) {
        if (!teamName || !leaderName || !leaderEmail || !leaderWhatsapp || !leaderInstitution || !leaderAddress || !leaderIdCardUrl || !leaderTwibbonUrl) {
          showAlert({ message: t(
            'Please fill out all Team Leader details and upload required documents (ID Card & Twibbon).',
            'Mohon lengkapi seluruh data Ketua Tim dan unggah dokumen wajib (Kartu Identitas & Twibbon).'
          ), type: 'error' });
          return;
        }
      }
      if (wizardStep === 3) {
        const minReq = divisionObj.minMembers ?? 0;
        const maxMem = divisionObj.maxMembers ?? 1;

        for (let i = 0; i < maxMem; i++) {
          const m = members[i];
          const isRequired = i < minReq;

          if (isRequired) {
            if (!m || !m.name.trim() || !m.whatsapp.trim() || !m.idCardUrl || !m.twibbonUrl) {
              showAlert({ message: t(
                `Please fill out Member ${i + 1} details and upload required documents (ID Card & Twibbon).`,
                `Mohon lengkapi seluruh data Anggota Tim ${i + 1} dan unggah dokumen wajib (Kartu Identitas & Twibbon).`
              ), type: 'error' });
              return;
            }
          } else {
            if (m && m.name.trim() !== '') {
              if (!m.whatsapp.trim() || !m.idCardUrl || !m.twibbonUrl) {
                showAlert({ message: t(
                  `Please fill out all Member ${i + 1} details or clear their name if not registered.`,
                  `Mohon lengkapi seluruh data Anggota Tim ${i + 1} atau kosongkan nama jika tidak terdaftar.`
                ), type: 'error' });
                return;
              }
            }
          }
        }

        // Validate Lecturer / Advisor
        if (divisionObj.hasLecturer) {
          if (!lecturerName.trim() || !lecturerEmail.trim() || !lecturerWhatsapp.trim() || !lecturerIdCardUrl || !lecturerTwibbonUrl) {
            showAlert({ message: t(
              'Please fill out all Lecturer / Advisor details and upload required documents (ID Card & Twibbon).',
              'Mohon lengkapi seluruh data Dosen / Guru Pembimbing dan unggah dokumen wajib (Kartu Identitas & Twibbon).'
            ), type: 'error' });
            return;
          }
        }
      }
      setWizardStep(wizardStep + 1);
      return;
    }

    // Step 4 is Payment Submission
    if (!paymentProofUrl) {
      showAlert({ message: t('Please upload your proof of payment file first!', 'Mohon unggah file bukti pembayaran Anda terlebih dahulu!'), type: 'error' });
      return;
    }

    setIsProcessingPayment(true);
    setSyncError('');

    const shortCode = selectedDivision.substring(0, 4).toUpperCase().replace(/-$/, '');
    const generatedPin = `ERIC-REG-${shortCode}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    const displayMethodName = paymentMethod === 'transfer_bank'
      ? `TRANSFER BANK (${selectedBank.toUpperCase()})`
      : 'PAYPAL';

    const finalMembers: Member[] = [];
    members.forEach(m => {
      if (m.name.trim() !== '') {
        finalMembers.push({ ...m });
      }
    });

    const finalRegistration: Registration = {
      id: `reg-${Date.now()}`,
      divisionId: selectedDivision,
      teamName: teamName,
      leader: {
        name: leaderName,
        email: leaderEmail.trim(),
        whatsapp: leaderWhatsapp,
        institution: leaderInstitution,
        address: leaderAddress,
        congenitalDisease: leaderCongenitalDisease,
        idCardName: leaderIdCardName,
        idCardUrl: leaderIdCardUrl,
        twibbonName: leaderTwibbonName,
        twibbonUrl: leaderTwibbonUrl,
      },
      members: finalMembers,
      paymentMethod: displayMethodName,
      paymentStatus: 'PAID',
      refCode: generatedPin,
      amount: divisionObj.price,
      subCategory: divisionObj.hasSubCategory ? subCategory : undefined,
      level: divisionObj.hasLevels ? level : undefined,
      lecturerName: divisionObj.hasLecturer ? lecturerName : undefined,
      lecturerEmail: divisionObj.hasLecturer ? lecturerEmail : undefined,
      lecturerWhatsapp: divisionObj.hasLecturer ? lecturerWhatsapp : undefined,
      lecturerIdCardName: divisionObj.hasLecturer ? lecturerIdCardName : undefined,
      lecturerIdCardUrl: divisionObj.hasLecturer ? lecturerIdCardUrl : undefined,
      lecturerTwibbonName: divisionObj.hasLecturer ? lecturerTwibbonName : undefined,
      lecturerTwibbonUrl: divisionObj.hasLecturer ? lecturerTwibbonUrl : undefined,
      lecturerCongenitalDisease: divisionObj.hasLecturer ? lecturerCongenitalDisease : undefined,
      paymentProofName: paymentProofName || undefined,
      paymentProofUrl: paymentProofUrl || undefined,
      ric: selectedDivision === 'research-innovation' ? {
        stage1Status: 'open',
        stage2Status: 'locked',
        stage3Status: 'locked',
      } : undefined
    };

    // Asynchronously synchronize registration data to Google Sheet
    syncToGoogleSheet(finalRegistration)
      .then((success) => {
        if (!success) {
          console.warn('Google Sheets sync skipped (URL not configured) or failed.');
        }
      })
      .catch((err) => {
        console.error('Failed to sync to Google Sheet:', err);
      })
      .finally(() => {
        clearDraft(selectedDivision);
        onRegistrationSuccess(finalRegistration);
        setSuccessPopup(finalRegistration);
        setIsProcessingPayment(false);
      });
  };

  const divisionObj = COMPETITION_DIVISIONS.find(d => d.id === selectedDivision) || COMPETITION_DIVISIONS[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md overflow-y-auto">
          <div className="min-h-full sm:min-h-screen flex items-center justify-center px-4 py-6 sm:py-10 md:py-12">
          <motion.div
            id="registration-modal-card"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-3xl p-5 sm:p-6 md:p-8 shadow-[0_35px_80px_rgba(0,0,0,0.95)] z-10"
          >
            {/* Design grid outline - hide on mobile */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:25px_25px] pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FFD700] to-[#0047AB]" />

            {/* Close Button */}
            {!successPopup && (
              <button
                onClick={() => {
                  showConfirm({
                    message: t('Save changes or discard?', 'Simpan perubahan atau buang perubahan?'),
                    type: 'warning',
                    confirmLabel: t('SAVE', 'SIMPAN'),
                    cancelLabel: t('DISCARD', 'BUANG'),
                    onConfirm: () => {
                      saveDraft(selectedDivision, {
                        wizardStep,
                        selectedDivision, teamName, leaderName, leaderEmail, leaderWhatsapp, leaderInstitution,
                        leaderIdCardName, leaderIdCardUrl, leaderTwibbonName, leaderTwibbonUrl,
                        leaderAddress, leaderCongenitalDisease,
                        members, subCategory, level,
                        lecturerName, lecturerEmail, lecturerWhatsapp,
                        lecturerIdCardName, lecturerIdCardUrl, lecturerTwibbonName, lecturerTwibbonUrl,
                        lecturerCongenitalDisease,
                        paymentMethod, selectedBank, paymentProofName, paymentProofUrl,
                      });
                      onClose();
                    },
                    onCancel: () => {
                      clearDraft(selectedDivision);
                      onClose();
                    },
                  });
                }}
                className="absolute top-4 right-4 p-2 bg-zinc-900 border border-white/5 hover:border-white/10 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer z-20"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <AnimatePresence mode="wait">
              {successPopup ? (
                /* SUCCESS FLOW - centered on both mobile and desktop */
                <motion.div
                  key="success-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6 select-none"
                >
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-[#FFD700]/10 rounded-full flex items-center justify-center border border-[#FFD700] shadow-[0_0_20px_rgba(255, 215, 0, 0.2)]">
                      <CheckCircle2 className="w-8 h-8 text-[#FFD700]" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-[#FFD700] uppercase tracking-[0.3em] block">
                      TRANSMISSION STATUS: ACCREDITED
                    </span>
                    <h3 className="text-3xl font-sans font-black text-white uppercase tracking-tighter">
                      {t('REGISTRATION SUCCESSFUL', 'REGISTRASI BERHASIL')}
                    </h3>
                    <p className="text-xs font-mono text-zinc-500 uppercase">
                      UNJ_ERIC-REGISTRATION_OK // SECURITY KEY ISSUED
                    </p>
                  </div>

                  <div className="bg-black border border-white/5 p-6 rounded-2xl text-center space-y-3 relative">
                    <span className="absolute top-2 right-3 text-[7px] font-mono text-white/5 select-none font-bold">
                      ERIC_DATABASE_COORDINATE
                    </span>
                    <div className="text-[9px] font-mono text-[#C5A059] uppercase tracking-widest font-bold">
                      {t('YOUR TOURNAMENT KEY', 'KUNCI AKSES TURNAMEN ANDA')}
                    </div>
                    <div className="text-2xl font-mono text-[#FFD700] font-black tracking-widest select-all">
                      {successPopup.refCode}
                    </div>
                    <p className="text-[8.5px] font-mono text-zinc-500 uppercase leading-normal">
                      {t('Save or copy this registration code to manage rosters and unlock access locks.', 'Simpan atau salin kode registrasi ini untuk mengelola roster dan membuka kunci akses.')}
                    </p>
                  </div>

                  <a
                    href={(() => {
                      const div = COMPETITION_DIVISIONS.find(d => d.id === successPopup.divisionId);
                      return div?.whatsappGroup || '#';
                    })()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-amber-950/20 border border-amber-500/20 hover:border-amber-400/40 rounded-2xl p-4 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <MessageCircle className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                      <div className="text-left">
                        <div className="text-[9px] font-mono text-amber-400 uppercase tracking-widest font-bold">
                          WHATSAPP GROUP — {(() => { const div = COMPETITION_DIVISIONS.find(d => d.id === successPopup.divisionId); return div?.title.toUpperCase() || ''; })()}
                        </div>
                        <div className="text-xs font-sans font-black text-white group-hover:text-amber-300 transition-colors uppercase tracking-tight">
                          {t('Click to join your division group', 'Klik untuk gabung grup divisi Anda')}
                        </div>
                      </div>
                    </div>
                  </a>

                  <a
                    href={MAIN_WHATSAPP_GROUP}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-[#FFD700]/10 border border-[#FFD700]/20 hover:border-[#FFD700]/40 rounded-2xl p-4 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <MessageCircle className="w-5 h-5 text-[#FFD700] group-hover:scale-110 transition-transform" />
                      <div className="text-left">
                        <div className="text-[9px] font-mono text-[#FFD700] uppercase tracking-widest font-bold">
                          WHATSAPP GROUP — ALL PARTICIPANTS
                        </div>
                        <div className="text-xs font-sans font-black text-white group-hover:text-[#FFD700] transition-colors uppercase tracking-tight">
                          {t('Main group for all ERIC 2026 participants', 'Grup utama untuk seluruh peserta ERIC 2026')}
                        </div>
                      </div>
                    </div>
                  </a>

                  <p className="text-xs text-zinc-400 font-mono uppercase leading-relaxed text-center px-4">
                    {t('Thank you', 'Terima kasih')}, <span className="text-white font-bold">{successPopup.leader.name}</span>. {t('Your team', 'Tim Anda')} <span className="text-[#FFD700] font-bold">"{successPopup.teamName}"</span> {t('is registered. A confirmation has been logged.', 'telah terdaftar. Konfirmasi telah dicatat.')}
                  </p>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full py-3 bg-gradient-to-r from-[#FFD700] to-[#FFE44D] text-black font-sans font-black text-xs tracking-wider uppercase rounded-xl shadow-[0_0_15px_rgba(255, 215, 0, 0.15)] hover:scale-101 transition-transform cursor-pointer"
                    >
                      {t('DONE', 'SELESAI')}
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* WIZARD FLOW */
                <motion.div key="wizard-card" className="space-y-6">
                  {/* Step indicators */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-4 select-none">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-[#FFD700] uppercase tracking-[0.25em] font-black block">
                        {t('CHAMPIONSHIP REGISTRATION DEPLOYER', 'REGISTRASI PERLOMBAAN RESMI')}
                      </span>
                      <h3 className="text-xl md:text-2xl font-sans font-black text-white uppercase tracking-tight">
                        {t('ARENA REGISTRATION', 'DAFTAR KATEGORI ARENA')}
                      </h3>
                    </div>

                    <div className="text-right font-mono text-xs text-zinc-500">
                      <span className="text-[#FFD700] font-bold">{wizardStep}</span> / 4
                    </div>
                  </div>

                  {/* Horizontal progress dots */}
                  <div className="flex gap-2 h-1 select-none">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full flex-grow rounded-full transition-all duration-300 ${
                          step <= wizardStep ? 'bg-[#FFD700]' : 'bg-zinc-800'
                        }`}
                      />
                    ))}
                  </div>

                  <form onSubmit={handleWizardSubmit} className="space-y-5">
                    {/* STEP 1: DIVISION VERIFICATION */}
                    {wizardStep === 1 && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-4"
                      >
                        <div className="p-5 bg-zinc-900/40 border border-white/5 rounded-2xl space-y-4">
                          <span className="text-[10px] font-mono text-[#FFD700] uppercase tracking-wider block font-bold">
                            {t('SELECTED DIVISION DETAILS', 'DETAIL DIVISI PILIHAN')}
                          </span>

                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-zinc-950 rounded-xl border border-white/10 text-[#FFD700]">
                              <Trophy className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="text-lg font-sans font-black text-white uppercase tracking-tight">
                                {divisionObj.title}
                              </h4>
                            </div>
                          </div>

                          <p className="text-xs text-zinc-400 font-mono leading-relaxed uppercase mt-2">
                            {t(divisionObj.description, divisionObj.indonesianDescription)}
                          </p>

                          <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4 text-[10px] font-mono text-zinc-500">
                            <div>
                              SPECIFICATION: <span className="text-white font-bold">{divisionObj.specHighlight}</span>
                            </div>
                            <div>
                              TECHNICAL INDEX: <span className="text-white font-bold">{divisionObj.intensityScore}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">
                            {t('Change Division Category', 'Ganti Kategori Perlombaan')}
                          </label>
                          <select
                            value={selectedDivision}
                            onChange={(e) => setSelectedDivision(e.target.value)}
                            className="w-full bg-zinc-900 border border-white/5 focus:border-[#FFD700] rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                          >
                            {COMPETITION_DIVISIONS.map((div) => (
                              <option key={div.id} value={div.id} className="bg-zinc-950 text-white">
                                {div.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        {divisionObj.hasSubCategory && divisionObj.subCategories && (
                          <div className="space-y-2">
                            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">
                              {t('Select Sub-Category', 'Pilih Sub-Kategori')}
                            </label>
                            <select
                              value={subCategory}
                              onChange={(e) => setSubCategory(e.target.value)}
                              className="w-full bg-zinc-900 border border-[#FFD700]/40 focus:border-[#FFD700] rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                            >
                              {divisionObj.subCategories.map((sub) => (
                                <option key={sub} value={sub} className="bg-zinc-950 text-white">
                                  {sub}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {divisionObj.hasLevels && divisionObj.levels && (
                          <div className="space-y-2">
                            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">
                              {t('Select Level / Category', 'Pilih Tingkat / Kategori')}
                            </label>
                            <select
                              value={level}
                              onChange={(e) => setLevel(e.target.value)}
                              className="w-full bg-zinc-900 border border-[#C5A059]/40 focus:border-[#C5A059] rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                            >
                              {divisionObj.levels.map((lvl) => (
                                <option key={lvl} value={lvl} className="bg-zinc-950 text-white">
                                  {lvl}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="pt-4 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setWizardStep(2)}
                            className="px-6 py-3 bg-[#FFD700] text-black font-sans font-black text-xs tracking-widest uppercase rounded-xl flex items-center gap-2 hover:scale-101 transition-all cursor-pointer shadow-[0_0_15px_rgba(255, 215, 0, 0.2)]"
                          >
                            <span>{t('CONTINUE', 'LANJUT')}</span>
                            <ArrowRight className="w-4 h-4 text-black" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 2: LEADER COORDINATES */}
                    {wizardStep === 2 && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1 md:col-span-2">
                            <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">{t('Team Designation Name', 'Nama Tim')}</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g., GARUDA UNJ 1"
                              value={teamName}
                              onChange={(e) => setTeamName(e.target.value.toUpperCase())}
                              className="w-full bg-zinc-900 border border-white/5 focus:border-[#FFD700] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">{t('Leader Full Name', 'Nama Ketua Tim')}</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g., Fauzan Lubis"
                              value={leaderName}
                              onChange={(e) => setLeaderName(e.target.value)}
                              className="w-full bg-zinc-900 border border-white/5 focus:border-[#FFD700] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">{t('Leader WhatsApp / Phone', 'Nomor Telepon Ketua')}</label>
                            <WhatsAppField
                              value={leaderWhatsapp}
                              onChange={setLeaderWhatsapp}
                              placeholder="e.g., 8123456789"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">{t('Leader Email Address', 'Email Ketua')}</label>
                            <input
                              type="email"
                              required
                              placeholder="e.g., mail@unj.ac.id"
                              value={leaderEmail}
                              onChange={(e) => setLeaderEmail(e.target.value)}
                              className="w-full bg-zinc-900 border border-white/5 focus:border-[#FFD700] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">{t('Institution / School', 'Institusi')}</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g., Jakarta State University (UNJ)"
                              value={leaderInstitution}
                              onChange={(e) => setLeaderInstitution(e.target.value)}
                              className="w-full bg-zinc-900 border border-white/5 focus:border-[#FFD700] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">{t('Leader Address', 'Alamat Ketua Tim')}</label>
                            <textarea
                              required
                              rows={2}
                              placeholder="e.g., Jl. Rawamangun Muka No. 1, Jakarta Timur"
                              value={leaderAddress}
                              onChange={(e) => setLeaderAddress(e.target.value)}
                              className="w-full bg-zinc-900 border border-white/5 focus:border-[#FFD700] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none resize-none"
                            />
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">
                              {t('Leader Congenital Disease (Leave blank if none)', 'Penyakit Bawaan Ketua Tim (Kosongkan jika tidak ada)')}
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., Asthma, Maag (optional)"
                              value={leaderCongenitalDisease}
                              onChange={(e) => setLeaderCongenitalDisease(e.target.value)}
                              className="w-full bg-zinc-900 border border-white/5 focus:border-[#FFD700] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                            />
                          </div>

                          <SafeFileUpload
                              label={t('ID Card Photo', 'Foto Kartu Identitas')}
                              fileName={leaderIdCardName}
                              fileUrl={leaderIdCardUrl}
                              onSelect={(file) => processFileUpload(file, setLeaderIdCardName, setLeaderIdCardUrl)}
                              onClear={() => {
                                setLeaderIdCardName('');
                                setLeaderIdCardUrl('');
                              }}
                              id="leader-id-card-input"
                          />

                          <SafeFileUpload
                            label={t('Twibbon Photo', 'Foto Twibbon')}
                            fileName={leaderTwibbonName}
                            fileUrl={leaderTwibbonUrl}
                            onSelect={(file) => processFileUpload(file, setLeaderTwibbonName, setLeaderTwibbonUrl)}
                            onClear={() => {
                              setLeaderTwibbonName('');
                              setLeaderTwibbonUrl('');
                            }}
                            id="leader-twibbon-input"
                          />
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-white/5 select-none">
                          <button
                            type="button"
                            onClick={() => setWizardStep(1)}
                            className="px-5 py-2.5 border border-white/10 text-xs font-mono text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer"
                          >
                            {t('BACK', 'KEMBALI')}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (!teamName || !leaderName || !leaderEmail || !leaderWhatsapp || !leaderInstitution || !leaderAddress || !leaderIdCardUrl || !leaderTwibbonUrl) {
                                showAlert({ message: t(
                                  'Please fill out all Team Leader details and upload required files (ID Card & Twibbon).',
                                  'Mohon lengkapi seluruh kolom Ketua Tim dan unggah berkas wajib (Kartu Identitas & Twibbon).'
                                ), type: 'error' });
                                return;
                              }
                              setWizardStep(3);
                            }}
                            className="px-6 py-3 bg-[#FFD700] text-black font-sans font-black text-xs tracking-widest uppercase rounded-xl flex items-center gap-2 hover:scale-101 transition-all cursor-pointer shadow-[0_0_15px_rgba(255, 215, 0, 0.2)]"
                          >
                            <span>{t('CONTINUE', 'LANJUT')}</span>
                            <ArrowRight className="w-4 h-4 text-black" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                     {/* STEP 3: COHORT TEAM ROSTER */}
                    {wizardStep === 3 && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-6"
                      >
                        {/* Member Sections — dynamically rendered based on minMembers/maxMembers */}
                        {members.map((member, index) => {
                          const isRequired = index < (divisionObj.minMembers ?? 0);
                          const memberNum = index + 1;
                          return (
                            <div key={member.id} className="p-4 bg-zinc-900/30 border border-white/5 rounded-2xl space-y-4">
                              <div className="flex justify-between items-center select-none border-b border-white/5 pb-2">
                                <h4 className="font-sans font-black text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                                  <span className={`w-1.5 h-1.5 rounded-full ${isRequired ? 'bg-[#FFD700]' : 'bg-zinc-500'}`} />
                                  {t(`MEMBER ${memberNum}`, `ANGGOTA TIM ${memberNum}`)}
                                </h4>
                                <span className={`text-[8.5px] font-mono uppercase font-bold tracking-widest px-2 py-0.5 rounded border ${
                                  isRequired
                                    ? 'text-[#FFD700] border-[#FFD700]/20 bg-[#FFD700]/5'
                                    : 'text-zinc-500 border-white/10 bg-white/5'
                                }`}>
                                  {isRequired ? t('REQUIRED', 'WAJIB') : t('OPTIONAL', 'OPSIONAL')}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">{t('Full Name', 'Nama')}</label>
                                  <input
                                    type="text"
                                    required={isRequired}
                                    placeholder={`e.g., Member ${memberNum}`}
                                    value={member.name || ''}
                                    onChange={(e) => updateMemberField(member.id, 'name', e.target.value)}
                                    className="w-full bg-zinc-900 border border-white/5 focus:border-[#FFD700] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">{t('WhatsApp Number', 'Nomor WhatsApp')}</label>
                                  <WhatsAppField
                                    value={member.whatsapp || ''}
                                    onChange={(val) => updateMemberField(member.id, 'whatsapp', val)}
                                    placeholder="e.g., 8123456789"
                                    required={isRequired}
                                  />
                                </div>

                                <div className="space-y-1 md:col-span-2">
                                  <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">
                                    {t('Congenital Disease (Optional)', 'Penyakit Bawaan jika ada')}
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g., Diabetes, Asthma (optional)"
                                    value={member.congenitalDisease || ''}
                                    onChange={(e) => updateMemberField(member.id, 'congenitalDisease', e.target.value)}
                                    className="w-full bg-zinc-900 border border-white/5 focus:border-[#FFD700] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                                  />
                                </div>

                                <SafeFileUpload
                                  label={t('ID Card Photo', 'Foto Kartu Identitas')}
                                  fileName={member.idCardName || ''}
                                  fileUrl={member.idCardUrl || ''}
                                  onSelect={(file) => processFileUpload(file,
                                    (name) => updateMemberField(member.id, 'idCardName', name),
                                    (url) => updateMemberField(member.id, 'idCardUrl', url)
                                  )}
                                  onClear={() => {
                                    updateMemberField(member.id, 'idCardName', '');
                                    updateMemberField(member.id, 'idCardUrl', '');
                                  }}
                                  id={`${member.id}-id-card-input`}
                                />

                                <SafeFileUpload
                                  label={t('Twibbon Photo', 'Foto Twibbon')}
                                  fileName={member.twibbonName || ''}
                                  fileUrl={member.twibbonUrl || ''}
                                  onSelect={(file) => processFileUpload(file,
                                    (name) => updateMemberField(member.id, 'twibbonName', name),
                                    (url) => updateMemberField(member.id, 'twibbonUrl', url)
                                  )}
                                  onClear={() => {
                                    updateMemberField(member.id, 'twibbonName', '');
                                    updateMemberField(member.id, 'twibbonUrl', '');
                                  }}
                                  id={`${member.id}-twibbon-input`}
                                />
                              </div>
                            </div>
                          );
                        })}

                        {/* Lecturer / Advisor Section */}
                        {divisionObj.hasLecturer && (
                          <div className="p-4 bg-zinc-900/40 border border-[#C5A059]/30 rounded-2xl space-y-4">
                            <div className="flex justify-between items-center select-none border-b border-[#C5A059]/20 pb-2">
                              <h4 className="font-sans font-black text-xs text-[#C5A059] uppercase tracking-wider flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                                {t('LECTURER / ADVISOR', 'DOSEN / GURU PEMBIMBING')}
                              </h4>
                              <span className="text-[8.5px] font-mono text-[#C5A059] uppercase tracking-widest border border-[#C5A059]/20 bg-[#C5A059]/5 px-2 py-0.5 rounded">
                                {t('REQUIRED', 'WAJIB')}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">{t('Full Name', 'Nama')}</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g., Dr. Eng. Hermawan"
                                  value={lecturerName}
                                  onChange={(e) => setLecturerName(e.target.value)}
                                  className="w-full bg-zinc-900 border border-white/5 focus:border-[#C5A059] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">{t('WhatsApp Number', 'Nomor WhatsApp / HP')}</label>
                                <WhatsAppField
                                  value={lecturerWhatsapp}
                                  onChange={setLecturerWhatsapp}
                                  placeholder="e.g., 8123456789"
                                  required
                                />
                              </div>

                              <div className="space-y-1 md:col-span-2">
                                <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">{t('Email', 'Email')}</label>
                                <input
                                  type="email"
                                  required
                                  placeholder="e.g., advisor@unj.ac.id"
                                  value={lecturerEmail}
                                  onChange={(e) => setLecturerEmail(e.target.value)}
                                  className="w-full bg-zinc-900 border border-white/5 focus:border-[#C5A059] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                                />
                              </div>

                              <div className="space-y-1 md:col-span-2">
                                <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">
                                  {t('Congenital Disease (Optional)', 'Penyakit Bawaan Pendamping jika ada')}
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g., Hypertension (optional)"
                                  value={lecturerCongenitalDisease}
                                  onChange={(e) => setLecturerCongenitalDisease(e.target.value)}
                                  className="w-full bg-zinc-900 border border-white/5 focus:border-[#C5A059] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                                />
                              </div>

                              <SafeFileUpload
                                label={t('ID Card Photo', 'Foto Kartu Identitas')}
                                fileName={lecturerIdCardName}
                                fileUrl={lecturerIdCardUrl}
                                onSelect={(file) => processFileUpload(file, setLecturerIdCardName, setLecturerIdCardUrl)}
                                onClear={() => {
                                  setLecturerIdCardName('');
                                  setLecturerIdCardUrl('');
                                }}
                                id="lecturer-id-card-input"
                              />

                              <SafeFileUpload
                                label={t('Twibbon Photo', 'Foto Twibbon')}
                                fileName={lecturerTwibbonName}
                                fileUrl={lecturerTwibbonUrl}
                                onSelect={(file) => processFileUpload(file, setLecturerTwibbonName, setLecturerTwibbonUrl)}
                                onClear={() => {
                                  setLecturerTwibbonName('');
                                  setLecturerTwibbonUrl('');
                                }}
                                id="lecturer-twibbon-input"
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-4 border-t border-white/5 select-none">
                          <button
                            type="button"
                            onClick={() => setWizardStep(2)}
                            className="px-5 py-2.5 border border-white/10 text-xs font-mono text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer"
                          >
                            {t('BACK', 'KEMBALI')}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const minReq = divisionObj.minMembers ?? 0;
                              const maxMem = divisionObj.maxMembers ?? 1;

                              for (let i = 0; i < maxMem; i++) {
                                const m = members[i];
                                const isRequired = i < minReq;

                                if (isRequired) {
                                  if (!m || !m.name.trim() || !m.whatsapp.trim() || !m.idCardUrl || !m.twibbonUrl) {
                                    showAlert({ message: t(
                                      `Please fill out Member ${i + 1} details and upload required documents (ID Card & Twibbon).`,
                                      `Mohon lengkapi seluruh data Anggota Tim ${i + 1} dan unggah dokumen wajib (Kartu Identitas & Twibbon).`
                                    ), type: 'error' });
                                    return;
                                  }
                                } else {
                                  if (m && m.name.trim() !== '') {
                                    if (!m.whatsapp.trim() || !m.idCardUrl || !m.twibbonUrl) {
                                      showAlert({ message: t(
                                        `Please fill out all Member ${i + 1} details or clear their name if not registered.`,
                                        `Mohon lengkapi seluruh data Anggota Tim ${i + 1} atau kosongkan nama jika tidak terdaftar.`
                                      ), type: 'error' });
                                      return;
                                    }
                                  }
                                }
                              }

                              // Validate Lecturer / Advisor
                              if (divisionObj.hasLecturer) {
                                if (!lecturerName.trim() || !lecturerEmail.trim() || !lecturerWhatsapp.trim() || !lecturerIdCardUrl || !lecturerTwibbonUrl) {
                                  showAlert({ message: t(
                                    'Please fill out all Lecturer / Advisor details and upload required documents (ID Card & Twibbon).',
                                    'Mohon lengkapi seluruh data Dosen / Guru Pembimbing dan unggah dokumen wajib (Kartu Identitas & Twibbon).'
                                  ), type: 'error' });
                                  return;
                                }
                              }

                              setWizardStep(4);
                            }}
                            className="px-6 py-3 bg-[#FFD700] text-black font-sans font-black text-xs tracking-widest uppercase rounded-xl flex items-center gap-2 hover:scale-101 transition-all cursor-pointer shadow-[0_0_15px_rgba(255, 215, 0, 0.2)]"
                          >
                            <span>{t('CONTINUE', 'LANJUT')}</span>
                            <ArrowRight className="w-4 h-4 text-black" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 4: DUAL PAYMENT GATEWAY */}
                    {wizardStep === 4 && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-4"
                      >
                        <div className="p-4 bg-zinc-900/60 border border-white/5 rounded-2xl flex justify-between items-center select-none">
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
                              {t('FEE SCHEDULE: NATIONAL LEAGUE', 'BIAYA PENDAFTARAN RESMI')}
                            </span>
                            <h4 className="text-sm font-sans font-black text-white uppercase">
                              {divisionObj.title}
                            </h4>
                          </div>

                          <div className="text-right">
                            <span className="text-[8.5px] font-mono text-amber-400 border border-amber-500/20 bg-amber-950/20 px-2 py-0.5 rounded uppercase block mb-1 font-bold">
                              {t('ALL INCLUSIVE', 'BIAYA TETAP')}
                            </span>
                            <span className="text-xl font-mono text-[#FFD700] font-black tracking-tight block">
                              {divisionObj.price}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500 tracking-tight block">
                              {divisionObj.priceUSD} {t('USD', 'USD')}
                            </span>
                          </div>
                        </div>

                        {/* Payment selectors */}
                        <div className="space-y-2">
                          <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block select-none">
                            {t('SELECT PAYMENT CHANNEL', 'PILIH METODE PEMBAYARAN')}
                          </label>
                          <div className="grid grid-cols-2 gap-2.5">
                            {[
                              { id: 'transfer_bank', name: 'BANK TRANSFER', desc: t('BCA / SeaBank (Manual)', 'BCA / SeaBank (Manual)') },
                              { id: 'paypal', name: 'PAYPAL', desc: t('USD Global Checkout', 'USD Global Checkout') }
                            ].map((ch) => (
                              <button
                                key={ch.id}
                                type="button"
                                onClick={() => {
                                  setPaymentMethod(ch.id as any);
                                  setPaymentProofName('');
                                  setPaymentProofUrl('');
                                }}
                                className={`p-3 bg-zinc-950 border rounded-xl text-center transition-all cursor-pointer ${
                                  paymentMethod === ch.id
                                    ? 'border-[#FFD700] bg-[#FFD700]/5'
                                    : 'border-white/5 hover:border-white/10 hover:bg-zinc-900/40'
                                }`}
                              >
                                <div className={`text-[11px] font-sans font-black ${paymentMethod === ch.id ? 'text-[#FFD700]' : 'text-white'}`}>
                                  {ch.name}
                                </div>
                                <div className="text-[8.5px] font-mono text-zinc-500 uppercase mt-0.5">{ch.desc}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Interactive dynamic sub-panels */}
                        <div className="mt-2">
                          <AnimatePresence mode="wait">
                            {paymentMethod === 'transfer_bank' && (
                              <motion.div
                                key="transfer-bank-panel"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl space-y-4"
                              >
                                {/* Bank Select Tabs */}
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedBank('bca')}
                                    className={`flex-1 py-1.5 px-3 rounded-lg font-sans font-bold text-[10px] tracking-wider uppercase transition-all border cursor-pointer ${
                                      selectedBank === 'bca'
                                        ? 'bg-zinc-900 border-[#FFD700] text-[#FFD700]'
                                        : 'bg-zinc-950 border-white/5 text-zinc-400 hover:text-white'
                                    }`}
                                  >
                                    BLU BCA BANK
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedBank('seabank')}
                                    className={`flex-1 py-1.5 px-3 rounded-lg font-sans font-bold text-[10px] tracking-wider uppercase transition-all border cursor-pointer ${
                                      selectedBank === 'seabank'
                                        ? 'bg-zinc-900 border-[#FFD700] text-[#FFD700]'
                                        : 'bg-zinc-950 border-white/5 text-zinc-400 hover:text-white'
                                    }`}
                                  >
                                    SEABANK
                                  </button>
                                </div>

                                {selectedBank === 'bca' ? (
                                  <div className="space-y-2 border border-white/5 rounded-xl p-3 bg-zinc-950/60">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[8.5px] font-mono text-zinc-500 uppercase">BANK NAME</span>
                                      <span className="text-[10px] font-sans font-black text-white">BLU BCA BANK</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-[8.5px] font-mono text-zinc-500 uppercase">ACCOUNT NUMBER</span>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[11px] font-mono text-[#FFD700] font-bold select-all tracking-wider">004332897796</span>
                                        <button
                                          type="button"
                                          onClick={() => handleCopy('004332897796', 'bca_acc')}
                                          className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                          title="Copy Account Number"
                                        >
                                          {copiedText === 'bca_acc' ? (
                                            <span className="text-[8px] font-mono text-[#FFD700] font-bold">COPIED</span>
                                          ) : (
                                            <Copy className="w-3 h-3" />
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-[8.5px] font-mono text-zinc-500 uppercase">ACCOUNT HOLDER</span>
                                      <span className="text-[10px] font-sans font-black text-zinc-300">Muhammad Raffa Wijaya</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-2 border border-white/5 rounded-xl p-3 bg-zinc-950/60">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[8.5px] font-mono text-zinc-500 uppercase">BANK NAME</span>
                                      <span className="text-[10px] font-sans font-black text-white">SeaBank</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-[8.5px] font-mono text-zinc-500 uppercase">ACCOUNT NUMBER</span>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[11px] font-mono text-[#FFD700] font-bold select-all tracking-wider">901641716770</span>
                                        <button
                                          type="button"
                                          onClick={() => handleCopy('901641716770', 'seabank_acc')}
                                          className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                          title="Copy Account Number"
                                        >
                                          {copiedText === 'seabank_acc' ? (
                                            <span className="text-[8px] font-mono text-[#FFD700] font-bold">COPIED</span>
                                          ) : (
                                            <Copy className="w-3 h-3" />
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-[8.5px] font-mono text-zinc-500 uppercase">ACCOUNT HOLDER</span>
                                      <span className="text-[10px] font-sans font-black text-zinc-300">Muhammad Raffa Wijaya</span>
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            )}

                            {paymentMethod === 'paypal' && (
                              <motion.div
                                key="paypal-panel"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl space-y-3"
                              >
                                <div className="space-y-2 border border-white/5 rounded-xl p-3 bg-zinc-950/60">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[8.5px] font-mono text-zinc-500 uppercase">PAYPAL USERNAME</span>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[11px] font-mono text-[#FFD700] font-bold select-all">@MuhammadRaffaWijaya</span>
                                      <button
                                        type="button"
                                        onClick={() => handleCopy('@MuhammadRaffaWijaya', 'pp_user')}
                                        className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                        title="Copy Username"
                                      >
                                        {copiedText === 'pp_user' ? (
                                          <span className="text-[8px] font-mono text-[#FFD700] font-bold">COPIED</span>
                                        ) : (
                                          <Copy className="w-3 h-3" />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-[8.5px] font-mono text-zinc-500 uppercase">PAYPAL EMAIL</span>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[11px] font-mono text-white select-all">kokoraffa06@gmail.com</span>
                                      <button
                                        type="button"
                                        onClick={() => handleCopy('kokoraffa06@gmail.com', 'pp_email')}
                                        className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                        title="Copy Email"
                                      >
                                        {copiedText === 'pp_email' ? (
                                          <span className="text-[8px] font-mono text-[#FFD700] font-bold">COPIED</span>
                                        ) : (
                                          <Copy className="w-3 h-3" />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-[8.5px] font-mono text-zinc-500 uppercase">ACCOUNT HOLDER</span>
                                    <span className="text-[10px] font-sans font-black text-zinc-300">Muhammad Raffa Wijaya</span>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Drag & Drop Proof Upload Component */}
                        <div className="space-y-1.5 mt-4">
                          <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block select-none">
                            {t('UPLOAD PROOF OF PAYMENT', 'UNGGAH BUKTI PEMBAYARAN')} <span className="text-red-500 font-bold">*</span>
                          </label>
                          <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setIsDragging(false);
                              const file = e.dataTransfer.files?.[0];
                              if (file) handleFileProcess(file);
                            }}
                            onClick={() => document.getElementById('proof-file-input')?.click()}
                            className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer ${
                              isDragging 
                                ? 'border-[#FFD700] bg-[#FFD700]/5 scale-[0.99]'
                                : paymentProofUrl 
                                  ? 'border-amber-500/35 bg-amber-950/5' 
                                  : 'border-white/10 hover:border-white/20 bg-zinc-950/40'
                            }`}
                          >
                            <input
                              type="file"
                              id="proof-file-input"
                              className="hidden"
                              accept="image/*,application/pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileProcess(file);
                              }}
                            />
                            
                            {paymentProofUrl ? (
                              <div className="space-y-1">
                                <div className="mx-auto w-8 h-8 rounded-full bg-amber-950/50 border border-amber-500/20 flex items-center justify-center">
                                  <Check className="w-4 h-4 text-amber-400" />
                                </div>
                                <div className="text-[11px] font-mono font-bold text-white truncate max-w-xs mx-auto">
                                  {paymentProofName}
                                </div>
                                <p className="text-[9px] font-mono text-amber-400 uppercase font-semibold">
                                  {t('UPLOAD SUCCESSFUL! PRESS SUBMIT TO REGISTER', 'UNGGAH BERHASIL! TEKAN DAFTAR UNTUK MENYELESAIKAN')}
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div className="mx-auto w-8 h-8 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center">
                                  <Upload className="w-4 h-4 text-zinc-400" />
                                </div>
                                <div className="text-[10px] font-sans font-bold text-white uppercase">
                                  {t('DRAG & DROP OR BROWSE', 'SERET & TARUH ATAU CARI FILE')}
                                </div>
                                <p className="text-[8.5px] font-mono text-zinc-500 uppercase leading-normal">
                                  {t('SUPPORTED FORMATS: PNG, JPG, PDF (MAX 5MB)', 'FORMAT DISETUJUI: PNG, JPG, PDF (MAKSIMAL 5MB)')}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Synchronization Warning / Note */}
                        {syncError && (
                          <div className="p-3 border border-amber-500/20 bg-amber-500/10 rounded-xl flex gap-2 items-center text-[9.5px] text-amber-400 font-mono select-none mt-4">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span className="uppercase">{syncError}</span>
                          </div>
                        )}

                        {/* Bottom Actions */}
                        <div className="flex justify-between items-center pt-4 border-t border-white/5 select-none">
                          <button
                            type="button"
                            onClick={() => setWizardStep(3)}
                            className="px-5 py-2.5 border border-white/10 text-xs font-mono text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer"
                          >
                            {t('BACK', 'KEMBALI')}
                          </button>

                          <button
                            type="submit"
                            disabled={isProcessingPayment}
                            className="px-8 py-3.5 bg-[#FFD700] text-black font-sans font-black text-xs tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255, 215, 0, 0.25)] hover:shadow-[0_0_35px_rgba(255, 215, 0, 0.55)] hover:scale-101 transition-all cursor-pointer disabled:opacity-50 font-bold"
                          >
                            {isProcessingPayment ? (
                              <>
                                <Terminal className="w-4 h-4 animate-spin text-black" />
                                <span>PROCESSING REGISTRATION PAYLOAD...</span>
                              </>
                            ) : (
                              <>
                                <Trophy className="w-4 h-4 text-black" />
                                <span>{t('VERIFY & SUBMIT', 'VERIFIKASI & DAFTAR')}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
