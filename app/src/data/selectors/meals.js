/**
 * meals.js — Meal selectors.
 *
 * All selectors accept (state, userId, ...) and filter by userId.
 * HT-CORE-010: selectors filter by currentUser.id (passed as userId parameter).
 * No Date.now() / new Date() — callers inject date when needed.
 *
 * Memoization: single-input memo with reference-equality check (no reselect dependency).
 * Open debt (P1.D D15): mealInventory + mealPlan slice keys are not yet renamed from
 *   the legacy mealTemplates shape; the rename + library-pattern migration is reserved
 *   for the meal-library seed commit. Selectors default-guard so the app does not crash
 *   in the meantime. See _workspace/scratch/observed-debt.md "Tracker → Planner refactor
 *   debt (2026-05-04)" entry, deadline P1.D D15.
 */

import { filterByUser } from './_internal/userScope.js';

// ── Memo helper ───────────────────────────────────────────────────────────────

function makeMemo(fn) {
  let lastState;
  let lastArgs;
  let lastResult;
  return function (state, ...args) {
    if (
      state === lastState &&
      lastArgs !== undefined &&
      args.length === lastArgs.length &&
      args.every((a, i) => a === lastArgs[i])
    ) {
      return lastResult;
    }
    lastState = state;
    lastArgs = args;
    lastResult = fn(state, ...args);
    return lastResult;
  };
}

// ── selectMealInventory ───────────────────────────────────────────────────────

/**
 * Return active MealInventoryItem[] for the given user.
 * HT-CORE-010: filters by userId.
 * Debt: mealInventory slice key lands at B10. Gracefully returns [] if absent.
 *
 * @param {Object} state
 * @param {string} userId
 * @returns {Array}
 */
export const selectMealInventory = makeMemo((state, userId) =>
  filterByUser(state.mealInventory ?? [], userId)
);

// ── selectFavoriteMeals ───────────────────────────────────────────────────────

/**
 * Return MealInventoryItem[] with favoriteStars > 0, ordered desc by stars.
 * HT-CORE-010: filters by userId.
 *
 * @param {Object} state
 * @param {string} userId
 * @returns {Array}
 */
export const selectFavoriteMeals = makeMemo((state, userId) => {
  const meals = filterByUser(state.mealInventory ?? [], userId).filter(
    (m) => (m.favoriteStars ?? 0) > 0
  );
  return meals.slice().sort((a, b) => (b.favoriteStars ?? 0) - (a.favoriteStars ?? 0));
});

// ── selectMealsByCategory ─────────────────────────────────────────────────────

/**
 * Return MealInventoryItem[] filtered by category for the given user.
 * HT-CORE-010: filters by userId.
 *
 * @param {Object} state
 * @param {string} userId
 * @param {string} category
 * @returns {Array}
 */
export const selectMealsByCategory = makeMemo((state, userId, category) =>
  filterByUser(state.mealInventory ?? [], userId).filter(
    (m) => m.category === category
  )
);

// ── selectWeeklyPlan ──────────────────────────────────────────────────────────

/**
 * Return the current MealPlan for the given user, or null.
 * HT-CORE-010: verifies mealPlan.userId === userId.
 * Debt: mealPlan shape lands at B10. Returns null gracefully if absent.
 *
 * @param {Object} state
 * @param {string} userId
 * @returns {Object | null}
 */
export function selectWeeklyPlan(state, userId) {
  const plan = state.mealPlan ?? null;
  if (!plan) return null;
  if (plan.userId !== userId) return null;
  if (plan.deletedAt !== null && plan.deletedAt !== undefined) return null;
  return plan;
}

// ── selectPlanSlot ────────────────────────────────────────────────────────────

/**
 * Return a specific MealPlanSlot by date and slotKey, or null.
 * HT-CORE-010: verifies plan belongs to userId.
 *
 * @param {Object} state
 * @param {string} userId
 * @param {string} date - YYYY-MM-DD
 * @param {string} slotKey - e.g. 'lunch', 'dinner', 'breakfast'
 * @returns {Object | null}
 */
export function selectPlanSlot(state, userId, date, slotKey) {
  const plan = selectWeeklyPlan(state, userId);
  if (!plan) return null;
  const day = plan.days?.[date];
  if (!day) return null;
  return day[slotKey] ?? null;
}
