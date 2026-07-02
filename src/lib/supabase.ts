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
 * Fetch registrations from localStorage + Supabase, merged by id.
 * Supabase results take priority.
 */
export async function dbFetchRegistrations(userEmail?: string): Promise<Registration[]> {
  const local = localStorage.getItem('eric_live_registrations');
  const localRegs: Registration[] = local ? JSON.parse(local) : [];

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
  // localStorage
  const local = localStorage.getItem('eric_live_registrations');
  const list: Registration[] = local ? JSON.parse(local) : [];
  const index = list.findIndex(r => r.id === reg.id);
  if (index >= 0) {
    list[index] = reg;
  } else {
    list.push(reg);
  }
  localStorage.setItem('eric_live_registrations', JSON.stringify(list));

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
  const local = localStorage.getItem('eric_live_registrations');
  if (local) {
    const list: Registration[] = JSON.parse(local);
    const filtered = list.filter(r => r.id !== id);
    localStorage.setItem('eric_live_registrations', JSON.stringify(filtered));
  }

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
