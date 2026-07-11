/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Registration } from '../types';

export const getGoogleScriptUrl = (): string => {
  const newUrl = 'https://script.google.com/macros/s/AKfycbxxqH-GHITKS8LqdXaHsc55l0sNqgYUGxcSnIoP71BaLWIPaFGDHNuYzKPEUzWxDCTy/exec';
  const storedUrl = localStorage.getItem('eric_google_script_url');
  if (storedUrl && storedUrl !== newUrl) {
    localStorage.removeItem('eric_google_script_url');
  }
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
      amount: reg.amount || 'IDR 250,000',
      refCode: reg.refCode,
      paymentProofName: reg.paymentProofName || '',
      paymentProofUrl: reg.paymentProofUrl || '',

      // RIC Submission Fields (prefix RIC_)
      ricStage1Status: reg.ric?.stage1Status || '-',
      ricStage2Status: reg.ric?.stage2Status || '-',
      ricStage3Status: reg.ric?.stage3Status || '-',
      ricAbstractName: reg.ric?.abstractName || '',
      ricAbstractUrl: reg.ric?.abstractUrl || '',
      ricProposalName: reg.ric?.proposalName || '',
      ricProposalUrl: reg.ric?.proposalUrl || '',
      ricVideoLink: reg.ric?.videoLink || '',
      ricPosterName: reg.ric?.posterName || '',
      ricPosterUrl: reg.ric?.posterUrl || '',
      ricPptName: reg.ric?.pptName || '',
      ricPptUrl: reg.ric?.pptUrl || ''
    };

    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
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

/**
 * Fetch user registrations from Google Sheets via Apps Script doGet using JSONP.
 * This bypasses CORS issues often encountered with standard fetch requests to GAS Web Apps.
 * Includes retry logic with exponential backoff for reliability.
 */
const jsonpFetch = (url: string, email: string): Promise<Registration[] | null> => {
  return new Promise((resolve) => {
    const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    const script = document.createElement('script');
    script.src = `${url}?action=getRegistrations&email=${encodeURIComponent(email)}&callback=${callbackName}`;

    const timeoutId = setTimeout(() => {
      cleanup();
      console.warn('JSONP request timed out for Google Sheets.');
      resolve(null);
    }, 15000);

    const cleanup = () => {
      clearTimeout(timeoutId);
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      delete (window as any)[callbackName];
    };

    (window as any)[callbackName] = (data: any) => {
      cleanup();
      if (Array.isArray(data)) {
        resolve(data as Registration[]);
      } else {
        resolve(null);
      }
    };

    script.onerror = () => {
      cleanup();
      console.warn('Failed to load JSONP script from Google Sheets.');
      resolve(null);
    };

    document.body.appendChild(script);
  });
};

/**
 * Fetch ALL registrations (admin). Calls GAS without email filter.
 * Requires GAS doGet to support `action=getRegistrations` without `email` param.
 */
const jsonpFetchAll = (url: string): Promise<Registration[] | null> => {
  return new Promise((resolve) => {
    const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    const script = document.createElement('script');
    script.src = `${url}?action=getRegistrations&callback=${callbackName}`;

    const timeoutId = setTimeout(() => {
      cleanup();
      console.warn('JSONP request timed out for Google Sheets.');
      resolve(null);
    }, 15000);

    const cleanup = () => {
      clearTimeout(timeoutId);
      if (script.parentNode) script.parentNode.removeChild(script);
      delete (window as any)[callbackName];
    };

    (window as any)[callbackName] = (data: any) => {
      cleanup();
      resolve(Array.isArray(data) ? (data as Registration[]) : null);
    };

    script.onerror = () => { cleanup(); resolve(null); };
    document.body.appendChild(script);
  });
};

export const fetchAllRegistrations = async (): Promise<Registration[] | null> => {
  const url = getGoogleScriptUrl();
  if (!url) return null;
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await jsonpFetchAll(url);
    if (result !== null) return result;
    if (attempt < maxAttempts) await new Promise(r => setTimeout(r, attempt * 2000));
  }
  return null;
};

export const fetchUserRegistrations = async (email: string): Promise<Registration[] | null> => {
  const url = getGoogleScriptUrl();
  if (!url) return null;

  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await jsonpFetch(url, email);
    if (result !== null) return result;
    if (attempt < maxAttempts) {
      const delay = attempt * 2000;
      await new Promise(r => setTimeout(r, delay));
    }
  }

  return null;
};
