/**
 * userScope.js — Shared user-scope filter utility.
 *
 * SSOT for the `filterByUser` helper that was previously duplicated
 * in cannabis.js, meals.js, and todos.js. Centralising here resolves
 * the ≥3-owners duplication flagged by the post-B6 challenger review.
 *
 * HT-CORE-003: Single Source of Truth — no duplicate authority.
 * HT-CORE-010: Selectors filter by currentUser.id (even under solo-user scope).
 *
 * Contract:
 *   - Returns a NEW array (does not mutate input).
 *   - A record is "active" iff userId === the supplied userId AND deletedAt === null.
 *   - Records with deletedAt undefined do NOT pass (enforces HT-CORE-008 audit-field
 *     discipline — every record must have deletedAt explicitly set to null).
 *
 * AC-P1A-A3
 */

/**
 * Filter records by userId and exclude soft-deleted entries.
 *
 * @param {Array|null|undefined} records - Array of records to filter.
 * @param {string} userId - The user identifier to filter by.
 * @returns {Array} A new array of active records belonging to userId.
 */
export function filterByUser(records, userId) {
  return (records ?? []).filter(
    (r) => r.userId === userId && r.deletedAt === null
  );
}
