/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { useAlert } from './AlertModal';
import { COMPETITION_DIVISIONS } from '../data';
import { Member, Registration, RICSubmission } from '../types';
import RICAdminPanel from './RICAdminPanel';
import * as XLSX from 'xlsx';
import { 
  Trophy, User, Code, Terminal, Sparkles, Plus, Trash2, 
  Edit2, Check, AlertCircle, Building2, Download, 
  FileSpreadsheet, Database, Search, ArrowLeft, X,
  Hash, ShieldAlert, CreditCard, Users, Globe, Copy, ExternalLink
} from 'lucide-react';
import { getGoogleScriptUrl, setGoogleScriptUrl } from '../lib/googleSheet';

interface AdminDashboardProps {
  currentUser: { name: string; email: string; method: string } | null;
  registrations: Registration[];
  onUpdateRegistrations: (newRegs: Registration[]) => void;
  onBackToHome: () => void;
  ricSubmissions: RICSubmission[];
  onUpdateRICSubmissions: (subs: RICSubmission[], stageIdx?: number, changedSubId?: string) => void;
}

export default function AdminDashboard({
  currentUser,
  registrations,
  onUpdateRegistrations,
  onBackToHome,
  ricSubmissions,
  onUpdateRICSubmissions
}: AdminDashboardProps) {
  const { t } = useLanguage();
  const { showAlert, showConfirm } = useAlert();

  // Search and filter states
  const [activeTab, setActiveTab] = useState<'registrations' | 'ric'>('registrations');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivFilter, setSelectedDivFilter] = useState('ALL');
  const [editingReg, setEditingReg] = useState<Registration | null>(null);

  // Google Sheets integration state
  const [googleScriptUrl, setGoogleScriptUrlState] = useState(getGoogleScriptUrl());
  const [showScriptGuide, setShowScriptGuide] = useState(false);
  const [copiedText, setCopiedText] = useState('');

  const saveGoogleScriptUrl = (url: string) => {
    setGoogleScriptUrlState(url);
    setGoogleScriptUrl(url);
  };

  // Statistics calculation
  const totalTeams = registrations.length;
  const totalRosterMembers = registrations.reduce((acc, reg) => acc + 1 + reg.members.length, 0);
  const paidTeams = registrations.filter(r => r.paymentStatus === 'PAID').length;
  const activeDivisionsCount = Array.from(new Set(registrations.map(r => r.divisionId))).length;

  // Filter registrations based on search and division select
  const filteredAllEntries = registrations.filter((reg) => {
    const divisionObj = COMPETITION_DIVISIONS.find(d => d.id === reg.divisionId);
    const matchesSearch = 
      reg.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.leader.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.leader.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (divisionObj && divisionObj.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDivision = selectedDivFilter === 'ALL' || reg.divisionId === selectedDivFilter;

    return matchesSearch && matchesDivision;
  });

  // Export to Excel divided by sheets per arena
  const downloadExcelLedger = () => {
    const wb = XLSX.utils.book_new();

    COMPETITION_DIVISIONS.forEach((division) => {
      const divisionRegs = registrations.filter(r => r.divisionId === division.id);
      const sheetRows: any[] = [];

      if (divisionRegs.length > 0) {
        divisionRegs.forEach((reg, index) => {
          const row: any = {
            'No': index + 1,
            'Reference Code': reg.refCode,
            'Team Name': reg.teamName,
            'Sub Category': reg.subCategory || '-',
            'Level': reg.level || '-',
            'Leader Name': reg.leader.name,
            'Leader Email': reg.leader.email,
            'Leader WhatsApp': reg.leader.whatsapp,
            'Institution': reg.leader.institution,
            'Leader Address': reg.leader.address || '-',
            'Leader Congenital Disease': reg.leader.congenitalDisease || 'None',
            'Leader ID Card Link': reg.leader.idCardUrl || '-',
            'Leader Twibbon Link': reg.leader.twibbonUrl || '-',
            'Lecturer Name': reg.lecturerName || '-',
            'Lecturer Email': reg.lecturerEmail || '-',
            'Lecturer WhatsApp': reg.lecturerWhatsapp || '-',
            'Lecturer Congenital Disease': reg.lecturerCongenitalDisease || 'None',
            'Lecturer ID Card Link': reg.lecturerIdCardUrl || '-',
            'Lecturer Twibbon Link': reg.lecturerTwibbonUrl || '-',
            'Payment Gateway': reg.paymentMethod,
            'Billing Status': reg.paymentStatus,
            'Amount Paid': reg.amount || (COMPETITION_DIVISIONS.find(d => d.id === reg.divisionId)?.price || 'IDR 250,000'),
            'Payment Proof File': reg.paymentProofName || '-',
            'Payment Proof Data': reg.paymentProofUrl ? '(Base64 Data Present)' : '-',
            'Roster size': reg.members.length + 1
          };

          for (let i = 0; i < 5; i++) {
            const member = reg.members[i];
            row[`Member ${i + 1} Name`] = member ? member.name : '';
            row[`Member ${i + 1} WhatsApp`] = member ? member.whatsapp : '';
            row[`Member ${i + 1} Congenital Disease`] = member ? member.congenitalDisease || 'None' : '';
            row[`Member ${i + 1} ID Card Link`] = member ? member.idCardUrl || '-' : '';
            row[`Member ${i + 1} Twibbon Link`] = member ? member.twibbonUrl || '-' : '';
          }

          sheetRows.push(row);
        });
      } else {
        sheetRows.push({
          'No': '-',
          'Reference Code': '-',
          'Team Name': '-',
          'Sub Category': '-',
          'Level': '-',
          'Leader Name': '(No entries registered in this division yet)',
          'Leader Email': '-',
          'Leader WhatsApp': '-',
          'Institution': '-',
          'Lecturer Name': '-',
          'Lecturer Email': '-',
          'Lecturer WhatsApp': '-',
          'Payment Gateway': '-',
          'Billing Status': '-',
          'Amount Paid': '-',
          'Payment Proof File': '-',
          'Payment Proof Data': '-',
          'Roster size': 0
        });
      }

      const ws = XLSX.utils.json_to_sheet(sheetRows);

      ws['!cols'] = [
        { wch: 6 }, { wch: 18 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 22 }, { wch: 28 },
        { wch: 18 }, { wch: 30 }, { wch: 22 }, { wch: 25 }, { wch: 18 }, { wch: 16 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 25 }, { wch: 12 }
      ];

      const titleCleaned = division.title.replace(/[\\\/\?\*\:\[\]]/g, '').substring(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, titleCleaned);
    });

    XLSX.writeFile(wb, `ERIC_2026_Live_Registrations_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Delete registration handler
  const handleDeleteRegistration = (id: string) => {
    showConfirm({
      message: t('Are you sure you want to withdraw this registration? This cannot be undone.', 'Apakah Anda yakin ingin menarik pendaftaran ini? Tindakan ini tidak dapat dibatalkan.'),
      type: 'danger',
      confirmLabel: t('DELETE', 'HAPUS'),
      cancelLabel: t('CANCEL', 'BATAL'),
      onConfirm: () => {
        const updated = registrations.filter(r => r.id !== id);
        onUpdateRegistrations(updated);
      }
    });
  };

  // Save edited registration
  const saveEditedForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReg) return;

    const updated = registrations.map(r => r.id === editingReg.id ? editingReg : r);
    onUpdateRegistrations(updated);
    setEditingReg(null);
    showAlert({ message: t('Roster changes synchronized successfully!', 'Perubahan roster berhasil disinkronkan!'), type: 'success' });
  };

  // Inline editor helper state modifiers
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
    <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto space-y-8 select-none">
      
      {/* Header breadcrumb & info bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/5 hover:border-[#FFD700]/20 hover:text-[#FFD700] text-xs font-mono font-bold uppercase rounded-xl transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('Back to Landing Page', 'Kembali ke Beranda')}</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-full text-[9px] font-mono text-[#FFD700] uppercase font-black tracking-widest animate-pulse">
            ADMIN SECURE NETWORK ACCESS
          </div>
        </div>
      </div>

      {/* Main Big Title Block */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono text-[#FFD700] tracking-[0.25em] uppercase font-black">
          ROSTER TELEMETRY DATABANK
        </span>
        <h2 className="text-4xl md:text-6xl font-sans font-black tracking-tight text-white uppercase leading-none">
          ADMIN <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FFEA85] to-white">DASHBOARD</span>
        </h2>
        <p className="text-zinc-500 font-mono text-xs uppercase max-w-2xl leading-relaxed">
          {t('A secure high-performance system console for administrating tournament registrations, auditing candidate rosters, and exporting official excel ledgers.', 'Konsol sistem berkinerja tinggi yang aman untuk mengelola pendaftaran turnamen, memeriksa daftar nama peserta, dan mengunduh laporan excel resmi.')}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-zinc-950 border border-white/5 rounded-2xl p-1 w-fit">
        <button
          onClick={() => setActiveTab('registrations')}
          className={`px-5 py-2 text-xs font-mono font-black uppercase rounded-xl transition-all cursor-pointer ${activeTab === 'registrations' ? 'bg-[#FFD700] text-black shadow-[0_0_15px_rgba(255,215,0,0.2)]' : 'text-zinc-400 hover:text-white'}`}
        >
          REGISTRATIONS
        </button>
        <button
          onClick={() => setActiveTab('ric')}
          className={`px-5 py-2 text-xs font-mono font-black uppercase rounded-xl transition-all cursor-pointer ${activeTab === 'ric' ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'text-zinc-400 hover:text-white'}`}
        >
          RIC REVIEW
        </button>
      </div>

      {activeTab === 'registrations' && (<>
      {/* Database Statistics Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-zinc-950 border border-white/5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#FFD700]" />
          <div className="flex justify-between items-start text-zinc-500">
            <span className="text-[9px] font-mono uppercase tracking-wider">Total Teams Registered</span>
            <Trophy className="w-4 h-4 text-[#FFD700]" />
          </div>
          <div className="text-3xl font-sans font-black text-white mt-4">{totalTeams}</div>
          <div className="text-[8px] font-mono text-[#FFD700] uppercase tracking-wider mt-1">Across all arenas</div>
        </div>

        <div className="p-6 bg-zinc-950 border border-white/5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#0047AB]" />
          <div className="flex justify-between items-start text-zinc-500">
            <span className="text-[9px] font-mono uppercase tracking-wider">Total Roster Members</span>
            <Users className="w-4 h-4 text-[#0047AB]" />
          </div>
          <div className="text-3xl font-sans font-black text-white mt-4">{totalRosterMembers}</div>
          <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider mt-1">Candidates & Leaders included</div>
        </div>

        <div className="p-6 bg-zinc-950 border border-white/5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#FFD700]" />
          <div className="flex justify-between items-start text-zinc-500">
            <span className="text-[9px] font-mono uppercase tracking-wider">Billing Status Fully Paid</span>
            <CreditCard className="w-4 h-4 text-[#FFD700]" />
          </div>
          <div className="text-3xl font-sans font-black text-white mt-4">{paidTeams}</div>
          <div className="text-[8px] font-mono text-[#FFD700] uppercase tracking-wider mt-1">{totalTeams > 0 ? `${Math.round((paidTeams/totalTeams)*100)}% Completion` : '0%'}</div>
        </div>

        <div className="p-6 bg-zinc-950 border border-white/5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-purple-500" />
          <div className="flex justify-between items-start text-zinc-500">
            <span className="text-[9px] font-mono uppercase tracking-wider">Active Arenas Registered</span>
            <Database className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-sans font-black text-white mt-4">{activeDivisionsCount} / 9</div>
          <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider mt-1">Unique active classifications</div>
        </div>
      </div>

      {/* Dynamic Controls Grid (Excel and search controls) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Search, Filter, & Table panel */}
        <div className="lg:col-span-8 bg-zinc-950 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="space-y-1">
              <h4 className="font-sans font-black text-white uppercase text-sm tracking-wider">
                PARTICIPANT LIST
              </h4>
              <p className="text-[9px] font-mono text-zinc-500 uppercase">
                {filteredAllEntries.length} entries matching search parameters
              </p>
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <div className="relative flex-grow">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder={t('Search teams, leaders...', 'Cari tim, ketua...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD700] transition-colors"
                />
              </div>

              <select
                value={selectedDivFilter}
                onChange={(e) => setSelectedDivFilter(e.target.value)}
                className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD700]"
              >
                <option value="ALL">ALL DIVISIONS</option>
                {COMPETITION_DIVISIONS.map(d => (
                  <option key={d.id} value={d.id}>{d.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table container */}
          <div className="overflow-x-auto border border-white/5 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900 border-b border-white/5 font-mono text-[9px] text-zinc-400 uppercase tracking-wider">
                  <th className="p-4">{t('TEAM & CODE', 'TIM & KODE')}</th>
                  <th className="p-4">{t('DIVISION & OPTION', 'DIVISI & DETAIL')}</th>
                  <th className="p-4">{t('LEADER DETAILS', 'DETAIL KETUA')}</th>
                  <th className="p-4">{t('INSTITUTION', 'INSTITUSI')}</th>
                  <th className="p-4">{t('ADVISOR / GURU', 'PEMBIMBING')}</th>
                  <th className="p-4">{t('PAYMENT & PROOF', 'BUKTI & BAYAR')}</th>
                  <th className="p-4 text-right">{t('ROSTER SIZE', 'UKURAN ROSTER')}</th>
                  <th className="p-4 text-right">{t('ACTIONS', 'AKSI')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-xs text-zinc-300">
                {filteredAllEntries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-zinc-500 uppercase">
                      {t('No registered teams match your criteria', 'Tidak ada tim terdaftar yang cocok dengan kriteria Anda')}
                    </td>
                  </tr>
                ) : (
                  filteredAllEntries.map((reg) => {
                    const divisionObj = COMPETITION_DIVISIONS.find(d => d.id === reg.divisionId);
                    return (
                      <tr key={reg.id} className="hover:bg-zinc-900/35 transition-colors">
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-sans font-black text-white uppercase">{reg.teamName}</span>
                            <span className="text-[9px] text-zinc-500 font-mono tracking-tight mt-0.5 select-all font-bold">Ref: {reg.refCode}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-[#FFD700] font-bold">{divisionObj?.title || reg.divisionId}</span>
                            {reg.subCategory && <span className="text-[10px] text-[#FFD700]">Sub: {reg.subCategory}</span>}
                            {reg.level && <span className="text-[10px] text-[#C5A059]">Lvl: {reg.level}</span>}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-white font-semibold">{reg.leader.name}</span>
                            <span className="text-[10px] text-zinc-400">{reg.leader.email}</span>
                            <span className="text-[9px] text-zinc-500">{reg.leader.whatsapp}</span>
                          </div>
                        </td>
                        <td className="p-4 text-zinc-400">{reg.leader.institution}</td>
                        <td className="p-4">
                          {reg.lecturerName ? (
                            <div className="flex flex-col">
                              <span className="text-white font-medium">{reg.lecturerName}</span>
                              <span className="text-[10px] text-zinc-400">{reg.lecturerEmail}</span>
                              <span className="text-[9px] text-zinc-500">{reg.lecturerWhatsapp}</span>
                            </div>
                          ) : (
                            <span className="text-zinc-600">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-[#FFD700] font-bold uppercase">{reg.paymentMethod}</span>
                            <span className="text-[9px] text-zinc-500">{reg.amount || COMPETITION_DIVISIONS.find(d => d.id === reg.divisionId)?.price || 'IDR 250,000'}</span>
                            {reg.paymentProofUrl ? (
                              <a
                                href={reg.paymentProofUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[9.5px] text-amber-400 hover:text-[#FFD700] hover:underline font-bold"
                              >
                                <Download className="w-2.5 h-2.5" />
                                <span className="truncate max-w-[90px]">{reg.paymentProofName || 'View File'}</span>
                              </a>
                            ) : (
                              <span className="text-[9px] text-zinc-600 italic">No proof uploaded</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right text-zinc-500">
                          <span className="text-white font-bold">{reg.members.length + 1}</span> {t('Roster', 'Roster')}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => setEditingReg(JSON.parse(JSON.stringify(reg)))}
                              className="p-1.5 bg-zinc-900 border border-white/5 hover:border-[#FFD700]/20 text-zinc-400 hover:text-[#FFD700] rounded-lg transition-colors cursor-pointer"
                              title="Edit Roster"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRegistration(reg.id)}
                              className="p-1.5 bg-zinc-900 border border-white/5 hover:border-red-500/20 text-zinc-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                              title="Withdraw Team"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Excel & administrative controls column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Excel compilation module */}
          <div className="p-6 bg-zinc-950 border border-white/5 rounded-3xl space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-6 h-6 text-[#FFD700]" />
                <h4 className="font-sans font-black text-white uppercase tracking-wider text-sm">
                  OFFICIAL XLSX LEDGER GENERATION
                </h4>
              </div>
              <p className="text-xs font-mono text-zinc-400 uppercase leading-relaxed">
                {t('Compile and download a real-time, comprehensive Excel workbook containing all registered team records. Each competition division is cleanly partitioned into its own sheet containing leader coordinates, ref keys, and additional roster details.', 'Kompilasi dan unduh workbook Excel real-time yang berisi semua catatan tim yang terdaftar. Setiap divisi kompetisi akan dipisahkan secara bersih ke dalam sheetnya sendiri.')}
              </p>
            </div>
            <button
              onClick={downloadExcelLedger}
              className="w-full mt-6 py-3.5 bg-gradient-to-r from-[#FFD700] to-[#FFE44D] text-black font-sans font-black text-xs tracking-wider uppercase rounded-xl hover:scale-101 transition-transform cursor-pointer flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(255, 215, 0, 0.2)]"
            >
              <Download className="w-4 h-4" />
              <span>DOWNLOAD FULL EXCEL LEDGER</span>
            </button>
          </div>

          {/* Google Sheets Real-Time Sync Module */}
          <div className="p-6 bg-zinc-950 border border-white/5 rounded-3xl space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Globe className="w-6 h-6 text-[#4D90FE]" />
                <h4 className="font-sans font-black text-white uppercase tracking-wider text-sm">
                  GOOGLE SHEETS INSTANT SYNC
                </h4>
              </div>
              <p className="text-xs font-mono text-zinc-400 uppercase leading-relaxed">
                {t('Configure an automated link with your live Google Spreadsheet. Participants submit, and records instantly append as rows with no sign-in or authorization required from them.', 'Konfigurasikan tautan otomatis dengan Spreadsheet Google Anda. Peserta mendaftar, dan data langsung ditambahkan sebagai baris tanpa perlu login Google dari sisi mereka.')}
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-zinc-500 uppercase">WEB APP URL</span>
                  {googleScriptUrl ? (
                    <span className="text-[#FFD700] font-bold uppercase flex items-center gap-1">
                      <span className="w-1 h-1 bg-[#FFD700] rounded-full animate-pulse" />
                      ACTIVE SYNC
                    </span>
                  ) : (
                    <span className="text-amber-500 font-bold uppercase">INACTIVE</span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={googleScriptUrl}
                  onChange={(e) => saveGoogleScriptUrl(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/5 hover:border-white/10 rounded-xl px-3 py-2.5 text-[11px] font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-[#4D90FE]/30 transition-all"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                onClick={() => setShowScriptGuide(true)}
                className="py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-300 hover:text-white font-mono text-[9px] font-bold uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>HOW TO SETUP</span>
              </button>
              <a
                href="https://docs.google.com/spreadsheets/d/12ouLbtyguh2VWYX0_DQlJUU_KCCEZ4qQBtH0RL2UFP8/edit?usp=sharing"
                target="_blank"
                rel="noreferrer"
                className="py-2.5 bg-[#4D90FE]/10 hover:bg-[#4D90FE]/15 border border-[#4D90FE]/20 text-[#4D90FE] font-mono text-[9px] font-bold uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>OPEN SHEET</span>
              </a>
            </div>
          </div>

          {/* Database Info Node */}
          <div className="p-6 bg-zinc-950 border border-white/5 rounded-3xl space-y-4">
            <div className="flex items-center gap-3">
              <Terminal className="w-6 h-6 text-[#FFD700]" />
              <h4 className="font-sans font-black text-white uppercase tracking-wider text-sm">
                DATABASE TELEMETRY LOGS
              </h4>
            </div>
            <p className="text-xs font-mono text-zinc-400 uppercase leading-relaxed">
              {t('You are authenticated as an official administrator. Roster updates performed here are synchronized directly with local storage nodes. Full export sheets represent structural schemas.', 'Anda terotentikasi sebagai administrator resmi. Pembaruan roster yang dilakukan di sini disinkronkan langsung dengan penyimpanan lokal.')}
            </p>
            <div className="p-4 bg-zinc-900 border border-white/5 rounded-xl flex items-center justify-between text-[9px] font-mono text-zinc-500 uppercase">
              <div>STATUS: <span className="text-[#FFD700] font-bold">ONLINE</span></div>
              <div>VERSION: <span className="text-white">v2.1.0-LIVE</span></div>
            </div>
          </div>

        </div>

      </div>

      {/* OVERLAY DIALOG: GOOGLE APPS SCRIPT SETUP GUIDE */}
      <AnimatePresence>
        {showScriptGuide && (
          <motion.div
            key="guide-dialog"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto"
          >
            <div className="absolute inset-0 cursor-default" onClick={() => setShowScriptGuide(false)} />
            <div className="bg-[#0C0C0C] border border-white/10 rounded-3xl p-6 md:p-8 max-w-2xl w-full relative z-10 overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.95)]">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-[#4D90FE] uppercase tracking-widest block font-black">
                    INTEGRATION HANDBOOK
                  </span>
                  <h4 className="text-lg font-sans font-black text-white uppercase tracking-tight">
                    GOOGLE SHEETS SETUP GUIDE
                  </h4>
                </div>
                <button
                  onClick={() => setShowScriptGuide(false)}
                  className="p-1.5 bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-5 pt-4 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                <div className="space-y-2 text-xs font-mono text-zinc-400 uppercase leading-relaxed">
                  <p className="text-white font-bold">Follow these steps to link your live Google Sheet:</p>
                  <ol className="list-decimal pl-4 space-y-1.5">
                    <li>Open your Google Sheet: <a href="https://docs.google.com/spreadsheets/d/12ouLbtyguh2VWYX0_DQlJUU_KCCEZ4qQBtH0RL2UFP8/edit" target="_blank" rel="noreferrer" className="text-[#4D90FE] hover:underline inline-flex items-center gap-1">Open Sheet <ExternalLink className="w-3 h-3" /></a></li>
                    <li>In the top menu, go to <span className="text-white font-bold">Extensions</span> &rarr; <span className="text-white font-bold">Apps Script</span>.</li>
                    <li>Copy the pre-made integration script below entirely.</li>
                    <li>Paste it into <code className="text-white bg-zinc-900 px-1 py-0.5 rounded">Code.gs</code>, saving any changes.</li>
                    <li>In the top-right corner, click <span className="text-white font-bold">Deploy</span> &rarr; <span className="text-white font-bold">New deployment</span>.</li>
                    <li>Click the gear icon, select <span className="text-white font-bold">Web app</span>.</li>
                    <li>Set "Who has access" to <span className="text-[#FFD700] font-bold">Anyone</span> (crucial to allow direct submissions).</li>
                    <li>Click <span className="text-white font-bold">Deploy</span>, approve requested Google permissions.</li>
                    <li>Copy the resulting Web App URL and paste it in the field on your left.</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase font-bold">Code.gs Script</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`/**
 * GOOGLE APPS SCRIPT FOR GOOGLE SHEET SYNCHRONIZATION
 */
const SPREADSHEET_ID = "12ouLbtyguh2VWYX0_DQlJUU_KCCEZ4qQBtH0RL2UFP8";

function getOrCreateFolder(name) {
  const folders = DriveApp.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(name);
}

function uploadBase64File(base64Data, filename, folder) {
  if (!base64Data || !base64Data.startsWith("data:")) return "-";
  try {
    const parts = base64Data.split(",");
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : "application/octet-stream";
    const decoded = Utilities.base64Decode(parts[1]);
    const blob = Utilities.newBlob(decoded, mimeType, filename);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (err) {
    return "Upload Error: " + err.toString();
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getActiveSheet();
    
    const idFolder = getOrCreateFolder("ERIC_ID_Cards");
    const twibbonFolder = getOrCreateFolder("ERIC_Twibbons");
    const proofFolder = getOrCreateFolder("ERIC_Payment_Proofs");
    
    const leaderIdUrl = uploadBase64File(data.leaderIdCardUrl, "LEADER_ID_" + data.teamName + "_" + (data.leaderIdCardName || "id_card"), idFolder);
    const leaderTwibbonUrl = uploadBase64File(data.leaderTwibbonUrl, "LEADER_TWIBBON_" + data.teamName + "_" + (data.leaderTwibbonName || "twibbon"), twibbonFolder);
    
    const m1IdUrl = uploadBase64File(data.m1IdCardUrl, "MEMBER1_ID_" + data.teamName + "_" + (data.m1IdCardName || "id_card"), idFolder);
    const m1TwibbonUrl = uploadBase64File(data.m1TwibbonUrl, "MEMBER1_TWIBBON_" + data.teamName + "_" + (data.m1TwibbonName || "twibbon"), twibbonFolder);
    
    const m2IdUrl = uploadBase64File(data.m2IdCardUrl, "MEMBER2_ID_" + data.teamName + "_" + (data.m2IdCardName || "id_card"), idFolder);
    const m2TwibbonUrl = uploadBase64File(data.m2TwibbonUrl, "MEMBER2_TWIBBON_" + data.teamName + "_" + (data.m2TwibbonName || "twibbon"), twibbonFolder);
    
    const lecturerIdUrl = uploadBase64File(data.lecturerIdCardUrl, "LECTURER_ID_" + data.teamName + "_" + (data.lecturerIdCardName || "id_card"), idFolder);
    const lecturerTwibbonUrl = uploadBase64File(data.lecturerTwibbonUrl, "LECTURER_TWIBBON_" + data.teamName + "_" + (data.lecturerTwibbonName || "twibbon"), twibbonFolder);
    
    const payProofUrl = uploadBase64File(data.paymentProofUrl, "PAY_PROOF_" + data.teamName + "_" + (data.paymentProofName || "proof"), proofFolder);
    
    const headers = [
      "ID", "Timestamp", "Division", "Sub Category", "Level", "Team Name",
      "Leader Name", "Leader Email", "Leader WhatsApp", "Leader Institution", "Leader Address", "Leader Congenital Disease",
      "Leader ID Card", "Leader Twibbon",
      "Member 1 Name", "Member 1 WhatsApp", "Member 1 Disease", "Member 1 ID Card", "Member 1 Twibbon",
      "Member 2 Name", "Member 2 WhatsApp", "Member 2 Disease", "Member 2 ID Card", "Member 2 Twibbon",
      "Lecturer Name", "Lecturer Email", "Lecturer WhatsApp", "Lecturer Disease", "Lecturer ID Card", "Lecturer Twibbon",
      "Payment Method", "Payment Status", "Amount Paid", "Payment Proof", "Ref Code"
    ];
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#FFD700");
      headerRange.setFontColor("#000000");
    }
    
    const row = [
      data.id, new Date().toLocaleString(), data.divisionId, data.subCategory || "-", data.level || "-", data.teamName,
      data.leaderName, data.leaderEmail, data.leaderWhatsApp, data.leaderInstitution, data.leaderAddress || "-", data.leaderCongenitalDisease || "-",
      leaderIdUrl, leaderTwibbonUrl,
      data.m1Name || "-", data.m1WhatsApp || "-", data.m1CongenitalDisease || "-", m1IdUrl, m1TwibbonUrl,
      data.m2Name || "-", data.m2WhatsApp || "-", data.m2CongenitalDisease || "-", m2IdUrl, m2TwibbonUrl,
      data.lecturerName || "-", data.lecturerEmail || "-", data.lecturerWhatsApp || "-", data.lecturerCongenitalDisease || "-", lecturerIdUrl, lecturerTwibbonUrl,
      data.paymentMethod, data.paymentStatus, data.amount || "IDR 250,000", payProofUrl, data.refCode
    ];
    
    sheet.appendRow(row);
    return ContentService.createTextOutput(JSON.stringify({ status: "success", id: data.id })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}`);
                        setCopiedText('COPIED!');
                        setTimeout(() => setCopiedText(''), 2000);
                      }}
                      className="px-3 py-1 bg-[#4D90FE]/10 border border-[#4D90FE]/20 hover:bg-[#4D90FE]/20 text-[9px] font-mono text-[#4D90FE] font-black rounded uppercase cursor-pointer"
                    >
                      {copiedText || 'COPY TO CLIPBOARD'}
                    </button>
                  </div>
                  <pre className="p-4 bg-zinc-950 border border-white/5 rounded-2xl text-[10.5px] font-mono text-zinc-400 overflow-x-auto max-h-[180px] custom-scrollbar select-all">
{`const SPREADSHEET_ID = "12ouLbtyguh2VWYX0_DQlJUU_KCCEZ4qQBtH0RL2UFP8";

function getOrCreateFolder(name) {
  const folders = DriveApp.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(name);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const idFolder = getOrCreateFolder("ERIC_ID_Cards");
    const twibbonFolder = getOrCreateFolder("ERIC_Twibbons");
    const proofFolder = getOrCreateFolder("ERIC_Payment_Proofs");
    // ... complete script is copied via clipboard button above ...`}
                  </pre>
                </div>
              </div>

              <div className="pt-4 flex justify-end border-t border-white/5">
                <button
                  onClick={() => setShowScriptGuide(false)}
                  className="px-5 py-2 bg-[#4D90FE] text-black font-sans font-black text-xs tracking-wider uppercase rounded-xl hover:scale-101 transition-transform cursor-pointer font-bold"
                >
                  GOT IT!
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY DIALOG: EDIT ROSTER */}
      <AnimatePresence>
        {editingReg && (
          <motion.div
            key="editing-dialog"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto"
          >
            <div className="absolute inset-0 cursor-default" onClick={() => setEditingReg(null)} />
            <div className="bg-[#0C0C0C] border border-white/10 rounded-3xl p-6 md:p-8 max-w-xl w-full relative z-10 overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.95)]">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-[#FFD700] uppercase tracking-widest block font-black">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[220px] overflow-y-auto pr-1">
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

                  {(() => {
                    const division = COMPETITION_DIVISIONS.find(d => d.id === editingReg.divisionId);
                    return division?.hasLecturer ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:col-span-2 p-3 bg-zinc-900/40 border border-[#C5A059]/30 rounded-xl space-y-2 md:space-y-0">
                        <div className="col-span-3 text-[9px] font-mono text-[#C5A059] uppercase font-bold">ADVISOR / DOSEN PEMBIMBING</div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-mono text-zinc-400 uppercase">Advisor Name</label>
                          <input
                            type="text"
                            required
                            value={editingReg.lecturerName || ''}
                            onChange={(e) => handleEditInput('lecturerName', e.target.value)}
                            className="w-full bg-[#121212] border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-mono text-zinc-400 uppercase">Advisor Email</label>
                          <input
                            type="email"
                            required
                            value={editingReg.lecturerEmail || ''}
                            onChange={(e) => handleEditInput('lecturerEmail', e.target.value)}
                            className="w-full bg-[#121212] border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-mono text-zinc-400 uppercase">Advisor Whatsapp</label>
                          <input
                            type="tel"
                            required
                            value={editingReg.lecturerWhatsapp || ''}
                            onChange={(e) => handleEditInput('lecturerWhatsapp', e.target.value)}
                            className="w-full bg-[#121212] border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Members list */}
                <div className="space-y-3 pt-3 border-t border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-[9.5px] font-mono text-white font-bold uppercase">
                      {t('TEAM MEMBERS', 'ANGGOTA ROSTER')} ({editingReg.members.length})
                    </span>
                    {(() => {
                      const division = COMPETITION_DIVISIONS.find(d => d.id === editingReg.divisionId);
                      const limit = division?.maxMembers ?? 5;
                      return editingReg.members.length < limit ? (
                        <button
                          type="button"
                          onClick={addMemberToEditing}
                          className="px-2.5 py-1 bg-[#FFD700]/10 border border-[#FFD700]/20 text-[8px] font-mono text-[#FFD700] font-bold rounded"
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
                    className="px-5 py-2 bg-[#FFD700] text-black font-sans font-black text-xs tracking-wider uppercase rounded-xl hover:scale-101 transition-transform cursor-pointer"
                  >
                    {t('SAVE CHANGES', 'SIMPAN PERUBAHAN')}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </>      
      )}

      {activeTab === 'ric' && (
        <RICAdminPanel
          submissions={ricSubmissions}
          onUpdateSubmissions={onUpdateRICSubmissions}
        />
      )}

    </div>
  );
}
