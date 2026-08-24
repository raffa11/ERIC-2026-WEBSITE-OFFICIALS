/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Side Connect registration sync — separate Google Spreadsheet.
 */

import { SideConnectRegistration } from '../types';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbxSIDE_CONNECT_DEPLOY_ID/exec';

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
