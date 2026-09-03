/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Live quota: the arena cards show the registered-count per division and rise
 * +1 whenever a new participant successfully registers in the current session.
 *
 * The base counts come from the static `registered` values in data.ts (which are
 * manually kept up to date). On top of that we track how many successful
 * registrations happened locally and add them on, so the number increments in
 * real time without depending on an Apps Script / Google Sheets round-trip.
 */

import { useCallback, useRef, useState } from 'react';
import { COMPETITION_DIVISIONS } from '../data';

export interface LiveQuota {
  /** divisionId -> current registered count (base + local increments) */
  map: Record<string, number>;
  /** no longer fetched from a remote source, so it is never "loading" */
  loading: boolean;
  /** timestamp (ms) of the last update, or null if never updated */
  lastUpdated: number | null;
  /** bump the count for a division by +1 after a successful registration */
  increment: (divisionId: string) => void;
  /** reset local increments back to the base data.ts values */
  reset: () => void;
}

const DEFAULT_BASE_COUNTS: Record<string, number> = (() => {
  const base: Record<string, number> = {};
  for (const d of COMPETITION_DIVISIONS) {
    base[d.id] = d.registered ?? 0;
  }
  return base;
})();

export function useLiveQuota(): LiveQuota {
  const baseCounts = useRef<Record<string, number>>({ ...DEFAULT_BASE_COUNTS });

  const [map, setMap] = useState<Record<string, number>>(() => ({ ...baseCounts.current }));
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const increment = useCallback((divisionId: string) => {
    setMap(prev => {
      const current = typeof prev[divisionId] === 'number' ? prev[divisionId] : (baseCounts.current[divisionId] ?? 0);
      return { ...prev, [divisionId]: current + 1 };
    });
    setLastUpdated(Date.now());
  }, []);

  const reset = useCallback(() => {
    setMap({ ...baseCounts.current });
    setLastUpdated(null);
  }, []);

  return { map, loading: false, lastUpdated, increment, reset };
}
