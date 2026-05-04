/**
 * useMealsRepo.js
 *
 * Repository hook for meals domain.
 *
 * Wraps mealSlice (mealTemplates) with:
 *   - audit-field stamping on every write (via shared helpers)
 *   - soft-delete pattern (deletedAt) instead of hard deletes
 *   - sync-by-signature: every method returns a value directly, never a Promise
 *
 * Debt (B9-DEBT-002, filed 2026-05-04):
 *   mealSlice exposes only saveMealTemplate (append) and deleteMealTemplate (hard delete).
 *   updateMealTemplate and soft-delete are implemented here via useStore.setState()
 *   directly. See _workspace/scratch/observed-debt.md entry B9-DEBT-002.
 *
 * Architecture rule 5 invariant: NO async, NO await, NO Promise.resolve, NO .then.
 */

import { useStore } from '../store';
import { stampNewRecord, stampUpdate, stampSoftDelete } from './_internal/auditFields.js';

export function useMealsRepo() {
  const mealTemplates = useStore((s) => s.mealTemplates);

  /**
   * Returns all meal templates.
   * @returns {Object[]}
   */
  function listMealTemplates() {
    return mealTemplates;
  }

  /**
   * Finds and returns a meal template by id. Returns undefined if not found.
   * @param {string} id
   * @returns {Object|undefined}
   */
  function getMealTemplate(id) {
    return mealTemplates.find((t) => t.id === id);
  }

  /**
   * Stamps a new meal template with audit fields and appends it to the store.
   * Returns the stamped record synchronously.
   * @param {Object} input
   * @returns {Object}
   */
  function addMealTemplate(input) {
    const record = stampNewRecord(input);
    useStore.setState((s) => ({ mealTemplates: [...s.mealTemplates, record] }));
    return record;
  }

  /**
   * Merges patch onto an existing meal template and bumps audit fields.
   * Returns the updated record, or undefined if id is not found.
   * @param {string} id
   * @param {Object} patch
   * @returns {Object|undefined}
   */
  function updateMealTemplate(id, patch) {
    const existing = mealTemplates.find((t) => t.id === id);
    if (!existing) return undefined;
    const updated = stampUpdate(existing, patch);
    useStore.setState((s) => ({
      mealTemplates: s.mealTemplates.map((t) => (t.id === id ? updated : t)),
    }));
    return updated;
  }

  /**
   * Soft-deletes a meal template by setting deletedAt.
   * Returns the updated record, or undefined if id is not found.
   * @param {string} id
   * @returns {Object|undefined}
   */
  function removeMealTemplate(id) {
    const existing = mealTemplates.find((t) => t.id === id);
    if (!existing) return undefined;
    const deleted = stampSoftDelete(existing);
    useStore.setState((s) => ({
      mealTemplates: s.mealTemplates.map((t) => (t.id === id ? deleted : t)),
    }));
    return deleted;
  }

  return {
    listMealTemplates,
    getMealTemplate,
    addMealTemplate,
    updateMealTemplate,
    removeMealTemplate,
  };
}
