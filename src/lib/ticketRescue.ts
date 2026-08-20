/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * PDF TICKET RESCUE MODULE
 * Memungkinkan admin mengenerate ulang PDF tiket peserta dari data yang ada
 * di Google Sheets, lalu mengirimkannya langsung ke email peserta via
 * Google Apps Script (MailApp) sebagai lampiran.
 */

import { Registration } from '../types';
import { registrationToPdfBase64, registrationPdfSafeName } from './generatePDF';
import { getGoogleScriptUrl } from './googleSheet';
import { flatToRegistration } from './supabase';

const SECRET_KEY = 'eric_ticket_send_secret';
const DEFAULT_SECRET = 'ERIC2026_TICKET_RESCUE';

export const getSendTicketSecret = (): string => {
  try {
    return localStorage.getItem(SECRET_KEY) || DEFAULT_SECRET;
  } catch {
    return DEFAULT_SECRET;
  }
};

export const setSendTicketSecret = (value: string) => {
  try {
    localStorage.setItem(SECRET_KEY, value);
  } catch {
    // ignore
  }
};

const s = (v: any): string => (v === null || v === undefined ? '' : String(v));

/**
 * Google Apps Script doGet mengembalikan objek Registration bersarang,
 * sedangkan beberapa source lama mengembalikan bentuk flat.
 * Helper ini menormalkan keduanya menjadi Registration penuh,
 * sekaligus memaksa semua field kunci menjadi string agar aman
 * untuk operasi .toLowerCase()/search serta rendering.
 */
export function normalizeRegistration(raw: any): Registration | null {
  if (!raw) return null;
  let reg: Registration | null = null;
  if (
    raw.leader &&
    typeof raw.leader === 'object' &&
    (raw.leader.name || raw.leader.email || raw.leader.whatsapp)
  ) {
    reg = raw as Registration;
  } else {
    try {
      reg = flatToRegistration(raw);
    } catch {
      return null;
    }
  }
  if (!reg) return null;
  const leaderRaw: any = reg.leader && typeof reg.leader === 'object' ? reg.leader : {};
  return {
    ...reg,
    id: s(reg.id || raw.id || raw.refCode),
    divisionId: s(reg.divisionId),
    teamName: s(reg.teamName),
    refCode: s(reg.refCode),
    amount: s(reg.amount),
    paymentMethod: s(reg.paymentMethod),
    paymentStatus: s(reg.paymentStatus),
    subCategory: reg.subCategory ? s(reg.subCategory) : undefined,
    level: reg.level ? s(reg.level) : undefined,
    lecturerName: reg.lecturerName ? s(reg.lecturerName) : undefined,
    ticketEmailStatus: reg.ticketEmailStatus ? s(reg.ticketEmailStatus) : undefined,
    ticketEmailDate: reg.ticketEmailDate ? s(reg.ticketEmailDate) : undefined,
    leader: {
      name: s(leaderRaw.name),
      email: s(leaderRaw.email),
      whatsapp: s(leaderRaw.whatsapp),
      institution: s(leaderRaw.institution),
      address: leaderRaw.address ? s(leaderRaw.address) : undefined,
      congenitalDisease: leaderRaw.congenitalDisease ? s(leaderRaw.congenitalDisease) : undefined,
    },
    members: Array.isArray(reg.members)
      ? reg.members.map((m) => ({
          ...m,
          name: s((m as any).name),
          whatsapp: s((m as any).whatsapp),
          congenitalDisease: (m as any).congenitalDisease ? s((m as any).congenitalDisease) : undefined,
        }))
      : [],
  };
}

export function registrationPdfFileName(reg: Registration): string {
  return `ERIC_2026_Ticket_${registrationPdfSafeName(reg)}.pdf`;
}

export interface SendTicketOptions {
  reg: Registration;
  toEmail: string;
  subject?: string;
  body?: string;
  secret?: string;
}

export interface SendTicketResult {
  ok: boolean;
  message: string;
  confirmed?: boolean;
}

/**
 * Mengirim PDF tiket peserta ke email via Google Apps Script (MailApp).
 *
 * Catatan CORS: GAS web app mendukung pembacaan response jika request
 * memakai Content-Type text/plain (simple request, tanpa preflight).
 * Jika tetap gagal membaca response, fallback ke no-cors fire-and-forget —
 * status sebenarnya tercatat di kolom "Ticket Email Status" di Google Sheet.
 */
export async function sendTicketEmail(opts: SendTicketOptions): Promise<SendTicketResult> {
  const url = getGoogleScriptUrl();
  if (!url) {
    return { ok: false, message: 'Google Apps Script URL belum dikonfigurasi.' };
  }

  const toEmail = opts.toEmail.trim();
  if (!toEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(toEmail)) {
    return { ok: false, message: 'Alamat email tujuan tidak valid.' };
  }

  const pdfBase64 = registrationToPdfBase64(opts.reg);

  const payload = {
    action: 'sendTicket',
    token: opts.secret || getSendTicketSecret(),
    refCode: opts.reg.refCode,
    regId: opts.reg.id,
    teamName: opts.reg.teamName,
    divisionId: opts.reg.divisionId,
    toEmail,
    subject: opts.subject || `ERIC 2026 — Tiket Peserta ${opts.reg.teamName}`,
    body: opts.body || `Halo ${opts.reg.leader?.name || 'Peserta'},\n\nTerlampir tiket registrasi ERIC 2026 untuk tim ${opts.reg.teamName} (kode: ${opts.reg.refCode}).\n\nSalam,\nPanitia ERIC 2026`,
    pdfBase64,
    pdfName: registrationPdfFileName(opts.reg),
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (data && data.status === 'success') {
        return { ok: true, message: data.message || 'Email berhasil dikirim.', confirmed: true };
      }
      return {
        ok: false,
        message: data?.message || 'Server GAS menolak permintaan.',
        confirmed: true,
      };
    }
  } catch (err) {
    console.warn('CORS read failed, falling back to fire-and-forget:', err);
  }

  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return {
      ok: true,
      message: 'Permintaan pengiriman terkirim. Status final akan tercatat di Google Sheet (kolom Ticket Email Status).',
      confirmed: false,
    };
  } catch (err) {
    return { ok: false, message: 'Gagal menghubungi server: ' + err, confirmed: true };
  }
}