/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Live quota: counts real registrations per division straight from Google Sheets
 * (via the Apps Script getRegistrations endpoint) so the "LIVE QUOTA" boxes on
 * the arena cards reflect actual registrations and rise in real time as new
 * participants register and sync to the sheet.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchAllRegistrations } from './googleSheet';

export interface LiveQuota {
  /** divisionId -> number of real registrations currently in the sheet */
  map: Record<string, number>;
  /** true until the first successful fetch resolves */
  loading: boolean;
  /** timestamp (ms) of the last successful refresh, or null if never fetched */
  lastUpdated: number | null;
  /** re-fetch registration counts from the sheet now */
  refresh: () => Promise<void>;
}

const DEFAULT_POLL_INTERVAL_MS = 60000;

export function useLiveQuota(pollIntervalMs: number = DEFAULT_POLL_INTERVAL_MS): LiveQuota {
  const [map, setMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    // Guard against overlapping fetchAllRegistrations requests (it already has
    // its own retry logic, so we only serialize at the hook layer).
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

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, pollIntervalMs);
    return () => clearInterval(interval);
  }, [refresh, pollIntervalMs]);

  return { map, loading, lastUpdated, refresh };
}
