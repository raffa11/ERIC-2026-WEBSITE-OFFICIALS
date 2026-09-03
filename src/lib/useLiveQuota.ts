/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Live quota (global): the arena cards show a registered-count per division that
 * is the same on every device and rises +1 whenever any participant registers.
 *
 * The count comes from the real registrations stored in Google Sheets (the shared
 * source of truth, so desktop and Android always agree). A manual floor is applied
 * per division from the `registered` values in data.ts — see Divisions.tsx, where
 * effective = max(sheetCount, manual) — so a number you set by hand is never shown
 * smaller, while real signups still push it upward globally.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchAllRegistrations } from './googleSheet';

export interface LiveQuota {
  /** divisionId -> count of real registrations in Google Sheets + local bumps */
  map: Record<string, number>;
  /** true until the first successful fetch resolves */
  loading: boolean;
  /** timestamp (ms) of the last successful fetch, or null if never fetched */
  lastUpdated: number | null;
  /** re-fetch registration counts from the sheet now */
  refresh: () => Promise<void>;
  /** optimistic +1 bump for UX; superseded by the sheet count on next refresh */
  incrementLocal: (divisionId: string) => void;
}

const DEFAULT_POLL_INTERVAL_MS = 60000;

export function useLiveQuota(pollIntervalMs: number = DEFAULT_POLL_INTERVAL_MS): LiveQuota {
  const [map, setMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const regs = await fetchAllRegistrations();
      if (regs) {
        const counts: Record<string, number> = {};
        for (const r of regs) {
          const id = r?.divisionId;
          if (!id) continue;
          counts[id] = (counts[id] || 0) + 1;
        }
        setMap(counts);
        setLastUpdated(Date.now());
      }
    } catch (err) {
      console.error('[useLiveQuota] Error fetching live registrations:', err);
    } finally {
      setLoading(false);
      inFlight.current = false;
    }
  }, []);

  // Optimistic local bump so the card increments instantly on success. This is
  // session-scoped and temporary — the next refresh() overwrites the map with the
  // authoritative sheet count.
  const incrementLocal = useCallback((divisionId: string) => {
    setMap(prev => ({ ...prev, [divisionId]: (prev[divisionId] || 0) + 1 }));
    setLastUpdated(Date.now());
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, pollIntervalMs);
    return () => clearInterval(interval);
  }, [refresh, pollIntervalMs]);

  return { map, loading, lastUpdated, refresh, incrementLocal };
}
