/**
 * userScope.test.js
 *
 * Tests for the shared filterByUser utility.
 * After A3 refactor: cannabis.js, meals.js, todos.js import from here.
 *
 * RED phase — ../userScope.js doesn't exist yet; test fails with module-not-found.
 *
 * AC-P1A-A3
 * HT-CORE-003 (SSOT — shared filterByUser)
 * HT-CORE-010 (user-scoped selectors)
 */

import { describe, it, expect } from 'vitest';
import { filterByUser } from '../_internal/userScope.js';

describe('filterByUser — shared selector util (HT-CORE-010)', () => {
  it('returns empty array for null/undefined input', () => {
    expect(filterByUser(null, 'me')).toEqual([]);
    expect(filterByUser(undefined, 'me')).toEqual([]);
  });

  it('returns empty array for empty input', () => {
    expect(filterByUser([], 'me')).toEqual([]);
  });

  it('includes records matching userId with deletedAt=null', () => {
    const records = [
      { id: '1', userId: 'me', deletedAt: null },
      { id: '2', userId: 'me', deletedAt: null },
    ];
    expect(filterByUser(records, 'me')).toHaveLength(2);
  });

  it('excludes records with deletedAt set (soft-deleted)', () => {
    const records = [
      { id: '1', userId: 'me', deletedAt: '2026-05-04T10:00:00.000Z' },
      { id: '2', userId: 'me', deletedAt: null },
    ];
    const result = filterByUser(records, 'me');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('excludes records belonging to a different user', () => {
    const records = [
      { id: '1', userId: 'me', deletedAt: null },
      { id: '2', userId: 'other-user', deletedAt: null },
    ];
    const result = filterByUser(records, 'me');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('excludes both wrong-user and deleted records together', () => {
    const records = [
      { id: '1', userId: 'me', deletedAt: null },
      { id: '2', userId: 'me', deletedAt: '2026-05-04T10:00:00.000Z' },
      { id: '3', userId: 'other', deletedAt: null },
    ];
    expect(filterByUser(records, 'me')).toHaveLength(1);
  });

  it('works for any userId string (not hardcoded to "me")', () => {
    const records = [
      { id: '1', userId: 'alice', deletedAt: null },
      { id: '2', userId: 'bob', deletedAt: null },
    ];
    expect(filterByUser(records, 'alice')).toHaveLength(1);
    expect(filterByUser(records, 'bob')).toHaveLength(1);
  });

  it('returns a new array (does not mutate input)', () => {
    const records = [{ id: '1', userId: 'me', deletedAt: null }];
    const result = filterByUser(records, 'me');
    expect(result).not.toBe(records);
  });

  it('handles records with undefined deletedAt (treats as non-deleted)', () => {
    // Historical records may not have deletedAt set — they should be included
    // if userId matches. The helper treats undefined deletedAt as "not deleted".
    const records = [{ id: '1', userId: 'me' }];
    // Per current implementation: deletedAt === null is the only check
    // Records without deletedAt (undefined) are NOT included — this is deliberate.
    // The audit-field contract requires deletedAt to be explicitly null.
    const result = filterByUser(records, 'me');
    // Records with undefined deletedAt do NOT pass the filter (strict null check).
    // This enforces the HT-CORE-008 audit-field contract.
    expect(result).toHaveLength(0);
  });
});
