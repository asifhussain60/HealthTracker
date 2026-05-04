/**
 * macroMath.js — Pure macro scaling functions.
 *
 * No imports from store, views, or React.
 * No Date.now() / new Date().
 *
 * Plate-weight scaling math (from data-model.md § Plate-weight scaling math):
 *   food_weight = max(0, plateWeight − profile.plateDefaults[category])
 *   scaled.calories = refCalories × (food_weight / referenceWeight)
 *   // same ratio for protein / carbs / fat
 *
 * The shorthand formula `refCalories × plateWeight / referenceWeight` in
 * DESIGN-REQUIREMENTS.md is illustrative; the actual derivation always
 * subtracts plateDefaults[category] first (see data-model.md note).
 */

// ── foodWeightFromTotal ───────────────────────────────────────────────────────

/**
 * Derive actual food weight by subtracting the known empty-plate mass.
 * Returns max(0, plateWeight − plateDefaultGrams) to prevent negative weights.
 *
 * @param {number} plateWeight       - Total mass on plate (food + plate) in grams
 * @param {number} plateDefaultGrams - Empty plate mass for this category in grams
 *                                     (from profile.plateDefaults[category])
 * @returns {number} Food weight in grams (≥ 0)
 */
export function foodWeightFromTotal(plateWeight, plateDefaultGrams) {
  return Math.max(0, plateWeight - plateDefaultGrams);
}

// ── scaledMacros ──────────────────────────────────────────────────────────────

/**
 * Scale reference macros by the ratio foodWeightGrams / referenceWeightGrams.
 * Returns all-zero macros when referenceWeightGrams is 0 (guard against division-by-zero).
 *
 * @param {{ calories: number, protein: number, carbs: number, fat: number }} refMacros
 *   Reference macros at referenceWeightGrams (from MealInventoryItem.ref* fields)
 * @param {number} foodWeightGrams       - Actual food weight (output of foodWeightFromTotal)
 * @param {number} referenceWeightGrams  - Weight at which refMacros were measured
 * @returns {{ calories: number, protein: number, carbs: number, fat: number }}
 */
export function scaledMacros(refMacros, foodWeightGrams, referenceWeightGrams) {
  if (!referenceWeightGrams || referenceWeightGrams <= 0) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }

  const ratio = foodWeightGrams / referenceWeightGrams;

  return {
    calories: refMacros.calories * ratio,
    protein: refMacros.protein * ratio,
    carbs: refMacros.carbs * ratio,
    fat: refMacros.fat * ratio,
  };
}

// ── consumedMacrosForSlot ─────────────────────────────────────────────────────

/**
 * Compute consumed macros for a single MealPlanSlot.
 *
 * Returns null when:
 *   - slot.eaten is falsy (slot not consumed)
 *   - slot.plateWeight is null or undefined (no weight entered)
 *   - mealInventoryItem is null/undefined (no meal assigned)
 *
 * PF-12 invariant: this function treats the slot as an immutable input;
 * it never mutates the slot object.
 *
 * @param {{ eaten: boolean, plateWeight: number|null, category: string }} slot
 *   MealPlanSlot — see data-model.md § MealPlanSlot
 * @param {{ referenceWeight: number, refCalories: number, refProtein: number,
 *            refCarbs: number, refFat: number } | null} mealInventoryItem
 * @param {{ breakfast: number, lunch: number, dinner: number,
 *            snack: number, shake: number }} plateDefaults
 *   profile.plateDefaults — empty-plate mass in grams per category
 * @returns {{ calories: number, protein: number, carbs: number, fat: number } | null}
 */
export function consumedMacrosForSlot(slot, mealInventoryItem, plateDefaults) {
  if (!slot.eaten) return null;
  if (slot.plateWeight == null) return null;
  if (!mealInventoryItem) return null;

  const plateDefaultGrams = plateDefaults[slot.category] ?? 0;
  const foodWeight = foodWeightFromTotal(slot.plateWeight, plateDefaultGrams);

  const refMacros = {
    calories: mealInventoryItem.refCalories,
    protein: mealInventoryItem.refProtein,
    carbs: mealInventoryItem.refCarbs,
    fat: mealInventoryItem.refFat,
  };

  return scaledMacros(refMacros, foodWeight, mealInventoryItem.referenceWeight);
}
