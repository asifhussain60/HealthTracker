/**
 * workSessionsSlice.js — Work-from session tracking.
 *
 * Owns: workSessions — daily work sessions with location, start/end times, duration.
 *
 * Actions:
 *   startSession({ date, locationId }) — creates a new open session
 *   endSession(id) — closes the session, computes durationMinutes
 *   getSessionsForDate(date) — returns sessions for the given date
 *
 * AC-P1E-E7
 * HT-CORE-008: audit fields on every new record.
 * HT-CORE-009: schemaVersion: 3.
 */

import { stampNewRecord } from '../repositories/_internal/auditFields.js';

export const workSessionsSliceInitial = {
  workSessions: [],
  // WorkSession[] — { id, date, locationId, startedAt, endedAt, durationMinutes,
  //                    createdAt, updatedAt, createdBy, updatedBy, schemaVersion }
};

/**
 * @param {Function} set - Zustand set
 * @param {Function} get - Zustand get
 * @returns {Object} action creators
 */
export function createWorkSessionsSlice(set, get) {
  return {
    /**
     * Start a work session for a given date and location.
     * Returns the new session record.
     *
     * @param {{ date: string, locationId: string, locationName?: string }} input
     * @returns {Object}
     */
    startSession(input) {
      const now = new Date().toISOString();
      const record = stampNewRecord({
        date: input.date,
        locationId: input.locationId,
        locationName: input.locationName ?? null,
        startedAt: now,
        endedAt: null,
        durationMinutes: null,
      });
      set((s) => ({ workSessions: [...(s.workSessions ?? []), record] }));
      return record;
    },

    /**
     * End a work session by id. Computes durationMinutes from startedAt.
     * No-op if session not found or already ended.
     *
     * @param {string} id
     * @returns {Object|null} the updated session
     */
    endSession(id) {
      const now = new Date();
      let result = null;
      set((s) => ({
        workSessions: (s.workSessions ?? []).map((sess) => {
          if (sess.id !== id || sess.endedAt) return sess;
          const startMs = new Date(sess.startedAt).getTime();
          const durationMinutes = Math.max(0, Math.round((now.getTime() - startMs) / 60000));
          result = {
            ...sess,
            endedAt: now.toISOString(),
            durationMinutes,
            updatedAt: now.toISOString(),
          };
          return result;
        }),
      }));
      return result;
    },

    /**
     * Return work sessions for a given date (active and completed).
     * @param {string} date - YYYY-MM-DD
     * @returns {Object[]}
     */
    getSessionsForDate(date) {
      return (get().workSessions ?? []).filter((s) => s.date === date);
    },
  };
}
