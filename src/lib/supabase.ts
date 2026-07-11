/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Authentication: Supabase Auth (Google SSO only).
 * Data persistence: Google Sheets (primary) + localStorage (cache).
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Registration } from '../types';
import { fetchUserRegistrations } from './googleSheet';

const metaEnv = (import.meta as any).env || {};
const supabaseUrl = (metaEnv.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (metaEnv.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  }
  return supabaseInstance;
}

export function getSupabaseAuth() {
  const supabase = getSupabase();
  return supabase?.auth ?? null;
}

const LS_KEY = 'eric_live_registrations';

function stripImages(reg: Registration): Registration {
  const clone = structuredClone(reg);
  clone.leader.idCardUrl = clone.leader.idCardUrl?.startsWith('data:') ? '[stripped]' : (clone.leader.idCardUrl || '');
  clone.leader.twibbonUrl = clone.leader.twibbonUrl?.startsWith('data:') ? '[stripped]' : (clone.leader.twibbonUrl || '');
  clone.members = clone.members.map(m => ({
    ...m,
    idCardUrl: m.idCardUrl?.startsWith('data:') ? '[stripped]' : (m.idCardUrl || ''),
    twibbonUrl: m.twibbonUrl?.startsWith('data:') ? '[stripped]' : (m.twibbonUrl || ''),
  }));
  clone.lecturerIdCardUrl = clone.lecturerIdCardUrl?.startsWith('data:') ? '[stripped]' : (clone.lecturerIdCardUrl || '');
  clone.lecturerTwibbonUrl = clone.lecturerTwibbonUrl?.startsWith('data:') ? '[stripped]' : (clone.lecturerTwibbonUrl || '');
  clone.paymentProofUrl = clone.paymentProofUrl?.startsWith('data:') ? '[stripped]' : (clone.paymentProofUrl || '');
  if (clone.ric) {
    clone.ric.abstractUrl = clone.ric.abstractUrl?.startsWith('data:') ? '[stripped]' : (clone.ric.abstractUrl || '');
    clone.ric.proposalUrl = clone.ric.proposalUrl?.startsWith('data:') ? '[stripped]' : (clone.ric.proposalUrl || '');
    clone.ric.posterUrl = clone.ric.posterUrl?.startsWith('data:') ? '[stripped]' : (clone.ric.posterUrl || '');
    clone.ric.pptUrl = clone.ric.pptUrl?.startsWith('data:') ? '[stripped]' : (clone.ric.pptUrl || '');
  }
  return clone;
}

function safeGetItem(): Registration[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function safeSetItem(list: Registration[]): void {
  try {
    const stripped = list.map(stripImages);
    localStorage.setItem(LS_KEY, JSON.stringify(stripped));
  } catch (err) {
    console.warn('localStorage quota exceeded. Registrations not cached locally.', err);
  }
}

/**
 * Reconstruct nested ric object from flat Google Sheets fields.
 * Only overrides ric if sheet actually has RIC data (ricStage1Status present).
 * Otherwise preserves existing ric from localStorage.
 */
function reconstructRic(data: any): Registration {
  if (data.divisionId === 'research-innovation' && data.ricStage1Status) {
    (data as any).ric = {
      stage1Status: data.ricStage1Status || 'locked',
      stage2Status: data.ricStage2Status || 'locked',
      stage3Status: data.ricStage3Status || 'locked',
      abstractName: data.ricAbstractName || '',
      abstractUrl: data.ricAbstractUrl || '',
      proposalName: data.ricProposalName || '',
      proposalUrl: data.ricProposalUrl || '',
      videoLink: data.ricVideoLink || '',
      posterName: data.ricPosterName || '',
      posterUrl: data.ricPosterUrl || '',
      pptName: data.ricPptName || '',
      pptUrl: data.ricPptUrl || '',
    };
    delete data.ricStage1Status;
    delete data.ricStage2Status;
    delete data.ricStage3Status;
    delete data.ricAbstractName; delete data.ricAbstractUrl;
    delete data.ricProposalName; delete data.ricProposalUrl;
    delete data.ricVideoLink;
    delete data.ricPosterName; delete data.ricPosterUrl;
    delete data.ricPptName; delete data.ricPptUrl;
  }

  return data as Registration;
}

/**
 * Fetch registrations from localStorage + Google Sheets.
 * Returns localStorage data immediately, then fetches from Sheets in background.
 * This means users always see their registrations (even from cache) instantly.
 */
export async function dbFetchRegistrations(
  userEmail?: string,
  onBackgroundUpdate?: (merged: Registration[]) => void
): Promise<Registration[]> {
  const localRegs = safeGetItem();
  if (!userEmail) return localRegs;

  // If we have local data, return it immediately — don't block on Sheets
  const hasLocalData = localRegs.length > 0;
  if (hasLocalData && !onBackgroundUpdate) {
    // Fire-and-forget background refresh to update localStorage for next visit
    dbFetchRegistrations(userEmail, (merged) => {
      // Callback re-invokes to let caller update state if desired
    }).catch(() => {});
    return localRegs;
  }

  // Full fetch from Sheets (used during login or explicit refresh)
  try {
    const sheetRegs = await fetchUserRegistrations(userEmail);
    if (sheetRegs && sheetRegs.length > 0) {
      const merged = [...localRegs];
      for (const sReg of sheetRegs) {
        const reconstructed = reconstructRic(sReg);
        const idx = merged.findIndex(r => r.id === reconstructed.id);
        if (idx >= 0) {
          // Preserve local ric field if sheet data doesn't have it
          if (!reconstructed.ric && merged[idx].ric) {
            reconstructed.ric = merged[idx].ric;
          }
          merged[idx] = reconstructed;
        }
        else merged.push(reconstructed);
      }
      safeSetItem(merged);
      if (onBackgroundUpdate) onBackgroundUpdate(merged);
      return merged;
    }
  } catch (err) {
    console.warn('Google Sheets fetch failed, using localStorage:', err);
  }

  // If this was a background refresh with no local data, still return []
  if (onBackgroundUpdate) onBackgroundUpdate(localRegs);
  return localRegs;
}

/**
 * Save registration to localStorage.
 * Google Sheets sync is handled separately by syncToGoogleSheet().
 */
export async function dbUpsertRegistration(reg: Registration, _userEmail?: string): Promise<void> {
  const list = safeGetItem();
  const index = list.findIndex(r => r.id === reg.id);
  if (index >= 0) list[index] = reg;
  else list.push(reg);
  safeSetItem(list);
}

/**
 * Delete registration from localStorage.
 */
export async function dbDeleteRegistration(id: string): Promise<void> {
  const list = safeGetItem();
  safeSetItem(list.filter(r => r.id !== id));
}
