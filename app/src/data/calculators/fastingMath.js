/**
 * fastingMath.js — Pure fasting-window calculation functions.
 *
 * No imports from store, views, or React.
 * No Date.now() / new Date() — callers inject `now` as an ISO 8601 string.
 *
 * Fasting protocol shape (from data-model.md § profileSlice.profile.fastingProtocol):
 *   { enabled: boolean, windowStart: 'HH:mm', windowEnd: 'HH:mm', timezone: string }
 *
 * All HH:mm comparisons are done by extracting the time portion of the ISO string
 * and comparing to windowStart / windowEnd. This is intentionally timezone-naive
 * for local-date comparisons consistent with the app's date strategy (store local
 * date for daily logs — see data-model.md § Date strategy).
 *
 * State machine (FASTING banner, per phase-1-master-plan § 1 Food panel):
 *   'open'         — now is inside the eating window [windowStart, windowEnd)
 *   'opens-in'     — eating window has not yet opened today
 *   'closed-since' — eating window has already closed for today
 */

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Extract the HH:mm portion of an ISO timestamp string.
 * Works for both '2026-05-04T14:30:00' and '14:30:00' strings.
 *
 * @param {string} isoOrTime
 * @returns {string} 'HH:mm'
 */
function extractHHMM(isoOrTime) {
  // Handles 'YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DDTHH:mm', 'HH:mm:ss', 'HH:mm'
  const match = isoOrTime.match(/T?(\d{2}:\d{2})/);
  return match ? match[1] : '00:00';
}

/**
 * Convert 'HH:mm' to total minutes since midnight.
 *
 * @param {string} hhmm
 * @returns {number}
 */
function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Parse an ISO string to a Date object for arithmetic.
 *
 * @param {string} isoString
 * @returns {Date}
 */
function parseISO(isoString) {
  return new Date(isoString);
}

// ── currentState ──────────────────────────────────────────────────────────────

/**
 * Determine the current fasting state relative to the protocol window.
 *
 * @param {string} now - ISO 8601 timestamp (injected by caller; not Date.now())
 * @param {{ enabled: boolean, windowStart: string, windowEnd: string }} profileFastingProtocol
 * @param {string | null} _lastEatenAt - Unused in state machine; accepted for API completeness
 * @returns {{
 *   state: 'open' | 'opens-in' | 'closed-since',
 *   minutesUntilOpen?: number,
 *   minutesSinceClose?: number
 * }}
 */
export function currentState(now, profileFastingProtocol, _lastEatenAt) {
  // Disabled protocol: always open
  if (!profileFastingProtocol?.enabled) {
    return { state: 'open' };
  }

  const nowHHMM = extractHHMM(now);
  const nowMin = toMinutes(nowHHMM);
  const startMin = toMinutes(profileFastingProtocol.windowStart);
  const endMin = toMinutes(profileFastingProtocol.windowEnd);

  if (nowMin < startMin) {
    return {
      state: 'opens-in',
      minutesUntilOpen: startMin - nowMin,
    };
  }

  if (nowMin >= startMin && nowMin < endMin) {
    return { state: 'open' };
  }

  // nowMin >= endMin → closed-since
  return {
    state: 'closed-since',
    minutesSinceClose: nowMin - endMin,
  };
}

// ── hoursSinceMeal ────────────────────────────────────────────────────────────

/**
 * Compute the number of hours elapsed since the last meal.
 * Returns Infinity when lastEatenAt is null/undefined (never eaten).
 *
 * @param {string} now        - ISO 8601 timestamp
 * @param {string | null | undefined} lastEatenAt - ISO 8601 timestamp of last meal
 * @returns {number} Hours (may be fractional); Infinity if lastEatenAt is absent
 */
export function hoursSinceMeal(now, lastEatenAt) {
  if (lastEatenAt == null) return Infinity;

  const nowMs = parseISO(now).getTime();
  const lastMs = parseISO(lastEatenAt).getTime();
  const diffMs = nowMs - lastMs;
  return diffMs / (1000 * 60 * 60);
}

// ── timeUntilFastBreak ────────────────────────────────────────────────────────

/**
 * Minutes until the eating window opens.
 * Returns 0 if the window is currently open OR already closed for today.
 * Returns 0 when protocol is disabled (no restriction).
 *
 * @param {string} now - ISO 8601 timestamp
 * @param {{ enabled: boolean, windowStart: string, windowEnd: string }} profileFastingProtocol
 * @returns {number} Minutes (integer, ≥ 0)
 */
export function timeUntilFastBreak(now, profileFastingProtocol) {
  if (!profileFastingProtocol?.enabled) return 0;

  const state = currentState(now, profileFastingProtocol, null);

  if (state.state === 'opens-in') {
    return state.minutesUntilOpen;
  }

  // open or closed-since → no wait remaining
  return 0;
}

// ── windowAdherence ───────────────────────────────────────────────────────────

/**
 * Compute the fraction of meal timestamps that fall inside the eating window.
 *
 * Window is [windowStart, windowEnd) — start inclusive, end exclusive.
 * Returns 1.0 for empty arrays (vacuously adherent).
 * Returns 1.0 when protocol is disabled (all meals are "in window").
 *
 * @param {string[]} eatenAtTimestamps - Array of ISO 8601 timestamps
 * @param {{ enabled: boolean, windowStart: string, windowEnd: string }} profileFastingProtocol
 * @returns {number} Adherence fraction in [0, 1]
 */
export function windowAdherence(eatenAtTimestamps, profileFastingProtocol) {
  if (!eatenAtTimestamps || eatenAtTimestamps.length === 0) return 1.0;
  if (!profileFastingProtocol?.enabled) return 1.0;

  const startMin = toMinutes(profileFastingProtocol.windowStart);
  const endMin = toMinutes(profileFastingProtocol.windowEnd);

  const insideCount = eatenAtTimestamps.filter((ts) => {
    const min = toMinutes(extractHHMM(ts));
    return min >= startMin && min < endMin;
  }).length;

  return insideCount / eatenAtTimestamps.length;
}
