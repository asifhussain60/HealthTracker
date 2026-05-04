/**
 * fasting.js — Fasting selectors.
 *
 * All selectors accept (state, userId, ...) and filter by userId.
 * HT-CORE-010: selectors filter by currentUser.id (passed as userId parameter).
 * No Date.now() / new Date() — callers inject `now` as ISO 8601 string.
 *
 * Composes fastingMath calculators. Meal slot data is read from mealPlan.
 * Open debt (P1.D D15): mealPlan + mealInventory keys are not yet renamed from
 *   the legacy mealTemplates shape; selectors default-guard so the app does not
 *   crash in the meantime. See observed-debt.md, deadline P1.D D15.
 */

import { currentState, windowAdherence } from '../calculators/fastingMath.js';
import { selectWeeklyPlan } from './meals.js';

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Collect ISO timestamps of eaten slots across a week (7 days from weekStartDate).
 * Only includes slots from a mealPlan belonging to userId.
 * HT-CORE-010: userId filter via selectWeeklyPlan.
 *
 * @param {Object} state
 * @param {string} userId
 * @param {string} weekStartDate - YYYY-MM-DD
 * @returns {string[]} Array of ISO 8601 eatenAt timestamps
 */
function collectWeekEatenAtTimestamps(state, userId, weekStartDate) {
  const plan = selectWeeklyPlan(state, userId);
  if (!plan?.days) return [];

  const timestamps = [];
  const startDate = new Date(weekStartDate);

  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateKey = d.toISOString().slice(0, 10);
    const day = plan.days[dateKey];
    if (!day) continue;
    for (const slot of Object.values(day)) {
      if (slot?.eaten && slot?.eatenAt) {
        timestamps.push(slot.eatenAt);
      }
    }
  }

  return timestamps;
}

/**
 * Find the latest eatenAt timestamp from the user's plan on a given date.
 *
 * @param {Object} state
 * @param {string} userId
 * @param {string} date - YYYY-MM-DD
 * @returns {string | null}
 */
function getLastEatenAt(state, userId, date) {
  const plan = selectWeeklyPlan(state, userId);
  if (!plan?.days?.[date]) return null;

  const slots = Object.values(plan.days[date]);
  const eatenTimestamps = slots
    .filter((s) => s?.eaten && s?.eatenAt)
    .map((s) => s.eatenAt);

  if (eatenTimestamps.length === 0) return null;
  // Return the latest timestamp
  return eatenTimestamps.reduce((latest, ts) => (ts > latest ? ts : latest));
}

// ── selectFastingState ────────────────────────────────────────────────────────

/**
 * Determine the current fasting state for the user.
 * Delegates to fastingMath.currentState.
 * HT-CORE-010: reads lastEatenAt from userId's mealPlan only.
 *
 * @param {Object} state
 * @param {string} userId
 * @param {string} now - ISO 8601 timestamp (injected by caller)
 * @returns {{ state: 'open' | 'opens-in' | 'closed-since', minutesUntilOpen?: number, minutesSinceClose?: number }}
 */
export function selectFastingState(state, userId, now) {
  const protocol = state.profile?.fastingProtocol ?? null;
  const date = now.slice(0, 10); // Extract YYYY-MM-DD portion
  const lastEatenAt = getLastEatenAt(state, userId, date);
  return currentState(now, protocol, lastEatenAt);
}

// ── selectWindowAdherence ─────────────────────────────────────────────────────

/**
 * Compute the fraction of eaten meal slots within the eating window for a week.
 * Delegates to fastingMath.windowAdherence.
 * HT-CORE-010: reads only userId's mealPlan slots.
 *
 * @param {Object} state
 * @param {string} userId
 * @param {string} weekStartDate - YYYY-MM-DD; first day of the 7-day window
 * @returns {number} Adherence fraction in [0, 1]
 */
export function selectWindowAdherence(state, userId, weekStartDate) {
  const protocol = state.profile?.fastingProtocol ?? null;
  const timestamps = collectWeekEatenAtTimestamps(state, userId, weekStartDate);
  return windowAdherence(timestamps, protocol);
}
