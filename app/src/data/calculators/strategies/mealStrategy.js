/**
 * mealStrategy.js — Favorites-weighted meal selection strategy.
 *
 * Pure function. No store access, no Date.now().
 *
 * Selection rules:
 *   1. Category constraint: slot's category must match meal's category.
 *   2. No-repeat within repeatGapDays (default 3) for same category.
 *   3. Favorites weighted by favoriteWeight × stars + 1.
 *   4. Lock survival: locked dates are passed to caller; this fn receives
 *      the recentlyUsed window and handles repeat-gap.
 *   5. Regen-immutability: eaten===true slots are never passed here —
 *      caller (WeeklyPlanGenerator) skips them before calling this strategy.
 *
 * AC-P1D-D16
 */

/**
 * Select a meal for a given slot, given the available library and recent usage.
 *
 * @param {Object} options
 * @param {Object[]} options.meals           - All MealInventoryItem[] from the library.
 * @param {string}  options.category         - Slot category ('breakfast', 'lunch', etc.)
 * @param {string[]} options.recentlyUsed    - Meal IDs used in the last repeatGapDays.
 * @param {number}  options.favoriteWeight   - Weight multiplier for favorite meals.
 * @param {Function} options.rng             - Seeded RNG: () => number in [0,1).
 * @returns {string|null} Selected meal id or null if no candidates.
 */
export function selectMeal({ meals, category, recentlyUsed, favoriteWeight, rng }) {
  // Filter to this category, active, not recently used
  const candidates = meals.filter(
    (m) =>
      m.category === category &&
      m.isActive !== false &&
      m.deletedAt == null &&
      !recentlyUsed.includes(m.id)
  );

  if (candidates.length === 0) {
    // Relax the repeat constraint if needed (avoid null)
    const fallback = meals.filter(
      (m) => m.category === category && m.isActive !== false && m.deletedAt == null
    );
    if (fallback.length === 0) return null;
    return weightedPick(fallback, favoriteWeight, rng);
  }

  return weightedPick(candidates, favoriteWeight, rng);
}

/**
 * Weighted random pick based on favoriteStars.
 *
 * weight(meal) = favoriteWeight × favoriteStars + 1
 *
 * @param {Object[]} candidates
 * @param {number}  favoriteWeight
 * @param {Function} rng
 * @returns {string} meal id
 */
function weightedPick(candidates, favoriteWeight, rng) {
  const weights = candidates.map((m) => favoriteWeight * (m.favoriteStars ?? 0) + 1);
  const totalWeight = weights.reduce((acc, w) => acc + w, 0);
  let pick = rng() * totalWeight;

  for (let i = 0; i < candidates.length; i++) {
    pick -= weights[i];
    if (pick <= 0) return candidates[i].id;
  }

  return candidates[candidates.length - 1].id;
}
