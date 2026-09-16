/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Side Connect registration sync — separate Google Spreadsheet.
 */

import { SideConnectRegistration } from '../types';

// Deployment URL for google-apps-script-sideconnect-v2.js
// Or set via localStorage key 'eric_sideconnect_gas_url'
const GAS_URL = 'https://script.google.com/macros/s/AKfycbzRSpAkIw_akA3bzIZRjCcTHR12n07wCqWeFd902GQWPT3gSXgVMHx0TWhVltbDDNYc9A/exec';

const MAX_FILE_MB = 8;

function getSideConnectUrl(): string {
  const url = localStorage.getItem('eric_sideconnect_gas_url') || GAS_URL;
  return url || '';
}

/**
 * Map satu baris flat dari GAS getRegistrations (objek {header: value}) menjadi
 * SideConnectRegistration. Mengembalikan null bila baris kosong / tidak punya
 * ID & Ref Code.
 */
export function flatToSideConnectRegistration(
  row: Record<string, unknown> | null | undefined
): SideConnectRegistration | null {
  if (!row) return null;
  const s = (k: string): string => String(row[k] ?? '').trim();
  const id = s('ID');
  const refCode = s('Ref Code');
  if (!id && !refCode) return null;

  const subCompRaw = String(row['_subCompetition'] ?? s('Sub Competition'));
  const subCompetition: SideConnectRegistration['subCompetition'] =
    subCompRaw === 'research-innovation' || subCompRaw === 'drone-innovation'
      ? subCompRaw
      : 'creative-innovation';
  const participationType: SideConnectRegistration['participationType'] =
    s('Participation Type').toLowerCase() === 'team' ? 'team' : 'individual';

  const member = (i: number) => ({
    name: s(`Member ${i} Name`) === '-' ? '' : s(`Member ${i} Name`),
    email: s(`Member ${i} Email`) === '-' ? '' : s(`Member ${i} Email`),
    whatsapp: s(`Member ${i} WhatsApp`) === '-' ? '' : s(`Member ${i} WhatsApp`),
    institution: s(`Member ${i} Institution`) === '-' ? '' : s(`Member ${i} Institution`),
    country: s(`Member ${i} Country`) === '-' ? '' : s(`Member ${i} Country`),
    age: Number(s(`Member ${i} Age`)) || 0,
  });

  return {
    id,
    timestamp: s('Timestamp'),
    subCompetition,
    participationType,
    teamName: s('Team Name'),
    leader: {
      name: s('Leader Name'),
      email: s('Leader Email'),
      whatsapp: s('Leader WhatsApp'),
      institution: s('Leader Institution'),
      country: s('Leader Country'),
      age: Number(s('Leader Age')) || 0,
    },
    members: [member(1), member(2)].filter((m) => !!(m.name || m.email)),
    abstractTitle: s('Abstract Title'),
    productDescription: s('Product Description'),
    howItWorks: s('How It Works'),
    productDesign: s('Product Design'),
    benefits: s('Benefits'),
    experience: s('Experience'),
    refCode,
  };
}

/**
 * Ambil registrasi Side Connect milik satu pengguna (public, tanpa token).
 * GAS hanya membalas baris di mana Leader Email cocok PERSIS.
 */
export async function fetchSideConnectRegistrations(
  email: string
): Promise<SideConnectRegistration[]> {
  const url = getSideConnectUrl();
  if (!url || url.includes('PASTE_YOUR')) {
    console.warn('[SideConnect] GAS URL not configured. Fetch skipped.');
    return [];
  }
  try {
    const res = await fetch(
      url + '?action=getRegistrations&email=' + encodeURIComponent(email.trim()),
      { mode: 'cors' }
    );
    const text = await res.text();
    let data: { success?: boolean; data?: Record<string, unknown>[] } = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      console.error('[SideConnect] Fetch: GAS returned non-JSON:', text.slice(0, 200));
    }
    if (!data.success || !Array.isArray(data.data)) return [];
    return data.data
      .map(flatToSideConnectRegistration)
      .filter((r): r is SideConnectRegistration => !!r);
  } catch (err) {
    console.error('[SideConnect] Fetch registrations failed:', err);
    return [];
  }
}

/**
 * Ambil SEMUA registrasi Side Connect (open — tanpa token sejak keputusan user).
 */
export async function fetchAllSideConnectRegistrations(): Promise<SideConnectRegistration[]> {
  const url = getSideConnectUrl();
  if (!url || url.includes('PASTE_YOUR')) {
    console.warn('[SideConnect] GAS URL not configured. Fetch skipped.');
    return [];
  }
  try {
    const res = await fetch(url + '?action=getRegistrations', {
      mode: 'cors',
    });
    const text = await res.text();
    let data: { success?: boolean; data?: Record<string, unknown>[]; message?: string } = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      console.error('[SideConnect] Fetch: GAS returned non-JSON:', text.slice(0, 200));
    }
    if (!data.success || !Array.isArray(data.data)) {
      console.error('[SideConnect] Fetch rejected:', data.message || text.slice(0, 200));
      return [];
    }
    return data.data
      .map(flatToSideConnectRegistration)
      .filter((r): r is SideConnectRegistration => !!r);
  } catch (err) {
    console.error('[SideConnect] Fetch failed:', err);
    return [];
  }
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Upload one or more files (e.g. proposal / report) for a SIDE CONNECT
 * registration, addressed by the participant's Ref Code. Files are sent to the
 * Apps Script as base64, saved to Google Drive there, and their shareable links
 * are recorded on the participant's row in the sheet.
 */
export async function uploadSideConnectFiles(
  refCode: string,
  files: File[]
): Promise<{ success: boolean; message: string; links?: string[] }> {
  const url = localStorage.getItem('eric_sideconnect_gas_url') || GAS_URL;
  if (!url || url.includes('PASTE_YOUR')) {
    console.warn('[SideConnect] GAS URL not configured. Upload skipped.');
    return { success: false, message: 'GAS URL not configured' };
  }
  if (!files.length) return { success: false, message: 'No files selected' };

  for (const f of files) {
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      return { success: false, message: `"${f.name}" exceeds ${MAX_FILE_MB} MB` };
    }
  }

  try {
    const encoded = [];
    for (const f of files) {
      encoded.push({
        name: f.name,
        mimeType: f.type || 'application/octet-stream',
        data: await fileToBase64(f),
      });
    }

    const payload = { action: 'uploadFiles', refCode: refCode.toUpperCase(), files: encoded };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const res = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const text = await res.text();
    let data: { success?: boolean; message?: string; files?: { name: string; url: string }[] } = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      console.error('[SideConnect] Upload: GAS returned non-JSON:', text.slice(0, 200));
    }
    if (!data.success) {
      console.error('[SideConnect] Upload rejected:', data.message || text.slice(0, 300));
      return { success: false, message: data.message || 'Upload rejected by server' };
    }

    console.log('[SideConnect] Files uploaded for ref code:', refCode);
    return { success: true, message: `Uploaded ${files.length} file(s)`, links: data.files?.map(f => f.url) || encoded.map(f => f.name) };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      console.error('[SideConnect] Upload timeout (60s)');
      return { success: false, message: 'Upload timeout' };
    }
    console.error('[SideConnect] Upload failed:', err);
    return { success: false, message: 'Upload failed' };
  }
}


export async function syncSideConnectToSheet(
  reg: SideConnectRegistration
): Promise<{ success: boolean; message: string; refCode?: string }> {
  const url = localStorage.getItem('eric_sideconnect_gas_url') || GAS_URL;
  if (!url || url.includes('PASTE_YOUR')) {
    console.warn('[SideConnect] GAS URL not configured. Sync skipped.');
    return { success: false, message: 'GAS URL not configured' };
  }

  try {
    const payload = {
      action: 'register',
      id: reg.id,
      timestamp: reg.timestamp,
      subCompetition: reg.subCompetition,
      participationType: reg.participationType,
      teamName: reg.teamName,
      leaderName: reg.leader.name,
      leaderEmail: reg.leader.email,
      leaderWhatsApp: reg.leader.whatsapp,
      leaderInstitution: reg.leader.institution,
      leaderCountry: reg.leader.country,
      leaderAge: reg.leader.age,
      m1Name: reg.members[0]?.name || '-',
      m1Email: reg.members[0]?.email || '-',
      m1WhatsApp: reg.members[0]?.whatsapp || '-',
      m1Institution: reg.members[0]?.institution || '-',
      m1Country: reg.members[0]?.country || '-',
      m1Age: reg.members[0]?.age || '-',
      m2Name: reg.members[1]?.name || '-',
      m2Email: reg.members[1]?.email || '-',
      m2WhatsApp: reg.members[1]?.whatsapp || '-',
      m2Institution: reg.members[1]?.institution || '-',
      m2Country: reg.members[1]?.country || '-',
      m2Age: reg.members[1]?.age || '-',
      abstractTitle: reg.abstractTitle,
      productDescription: reg.productDescription,
      howItWorks: reg.howItWorks,
      productDesign: reg.productDesign,
      benefits: reg.benefits,
      experience: reg.experience,
      refCode: reg.refCode,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const res = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const text = await res.text();
    let data: { success?: boolean; message?: string; refCode?: string } = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      console.error('[SideConnect] GAS returned non-JSON:', text.slice(0, 200));
    }
    if (!data.success) {
      console.error('[SideConnect] GAS rejected:', data.message || text.slice(0, 300));
      return { success: false, message: data.message || 'Registration rejected by server' };
    }

    console.log('[SideConnect] Synced to Google Sheet:', data.refCode || reg.refCode);
    return { success: true, message: 'Synced', refCode: data.refCode || reg.refCode };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      console.error('[SideConnect] Sync timeout (30s)');
      return { success: false, message: 'Sync timeout' };
    } else {
      console.error('[SideConnect] Failed to sync:', err);
      return { success: false, message: err instanceof Error ? err.message : 'Sync failed' };
    }
  }
}
