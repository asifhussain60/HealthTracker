/**
 * weightSessionsSlice.js — Weight training sessions slice.
 *
 * Owns: weightSessions — daily weight training sessions
 *
 * Cap rule: max 2 weight sessions per day. Adding a 3rd throws WeightCapExceededError.
 *
 * AC-P1E-E3
 * HT-CORE-008: audit fields on every new record.
 * HT-CORE-009: schemaVersion: 3 on every record.
 */

import { stampNewRecord } from '../repositories/_internal/auditFields.js';

// ── WeightCapExceededError ────────────────────────────────────────────────────

/**
 * Thrown when a 3rd weight session is added on the same day.
 */
export class WeightCapExceededError extends Error {
  constructor(date, cap) {
    super(`Weight session cap of ${cap} reached for ${date}`);
    this.name = 'WeightCapExceededError';
    this.date = date;
    this.cap = cap;
  }
}

// ── Slice ─────────────────────────────────────────────────────────────────────

export const weightSessionsSliceInitial = {
  weightSessions: [],
  // WeightSession[] — { id, date, routineId, routineName, createdAt, updatedAt, schemaVersion }
};

/**
 * @param {Function} set - Zustand set
 * @param {Function} get - Zustand get
 * @returns {Object} action creators
 */
export function createWeightSessionsSlice(set, get) {
  const DAILY_CAP = 2;

  return {
    /**
     * Add a weight session for a date.
     * Throws WeightCapExceededError if the day already has DAILY_CAP sessions.
     *
     * @param {Object} session - { date, routineId, routineName?, ... }
     * @returns {Object} the stamped session record
     */
    addWeightSession(session) {
      const state = get();
      const date = session.date;
      const existing = (state.weightSessions ?? []).filter(
        (s) => s.date === date && s.deletedAt == null
      );
      if (existing.length >= DAILY_CAP) {
        throw new WeightCapExceededError(date, DAILY_CAP);
      }
      const record = stampNewRecord({ ...session });
      set((s) => ({ weightSessions: [...(s.weightSessions ?? []), record] }));
      return record;
    },

    /**
     * Remove a weight session by id (hard delete — sessions are not medical records).
     * @param {string} id
     */
    removeWeightSession(id) {
      set((s) => ({
        weightSessions: (s.weightSessions ?? []).filter((s) => s.id !== id),
      }));
    },

    /**
     * Return weight sessions for a given date.
     * @param {string} date - YYYY-MM-DD
     * @returns {Object[]}
     */
    getWeightSessionsForDate(date) {
      return (get().weightSessions ?? []).filter(
        (s) => s.date === date && s.deletedAt == null
      );
    },
  };
}
