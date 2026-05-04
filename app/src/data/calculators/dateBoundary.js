/**
 * dateBoundary.js — Pure date-boundary helpers
 * AC-P1C-C4
 *
 * All functions accept an explicit `today` parameter — no Date.now() inside.
 * Boundary rule: [startOfWeek(today) - 7 days, endOfWeek(today)]
 *   where startOfWeek = Sunday, endOfWeek = Saturday.
 */

/**
 * Returns the Sunday that starts the week containing `date`.
 * @param {Date} date
 * @returns {Date} Sunday at 00:00:00.000 local time
 */
export function startOfWeekSunday(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun … 6=Sat
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns the Saturday that ends the week containing `date`.
 * @param {Date} date
 * @returns {Date} Saturday at 23:59:59.999 local time (floored to 00:00:00)
 */
export function endOfWeekSaturday(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun … 6=Sat
  d.setDate(d.getDate() + (6 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns the allowed date range: [thisSunday - 7 days, thisSaturday].
 * @param {Date} today
 * @returns {{ start: Date, end: Date }}
 */
export function weekRange(today) {
  const thisSunday = startOfWeekSunday(today);
  const start = new Date(thisSunday);
  start.setDate(start.getDate() - 7);

  const end = endOfWeekSaturday(today);

  return { start, end };
}

/**
 * Returns true if `date` is within the boundary [start, end] inclusive.
 * @param {Date} date
 * @param {Date} today
 * @returns {boolean}
 */
export function isWithinBoundary(date, today) {
  const { start, end } = weekRange(today);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const s = new Date(start);
  s.setHours(0, 0, 0, 0);
  const e = new Date(end);
  e.setHours(0, 0, 0, 0);
  return d >= s && d <= e;
}

/**
 * Clamps `date` to the boundary [start, end].
 * @param {Date} date
 * @param {Date} today
 * @returns {Date}
 */
export function clampToBoundary(date, today) {
  const { start, end } = weekRange(today);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const s = new Date(start);
  s.setHours(0, 0, 0, 0);
  const e = new Date(end);
  e.setHours(0, 0, 0, 0);
  if (d < s) return s;
  if (d > e) return e;
  return d;
}
