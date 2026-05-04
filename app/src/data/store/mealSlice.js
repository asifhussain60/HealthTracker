/**
 * mealSlice.js
 *
 * Owns: mealTemplates
 *
 * B10 note: In the v_legacy → v3 migration (B10), mealTemplates will be
 * renamed / migrated to mealLibrary per the Unified Library Pattern.
 * For now, keep current shape exactly.
 *
 * B10 DEBT-002 resolved:
 *   - updateMealTemplate(id, patch) added — merges patch + bumps audit fields.
 *   - removeMealTemplate now soft-deletes (sets deletedAt) instead of hard-delete.
 */

import { stampUpdate, stampSoftDelete } from '../repositories/_internal/auditFields.js';

export const mealSliceInitial = {
  mealTemplates: [],  // MealTemplate[] — { id, name, label, calories, protein, carbs, fat, notes }
};

/**
 * @param {Function} set - Zustand set
 * @param {Function} _get - Zustand get (unused currently)
 * @returns {Object} action creators
 */
export function createMealSlice(set, _get) {
  return {
    // ── Meal Templates ────────────────────────────────────────────

    saveMealTemplate: (template) =>
      set((s) => ({
        mealTemplates: [
          ...s.mealTemplates,
          { id: crypto.randomUUID(), ...template },
        ],
      })),

    /**
     * Merges a patch onto an existing meal template and bumps audit fields.
     * Is a no-op if the id is not found.
     * B10 DEBT-002 resolved.
     * @param {string} id
     * @param {Object} patch
     */
    updateMealTemplate: (id, patch) =>
      set((s) => ({
        mealTemplates: s.mealTemplates.map((t) =>
          t.id === id ? stampUpdate(t, patch) : t
        ),
      })),

    /**
     * Soft-deletes a meal template by setting deletedAt.
     * The record remains in the array; callers filter by deletedAt === null.
     * B10 DEBT-002 resolved (replaces former hard-delete).
     * @param {string} id
     */
    removeMealTemplate: (id) =>
      set((s) => ({
        mealTemplates: s.mealTemplates.map((t) =>
          t.id === id ? stampSoftDelete(t) : t
        ),
      })),
  };
}
