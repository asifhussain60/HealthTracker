import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorageAdapter, StorageQuotaError } from '../LocalStorageAdapter.js';

// The in-memory localStorage polyfill is installed globally by
// app/src/__tests__/setup.js — no additional mock needed.

describe('LocalStorageAdapter', () => {
  let adapter;

  beforeEach(() => {
    adapter = new LocalStorageAdapter();
    // Polyfill clear() is called by afterEach in setup.js between tests,
    // but clear it here too for explicit isolation within this describe block.
    localStorage.clear();
  });

  // ── getItem ──────────────────────────────────────────────────────────────────

  it('getItem returns null for a missing key', () => {
    expect(adapter.getItem('no-such-key')).toBeNull();
  });

  it('getItem returns the stored string after setItem', () => {
    adapter.setItem('greeting', 'hello');
    expect(adapter.getItem('greeting')).toBe('hello');
  });

  // ── setItem ──────────────────────────────────────────────────────────────────

  it('setItem round-trips an arbitrary string value', () => {
    const payload = JSON.stringify({ a: 1, b: [2, 3] });
    adapter.setItem('data', payload);
    expect(adapter.getItem('data')).toBe(payload);
  });

  it('setItem overwrites a previously stored value', () => {
    adapter.setItem('k', 'first');
    adapter.setItem('k', 'second');
    expect(adapter.getItem('k')).toBe('second');
  });

  // ── removeItem ───────────────────────────────────────────────────────────────

  it('removeItem deletes the key so getItem returns null afterwards', () => {
    adapter.setItem('temp', 'data');
    adapter.removeItem('temp');
    expect(adapter.getItem('temp')).toBeNull();
  });

  it('removeItem is a no-op for a key that does not exist (no throw)', () => {
    expect(() => adapter.removeItem('phantom')).not.toThrow();
  });

  // ── clear ────────────────────────────────────────────────────────────────────

  it('clear() with no argument removes every key', () => {
    adapter.setItem('a', '1');
    adapter.setItem('b', '2');
    adapter.setItem('c', '3');
    adapter.clear();
    expect(adapter.getItem('a')).toBeNull();
    expect(adapter.getItem('b')).toBeNull();
    expect(adapter.getItem('c')).toBeNull();
  });

  it('clear(prefix) removes only keys that start with that prefix', () => {
    adapter.setItem('ht-meals', 'x');
    adapter.setItem('ht-profile', 'y');
    adapter.setItem('other-key', 'z');
    adapter.clear('ht-');
    expect(adapter.getItem('ht-meals')).toBeNull();
    expect(adapter.getItem('ht-profile')).toBeNull();
    // Non-prefixed key must survive
    expect(adapter.getItem('other-key')).toBe('z');
  });

  it('clear(prefix) is a no-op when no keys match the prefix', () => {
    adapter.setItem('unrelated', 'keep');
    adapter.clear('ht-');
    expect(adapter.getItem('unrelated')).toBe('keep');
  });

  // ── StorageQuotaError ─────────────────────────────────────────────────────────

  it('setItem throws StorageQuotaError when underlying localStorage throws QuotaExceededError', () => {
    const native = localStorage.setItem.bind(localStorage);
    const stub = vi.fn(() => {
      const err = new Error('QuotaExceededError');
      err.name = 'QuotaExceededError';
      throw err;
    });
    // Temporarily replace the polyfill's setItem
    localStorage.setItem = stub;

    try {
      expect(() => adapter.setItem('big-key', 'big-value')).toThrow(StorageQuotaError);
    } finally {
      // Restore polyfill so subsequent tests are unaffected
      localStorage.setItem = native;
    }
  });

  it('StorageQuotaError carries the key and byteLength of the rejected value', () => {
    const value = 'big-value';
    const stub = vi.fn(() => {
      const err = new Error('QuotaExceededError');
      err.name = 'QuotaExceededError';
      throw err;
    });
    const native = localStorage.setItem.bind(localStorage);
    localStorage.setItem = stub;

    try {
      adapter.setItem('big-key', value);
    } catch (e) {
      expect(e).toBeInstanceOf(StorageQuotaError);
      expect(e.key).toBe('big-key');
      expect(e.byteLength).toBe(value.length);
      expect(e.name).toBe('StorageQuotaError');
    } finally {
      localStorage.setItem = native;
    }
  });
});
