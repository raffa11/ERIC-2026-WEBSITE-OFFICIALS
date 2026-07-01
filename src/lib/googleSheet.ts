/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Registration } from '../types';

export const getGoogleScriptUrl = (): string => {
  let storedUrl = localStorage.getItem('eric_google_script_url');
  const oldUrl = 'https://script.google.com/macros/s/AKfycbz1n7Le9PHBi_B0SEcntIUm_fPJVIeB4Rs7sFZyuiFPmAdtd4sKPuEy0mtFFR0L9pl_/exec';
  const newUrl = 'https://script.google.com/macros/s/AKfycbxQpLekriG8XXlM-mT9b-y2TNVAHkmSyBpT88CGYqQzG5WzYXYII5vNIn6zHz45g9dg/exec';

  if (storedUrl === oldUrl || (storedUrl && storedUrl.includes('AKfycbz1n7Le9PHBi_B0SEcntIUm_fPJVIeB4Rs7sFZyuiFPmAdtd4sKPuEy0mtFFR0L9pl_'))) {
    localStorage.setItem('eric_google_script_url', newUrl);
    storedUrl = newUrl;
  }

  if (storedUrl) return storedUrl;
  const metaEnv = (import.meta as any).env || {};
  return metaEnv.VITE_GOOGLE_SCRIPT_URL || newUrl;
};

export const setGoogleScriptUrl = (url: string) => {
  localStorage.setItem('eric_google_script_url', url);
};

export const syncToGoogleSheet = async (reg: Registration): Promise<boolean> => {
  const url = getGoogleScriptUrl();
  if (!url) {
    console.warn('Google Apps Script URL is not configured. Google Sheet synchronization skipped.');
    return false;
  }

  try {
    const payload = {
      id: reg.id,
      divisionId: reg.divisionId,
      subCategory: reg.subCategory || '-',
      level: reg.level || '-',
      teamName: reg.teamName,
      
      // Leader
      leaderName: reg.leader.name,
      leaderEmail: reg.leader.email,
      leaderWhatsApp: reg.leader.whatsapp,
      leaderInstitution: reg.leader.institution,
      leaderAddress: reg.leader.address || '-',
      leaderCongenitalDisease: reg.leader.congenitalDisease || '-',
      leaderIdCardName: reg.leader.idCardName || '',
      leaderIdCardUrl: reg.leader.idCardUrl || '',
      leaderTwibbonName: reg.leader.twibbonName || '',
      leaderTwibbonUrl: reg.leader.twibbonUrl || '',
      
      // Member 1
      m1Name: reg.members[0]?.name || '-',
      m1WhatsApp: reg.members[0]?.whatsapp || '-',
      m1CongenitalDisease: reg.members[0]?.congenitalDisease || '-',
      m1IdCardName: reg.members[0]?.idCardName || '',
      m1IdCardUrl: reg.members[0]?.idCardUrl || '',
      m1TwibbonName: reg.members[0]?.twibbonName || '',
      m1TwibbonUrl: reg.members[0]?.twibbonUrl || '',

      // Member 2
      m2Name: reg.members[1]?.name || '-',
      m2WhatsApp: reg.members[1]?.whatsapp || '-',
      m2CongenitalDisease: reg.members[1]?.congenitalDisease || '-',
      m2IdCardName: reg.members[1]?.idCardName || '',
      m2IdCardUrl: reg.members[1]?.idCardUrl || '',
      m2TwibbonName: reg.members[1]?.twibbonName || '',
      m2TwibbonUrl: reg.members[1]?.twibbonUrl || '',

      // Lecturer / Advisor
      lecturerName: reg.lecturerName || '-',
      lecturerEmail: reg.lecturerEmail || '-',
      lecturerWhatsApp: reg.lecturerWhatsapp || '-',
      lecturerCongenitalDisease: reg.lecturerCongenitalDisease || '-',
      lecturerIdCardName: reg.lecturerIdCardName || '',
      lecturerIdCardUrl: reg.lecturerIdCardUrl || '',
      lecturerTwibbonName: reg.lecturerTwibbonName || '',
      lecturerTwibbonUrl: reg.lecturerTwibbonUrl || '',

      paymentMethod: reg.paymentMethod,
      paymentStatus: reg.paymentStatus,
      amount: reg.amount || 'IDR 150,000',
      refCode: reg.refCode,
      paymentProofName: reg.paymentProofName || '',
      paymentProofUrl: reg.paymentProofUrl || ''
    };

    await fetch(url, {
      method: 'POST',
      mode: 'no-cors', // Solves Google Apps Script redirect CORS block
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('Registration successfully sent to Google Sheet sync webhook.');
    return true;
  } catch (error) {
    console.error('Error syncing to Google Sheet:', error);
    return false;
  }
};
