/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Live quota counter backed by Supabase (Postgres). Only stores a NUMBER per
 * division (division_id -> count) — no participant data, no images. This is a
 * dedicated counter so the arena-card quota can rise +1 globally, in real time,
 * across all devices, without depending on the Google Sheets fetch.
 *
 * Requires the `division_quotas` table + the two RPC functions from
 * `setup_division_quotas.sql`. Falls back to the static data.ts floor when
 * Supabase isn't configured or a call fails.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from './supabase';

export interface DivisionQuotaRow {
  division_id: string;
  count: number;
  updated_at: string;
}

export function isQuotaSupabaseConfigured(): boolean {
  // getSupabase() already returns null when VITE_SUPABASE_URL/KEY are missing.
  return getSupabase() !== null;
}

/** Read all division counters from Supabase. Returns null on failure/no config. */
export async function fetchQuotaCounts(): Promise<Record<string, number> | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('division_quotas')
      .select('division_id, count');
    if (error) throw error;
    const map: Record<string, number> = {};
    for (const row of (data || []) as DivisionQuotaRow[]) {
      if (row && row.division_id) map[row.division_id] = Number(row.count) || 0;
    }
    return map;
  } catch (err) {
    console.error('[liveQuotaSupabase] fetchQuotaCounts failed:', err);
    return null;
  }
}

/** Atomically increment a division's counter by +1 in Supabase. Returns the new count, or null. */
export async function incrementQuotaCount(divisionId: string): Promise<number | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  try {
    const { data, error } = await (supabase as SupabaseClient).rpc(
      'increment_division_quota',
      { p_division_id: divisionId }
    );
    if (error) throw error;
    return typeof data === 'number' ? data : null;
  } catch (err) {
    console.error('[liveQuotaSupabase] incrementQuotaCount failed:', err);
    return null;
  }
}

/** Manually seed / set a division's counter to an exact number. Returns the new count, or null. */
export async function setQuotaCount(divisionId: string, count: number): Promise<number | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  try {
    const { data, error } = await (supabase as SupabaseClient).rpc(
      'set_division_quota',
      { p_division_id: divisionId, p_count: count }
    );
    if (error) throw error;
    return typeof data === 'number' ? data : null;
  } catch (err) {
    console.error('[liveQuotaSupabase] setQuotaCount failed:', err);
    return null;
  }
}
