/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { useAlert } from './AlertModal';
import { COMPETITION_DIVISIONS } from '../data';
import { Registration, ADMIN_EMAILS } from '../types';

import * as XLSX from 'xlsx';
import { 
  Trophy, Terminal, Download, 
  FileSpreadsheet, Database, ArrowLeft, X,
  CreditCard, Users, Globe, ExternalLink,
  FileText, Lock, Check, Eye, Unlock,
  Ticket, Mail, Send, Search, RefreshCw, KeyRound, ShieldCheck
} from 'lucide-react';
import { getGoogleScriptUrl, setGoogleScriptUrl, syncToGoogleSheet, fetchAllRegistrations } from '../lib/googleSheet';
import { reconstructRic } from '../lib/supabase';
import { generateRegistrationPDF, registrationPdfSafeName } from '../lib/generatePDF';
import { sendTicketEmail, getSendTicketSecret, setSendTicketSecret, normalizeRegistration } from '../lib/ticketRescue';
import gasScriptRaw from '../../google-apps-script.js?raw';

interface AdminDashboardProps {
  currentUser: { name: string; email: string; method: string } | null;
  registrations: Registration[];
  onUpdateRegistrations: (newRegs: Registration[]) => void;
  onBackToHome: () => void;
}

export default function AdminDashboard({
  currentUser,
  registrations,
  onUpdateRegistrations,
  onBackToHome
}: AdminDashboardProps) {
  const { t } = useLanguage();
  const { showAlert, showConfirm } = useAlert();

  const [activeTab, setActiveTab] = useState<'registrations' | 'ric' | 'tickets'>('registrations');
  const [ricSheetData, setRicSheetData] = useState<Registration[] | null>(null);
  const [isLoadingRic, setIsLoadingRic] = useState(false);

  // PDF TICKET RESCUE state
  const [ticketData, setTicketData] = useState<Registration[] | null>(null);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketDivision, setTicketDivision] = useState('all');
  const [ticketSendModal, setTicketSendModal] = useState<Registration | null>(null);
  const [selectedTicketReg, setSelectedTicketReg] = useState<Registration | null>(null);
  const [sendToEmail, setSendToEmail] = useState('');
  const [sendSubject, setSendSubject] = useState('');
  const [sendBody, setSendBody] = useState('');
  const [sendSecret, setSendSecret] = useState(getSendTicketSecret());
  const [isSending, setIsSending] = useState(false);

  // Fetch ALL registrations from Google Sheets when RIC tab is active
  React.useEffect(() => {
    if (activeTab === 'ric') {
      setIsLoadingRic(true);
      fetchAllRegistrations().then((data) => {
        if (data) {
          const reconstructed = data.map(reconstructRic);
          setRicSheetData(reconstructed);
        }
        setIsLoadingRic(false);
      }).catch(() => setIsLoadingRic(false));
    }
  }, [activeTab]);

  // Fetch ALL registrations from Google Sheets when PDF TICKETS tab is active
  React.useEffect(() => {
    if (activeTab === 'tickets') {
      setIsLoadingTickets(true);
      fetchAllRegistrations().then((data) => {
        if (data) {
          const normalized = data
            .map(normalizeRegistration)
            .filter((r): r is Registration => !!r);
          setTicketData(normalized);
        } else {
          setTicketData([]);
        }
        setIsLoadingTickets(false);
      }).catch(() => {
        setTicketData([]);
        setIsLoadingTickets(false);
      });
    }
  }, [activeTab]);

  const isAdmin = !!currentUser && ADMIN_EMAILS.map(e => e.toLowerCase().trim()).includes(currentUser.email.toLowerCase().trim());

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

  // ─── PDF TICKET RESCUE LOGIC ─────────────────────────────
  const refreshTickets = () => {
    setIsLoadingTickets(true);
    fetchAllRegistrations().then((data) => {
      if (data) {
        const normalized = data
          .map(normalizeRegistration)
          .filter((r): r is Registration => !!r);
        setTicketData(normalized);
      } else {
        setTicketData([]);
      }
      setIsLoadingTickets(false);
    }).catch(() => {
      setTicketData([]);
      setIsLoadingTickets(false);
    });
  };

  const filteredTickets = (ticketData || []).filter((r) => {
    const q = String(ticketSearch || '').toLowerCase().trim();
    const matchQ = !q ||
      String(r.teamName || '').toLowerCase().includes(q) ||
      String(r.refCode || '').toLowerCase().includes(q) ||
      String(r.leader?.email || '').toLowerCase().includes(q) ||
      String(r.leader?.name || '').toLowerCase().includes(q);
    const matchDiv = ticketDivision === 'all' || String(r.divisionId) === ticketDivision;
    return matchQ && matchDiv;
  });

  const handleDownloadTicket = (reg: Registration) => {
    try {
      generateRegistrationPDF(reg);
      showAlert({
        message: `Tiket ${reg.teamName} (${reg.refCode}) berhasil di-generate dan diunduh.`,
        type: 'success',
      });
    } catch (err) {
      showAlert({ message: 'Gagal generate PDF: ' + err, type: 'error' });
    }
  };

  const openSendModal = (reg: Registration) => {
    setSendToEmail(reg.leader?.email || '');
    setSendSubject(`ERIC 2026 — Tiket Peserta ${reg.teamName} (${reg.refCode})`);
    setSendBody(
      `Halo ${reg.leader?.name || 'Peserta'},\n\n` +
      `Terlampir tiket registrasi ERIC 2026 untuk tim ${reg.teamName} (kode: ${reg.refCode}).\n\n` +
      `Salam,\nPanitia ERIC 2026`
    );
    setTicketSendModal(reg);
  };

  const handleSendTicket = async () => {
    if (!ticketSendModal) return;
    setIsSending(true);
    const res = await sendTicketEmail({
      reg: ticketSendModal,
      toEmail: sendToEmail,
      subject: sendSubject || undefined,
      body: sendBody || undefined,
      secret: sendSecret,
    });
    setIsSending(false);
    showAlert({ message: res.message, type: res.ok ? 'success' : 'error' });
    if (res.ok) {
      setTicketSendModal(null);
      refreshTickets();
    }
  };

  const ticketDivisionCounts = (ticketData || []).reduce((acc, r) => {
    acc[r.divisionId] = (acc[r.divisionId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
          className={`px-5 py-2 text-xs font-mono font-black uppercase rounded-xl transition-all cursor-pointer ${activeTab === 'ric' ? 'bg-[#C5A059] text-black shadow-[0_0_15px_rgba(197,160,89,0.2)]' : 'text-zinc-400 hover:text-white'}`}
        >
          RIC SUBMISSIONS
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-5 py-2 text-xs font-mono font-black uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'tickets' ? 'bg-[#FF3B30] text-white shadow-[0_0_15px_rgba(255,59,48,0.25)]' : 'text-zinc-400 hover:text-white'}`}
        >
          <Ticket className="w-3.5 h-3.5" />
          PDF TICKETS
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

      {/* Controls Grid (Excel, Google Sheets Sync, Database Info) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
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
              {t('Compile and download a real-time, comprehensive Excel workbook containing all registered team records.', 'Kompilasi dan unduh workbook Excel real-time yang berisi semua catatan tim yang terdaftar.')}
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
              {t('Configure an automated link with your live Google Spreadsheet. Participants submit, and records instantly append as rows.', 'Konfigurasikan tautan otomatis dengan Spreadsheet Google Anda. Peserta mendaftar, dan data langsung ditambahkan sebagai baris.')}
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
            {t('You are authenticated as an official administrator.', 'Anda terotentikasi sebagai administrator resmi.')}
          </p>
          <div className="p-4 bg-zinc-900 border border-white/5 rounded-xl flex items-center justify-between text-[9px] font-mono text-zinc-500 uppercase">
            <div>STATUS: <span className="text-[#FFD700] font-bold">ONLINE</span></div>
            <div>VERSION: <span className="text-white">v2.1.0-LIVE</span></div>
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
                        navigator.clipboard.writeText(gasScriptRaw);
                        setCopiedText('COPIED!');
                        setTimeout(() => setCopiedText(''), 2000);
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

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  // action = "sync" | "sendTicket" | "deleteRegistration"
  // ... full Code.gs (incl. handleSendTicket) is in google-apps-script.js
  //     and copied via the button above. Re-deploy after every change.`}
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


      </>      
      )}

      {activeTab === 'ric' && (<>
        <div className="space-y-2">
          <span className="text-[10px] font-mono text-[#C5A059] tracking-[0.25em] uppercase font-black flex items-center gap-2">
            <FileText className="w-4 h-4" /> RIC SUBMISSION TRACKER
          </span>
          <h2 className="text-3xl md:text-5xl font-sans font-black tracking-tight text-white uppercase leading-none">
            RESEARCH INNOVATION CHALLENGE
          </h2>
          <p className="text-zinc-500 font-mono text-xs uppercase max-w-2xl leading-relaxed">
            {t('Manage RIC submission stages: open stages for selected teams and monitor upload progress.', 'Kelola tahap pengumpulan RIC: buka tahap untuk tim terpilih dan pantau progres upload.')}
          </p>
        </div>

        {(() => {
          const ricRegs = (ricSheetData || registrations).filter(r => r.divisionId === 'research-innovation');
          if (isLoadingRic) {
            return <div className="p-10 text-center text-zinc-500 text-sm font-mono">Loading RIC data from Google Sheets...</div>;
          }
          if (ricRegs.length === 0) {
            return (
              <div className="p-10 bg-zinc-950 border border-dashed border-white/10 rounded-3xl text-center space-y-3">
                <FileText className="w-10 h-10 text-zinc-600 mx-auto" />
                <p className="text-sm font-sans font-black text-zinc-500 uppercase">{t('No RIC registrations yet.', 'Belum ada pendaftaran RIC.')}</p>
              </div>
            );
          }

          return (
            <div className="space-y-4">
              {ricRegs.map((reg) => {
                const ric = reg.ric || { stage1Status: 'locked', stage2Status: 'locked', stage3Status: 'locked' };
                const handleStageAction = async (stage: 'stage1' | 'stage2' | 'stage3', action: 'open' | 'lock') => {
                  const statusField = `${stage}Status` as 'stage1Status' | 'stage2Status' | 'stage3Status';
                  const updated: Registration = {
                    ...reg,
                    ric: { ...ric, [statusField]: action === 'open' ? 'open' : 'locked' },
                  };
                  const srcRegs = ricSheetData || registrations;
                  const newRegs = srcRegs.map(r => r.id === reg.id ? updated : r);
                  onUpdateRegistrations(newRegs);
                  // Also update local ricSheetData state for immediate UI feedback
                  if (ricSheetData) {
                    setRicSheetData(newRegs);
                  }
                  await syncToGoogleSheet(updated);
                };
                const stageInfo = [
                  { key: 'stage1' as const, label: 'Stage 1 — Abstract', status: ric.stage1Status, file: ric.abstractUrl },
                  { key: 'stage2' as const, label: 'Stage 2 — Proposal + Video', status: ric.stage2Status, file: ric.proposalUrl, video: ric.videoLink },
                  { key: 'stage3' as const, label: 'Stage 3 — Poster + PPT', status: ric.stage3Status, file: ric.posterUrl, extra: ric.pptUrl },
                ];
                return (
                  <div key={reg.id} className="p-5 bg-zinc-950 border border-white/5 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div>
                        <h4 className="font-sans font-black text-white uppercase tracking-tight">{reg.teamName}</h4>
                        <p className="text-[10px] font-mono text-zinc-500">REF: {reg.refCode} | {reg.leader.name} | {reg.leader.institution}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {reg.ric?.stage1Status === 'submitted' && <span className="text-[9px] font-mono text-green-400 font-bold">HAS SUBMISSION</span>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {stageInfo.map((s) => {
                        const statusColors: Record<string, string> = {
                          locked: 'border-zinc-800 text-zinc-500',
                          open: 'border-[#FFD700]/30 text-[#FFD700]',
                          submitted: 'border-green-500/30 text-green-400',
                        };
                        const icons: Record<string, React.ReactNode> = {
                          locked: <Lock className="w-3.5 h-3.5" />,
                          open: <Unlock className="w-3.5 h-3.5" />,
                          submitted: <Check className="w-3.5 h-3.5" />,
                        };
                        const isLocked = s.status === 'locked';
                        const isSubmitted = s.status === 'submitted';
                        return (
                          <div key={s.key} className={`p-3 bg-zinc-900/40 border rounded-xl space-y-2 ${statusColors[s.status] || 'border-zinc-800'}`}>
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono uppercase font-bold">{s.label}</span>
                              <span className={`text-[9px] font-mono font-black uppercase flex items-center gap-1 ${statusColors[s.status] || 'text-zinc-500'}`}>
                                {icons[s.status] || null} {s.status.toUpperCase()}
                              </span>
                            </div>
                            {s.file && s.file !== '-' && (
                              <div className="text-[9px] font-mono text-zinc-400 truncate flex items-center gap-1">
                                <FileText className="w-3 h-3 shrink-0" />
                                <span className="truncate">{t('FILE UPLOADED', 'FILE TERKIRIM')}</span>
                              </div>
                            )}
                            {s.extra && s.extra !== '-' && (
                              <div className="text-[9px] font-mono text-zinc-400 truncate flex items-center gap-1">
                                <FileText className="w-3 h-3 shrink-0" />
                                <span className="truncate">{t('PPT UPLOADED', 'PPT TERKIRIM')}</span>
                              </div>
                            )}
                            {s.video && (
                              <a href={s.video} target="_blank" rel="noopener noreferrer" className="text-[9px] font-mono text-[#4D90FE] flex items-center gap-1 hover:underline">
                                <Eye className="w-3 h-3" /> {t('VIEW VIDEO', 'LIHAT VIDEO')}
                              </a>
                            )}
                            <div className="flex gap-1.5 pt-1">
                              {isLocked && (
                                <button onClick={() => handleStageAction(s.key, 'open')}
                                  className="flex-1 py-1.5 bg-[#C5A059]/10 border border-[#C5A059]/30 text-[9px] font-mono text-[#C5A059] font-bold rounded-lg hover:bg-[#C5A059]/20 cursor-pointer uppercase">
                                  {t('OPEN', 'BUKA')}
                                </button>
                              )}
                              {!isLocked && !isSubmitted && (
                                <button onClick={() => handleStageAction(s.key, 'lock')}
                                  className="flex-1 py-1.5 bg-zinc-800 border border-zinc-700 text-[9px] font-mono text-zinc-400 font-bold rounded-lg hover:bg-zinc-700 cursor-pointer uppercase">
                                  {t('LOCK', 'KUNCI')}
                                </button>
                              )}
                              {isSubmitted && (
                                <span className="flex-1 py-1.5 text-center text-[9px] font-mono text-green-400/60 font-bold uppercase border border-green-500/10 rounded-lg">
                                  {t('COMPLETED', 'SELESAI')}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </>      
      )}

      {activeTab === 'tickets' && (<>
        <div className="space-y-2">
          <span className="text-[10px] font-mono text-[#FF3B30] tracking-[0.25em] uppercase font-black flex items-center gap-2">
            <Ticket className="w-4 h-4" /> PDF TICKET RESCUE
          </span>
          <h2 className="text-3xl md:text-5xl font-sans font-black tracking-tight text-white uppercase leading-none">
            TICKET <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF3B30] to-[#FF9F0A]">REGENERATOR</span>
          </h2>
          <p className="text-zinc-500 font-mono text-xs uppercase max-w-2xl leading-relaxed">
            {t('Regenerate registration tickets for any participant and deliver them directly via email when the participant cannot download their PDF.', 'Generate ulang tiket registrasi peserta mana pun dan kirim langsung via email saat peserta tidak bisa mengunduh PDF-nya.')}
          </p>
        </div>

        {!isAdmin && (
          <div className="p-6 bg-zinc-950 border border-[#FF3B30]/30 rounded-3xl flex items-center gap-4">
            <ShieldCheck className="w-8 h-8 text-[#FF3B30] shrink-0" />
            <div>
              <h4 className="font-sans font-black text-white uppercase tracking-wider text-sm">ACCESS DENIED</h4>
              <p className="text-[10px] font-mono text-zinc-400 uppercase mt-1">
                Hanya administrator resmi (email terdaftar di ADMIN_EMAILS) yang dapat mengakses modul pengiriman tiket.
              </p>
            </div>
          </div>
        )}

        {isAdmin && (<>
        {/* Controls: search + division filter + refresh */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 bg-zinc-950 border border-white/5 rounded-xl px-3 py-2.5 md:col-span-1">
            <Search className="w-4 h-4 text-zinc-500 shrink-0" />
            <input
              type="text"
              name="ticket-search"
              placeholder="Cari tim / ref code / email / nama..."
              value={ticketSearch}
              onChange={(e) => setTicketSearch(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-zinc-600 focus:outline-none font-mono"
            />
          </div>
          <select
            value={ticketDivision}
            onChange={(e) => setTicketDivision(e.target.value)}
            className="bg-zinc-950 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF3B30]/30 font-mono cursor-pointer"
          >
            <option value="all">ALL DIVISIONS ({ticketData?.length || 0})</option>
            {COMPETITION_DIVISIONS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title.toUpperCase()} ({ticketDivisionCounts[d.id] || 0})
              </option>
            ))}
          </select>
          <button
            onClick={refreshTickets}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-300 hover:text-white font-mono text-[10px] font-bold uppercase rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTickets ? 'animate-spin' : ''}`} />
            REFRESH DATA
          </button>
        </div>

        {/* Config: send secret */}
        <div className="p-4 bg-zinc-950 border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 uppercase shrink-0">
            <KeyRound className="w-4 h-4 text-[#FF3B30]" />
            ADMIN SEND SECRET
          </div>
          <input
            type="text"
            name="admin-send-secret"
            value={sendSecret}
            onChange={(e) => {
              setSendSecret(e.target.value);
              setSendTicketSecret(e.target.value);
            }}
            placeholder="Secret token (harus sama dengan GAS script)"
            className="flex-1 min-w-0 bg-zinc-900 border border-white/5 focus:border-[#FF3B30]/40 rounded-xl px-3 py-2 text-[11px] font-mono text-white placeholder-zinc-600 focus:outline-none"
          />
          <p className="text-[8.5px] font-mono text-zinc-600 uppercase leading-relaxed">
            Wajib sama persis dengan const SECRET di handleSendTicket (google-apps-script.js). Default: ERIC2026_TICKET_RESCUE
          </p>
        </div>

        {/* List */}
        {isLoadingTickets && !ticketData ? (
          <div className="p-10 text-center text-zinc-500 text-sm font-mono">Loading all registrations from Google Sheets...</div>
        ) : !ticketData || filteredTickets.length === 0 ? (
          <div className="p-10 bg-zinc-950 border border-dashed border-white/10 rounded-3xl text-center space-y-3">
            <Ticket className="w-10 h-10 text-zinc-600 mx-auto" />
            <p className="text-sm font-sans font-black text-zinc-500 uppercase">
              {ticketData ? 'No participants match the filter.' : 'No registrations loaded.'}
            </p>
            <p className="text-[10px] font-mono text-zinc-600 uppercase">
              {ticketData ? 'Coba ubah kata kunci pencarian atau filter divisi.' : 'Pastikan Google Apps Script URL aktif & data tersedia di sheet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTickets.map((reg, i) => {
              const divObj = COMPETITION_DIVISIONS.find(d => d.id === reg.divisionId);
              const isOpen = selectedTicketReg?.id === reg.id;
              const logStatus = reg.ticketEmailStatus || '';
              return (
                <div key={`${reg.id || reg.refCode || 'row'}-${i}`} className={`bg-zinc-950 border rounded-2xl transition-all ${logStatus === 'SENT' ? 'border-[#00FF88]/25' : 'border-white/5'}`}>
                  <div
                    onClick={() => setSelectedTicketReg(isOpen ? null : reg)}
                    className="p-4 flex flex-col md:flex-row md:items-center gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${logStatus === 'SENT' ? 'bg-[#00FF88]/10 border-[#00FF88]/30' : 'bg-[#FF3B30]/10 border-[#FF3B30]/20'}`}>
                        <Ticket className={`w-4 h-4 ${logStatus === 'SENT' ? 'text-[#00FF88]' : 'text-[#FF3B30]'}`} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-sans font-black text-white uppercase tracking-tight truncate">{reg.teamName}</h4>
                        <p className="text-[9px] font-mono text-zinc-500 truncate">
                          REF: <span className="text-[#C5A059] font-bold">{reg.refCode}</span> | {divObj?.title || reg.divisionId} | {reg.leader?.name || '-'} | {reg.leader?.email || '-'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {logStatus === 'SENT' && (
                        <span className="text-[8px] font-mono text-[#00FF88] font-black uppercase px-2 py-1 border border-[#00FF88]/30 bg-[#00FF88]/5 rounded-lg whitespace-nowrap">
                          ✓ EMAIL SENT {reg.ticketEmailDate ? '· ' + reg.ticketEmailDate : ''}
                        </span>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownloadTicket(reg); }}
                        className="px-3 py-1.5 bg-[#FFD700]/10 border border-[#FFD700]/20 hover:bg-[#FFD700]/20 rounded-lg text-[9px] font-mono text-[#FFD700] font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Download className="w-3 h-3" /> PDF
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); openSendModal(reg); }}
                        className="px-3 py-1.5 bg-[#FF3B30]/10 border border-[#FF3B30]/25 hover:bg-[#FF3B30]/20 rounded-lg text-[9px] font-mono text-[#FF3B30] font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Mail className="w-3 h-3" /> EMAIL
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[10px] font-mono">
                      <div className="sm:col-span-2 text-[8px] font-mono text-zinc-600 uppercase tracking-widest pb-1 pt-2">ROSTER DATA PREVIEW — {registrationPdfSafeName(reg)}</div>
                      <div className="text-zinc-500">PAYMENT: <span className={`font-bold ${reg.paymentStatus === 'PAID' ? 'text-[#00FF88]' : 'text-amber-400'}`}>{reg.paymentStatus}</span> · {reg.paymentMethod}</div>
                      <div className="text-zinc-500">AMOUNT: <span className="text-white font-bold">{reg.amount || divObj?.price || '-'}</span> <span className="text-zinc-400">({reg.amountUSD || divObj?.priceUSD || '-'})</span></div>
                      <div className="text-zinc-500">LEADER: <span className="text-white font-bold">{reg.leader?.name}</span></div>
                      <div className="text-zinc-500">WA: <span className="text-white font-bold">{reg.leader?.whatsapp || '-'}</span></div>
                      <div className="text-zinc-500">INSTITUTION: <span className="text-white font-bold">{reg.leader?.institution || '-'}</span></div>
                      <div className="text-zinc-500">MEMBERS: <span className="text-white font-bold">{(reg.members || []).map(m => m.name).filter(Boolean).join(', ') || '-'}</span></div>
                      {reg.subCategory && <div className="text-zinc-500">SUB: <span className="text-white font-bold">{reg.subCategory}</span></div>}
                      {reg.level && <div className="text-zinc-500">LEVEL: <span className="text-white font-bold">{reg.level}</span></div>}
                      {reg.lecturerName && <div className="text-zinc-500">ADVISOR: <span className="text-white font-bold">{reg.lecturerName}</span></div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* SEND VIA EMAIL MODAL */}
        <AnimatePresence>
          {ticketSendModal && (
            <motion.div
              key="send-ticket-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto"
            >
              <div className="absolute inset-0 cursor-default" onClick={() => !isSending && setTicketSendModal(null)} />
              <div className="bg-[#0C0C0C] border border-white/10 rounded-3xl p-6 md:p-8 max-w-xl w-full relative z-10 overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.95)]">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF3B30] to-[#FF9F0A]" />
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono text-[#FF3B30] uppercase tracking-widest block font-black">
                      EMAIL DELIVERY // PDF ATTACHMENT
                    </span>
                    <h4 className="text-lg font-sans font-black text-white uppercase tracking-tight">
                      SEND TICKET VIA EMAIL
                    </h4>
                  </div>
                  <button
                    onClick={() => setTicketSendModal(null)}
                    disabled={isSending}
                    className="p-1.5 bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white rounded-lg cursor-pointer disabled:opacity-40"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="py-4 space-y-4">
                  <div className="p-3 bg-zinc-950 border border-white/5 rounded-xl text-[10px] font-mono space-y-1">
                    <div className="text-zinc-400">RECIPIENT TEAM: <span className="text-white font-black">{ticketSendModal.teamName}</span></div>
                    <div className="text-zinc-400">REF CODE: <span className="text-[#C5A059] font-black">{ticketSendModal.refCode}</span></div>
                    <div className="text-zinc-400">ATTACHMENT: <span className="text-[#FF3B30] font-bold">{registrationPdfSafeName(ticketSendModal)}</span></div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">EMAIL TUJUAN *</label>
                    <input
                      type="email"
                      name="send-to-email"
                      required
                      value={sendToEmail}
                      onChange={(e) => setSendToEmail(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/5 focus:border-[#FF3B30]/40 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">SUBJEK</label>
                    <input
                      type="text"
                      name="send-subject"
                      value={sendSubject}
                      onChange={(e) => setSendSubject(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/5 focus:border-[#FF3B30]/40 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">PESAN (OPSIONAL)</label>
                    <textarea
                      name="send-body"
                      rows={4}
                      value={sendBody}
                      onChange={(e) => setSendBody(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/5 focus:border-[#FF3B30]/40 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00FF88]" />
                    PDF di-generate dari data registrasi peserta & dikirim via Google Apps Script (MailApp). Status tercatat di kolom Ticket Email Status pada sheet.
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-white/5">
                  <button
                    onClick={() => setTicketSendModal(null)}
                    disabled={isSending}
                    className="px-5 py-2.5 bg-zinc-900 border border-white/5 hover:border-white/10 text-xs font-mono text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer disabled:opacity-40"
                  >
                    BATAL
                  </button>
                  <button
                    onClick={handleSendTicket}
                    disabled={isSending || !sendToEmail.trim()}
                    className={`px-6 py-2.5 bg-gradient-to-r from-[#FF3B30] to-[#FF9F0A] text-black font-sans font-black text-xs tracking-wider uppercase rounded-xl hover:scale-101 transition-transform cursor-pointer disabled:opacity-40 flex items-center gap-2`}
                  >
                    {isSending ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {isSending ? 'MENGIRIM...' : 'KIRIM EMAIL'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </>)}
      </>      
      )}

    </div>
  );
}
