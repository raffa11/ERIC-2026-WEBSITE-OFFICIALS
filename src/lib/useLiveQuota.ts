/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Live quota (global, Supabase-backed): the arena cards show a registered-count
 * per division that is the same on every device and rises +1 whenever any
 * participant registers. Only a NUMBER per division is stored in Supabase
 * (division_quotas table) — no participant data or images.
 *
 * Effective count displayed = max(manualFloorFromDataTs, supabaseCount). The
 * manual floor guarantees a hand-set number is never shown smaller even if the
 * Supabase counter isn't seeded yet, while real signups push the number up
 * globally via the atomic increment + Postgres realtime subscription.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { getSupabase } from './supabase';
import {
  fetchQuotaCounts,
  incrementQuotaCount,
  isQuotaSupabaseConfigured,
} from './liveQuotaSupabase';

export interface LiveQuota {
  /** divisionId -> authoritative count from Supabase (global), if available */
  supabaseCounts: Record<string, number>;
  /** true until the first Supabase fetch resolves */
  loading: boolean;
  /** timestamp (ms) of the last update, or null if never */
  lastUpdated: number | null;
  /** atomic +1 of a division's counter in Supabase */
  increment: (divisionId: string) => Promise<void>;
  /** re-fetch counts from Supabase now */
  refresh: () => Promise<void>;
}

/** Default caution: never poll hard if Supabase is absent. */
const DEFAULT_REFRESH_MS = 60000;

let realtimeSubscribed = false;

export function useLiveQuota(refreshMs: number = DEFAULT_REFRESH_MS): LiveQuota {
  const [supabaseCounts, setSupabaseCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (!isQuotaSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const counts = await fetchQuotaCounts();
      if (counts) {
        setSupabaseCounts(counts);
        setLastUpdated(Date.now());
      }
    } catch (err) {
      console.error('[useLiveQuota] refresh failed:', err);
    } finally {
      setLoading(false);
      inFlight.current = false;
    }
  }, []);

  const increment = useCallback(async (divisionId: string) => {
    // Optimistic local bump for instant UX.
    setSupabaseCounts(prev => ({ ...prev, [divisionId]: (prev[divisionId] || 0) + 1 }));
    setLastUpdated(Date.now());
    // Atomic increment in Supabase; the realtime subscription / next refresh
    // reconciles any drift across devices.
    await incrementQuotaCount(divisionId);
  }, []);

  // Subscribe to Postgres realtime changes so all devices update instantly.
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }
    refresh();

    if (!realtimeSubscribed) {
      realtimeSubscribed = true;
      const channel = supabase
        .channel('division-quotas-live')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'division_quotas' },
          () => {
            void refresh();
          }
        )
        .subscribe();
      // No cleanup: keep the single channel alive for the app lifetime.
    }

    const interval = setInterval(() => { void refresh(); }, refreshMs);
    return () => clearInterval(interval);
  }, [refresh, refreshMs]);

  return { supabaseCounts, loading, lastUpdated, increment, refresh };
}
