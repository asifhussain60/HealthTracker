/**
 * useWorkoutRepo.js
 *
 * Repository hook for workout domain.
 *
 * Wraps workoutSlice (workoutLogs + weightHistory) with:
 *   - audit-field stamping on every write (via shared helpers)
 *   - soft-delete pattern (deletedAt) instead of hard deletes for logs
 *   - sync-by-signature: every method returns a value directly, never a Promise
 *
 * Debt note (filed 2026-05-04):
 *   workoutSlice.addWorkoutLog and addWeightEntry do not stamp audit fields —
 *   they generate ids without userId/createdAt/etc. The repo bypasses those
 *   slice actions for addWorkoutLog and addWeightEntry, using stampNewRecord
 *   + direct useStore.setState() to ensure correct audit fields.
 *   removeWorkoutLog implements soft-delete (not hard-delete like deleteWorkoutLog).
 *   When B10 lands the Unified Library Pattern, slice actions should be updated.
 *   See _workspace/scratch/observed-debt.md entry B9-DEBT-004.
 *
 * Architecture rule 5 invariant: NO async, NO await, NO Promise.resolve, NO .then.
 */

import { useStore } from '../store';
import { stampNewRecord, stampSoftDelete } from './_internal/auditFields.js';

export function useWorkoutRepo() {
  const workoutLogs = useStore((s) => s.workoutLogs);
  const weightHistory = useStore((s) => s.weightHistory);
  const getTodayWorkoutLogSlice = useStore((s) => s.getTodayWorkoutLog);

  /**
   * Returns all workout logs, optionally filtered by date string (yyyy-MM-dd).
   * @param {string} [date] - Optional date filter.
   * @returns {Object[]}
   */
  function listWorkoutLogs(date) {
    if (date !== undefined) {
      return workoutLogs.filter((log) => log.date === date);
    }
    return workoutLogs;
  }

  /**
   * Stamps a new workout log with audit fields and appends it to the store.
   * Returns the stamped record synchronously.
   * @param {Object} input
   * @returns {Object}
   */
  function addWorkoutLog(input) {
    const record = stampNewRecord(input);
    useStore.setState((s) => ({ workoutLogs: [...s.workoutLogs, record] }));
    return record;
  }

  /**
   * Soft-deletes a workout log by setting deletedAt.
   * Returns the updated record, or undefined if id is not found.
   * @param {string} id
   * @returns {Object|undefined}
   */
  function removeWorkoutLog(id) {
    const existing = workoutLogs.find((log) => log.id === id);
    if (!existing) return undefined;
    const deleted = stampSoftDelete(existing);
    useStore.setState((s) => ({
      workoutLogs: s.workoutLogs.map((log) => (log.id === id ? deleted : log)),
    }));
    return deleted;
  }

  /**
   * Returns the full weight history array.
   * @returns {Object[]}
   */
  function listWeightHistory() {
    return weightHistory;
  }

  /**
   * Stamps a new weight entry with audit fields and appends it to the store.
   * Returns the stamped record synchronously.
   * @param {Object} input - Must include { date, weight }.
   * @returns {Object}
   */
  function addWeightEntry(input) {
    const record = stampNewRecord(input);
    useStore.setState((s) => ({ weightHistory: [...s.weightHistory, record] }));
    return record;
  }

  /**
   * Passthrough to the slice's getTodayWorkoutLog selector.
   * Returns the log for today (by date match), or null.
   * @returns {Object|null}
   */
  function getTodayWorkoutLog() {
    return getTodayWorkoutLogSlice();
  }

  return {
    listWorkoutLogs,
    addWorkoutLog,
    removeWorkoutLog,
    listWeightHistory,
    addWeightEntry,
    getTodayWorkoutLog,
  };
}
