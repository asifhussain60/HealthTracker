/**
 * sweetToothSlice.js — Sweet tooth tracking (append-only).
 *
 * Owns: dailySlips — keyed by date → slip[] (never deletable)
 *
 * Rules:
 *   - addSlip appends; never modifies existing slips
 *   - removeSlip throws SweetToothDeleteBlockedError (append-only invariant)
 *   - getStreakDays returns a 14-day window with slipCount per day
 *
 * AC-P1E-E6
 * HT-CORE-008: audit fields on every new slip.
 * HT-CORE-009: schemaVersion: 3.
 */

import { CURRENT_USER_ID } from '../auth/currentUser.js';

// ── SweetToothDeleteBlockedError ──────────────────────────────────────────────

/**
 * Thrown when removeSlip is called — sweet tooth slips are append-only.
 */
export class SweetToothDeleteBlockedError extends Error {
  constructor() {
    super('Sweet tooth slips are append-only and cannot be deleted');
    this.name = 'SweetToothDeleteBlockedError';
  }
}

// ── Slice ─────────────────────────────────────────────────────────────────────

export const sweetToothSliceInitial = {
  dailySlips: {},
  // { [date: string]: Array<{ id, item, createdAt, userId, schemaVersion }> }
};

/**
 * @param {Function} set - Zustand set
 * @param {Function} get - Zustand get
 * @returns {Object} action creators
 */
export function createSweetToothSlice(set, get) {
  return {
    /**
     * Append a sweet tooth slip for the given date and item.
     * @param {string} date - YYYY-MM-DD
     * @param {string} item - e.g. 'chocolate', 'candy', 'mints', 'cookies'
     * @returns {Object} the new slip record
     */
    addSlip(date, item) {
      const now = new Date().toISOString();
      const slip = {
        id: crypto.randomUUID(),
        item,
        date,
        userId: CURRENT_USER_ID,
        createdAt: now,
        updatedAt: now,
        createdBy: CURRENT_USER_ID,
        updatedBy: CURRENT_USER_ID,
        deletedAt: null,
        schemaVersion: 3,
      };
      set((s) => ({
        dailySlips: {
          ...s.dailySlips,
          [date]: [...(s.dailySlips[date] ?? []), slip],
        },
      }));
      return slip;
    },

    /**
     * Always throws — sweet tooth slips cannot be deleted (append-only invariant).
     * @throws {SweetToothDeleteBlockedError}
     */
    removeSlip(_id) {
      throw new SweetToothDeleteBlockedError();
    },

    /**
     * Return a 14-day window array ending on `today` (inclusive).
     * Each entry: { date: string, slipCount: number }
     *
     * @param {string} today - YYYY-MM-DD
     * @param {number} days - window size (default 14)
     * @returns {Array<{ date: string, slipCount: number }>}
     */
    getStreakDays(today, days = 14) {
      const slips = get().dailySlips;
      const result = [];
      const endDate = new Date(today);

      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(endDate);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const daySlips = slips[dateStr] ?? [];
        result.push({ date: dateStr, slipCount: daySlips.length });
      }

      return result;
    },
  };
}
