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
 * profile.dailyCalorieTarget defaults to 2000 when not set.
 * weightHistory records without userId are excluded by the userId filter.
 */

import { consumedMacrosForSlot } from '../calculators/macroMath.js';
import { selectCannabisSessionsByDate } from './cannabis.js';
import { selectWeeklyPlan } from './meals.js';

// ── selectTodayWeightEntry ────────────────────────────────────────────────────

/**
 * Return the most recent WeightEntry for the user on or before the given date.
 * HT-CORE-010: filters by userId.
 * Requires records to have userId; seed records without userId are excluded.
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
 * Records without userId are excluded (records must have userId field).
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
 * profile.dailyCalorieTarget defaults to 2000 when not set.
 *
 * @param {Object} state
 * @param {string} userId
 * @param {string} date - YYYY-MM-DD
 * @returns {{ eaten: number, target: number, remaining: number }}
 */
// ── selectWeightDeltaWeek ─────────────────────────────────────────────────────

/**
 * Return the weight change (lb) between the most recent entry on/before `today`
 * and the most recent entry on/before `today - 7 days`.
 * Returns 0 when there is insufficient data for comparison.
 *
 * HT-CORE-010: filters by userId.
 * No Date.now() / new Date() — uses the injected `today` string.
 *
 * @param {Object} state
 * @param {string} userId
 * @param {string} today - YYYY-MM-DD
 * @returns {number} delta in lb (negative = lost weight)
 */
export function selectWeightDeltaWeek(state, userId, today) {
  const entries = (state.weightHistory ?? []).filter(
    (e) => e.userId === userId && e.deletedAt == null
  );
  if (entries.length === 0) return 0;

  // Most recent on/before today
  const onOrBefore = (cutoff) =>
    entries
      .filter((e) => e.date <= cutoff)
      .reduce((best, e) => (!best || e.date > best.date ? e : best), null);

  // One week ago date string arithmetic — avoid Date construction
  const todayParts = today.split('-').map(Number); // [year, month, day]
  const d = new Date(todayParts[0], todayParts[1] - 1, todayParts[2]);
  d.setDate(d.getDate() - 7);
  const weekAgo = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const current = onOrBefore(today);
  const previous = onOrBefore(weekAgo);

  if (!current || !previous) return 0;
  return current.weight - previous.weight;
}

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
