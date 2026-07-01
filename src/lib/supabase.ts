/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Registration } from '../types';

const metaEnv = (import.meta as any).env || {};
const supabaseUrl = (metaEnv.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (metaEnv.VITE_SUPABASE_ANON_KEY || '').trim();

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
 * LocalStorage CRUD — Google Sheet is the source of truth.
 */

export function dbFetchRegistrations(): Promise<Registration[]> {
  const local = localStorage.getItem('eric_live_registrations');
  return Promise.resolve(local ? JSON.parse(local) : []);
}

export async function dbUpsertRegistration(reg: Registration): Promise<void> {
  const local = localStorage.getItem('eric_live_registrations');
  const list: Registration[] = local ? JSON.parse(local) : [];
  const index = list.findIndex(r => r.id === reg.id);
  if (index >= 0) {
    list[index] = reg;
  } else {
    list.push(reg);
  }
  localStorage.setItem('eric_live_registrations', JSON.stringify(list));
}

export async function dbDeleteRegistration(id: string): Promise<void> {
  const local = localStorage.getItem('eric_live_registrations');
  if (local) {
    const list: Registration[] = JSON.parse(local);
    const filtered = list.filter(r => r.id !== id);
    localStorage.setItem('eric_live_registrations', JSON.stringify(filtered));
  }
}
