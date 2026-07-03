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
 * Fetch registrations from localStorage + Google Sheets.
 * Google Sheets is the primary source (survives browser clears).
 */
export async function dbFetchRegistrations(userEmail?: string): Promise<Registration[]> {
  const localRegs = safeGetItem();
  if (!userEmail) return localRegs;

  try {
    const sheetRegs = await fetchUserRegistrations(userEmail);
    if (sheetRegs && sheetRegs.length > 0) {
      const merged = [...localRegs];
      for (const sReg of sheetRegs) {
        const idx = merged.findIndex(r => r.id === sReg.id);
        if (idx >= 0) merged[idx] = sReg;
        else merged.push(sReg);
      }
      safeSetItem(merged);
      return merged;
    }
  } catch (err) {
    console.warn('Google Sheets fetch failed, using localStorage:', err);
  }

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
