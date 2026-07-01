/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Registration } from '../types';

const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || '';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase keys are provided in environment
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null;
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

/**
 * Sync registration from local types to Supabase Database format
 */
export async function dbFetchRegistrations(): Promise<Registration[]> {
  const supabase = getSupabase();
  if (!supabase) {
    // Fallback to localStorage if Supabase is not yet configured
    const local = localStorage.getItem('eric_live_registrations');
    return local ? JSON.parse(local) : [];
  }

  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching registrations from Supabase, falling back to localStorage:', error);
      const local = localStorage.getItem('eric_live_registrations');
      return local ? JSON.parse(local) : [];
    }

    const fetched = (data || []).map((row: any) => {
      const rawMembers = row.members || [];
      const metaItem = rawMembers.find((m: any) => m.id === 'metadata-extra');
      const filteredMembers = rawMembers.filter((m: any) => m.id !== 'metadata-extra');

      return {
        id: row.id,
        divisionId: row.division_id,
        teamName: row.team_name,
        leader: {
          name: row.leader_name,
          email: row.leader_email,
          whatsapp: row.leader_whatsapp,
          institution: row.leader_institution,
          address: metaItem?.leaderAddress || '',
          congenitalDisease: metaItem?.leaderCongenitalDisease || '',
          idCardName: metaItem?.leaderIdCardName || '',
          idCardUrl: metaItem?.leaderIdCardUrl || '',
          twibbonName: metaItem?.leaderTwibbonName || '',
          twibbonUrl: metaItem?.leaderTwibbonUrl || '',
        },
        members: filteredMembers,
        paymentMethod: row.payment_method,
        paymentStatus: row.payment_status,
        refCode: row.ref_code,
        amount: row.amount,
        subCategory: row.sub_category,
        level: row.level,
        lecturerName: row.lecturer_name,
        lecturerEmail: row.lecturer_email,
        lecturerWhatsapp: row.lecturer_whatsapp,
        lecturerIdCardName: metaItem?.lecturerIdCardName || '',
        lecturerIdCardUrl: metaItem?.lecturerIdCardUrl || '',
        lecturerTwibbonName: metaItem?.lecturerTwibbonName || '',
        lecturerTwibbonUrl: metaItem?.lecturerTwibbonUrl || '',
        lecturerCongenitalDisease: metaItem?.lecturerCongenitalDisease || '',
        paymentProofName: row.payment_proof_name,
        paymentProofUrl: row.payment_proof_url,
      };
    });

    // Keep localStorage in sync with the cloud
    localStorage.setItem('eric_live_registrations', JSON.stringify(fetched));
    return fetched;
  } catch (err) {
    console.warn('Error fetching registrations from Supabase, falling back to localStorage:', err);
    const local = localStorage.getItem('eric_live_registrations');
    return local ? JSON.parse(local) : [];
  }
}

/**
 * Upsert registration to Supabase
 */
export async function dbUpsertRegistration(reg: Registration): Promise<void> {
  // Always update localStorage first to ensure instant local persistence
  const local = localStorage.getItem('eric_live_registrations');
  const list: Registration[] = local ? JSON.parse(local) : [];
  const index = list.findIndex(r => r.id === reg.id);
  if (index >= 0) {
    list[index] = reg;
  } else {
    list.push(reg);
  }
  localStorage.setItem('eric_live_registrations', JSON.stringify(list));

  const supabase = getSupabase();
  if (!supabase) {
    return;
  }

  const metaItem = {
    id: 'metadata-extra',
    name: 'METADATA_EXTRA',
    whatsapp: 'METADATA_EXTRA',
    leaderAddress: reg.leader.address || '',
    leaderCongenitalDisease: reg.leader.congenitalDisease || '',
    leaderIdCardName: reg.leader.idCardName || '',
    leaderIdCardUrl: reg.leader.idCardUrl || '',
    leaderTwibbonName: reg.leader.twibbonName || '',
    leaderTwibbonUrl: reg.leader.twibbonUrl || '',
    lecturerIdCardName: reg.lecturerIdCardName || '',
    lecturerIdCardUrl: reg.lecturerIdCardUrl || '',
    lecturerTwibbonName: reg.lecturerTwibbonName || '',
    lecturerTwibbonUrl: reg.lecturerTwibbonUrl || '',
    lecturerCongenitalDisease: reg.lecturerCongenitalDisease || '',
  };

  const membersWithMeta = [
    ...reg.members.filter(m => m.id !== 'metadata-extra'),
    metaItem
  ];

  const row = {
    id: reg.id,
    division_id: reg.divisionId,
    team_name: reg.teamName,
    leader_name: reg.leader.name,
    leader_email: reg.leader.email,
    leader_whatsapp: reg.leader.whatsapp,
    leader_institution: reg.leader.institution,
    members: membersWithMeta,
    payment_method: reg.paymentMethod,
    payment_status: reg.paymentStatus,
    ref_code: reg.refCode,
    amount: reg.amount,
    sub_category: reg.subCategory || null,
    level: reg.level || null,
    lecturer_name: reg.lecturerName || null,
    lecturer_email: reg.lecturerEmail || null,
    lecturer_whatsapp: reg.lecturerWhatsapp || null,
    payment_proof_name: reg.paymentProofName || null,
    payment_proof_url: reg.paymentProofUrl || null,
  };

  try {
    const { error } = await supabase
      .from('registrations')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      console.error('Error upserting registration to Supabase:', error);
      throw error;
    }
  } catch (err) {
    console.error('Exception upserting registration to Supabase:', err);
    throw err;
  }
}

/**
 * Delete registration
 */
export async function dbDeleteRegistration(id: string): Promise<void> {
  // Always delete from localStorage first to ensure instant local responsiveness
  const local = localStorage.getItem('eric_live_registrations');
  if (local) {
    const list: Registration[] = JSON.parse(local);
    const filtered = list.filter(r => r.id !== id);
    localStorage.setItem('eric_live_registrations', JSON.stringify(filtered));
  }

  const supabase = getSupabase();
  if (!supabase) {
    return;
  }

  try {
    const { error } = await supabase
      .from('registrations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting registration from Supabase:', error);
      throw error;
    }
  } catch (err) {
    console.error('Exception deleting registration from Supabase:', err);
    throw err;
  }
}
