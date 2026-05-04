/**
 * workoutSlice.js
 *
 * Owns: workoutLogs, weightHistory
 *
 * B10 note: Shape is kept at current v_legacy form.
 * The v_legacy → v3 migration (B10) will expand with walkLog, kickboxingLog,
 * weightSessionsSlice per the Unified Library Pattern.
 */

import { format } from 'date-fns';
import { stampNewRecord } from '../repositories/_internal/auditFields.js';

const today = () => format(new Date(), 'yyyy-MM-dd');

export const workoutSliceInitial = {
  workoutLogs: [],     // WorkoutLog[] — { id, date, steps, walkDuration, type, completed, intensity, chestPain, sob, notes }
  weightHistory: [],   // WeightEntry[] — { date, weight }  — seed data injected by index.js
};

/**
 * @param {Function} set - Zustand set
 * @param {Function} get - Zustand get
 * @returns {Object} action creators
 */
export function createWorkoutSlice(set, get) {
  return {
    // ── Workout Logs ──────────────────────────────────────────────

    /**
     * Appends a new workout log with full audit fields.
     * B10 DEBT-004 resolved: now pipes through stampNewRecord.
     * @param {Object} entry
     */
    addWorkoutLog: (entry) =>
      set((s) => ({
        workoutLogs: [
          ...s.workoutLogs,
          stampNewRecord({ date: today(), ...entry }),
        ],
      })),

    deleteWorkoutLog: (id) =>
      set((s) => ({
        workoutLogs: s.workoutLogs.filter((e) => e.id !== id),
      })),

    // ── Weight History ────────────────────────────────────────────

    /**
     * Adds or updates a weight entry for a given date, with full audit fields.
     * B10 DEBT-004 resolved: new entries now pipe through stampNewRecord.
     * @param {number} weight
     * @param {string} [date] - ISO date string (yyyy-MM-dd); defaults to today.
     */
    addWeightEntry: (weight, date) =>
      set((s) => {
        const d = date || today();
        const existing = s.weightHistory.find((e) => e.date === d);
        const updated = existing
          ? s.weightHistory.map((e) => (e.date === d ? { ...e, weight } : e))
          : [...s.weightHistory, stampNewRecord({ date: d, weight })];
        return {
          weightHistory: updated,
          profile: { ...s.profile, currentWeight: weight },
        };
      }),

    // ── Selectors ─────────────────────────────────────────────────
    getTodayWorkoutLog: () =>
      get().workoutLogs.find((e) => e.date === today()) || null,
  };
}
