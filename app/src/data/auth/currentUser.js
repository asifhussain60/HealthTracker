/**
 * The single user identifier for HealthTracker.
 *
 * Solo-user scope (locked 2026-05-04 per _workspace/plan/program-roadmap.md § 0.5):
 * the app has exactly one user. There is no auth lookup, no React Context,
 * no useCurrentUser hook. AuditFields' `userId`, `createdBy`, and `updatedBy`
 * are populated from this constant at write time.
 *
 * If the scope ever expands to multi-user, this is the seam to collapse:
 * replace with a useCurrentUser hook fed by AuthContext.
 */
export const CURRENT_USER_ID = 'me';
