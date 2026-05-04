/**
 * useFeature.test.js
 *
 * Render-hook tests for useFeature(flagName).
 * AC-P0-B11
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFeature } from '../useFeature.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Wrap renderHook calls with a Zustand store that has specific featureFlags.
 * We mock useStore so we don't need a real Redux/Zustand provider.
 */

vi.mock('../../data/store', () => ({
  useStore: vi.fn(),
}));

import { useStore } from '../../data/store';

function setStoreFlags(flags) {
  useStore.mockReturnValue(flags);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useFeature', () => {
  beforeEach(() => {
    // Default: no flags in store, no URL flags
    setStoreFlags({});
    // Reset location search
    Object.defineProperty(window, 'location', {
      value: { search: '' },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns false for an unknown flag when store has no flags', () => {
    setStoreFlags({});
    const { result } = renderHook(() => useFeature('unknownFlag'));
    expect(result.current).toBe(false);
  });

  it('returns true when the flag is set in the store', () => {
    setStoreFlags({ myFeature: true });
    const { result } = renderHook(() => useFeature('myFeature'));
    expect(result.current).toBe(true);
  });

  it('returns false when the flag is explicitly false in the store', () => {
    setStoreFlags({ myFeature: false });
    const { result } = renderHook(() => useFeature('myFeature'));
    expect(result.current).toBe(false);
  });

  it('returns true when flag is set via URL ?ff= override (not in store)', () => {
    setStoreFlags({});
    Object.defineProperty(window, 'location', {
      value: { search: '?ff=urlFlag' },
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useFeature('urlFlag'));
    expect(result.current).toBe(true);
  });

  it('URL override wins over store false value', () => {
    setStoreFlags({ urlFlag: false });
    Object.defineProperty(window, 'location', {
      value: { search: '?ff=urlFlag' },
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useFeature('urlFlag'));
    expect(result.current).toBe(true);
  });

  it('URL flag does not bleed into an unrelated flag check', () => {
    setStoreFlags({});
    Object.defineProperty(window, 'location', {
      value: { search: '?ff=urlFlag' },
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useFeature('otherFlag'));
    expect(result.current).toBe(false);
  });

  it('handles multiple URL flags simultaneously', () => {
    setStoreFlags({});
    Object.defineProperty(window, 'location', {
      value: { search: '?ff=alpha,beta' },
      writable: true,
      configurable: true,
    });
    const { result: r1 } = renderHook(() => useFeature('alpha'));
    const { result: r2 } = renderHook(() => useFeature('beta'));
    const { result: r3 } = renderHook(() => useFeature('gamma'));
    expect(r1.current).toBe(true);
    expect(r2.current).toBe(true);
    expect(r3.current).toBe(false);
  });
});
