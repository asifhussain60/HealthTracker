/**
 * auditFields.js
 *
 * Shared audit-field stamping helpers for all repository hooks.
 *
 * Three helpers, one SSOT — centralised per the ≥3-owners rule from
 * the post-B6 challenger review:  stampNewRecord / stampUpdate / stampSoftDelete
 * would otherwise duplicate identical timestamp logic across five repos.
 *
 * All helpers are synchronous (architecture rule 5 — solo-user scope).
 * No Promises, no async/await.
 */

import { CURRENT_USER_ID } from '../../auth/currentUser';

/**
 * Stamps a new record with full audit fields.
 * Caller-supplied values for id, userId, createdAt are preserved (idempotent on re-import).
 *
 * @param {Object} input - The input object (fields from the caller).
 * @returns {Object} - The record with audit fields applied.
 */
export function stampNewRecord(input) {
  const now = new Date().toISOString();
  return {
    ...input,
    id: input.id ?? crypto.randomUUID(),
    userId: input.userId ?? CURRENT_USER_ID,
    createdAt: input.createdAt ?? now,
    updatedAt: now,
    createdBy: input.createdBy ?? CURRENT_USER_ID,
    updatedBy: CURRENT_USER_ID,
    deletedAt: input.deletedAt ?? null,
    schemaVersion: input.schemaVersion ?? 3,
  };
}

/**
 * Merges a patch onto an existing record and bumps updatedAt + updatedBy.
 * Preserves createdAt, createdBy, id, userId.
 *
 * @param {Object} existing - The current record state.
 * @param {Object} patch - Fields to merge in.
 * @returns {Object} - The updated record.
 */
export function stampUpdate(existing, patch) {
  return {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
    updatedBy: CURRENT_USER_ID,
  };
}

/**
 * Marks a record as soft-deleted by setting deletedAt and bumping updatedAt + updatedBy.
 * The record is NOT removed from the array; callers filter by deletedAt === null.
 *
 * @param {Object} existing - The current record state.
 * @returns {Object} - The record with deletedAt set.
 */
export function stampSoftDelete(existing) {
  const now = new Date().toISOString();
  return {
    ...existing,
    deletedAt: now,
    updatedAt: now,
    updatedBy: CURRENT_USER_ID,
  };
}
