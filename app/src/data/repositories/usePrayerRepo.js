/**
 * usePrayerRepo.js — Prayer repository hook.
 *
 * Wraps prayerSlice with:
 *   - sync-by-signature (no Promises)
 *   - closed-day guard: writes are blocked when the day is closed
 *   - audit fields stamped via prayerSlice.togglePrayer
 *
 * AC-P1E-E2
 * HT-CORE-008: audit fields stamped in slice.
 * HT-CORE-010: filters by userId (solo-user: CURRENT_USER_ID constant).
 */

import { useStore } from '../store';

export function usePrayerRepo() {
  const prayers = useStore((s) => s.prayers ?? {});
  const togglePrayer = useStore((s) => s.togglePrayer);
  const getPrayerStatus = useStore((s) => s.getPrayerStatus);
  const closures = useStore((s) => s.dayCloseSlice?.closures ?? {});

  /**
   * Return prayer status for a date.
   * @param {string} date - YYYY-MM-DD
   * @param {string} prayer - lowercase prayer key
   * @returns {{ done: boolean, updatedAt?: string }}
   */
  function getStatus(date, prayer) {
    return getPrayerStatus?.(date, prayer) ?? { done: false };
  }

  /**
   * Return all prayer statuses for a date.
   * @param {string} date - YYYY-MM-DD
   * @returns {{ [prayerKey: string]: { done: boolean } }}
   */
  function getDayStatus(date) {
    return prayers[date] ?? {};
  }

  /**
   * Toggle a prayer for a date.
   * No-op if the day is closed.
   * @param {string} date - YYYY-MM-DD
   * @param {string} prayer - lowercase prayer key
   * @returns {boolean} true if toggled; false if blocked (closed day)
   */
  function toggle(date, prayer) {
    if (closures[date]) return false;
    togglePrayer?.(date, prayer);
    return true;
  }

  return { getStatus, getDayStatus, toggle };
}
