/**
 * today.js — Today's composed view selectors.
 *
 * All selectors accept (state, userId, date) and filter by userId.
 * HT-CORE-010: selectors filter by currentUser.id (passed as userId parameter).
 * No Date.now() / new Date() — callers inject `date` as YYYY-MM-DD string.
 *
 * Delegates to:
 *   - cannabis.js selectCannabisSessionsByDate
 *   - macroMath.consumedMacrosForSlot
 * B10 debt: profile.dailyCalorieTarget defaults to 2000 until B10 sets it.
 * B10 debt: weightHistory records lack userId; selectTodayWeightEntry filters
 *   by userId gracefully — records without userId field are excluded.
 */

import { consumedMacrosForSlot } from '../calculators/macroMath.js';
import { selectCannabisSessionsByDate } from './cannabis.js';
import { selectWeeklyPlan } from './meals.js';

// ── selectTodayWeightEntry ────────────────────────────────────────────────────

/**
 * Return the most recent WeightEntry for the user on or before the given date.
 * HT-CORE-010: filters by userId.
 * Debt: current weightHistory records in seed.js lack userId field. This
 *   selector requires records to have userId; seed will be updated at B10.
 *
 * @param {Object} state
 * @param {string} userId
 * @param {string} date - YYYY-MM-DD; inclusive upper bound
 * @returns {Object | null}
 */
export function selectTodayWeightEntry(state, userId, date) {
  const entries = (state.weightHistory ?? [])
    .filter((e) => e.userId === userId && e.date <= date);

  if (entries.length === 0) return null;
  // Return the entry with the greatest date (most recent on/before date)
  return entries.reduce((latest, e) => (e.date > latest.date ? e : latest));
}

// ── selectTodayWorkoutLogs ────────────────────────────────────────────────────

/**
 * Return WorkoutLog[] for the user on the given date.
 * HT-CORE-010: filters by userId.
 * Debt: current workoutLogs records in slices lack userId field. Will be
 *   populated at B10.
 *
 * @param {Object} state
 * @param {string} userId
 * @param {string} date - YYYY-MM-DD
 * @returns {Array}
 */
export function selectTodayWorkoutLogs(state, userId, date) {
  return (state.workoutLogs ?? []).filter(
    (w) => w.userId === userId && w.date === date
  );
}

// ── selectTodayCannabisSessions ───────────────────────────────────────────────

/**
 * Return CannabisSession[] for the user on the given date, ordered by time.
 * Delegates to cannabis.selectCannabisSessionsByDate.
 * HT-CORE-010: inherited from delegate.
 *
 * @param {Object} state
 * @param {string} userId
 * @param {string} date - YYYY-MM-DD
 * @returns {Array}
 */
export function selectTodayCannabisSessions(state, userId, date) {
  return selectCannabisSessionsByDate(state, userId, date);
}

// ── selectTodayCalorieRing ────────────────────────────────────────────────────

/**
 * Return { eaten, target, remaining } calorie summary for the user on the given date.
 *
 * eaten:     sum of calories from eaten slots via consumedMacrosForSlot.
 * target:    profile.dailyCalorieTarget (default 2000 until B10).
 * remaining: max(0, target − eaten).
 *
 * HT-CORE-010: reads only userId's mealPlan (via selectWeeklyPlan).
 * Debt: profile.dailyCalorieTarget defaults to 2000 — B10 fix-up required.
 *
 * @param {Object} state
 * @param {string} userId
 * @param {string} date - YYYY-MM-DD
 * @returns {{ eaten: number, target: number, remaining: number }}
 */
export function selectTodayCalorieRing(state, userId, date) {
  const target = state.profile?.dailyCalorieTarget ?? 2000;
  const plan = selectWeeklyPlan(state, userId);
  const plateDefaults = state.profile?.plateDefaults ?? {};
  const mealInventory = state.mealInventory ?? [];

  let eaten = 0;

  if (plan?.days?.[date]) {
    const slots = Object.values(plan.days[date]);
    for (const slot of slots) {
      if (!slot?.eaten) continue;
      const mealItem = mealInventory.find((m) => m.id === slot.mealId) ?? null;
      const macros = consumedMacrosForSlot(slot, mealItem, plateDefaults);
      if (macros) {
        eaten += macros.calories;
      }
    }
  }

  return { eaten, target, remaining: Math.max(0, target - eaten) };
}
