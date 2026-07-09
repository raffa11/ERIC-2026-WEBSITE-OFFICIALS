import { RICSubmission } from '../types';
import { RIC_GOOGLE_SCRIPT_URL } from '../data';

export const getRICScriptUrl = (): string => {
  const stored = localStorage.getItem('eric_ric_script_url');
  if (stored) return stored;
  const metaEnv = (import.meta as any).env || {};
  return metaEnv.VITE_RIC_GOOGLE_SCRIPT_URL || RIC_GOOGLE_SCRIPT_URL;
};

export const setRICScriptUrl = (url: string) => {
  localStorage.setItem('eric_ric_script_url', url);
};

export const syncRICToSheet = async (submission: RICSubmission): Promise<boolean> => {
  const url = getRICScriptUrl();
  if (!url) {
    console.warn('RIC Google Script URL not configured.');
    return false;
  }

  try {
    const stageIndex = submission.currentStage;
    const stage = submission.stages[stageIndex];

    const payload: any = {
      id: submission.id,
      registrationId: submission.registrationId,
      teamName: submission.teamName,
      leaderEmail: submission.leaderEmail,
      divisionId: submission.divisionId,
      stage: stageIndex + 1,
      status: stage.status,
      submittedAt: stage.submittedAt || '',
      reviewedAt: stage.reviewedAt || '',
      reviewedBy: stage.reviewedBy || '',
      notes: stage.notes || '',
      action: 'submit'
    };

    if (stageIndex === 0) {
      payload.abstractFileName = stage.abstractFileName || '';
      payload.abstractFileUrl = stage.abstractFileUrl || '';
    } else if (stageIndex === 1) {
      payload.proposalFileName = stage.proposalFileName || '';
      payload.proposalFileUrl = stage.proposalFileUrl || '';
      payload.videoLink = stage.videoLink || '';
    } else if (stageIndex === 2) {
      payload.posterFileName = stage.posterFileName || '';
      payload.posterFileUrl = stage.posterFileUrl || '';
      payload.pptFileName = stage.pptFileName || '';
      payload.pptFileUrl = stage.pptFileUrl || '';
    }

    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log('RIC submission synced to sheet:', submission.id);
    return true;
  } catch (err) {
    console.error('Error syncing RIC to sheet:', err);
    return false;
  }
};

const jsonpFetchRIC = (url: string, email: string): Promise<RICSubmission[] | null> => {
  return new Promise((resolve) => {
    const callbackName = 'ric_jsonp_' + Math.round(100000 * Math.random());
    const script = document.createElement('script');
    script.src = `${url}?action=getRICSubmissions&email=${encodeURIComponent(email)}&callback=${callbackName}`;

    const timeoutId = setTimeout(() => {
      cleanup();
      resolve(null);
    }, 15000);

    const cleanup = () => {
      clearTimeout(timeoutId);
      if (script.parentNode) script.parentNode.removeChild(script);
      delete (window as any)[callbackName];
    };

    (window as any)[callbackName] = (data: any) => {
      cleanup();
      const records = data?.data || data;
      resolve(Array.isArray(records) ? records as RICSubmission[] : null);
    };

    script.onerror = () => {
      cleanup();
      resolve(null);
    };

    document.body.appendChild(script);
  });
};

export const fetchRICSubmissions = async (email?: string): Promise<RICSubmission[] | null> => {
  const url = getRICScriptUrl();
  if (!url) return null;

  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await jsonpFetchRIC(url, email || '');
    if (result !== null) return result;
    if (attempt < maxAttempts) {
      await new Promise(r => setTimeout(r, attempt * 2000));
    }
  }
  return null;
};
