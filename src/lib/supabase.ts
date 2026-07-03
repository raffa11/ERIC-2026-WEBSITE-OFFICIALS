/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Registration } from '../types';

const metaEnv = (import.meta as any).env || {};
const supabaseUrl = (metaEnv.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (metaEnv.VITE_SUPABASE_ANON_KEY || '').trim();

const REGISTRATIONS_TABLE = 'competition_registrations';
const LS_KEY = 'eric_live_registrations';

// Check if Supabase keys are provided in environment
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null;
  }
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

/**
 * Remove base64 image data from a Registration to keep localStorage small.
 * Images are only needed during submission (sent to Apps Script), not in cache.
 */
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
  } catch {
    return [];
  }
}

function safeSetItem(list: Registration[]): void {
  try {
    const stripped = list.map(stripImages);
    localStorage.setItem(LS_KEY, JSON.stringify(stripped));
  } catch (err) {
    console.warn('localStorage quota exceeded or unavailable. Registrations not cached locally.', err);
  }
}

/**
 * Fetch registrations from localStorage + Supabase, merged by id.
 * Supabase results take priority.
 */
export async function dbFetchRegistrations(userEmail?: string): Promise<Registration[]> {
  const localRegs = safeGetItem();

  if (!userEmail) {
    return localRegs;
  }

  try {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from(REGISTRATIONS_TABLE)
        .select('data')
        .eq('user_email', userEmail);

      if (!error && data && data.length > 0) {
        const supabaseRegs: Registration[] = data.map((d: any) => d.data);
        const merged = [...localRegs];
        for (const sReg of supabaseRegs) {
          const idx = merged.findIndex(r => r.id === sReg.id);
          if (idx >= 0) {
            merged[idx] = sReg;
          } else {
            merged.push(sReg);
          }
        }
        return merged;
      }
    }
  } catch (err) {
    console.error('Failed to fetch from Supabase:', err);
  }

  return localRegs;
}

/**
 * Save registration to localStorage + Supabase.
 */
export async function dbUpsertRegistration(reg: Registration, userEmail?: string): Promise<void> {
  // localStorage (strip images to avoid quota issues)
  const list = safeGetItem();
  const index = list.findIndex(r => r.id === reg.id);
  if (index >= 0) {
    list[index] = reg;
  } else {
    list.push(reg);
  }
  safeSetItem(list);

  // Supabase
  if (userEmail) {
    try {
      const supabase = getSupabase();
      if (supabase) {
        await supabase
          .from(REGISTRATIONS_TABLE)
          .upsert({ id: reg.id, user_email: userEmail, data: reg }, { onConflict: 'id' });
      }
    } catch (err) {
      console.error('Failed to save to Supabase:', err);
    }
  }
}

/**
 * Delete registration from localStorage + Supabase.
 */
export async function dbDeleteRegistration(id: string): Promise<void> {
  // localStorage
  const list = safeGetItem();
  const filtered = list.filter(r => r.id !== id);
  safeSetItem(filtered);

  // Supabase
  try {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.from(REGISTRATIONS_TABLE).delete().eq('id', id);
    }
  } catch (err) {
    console.error('Failed to delete from Supabase:', err);
  }
}
