/**
 * mealSlice.js
 *
 * Owns: mealTemplates
 *
 * B10 note: In the v_legacy → v3 migration (B10), mealTemplates will be
 * renamed / migrated to mealLibrary per the Unified Library Pattern.
 * For now, keep current shape exactly.
 */

export const mealSliceInitial = {
  mealTemplates: [],  // MealTemplate[] — { id, name, label, calories, protein, carbs, fat, notes }
};

/**
 * @param {Function} set - Zustand set
 * @returns {Object} action creators
 */
export function createMealSlice(set) {
  return {
    // ── Meal Templates ────────────────────────────────────────────
    saveMealTemplate: (template) =>
      set((s) => ({
        mealTemplates: [
          ...s.mealTemplates,
          { id: crypto.randomUUID(), ...template },
        ],
      })),

    deleteMealTemplate: (id) =>
      set((s) => ({
        mealTemplates: s.mealTemplates.filter((t) => t.id !== id),
      })),
  };
}
