/**
 * useMediaQuery.test.js — AC-P1C-C2
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMediaQuery } from '../useMediaQuery.js';

function mockMQL(matches) {
  return {
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useMediaQuery', () => {
  it('returns true when query matches', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn(() => mockMQL(true)),
    });
    const { result } = renderHook(() => useMediaQuery('(max-width: 599px)'));
    expect(result.current).toBe(true);
  });

  it('returns false when query does not match', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn(() => mockMQL(false)),
    });
    const { result } = renderHook(() => useMediaQuery('(max-width: 599px)'));
    expect(result.current).toBe(false);
  });

  it('returns false when matchMedia is unavailable', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: undefined,
    });
    const { result } = renderHook(() => useMediaQuery('(max-width: 599px)'));
    expect(result.current).toBe(false);
  });
});
