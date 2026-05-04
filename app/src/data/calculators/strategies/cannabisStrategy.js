/**
 * cannabisStrategy.js — Delegates per-day cannabis planning to cannabisPlanner.planDay().
 *
 * Pure function. No store access, no Date.now().
 *
 * AC-P1D-D16
 */
import { planDay, taperCeiling } from '../cannabisPlanner.js';

/**
 * Compute taper day offset for a given date.
 *
 * @param {string} date           - ISO date (YYYY-MM-DD).
 * @param {string|null} startDate - Taper start date or null.
 * @returns {number} Days elapsed since taper start (min 0).
 */
function taperDayFor(date, startDate) {
  if (!startDate) return 0;
  const msPerDay = 86_400_000;
  const start = new Date(startDate).getTime();
  const current = new Date(date).getTime();
  return Math.max(0, Math.round((current - start) / msPerDay));
}

/**
 * Generate a 7-day cannabis plan.
 *
 * @param {Object} options
 * @param {string[]} options.dates         - ISO dates for the week.
 * @param {Object}  options.profile        - ProfileFields.
 * @param {Object[]} options.productLib    - CannabisProduct[] inventory.
 * @returns {{ [date: string]: CannabisPlanDay }}
 */
export function planCannabisWeek({ dates, profile, productLib }) {
  const taperStartDate = profile?.cannabisTaperSchedule?.startDate ?? null;
  const result = {};

  for (const date of dates) {
    const taperDay = taperDayFor(date, taperStartDate);
    result[date] = planDay({ date, taperDay, profile, productLib });
  }

  return result;
}

export { taperCeiling };
