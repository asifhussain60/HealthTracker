/**
 * LibraryRepo.test.js
 *
 * Parameterized contract test for the generic LibraryRepo factory.
 * Runs against TWO synthetic library shapes to prove the factory is truly generic.
 *
 * RED phase — ../LibraryRepo.js doesn't exist yet; test fails with module-not-found.
 *
 * AC-P1A-A1
 * HT-CORE-002 (TDD)
 * HT-CORE-008 (audit fields)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createLibraryRepo } from '../LibraryRepo.js';

// ── In-memory store fake ─────────────────────────────────────────────────────

/**
 * A minimal in-memory store fake that implements the same setState/getState
 * interface used by LibraryRepo so tests run without Zustand.
 */
function createMemoryStore(initial = {}) {
  let state = { ...initial };
  return {
    getState: () => state,
    setState: (patch) => {
      state = { ...state, ...patch };
    },
  };
}

// ── Synthetic shapes ─────────────────────────────────────────────────────────

/**
 * WidgetLibrary: sliceKey='widgets', items have: id, name, color, createdAt, etc.
 */
const widgetSchema = {
  name: 'WidgetLibrary',
  sliceKey: 'widgets',
  fields: [
    { key: 'name', label: 'Name', type: 'string' },
    { key: 'color', label: 'Color', type: 'string' },
  ],
  primaryKey: 'id',
};

/**
 * GadgetLibrary: sliceKey='gadgets', items have: id, name, voltage.
 */
const gadgetSchema = {
  name: 'GadgetLibrary',
  sliceKey: 'gadgets',
  fields: [
    { key: 'name', label: 'Name', type: 'string' },
    { key: 'voltage', label: 'Voltage', type: 'number' },
  ],
  primaryKey: 'id',
};

// ── Parameterized contract suite ─────────────────────────────────────────────

const cases = [
  { label: 'WidgetLibrary', schema: widgetSchema, sampleA: { name: 'Sprocket', color: 'red' }, sampleB: { name: 'Bolt', color: 'blue' } },
  { label: 'GadgetLibrary', schema: gadgetSchema, sampleA: { name: 'Toaster', voltage: 120 }, sampleB: { name: 'Blender', voltage: 240 } },
];

describe.each(cases)('LibraryRepo contract — $label', ({ schema, sampleA, sampleB }) => {
  let store;
  let repo;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-04T10:00:00.000Z'));
    store = createMemoryStore({ [schema.sliceKey]: [] });
    repo = createLibraryRepo({ schema, store });
  });

  // ── list ─────────────────────────────────────────────────────────────────

  describe('list()', () => {
    it('returns empty array on empty store', () => {
      expect(repo.list()).toEqual([]);
    });

    it('is not a Promise', () => {
      const result = repo.list();
      expect(result).not.toBeInstanceOf(Promise);
    });

    it('excludes soft-deleted records by default', () => {
      const added = repo.add(sampleA);
      repo.remove(added.id);
      expect(repo.list()).toHaveLength(0);
    });

    it('includes soft-deleted records when includeDeleted=true', () => {
      const added = repo.add(sampleA);
      repo.remove(added.id);
      expect(repo.list({ includeDeleted: true })).toHaveLength(1);
    });
  });

  // ── get ──────────────────────────────────────────────────────────────────

  describe('get(id)', () => {
    it('returns the record by id', () => {
      const added = repo.add(sampleA);
      expect(repo.get(added.id)).toBeDefined();
      expect(repo.get(added.id).id).toBe(added.id);
    });

    it('returns undefined for unknown id', () => {
      expect(repo.get('nonexistent')).toBeUndefined();
    });

    it('is not a Promise', () => {
      const result = repo.get('any');
      expect(typeof result?.then).toBe('undefined');
    });
  });

  // ── add ──────────────────────────────────────────────────────────────────

  describe('add(input)', () => {
    it('stamps audit fields: id, userId, createdAt, updatedAt, createdBy, updatedBy, deletedAt, schemaVersion', () => {
      const record = repo.add(sampleA);
      expect(record.id).toBeDefined();
      expect(typeof record.id).toBe('string');
      expect(record.userId).toBe('me');
      expect(record.createdAt).toBeDefined();
      expect(record.updatedAt).toBeDefined();
      expect(record.createdBy).toBe('me');
      expect(record.updatedBy).toBe('me');
      expect(record.deletedAt).toBeNull();
      expect(record.schemaVersion).toBe(3);
    });

    it('appends item to the store slice', () => {
      repo.add(sampleA);
      repo.add(sampleB);
      expect(repo.list()).toHaveLength(2);
    });

    it('preserves caller-supplied id (idempotent re-import)', () => {
      const record = repo.add({ ...sampleA, id: 'preset-id' });
      expect(record.id).toBe('preset-id');
    });

    it('is not a Promise', () => {
      const result = repo.add(sampleA);
      expect(result).not.toBeInstanceOf(Promise);
    });
  });

  // ── update ───────────────────────────────────────────────────────────────

  describe('update(id, patch)', () => {
    it('merges the patch and bumps updatedAt', () => {
      vi.setSystemTime(new Date('2026-05-04T10:00:00.000Z'));
      const record = repo.add(sampleA);
      const originalCreatedAt = record.createdAt;

      vi.setSystemTime(new Date('2026-05-04T11:00:00.000Z'));
      const updated = repo.update(record.id, { name: 'Updated Name' });

      expect(updated.name).toBe('Updated Name');
      expect(updated.updatedAt).toBe('2026-05-04T11:00:00.000Z');
      expect(updated.createdAt).toBe(originalCreatedAt);
    });

    it('preserves createdAt and createdBy', () => {
      const record = repo.add(sampleA);
      const updated = repo.update(record.id, { name: 'Changed' });
      expect(updated.createdAt).toBe(record.createdAt);
      expect(updated.createdBy).toBe(record.createdBy);
    });

    it('returns undefined for unknown id', () => {
      expect(repo.update('nope', { name: 'x' })).toBeUndefined();
    });

    it('is not a Promise', () => {
      const record = repo.add(sampleA);
      const result = repo.update(record.id, {});
      expect(result).not.toBeInstanceOf(Promise);
    });
  });

  // ── remove (soft-delete) ─────────────────────────────────────────────────

  describe('remove(id)', () => {
    it('sets deletedAt on the record', () => {
      const record = repo.add(sampleA);
      repo.remove(record.id);
      const deleted = repo.get(record.id);
      expect(deleted.deletedAt).not.toBeNull();
    });

    it('removes the record from list() by default', () => {
      const record = repo.add(sampleA);
      repo.remove(record.id);
      expect(repo.list().find((r) => r.id === record.id)).toBeUndefined();
    });

    it('returns the soft-deleted record', () => {
      const record = repo.add(sampleA);
      const result = repo.remove(record.id);
      expect(result.deletedAt).not.toBeNull();
    });

    it('returns undefined for unknown id', () => {
      expect(repo.remove('nope')).toBeUndefined();
    });

    it('is not a Promise', () => {
      const record = repo.add(sampleA);
      const result = repo.remove(record.id);
      expect(result).not.toBeInstanceOf(Promise);
    });
  });

  // ── restore ──────────────────────────────────────────────────────────────

  describe('restore(id)', () => {
    it('clears deletedAt on a soft-deleted record', () => {
      const record = repo.add(sampleA);
      repo.remove(record.id);
      const restored = repo.restore(record.id);
      expect(restored.deletedAt).toBeNull();
    });

    it('restored record appears in list() again', () => {
      const record = repo.add(sampleA);
      repo.remove(record.id);
      repo.restore(record.id);
      expect(repo.list()).toHaveLength(1);
    });

    it('returns undefined for unknown id', () => {
      expect(repo.restore('nope')).toBeUndefined();
    });
  });

  // ── search ───────────────────────────────────────────────────────────────

  describe('search(query)', () => {
    it('returns records matching case-insensitive substring on name', () => {
      repo.add(sampleA); // name contains first word
      repo.add(sampleB);
      // search for lowercase version of first character of sampleA.name
      const firstWord = sampleA.name.slice(0, 3).toLowerCase();
      const results = repo.search(firstWord);
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.some((r) => r.name === sampleA.name)).toBe(true);
    });

    it('returns empty array when no match', () => {
      repo.add(sampleA);
      expect(repo.search('xyzzy-no-match')).toEqual([]);
    });

    it('excludes soft-deleted records', () => {
      const record = repo.add(sampleA);
      repo.remove(record.id);
      const firstWord = sampleA.name.slice(0, 3).toLowerCase();
      expect(repo.search(firstWord)).toHaveLength(0);
    });

    it('is not a Promise', () => {
      const result = repo.search('test');
      expect(result).not.toBeInstanceOf(Promise);
    });
  });

  // ── filter ───────────────────────────────────────────────────────────────

  describe('filter(predicate)', () => {
    it('applies the predicate to active records', () => {
      repo.add(sampleA);
      repo.add(sampleB);
      const results = repo.filter((r) => r.name === sampleA.name);
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe(sampleA.name);
    });

    it('returns empty array when predicate matches nothing', () => {
      repo.add(sampleA);
      expect(repo.filter(() => false)).toEqual([]);
    });

    it('excludes soft-deleted records by default', () => {
      const record = repo.add(sampleA);
      repo.remove(record.id);
      expect(repo.filter(() => true)).toHaveLength(0);
    });

    it('is not a Promise', () => {
      const result = repo.filter(() => true);
      expect(result).not.toBeInstanceOf(Promise);
    });
  });

  // ── sort ─────────────────────────────────────────────────────────────────

  describe('sort(comparator?)', () => {
    it('default sort is by createdAt descending', () => {
      vi.setSystemTime(new Date('2026-05-04T09:00:00.000Z'));
      const first = repo.add(sampleA);
      vi.setSystemTime(new Date('2026-05-04T10:00:00.000Z'));
      const second = repo.add(sampleB);

      const sorted = repo.sort();
      expect(sorted[0].id).toBe(second.id); // most recent first
      expect(sorted[1].id).toBe(first.id);
    });

    it('accepts a custom comparator', () => {
      repo.add(sampleA);
      repo.add(sampleB);
      const sorted = repo.sort((a, b) => a.name.localeCompare(b.name));
      // Names are sorted ascending
      expect(sorted[0].name <= sorted[1].name).toBe(true);
    });

    it('excludes soft-deleted records', () => {
      const record = repo.add(sampleA);
      repo.remove(record.id);
      expect(repo.sort()).toHaveLength(0);
    });

    it('is not a Promise', () => {
      const result = repo.sort();
      expect(result).not.toBeInstanceOf(Promise);
    });
  });
});
