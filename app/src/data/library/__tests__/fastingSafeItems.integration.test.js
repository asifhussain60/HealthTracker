/**
 * fastingSafeItems.integration.test.js
 *
 * Full round-trip integration test for the fastingSafeItems library.
 * Proves the generic LibraryRepo layer end-to-end with a real library shape.
 *
 * RED phase — ../schemas/fastingSafeItems.js doesn't exist; test fails.
 *
 * AC-P1A-A6
 * HT-CORE-002 (TDD)
 * HT-CORE-008 (audit fields)
 * HT-CORE-010 (user-scoped)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createLibraryRepo } from '../LibraryRepo.js';
import { fastingSafeItemsSchema } from '../schemas/fastingSafeItems.js';
import { exportLibrary, importLibrary } from '../importExport.js';
import { runMigrations } from '../../migrations/index.js';

// ── In-memory store factory ───────────────────────────────────────────────────

function createMemoryStore(initial = {}) {
  let state = { ...initial };
  return {
    getState: () => state,
    setState: (patch) => { state = { ...state, ...patch }; },
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('fastingSafeItems integration — LibraryRepo round-trip', () => {
  let store;
  let repo;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-04T10:00:00.000Z'));
    store = createMemoryStore({ fastingSafeItems: [] });
    repo = createLibraryRepo({ schema: fastingSafeItemsSchema, store });
  });

  // ── Schema ────────────────────────────────────────────────────────────────

  describe('schema descriptor', () => {
    it('has name "fastingSafeItems"', () => {
      expect(fastingSafeItemsSchema.name).toBe('fastingSafeItems');
    });

    it('has sliceKey "fastingSafeItems"', () => {
      expect(fastingSafeItemsSchema.sliceKey).toBe('fastingSafeItems');
    });

    it('is frozen (immutable descriptor)', () => {
      expect(Object.isFrozen(fastingSafeItemsSchema)).toBe(true);
    });

    it('has at least a name field', () => {
      const nameField = fastingSafeItemsSchema.fields.find((f) => f.key === 'name');
      expect(nameField).toBeDefined();
      expect(nameField.type).toBe('string');
    });
  });

  // ── Add ───────────────────────────────────────────────────────────────────

  describe('add() — round-trip', () => {
    it('adds an item and it appears in list()', () => {
      repo.add({ name: 'Lemon Water', defaultDailyTarget: 4 });
      expect(repo.list()).toHaveLength(1);
    });

    it('added item has all audit fields (HT-CORE-008)', () => {
      const item = repo.add({ name: 'Herbal Tea' });
      expect(item.id).toBeDefined();
      expect(item.userId).toBe('me');
      expect(item.createdAt).toBeDefined();
      expect(item.updatedAt).toBeDefined();
      expect(item.createdBy).toBe('me');
      expect(item.updatedBy).toBe('me');
      expect(item.deletedAt).toBeNull();
      expect(item.schemaVersion).toBe(3);
    });

    it('added item is retrievable by get(id)', () => {
      const item = repo.add({ name: 'Water', defaultDailyTarget: 8 });
      const found = repo.get(item.id);
      expect(found).toBeDefined();
      expect(found.name).toBe('Water');
    });
  });

  // ── Search ────────────────────────────────────────────────────────────────

  describe('search() — case-insensitive substring on name', () => {
    beforeEach(() => {
      repo.add({ name: 'Water', defaultDailyTarget: 8 });
      repo.add({ name: 'Green Tea' });
      repo.add({ name: 'Black Coffee' });
      repo.add({ name: 'Electrolytes' });
    });

    it('finds "water" case-insensitively', () => {
      const results = repo.search('water');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Water');
    });

    it('finds "tea" case-insensitively', () => {
      const results = repo.search('tea');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Green Tea');
    });

    it('finds "E" matches multiple', () => {
      // "Water", "Green Tea", "Coffee", "Electrolytes" all contain "e"
      const results = repo.search('e');
      expect(results.length).toBeGreaterThan(1);
    });

    it('returns empty array for no-match query', () => {
      expect(repo.search('soda')).toHaveLength(0);
    });
  });

  // ── Soft-delete ───────────────────────────────────────────────────────────

  describe('remove() — soft-delete', () => {
    it('soft-deleted item does not appear in list()', () => {
      const item = repo.add({ name: 'Black Coffee' });
      repo.remove(item.id);
      expect(repo.list()).toHaveLength(0);
    });

    it('soft-deleted item appears in list({ includeDeleted: true })', () => {
      const item = repo.add({ name: 'Black Coffee' });
      repo.remove(item.id);
      const all = repo.list({ includeDeleted: true });
      expect(all).toHaveLength(1);
      expect(all[0].deletedAt).not.toBeNull();
    });

    it('get(id) still finds a soft-deleted item', () => {
      const item = repo.add({ name: 'Electrolytes' });
      repo.remove(item.id);
      const found = repo.get(item.id);
      expect(found).toBeDefined();
      expect(found.deletedAt).not.toBeNull();
    });
  });

  // ── Restore ───────────────────────────────────────────────────────────────

  describe('restore() — clear deletedAt', () => {
    it('restored item appears in list() again', () => {
      const item = repo.add({ name: 'Green Tea' });
      repo.remove(item.id);
      repo.restore(item.id);
      expect(repo.list()).toHaveLength(1);
    });
  });

  // ── Import/export round-trip ──────────────────────────────────────────────

  describe('importExport integration', () => {
    it('export → import round-trip preserves items', () => {
      repo.add({ id: 'water', name: 'Water', defaultDailyTarget: 8 });
      repo.add({ id: 'green-tea', name: 'Green Tea' });
      repo.add({ id: 'black-coffee', name: 'Black Coffee' });
      repo.add({ id: 'electrolytes', name: 'Electrolytes' });

      const json = exportLibrary({
        items: repo.list({ includeDeleted: true }),
        schema: fastingSafeItemsSchema,
      });

      const store2 = createMemoryStore({ fastingSafeItems: [] });
      const repo2 = createLibraryRepo({ schema: fastingSafeItemsSchema, store: store2 });
      const result = importLibrary({ jsonOrCsv: json, schema: fastingSafeItemsSchema, repo: repo2 });

      expect(result.added).toBe(4);
      expect(result.skipped).toBe(0);
      expect(repo2.list()).toHaveLength(4);
    });

    it('re-import is idempotent (added:0, skipped:4)', () => {
      repo.add({ id: 'water', name: 'Water' });
      repo.add({ id: 'green-tea', name: 'Green Tea' });
      repo.add({ id: 'black-coffee', name: 'Black Coffee' });
      repo.add({ id: 'electrolytes', name: 'Electrolytes' });

      const json = exportLibrary({
        items: repo.list({ includeDeleted: true }),
        schema: fastingSafeItemsSchema,
      });

      const store2 = createMemoryStore({ fastingSafeItems: [] });
      const repo2 = createLibraryRepo({ schema: fastingSafeItemsSchema, store: store2 });
      importLibrary({ jsonOrCsv: json, schema: fastingSafeItemsSchema, repo: repo2 });
      const second = importLibrary({ jsonOrCsv: json, schema: fastingSafeItemsSchema, repo: repo2 });

      expect(second.added).toBe(0);
      expect(second.skipped).toBe(4);
    });
  });

  // ── Migration seed ────────────────────────────────────────────────────────

  describe('migration seed — fastingSafeItems in profile', () => {
    it('runMigrations({}) populates profile.fastingSafeItems with 4 default items', () => {
      const state = runMigrations({});
      const items = state.profile?.fastingSafeItems ?? [];
      expect(items).toHaveLength(4);
    });

    it('migration seed includes "Water" item', () => {
      const state = runMigrations({});
      const items = state.profile?.fastingSafeItems ?? [];
      const water = items.find((i) => i.name === 'Water');
      expect(water).toBeDefined();
    });

    it('migration seed includes "Green Tea" item', () => {
      const state = runMigrations({});
      const items = state.profile?.fastingSafeItems ?? [];
      expect(items.find((i) => i.name === 'Green Tea')).toBeDefined();
    });

    it('migration seed includes "Black Coffee" item', () => {
      const state = runMigrations({});
      const items = state.profile?.fastingSafeItems ?? [];
      expect(items.find((i) => i.name === 'Black Coffee')).toBeDefined();
    });

    it('migration seed includes "Electrolytes" item', () => {
      const state = runMigrations({});
      const items = state.profile?.fastingSafeItems ?? [];
      expect(items.find((i) => i.name === 'Electrolytes')).toBeDefined();
    });
  });
});
