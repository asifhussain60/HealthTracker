/**
 * cannabis.js — Cannabis selectors.
 *
 * All selectors accept (state, userId, ...) and filter by userId.
 * HT-CORE-010: selectors filter by currentUser.id (passed as userId parameter).
 * HT-CORE-008: no Date.now() / new Date() — callers inject date/now.
 *
 * Memoization: single-input memo with reference-equality check (no reselect dependency).
 * Callers pass CURRENT_USER_ID as userId (solo-user scope).
 */

import { dailyThcTotal, thcCeilingStatus } from '../calculators/thcMath.js';

// ── Memo helper ───────────────────────────────────────────────────────────────

/**
 * Create a simple single-slot memoizer.
 * Returns the cached result when (stateRef, ...args) are reference-equal to the
 * last call. Otherwise recomputes and caches.
 *
 * @param {Function} fn - (state, ...args) → result
 * @returns {Function}
 */
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

// ── Shared filter helper ──────────────────────────────────────────────────────

/**
 * Filter records by userId and exclude soft-deleted entries.
 *
 * @param {Array} records
 * @param {string} userId
 * @returns {Array}
 */
function filterByUser(records, userId) {
  return (records ?? []).filter(
    (r) => r.userId === userId && r.deletedAt === null
  );
}

// ── selectCannabisProducts ────────────────────────────────────────────────────

/**
 * Return active (non-deleted) CannabisProduct[] for the given user.
 * HT-CORE-010: filters by userId.
 *
 * @param {Object} state
 * @param {string} userId
 * @returns {Array}
 */
export const selectCannabisProducts = makeMemo((state, userId) =>
  filterByUser(state.inventory, userId)
);

// ── selectCannabisDevices ─────────────────────────────────────────────────────

/**
 * Return active CannabisDevice[] for the given user.
 * HT-CORE-010: filters by userId.
 * Gracefully returns [] if cannabisDevices slice key is absent.
 *
 * @param {Object} state
 * @param {string} userId
 * @returns {Array}
 */
export const selectCannabisDevices = makeMemo((state, userId) =>
  filterByUser(state.cannabisDevices ?? [], userId)
);

// ── selectCannabisSessionsByDate ──────────────────────────────────────────────

/**
 * Return CannabisSession[] for the given user on the given date, ordered by time.
 * HT-CORE-010: filters by userId.
 *
 * @param {Object} state
 * @param {string} userId
 * @param {string} date - YYYY-MM-DD
 * @returns {Array}
 */
export const selectCannabisSessionsByDate = makeMemo((state, userId, date) => {
  const sessions = filterByUser(state.cannabisLogs, userId).filter(
    (s) => s.date === date
  );
  return sessions.slice().sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''));
});

// ── selectDailyThcMg ──────────────────────────────────────────────────────────

/**
 * Return total absorbed THC (mg) for the given user on the given date.
 * Delegates to thcMath.dailyThcTotal.
 * HT-CORE-010: uses userId-filtered sessions.
 *
 * @param {Object} state
 * @param {string} userId
 * @param {string} date - YYYY-MM-DD
 * @returns {number}
 */
export function selectDailyThcMg(state, userId, date) {
  const sessions = filterByUser(state.cannabisLogs, userId);
  return dailyThcTotal(sessions, date);
}

// ── selectThcCeilingStatus ────────────────────────────────────────────────────

/**
 * Return 'under' | 'near' | 'over' relative to the daily THC ceiling.
 * Delegates to thcMath.thcCeilingStatus.
 * HT-CORE-010: uses userId-filtered sessions.
 *
 * Defaults: dailyThcMgCeiling = 50 when not set in profile.
 *
 * @param {Object} state
 * @param {string} userId
 * @param {string} date - YYYY-MM-DD
 * @returns {'under' | 'near' | 'over'}
 */
export function selectThcCeilingStatus(state, userId, date) {
  const dailyMg = selectDailyThcMg(state, userId, date);
  const ceiling = state.profile?.cannabisTargets?.dailyThcMgCeiling ?? 50;
  return thcCeilingStatus(dailyMg, ceiling);
}

// ── selectFavoriteProducts ────────────────────────────────────────────────────

/**
 * Return CannabisProduct[] with favoriteStars > 0 for the given user,
 * ordered by favoriteStars descending.
 * HT-CORE-010: filters by userId.
 *
 * @param {Object} state
 * @param {string} userId
 * @returns {Array}
 */
export const selectFavoriteProducts = makeMemo((state, userId) => {
  const products = filterByUser(state.inventory, userId).filter(
    (p) => (p.favoriteStars ?? 0) > 0
  );
  return products.slice().sort((a, b) => (b.favoriteStars ?? 0) - (a.favoriteStars ?? 0));
});
