/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Side Connect registration sync — separate Google Spreadsheet.
 */

import { SideConnectRegistration } from '../types';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbwkth-KlyqDJ2u1BCQ0jK670FAsHA4wjfzdlidRorp0y0aYjGq3udUY6txwck-fjfQn7Q/exec';

const MAX_FILE_MB = 8;

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
  if (!url || url.includes('SIDE_CONNECT_DEPLOY_ID')) {
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

    const payload = { action: 'uploadFiles', refCode, files: encoded };

    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
    });

    console.log('[SideConnect] Files uploaded for ref code:', refCode);
    return { success: true, message: `Uploaded ${files.length} file(s)`, links: encoded.map(f => f.name) };
  } catch (err) {
    console.error('[SideConnect] Upload failed:', err);
    return { success: false, message: 'Upload failed' };
  }
}


export async function syncSideConnectToSheet(reg: SideConnectRegistration): Promise<boolean> {
  const url = localStorage.getItem('eric_sideconnect_gas_url') || GAS_URL;
  if (!url || url.includes('SIDE_CONNECT_DEPLOY_ID')) {
    console.warn('[SideConnect] GAS URL not configured. Sync skipped.');
    return false;
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

    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
    });

    console.log('[SideConnect] Synced to Google Sheet:', reg.refCode);
    return true;
  } catch (err) {
    console.error('[SideConnect] Failed to sync:', err);
    return false;
  }
}
