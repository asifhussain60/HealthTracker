/**
 * useSweetToothRepo.js — Sweet tooth repository hook.
 *
 * Wraps sweetToothSlice with:
 *   - sync-by-signature (no Promises)
 *   - closed-day guard (blocks writes on closed days)
 *   - delete always blocked (append-only)
 *
 * AC-P1E-E6
 * HT-CORE-008: audit fields stamped in slice.
 * HT-CORE-010: solo-user scope.
 */

import { useStore } from '../store';

export function useSweetToothRepo() {
  const dailySlips = useStore((s) => s.dailySlips ?? {});
  const addSlip = useStore((s) => s.addSlip);
  const removeSlip = useStore((s) => s.removeSlip);
  const getStreakDays = useStore((s) => s.getStreakDays);
  const closures = useStore((s) => s.dayCloseSlice?.closures ?? {});

  /**
   * Get daily counts of each item type for a date.
   * @param {string} date - YYYY-MM-DD
   * @returns {{ [item: string]: number }}
   */
  function getDailyCounts(date) {
    const slips = dailySlips[date] ?? [];
    const counts = {};
    for (const slip of slips) {
      counts[slip.item] = (counts[slip.item] ?? 0) + 1;
    }
    return counts;
  }

  /**
   * Add a slip. Blocked on closed days.
   * @param {string} date
   * @param {string} item
   * @returns {boolean} true if added; false if blocked
   */
  function add(date, item) {
    if (closures[date]) return false;
    addSlip?.(date, item);
    return true;
  }

  /**
   * Refuses to delete — always throws.
   */
  function remove(_id) {
    removeSlip?.(_id); // will throw SweetToothDeleteBlockedError
  }

  /**
   * Get 14-day streak window.
   * @param {string} today - YYYY-MM-DD
   * @param {number} days
   * @returns {Array}
   */
  function streak(today, days = 14) {
    return getStreakDays?.(today, days) ?? [];
  }

  return { getDailyCounts, add, remove, streak };
}
