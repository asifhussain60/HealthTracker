/**
 * importExport.test.js
 *
 * Tests for the shared import/export envelope used by every library.
 *
 * RED phase — ../importExport.js doesn't exist yet; test fails with module-not-found.
 *
 * AC-P1A-A5
 * HT-CORE-002 (TDD)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { exportLibrary, importLibrary } from '../importExport.js';
import { createLibraryRepo } from '../LibraryRepo.js';
import { defineLibrarySchema } from '../LibrarySchema.js';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const widgetSchema = defineLibrarySchema({
  name: 'WidgetLibrary',
  sliceKey: 'widgets',
  fields: [
    { key: 'name', label: 'Name', type: 'string' },
    { key: 'color', label: 'Color', type: 'string' },
  ],
});

function createMemoryStore(initial = {}) {
  let state = { ...initial };
  return {
    getState: () => state,
    setState: (patch) => { state = { ...state, ...patch }; },
  };
}

function makeRepo(store) {
  return createLibraryRepo({ schema: widgetSchema, store });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('exportLibrary', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-04T10:00:00.000Z'));
  });

  it('returns a JSON string', () => {
    const store = createMemoryStore({ widgets: [] });
    const repo = makeRepo(store);
    repo.add({ name: 'Sprocket', color: 'red' });

    const json = exportLibrary({ items: repo.list({ includeDeleted: true }), schema: widgetSchema });
    expect(typeof json).toBe('string');
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('exported JSON contains an "items" array', () => {
    const store = createMemoryStore({ widgets: [] });
    const repo = makeRepo(store);
    repo.add({ name: 'Bolt', color: 'blue' });

    const parsed = JSON.parse(exportLibrary({ items: repo.list({ includeDeleted: true }), schema: widgetSchema }));
    expect(Array.isArray(parsed.items)).toBe(true);
    expect(parsed.items).toHaveLength(1);
  });

  it('exported JSON contains schemaName matching the library name', () => {
    const parsed = JSON.parse(exportLibrary({ items: [], schema: widgetSchema }));
    expect(parsed.schemaName).toBe('WidgetLibrary');
  });

  it('exported JSON contains exportedAt timestamp', () => {
    const parsed = JSON.parse(exportLibrary({ items: [], schema: widgetSchema }));
    expect(parsed.exportedAt).toBeDefined();
  });

  it('exports all items including soft-deleted when includeDeleted=true (caller provides list)', () => {
    const store = createMemoryStore({ widgets: [] });
    const repo = makeRepo(store);
    const item = repo.add({ name: 'Gone', color: 'gray' });
    repo.remove(item.id);

    const allItems = repo.list({ includeDeleted: true });
    const parsed = JSON.parse(exportLibrary({ items: allItems, schema: widgetSchema }));
    expect(parsed.items).toHaveLength(1);
  });

  it('is not a Promise', () => {
    const result = exportLibrary({ items: [], schema: widgetSchema });
    expect(result).not.toBeInstanceOf(Promise);
  });
});

describe('importLibrary', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-04T10:00:00.000Z'));
  });

  // ── Round-trip ──────────────────────────────────────────────────────────

  it('round-trip: export → import → same items in repo', () => {
    const store = createMemoryStore({ widgets: [] });
    const repo = makeRepo(store);
    repo.add({ name: 'Alpha', color: 'red' });
    repo.add({ name: 'Beta', color: 'green' });

    const json = exportLibrary({ items: repo.list({ includeDeleted: true }), schema: widgetSchema });

    // Fresh store and repo for import
    const store2 = createMemoryStore({ widgets: [] });
    const repo2 = makeRepo(store2);
    const result = importLibrary({ jsonOrCsv: json, schema: widgetSchema, repo: repo2 });

    expect(result.added).toBe(2);
    expect(result.skipped).toBe(0);
    expect(repo2.list()).toHaveLength(2);
  });

  it('round-trip preserves item names', () => {
    const store = createMemoryStore({ widgets: [] });
    const repo = makeRepo(store);
    repo.add({ name: 'Unique Widget', color: 'purple' });

    const json = exportLibrary({ items: repo.list({ includeDeleted: true }), schema: widgetSchema });
    const store2 = createMemoryStore({ widgets: [] });
    const repo2 = makeRepo(store2);
    importLibrary({ jsonOrCsv: json, schema: widgetSchema, repo: repo2 });

    const imported = repo2.list();
    expect(imported[0].name).toBe('Unique Widget');
  });

  // ── Idempotency ─────────────────────────────────────────────────────────

  it('idempotency: importing same data twice returns {added:0, skipped:N}', () => {
    const store = createMemoryStore({ widgets: [] });
    const repo = makeRepo(store);
    repo.add({ id: 'fixed-id-1', name: 'Widget X', color: 'red' });
    repo.add({ id: 'fixed-id-2', name: 'Widget Y', color: 'blue' });

    const json = exportLibrary({ items: repo.list({ includeDeleted: true }), schema: widgetSchema });

    // First import into a fresh repo
    const store2 = createMemoryStore({ widgets: [] });
    const repo2 = makeRepo(store2);
    importLibrary({ jsonOrCsv: json, schema: widgetSchema, repo: repo2 });

    // Second import (same data) — should skip all
    const result2 = importLibrary({ jsonOrCsv: json, schema: widgetSchema, repo: repo2 });
    expect(result2.added).toBe(0);
    expect(result2.skipped).toBe(2);
  });

  it('idempotency: re-import does not duplicate items in the repo', () => {
    const store = createMemoryStore({ widgets: [] });
    const repo = makeRepo(store);
    repo.add({ id: 'w-1', name: 'Sprocket', color: 'red' });

    const json = exportLibrary({ items: repo.list({ includeDeleted: true }), schema: widgetSchema });
    const store2 = createMemoryStore({ widgets: [] });
    const repo2 = makeRepo(store2);
    importLibrary({ jsonOrCsv: json, schema: widgetSchema, repo: repo2 });
    importLibrary({ jsonOrCsv: json, schema: widgetSchema, repo: repo2 });

    expect(repo2.list({ includeDeleted: true })).toHaveLength(1);
  });

  // ── Malformed input ─────────────────────────────────────────────────────

  it('malformed JSON: returns errors array, does not throw', () => {
    const store = createMemoryStore({ widgets: [] });
    const repo = makeRepo(store);
    const result = importLibrary({ jsonOrCsv: 'not-valid-json{{{', schema: widgetSchema, repo });
    expect(result.errors).toBeDefined();
    expect(Array.isArray(result.errors)).toBe(true);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('malformed JSON: repo is unchanged after failed import', () => {
    const store = createMemoryStore({ widgets: [] });
    const repo = makeRepo(store);
    repo.add({ name: 'PreExisting', color: 'green' });
    importLibrary({ jsonOrCsv: 'bad json', schema: widgetSchema, repo });
    expect(repo.list()).toHaveLength(1);
  });

  it('empty JSON string: returns errors array, does not throw', () => {
    const store = createMemoryStore({ widgets: [] });
    const repo = makeRepo(store);
    const result = importLibrary({ jsonOrCsv: '', schema: widgetSchema, repo });
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('null input: returns errors array, does not throw', () => {
    const store = createMemoryStore({ widgets: [] });
    const repo = makeRepo(store);
    const result = importLibrary({ jsonOrCsv: null, schema: widgetSchema, repo });
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('valid JSON but missing items array: returns errors array', () => {
    const store = createMemoryStore({ widgets: [] });
    const repo = makeRepo(store);
    const result = importLibrary({ jsonOrCsv: '{"schemaName":"WidgetLibrary"}', schema: widgetSchema, repo });
    expect(result.errors.length).toBeGreaterThan(0);
  });

  // ── Return shape ─────────────────────────────────────────────────────────

  it('returns {added, skipped, errors} shape', () => {
    const store = createMemoryStore({ widgets: [] });
    const repo = makeRepo(store);
    const result = importLibrary({ jsonOrCsv: '{}', schema: widgetSchema, repo });
    expect(typeof result.added).toBe('number');
    expect(typeof result.skipped).toBe('number');
    expect(Array.isArray(result.errors)).toBe(true);
  });

  it('is not a Promise', () => {
    const store = createMemoryStore({ widgets: [] });
    const repo = makeRepo(store);
    const result = importLibrary({ jsonOrCsv: 'bad', schema: widgetSchema, repo });
    expect(result).not.toBeInstanceOf(Promise);
  });

  // ── Partial import ───────────────────────────────────────────────────────

  it('imports only new items (some already exist, some are new)', () => {
    const store = createMemoryStore({ widgets: [] });
    const repo = makeRepo(store);
    repo.add({ id: 'existing-id', name: 'Existing', color: 'red' });
    repo.add({ id: 'new-id', name: 'New Widget', color: 'blue' });

    const json = exportLibrary({ items: repo.list({ includeDeleted: true }), schema: widgetSchema });

    // Destination repo already has 'existing-id' but not 'new-id'
    const store2 = createMemoryStore({ widgets: [] });
    const repo2 = makeRepo(store2);
    repo2.add({ id: 'existing-id', name: 'Existing', color: 'red' });

    const result = importLibrary({ jsonOrCsv: json, schema: widgetSchema, repo: repo2 });
    expect(result.added).toBe(1);
    expect(result.skipped).toBe(1);
    expect(repo2.list({ includeDeleted: true })).toHaveLength(2);
  });
});
