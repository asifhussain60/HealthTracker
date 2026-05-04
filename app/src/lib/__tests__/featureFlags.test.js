/**
 * featureFlags.test.js
 *
 * Unit tests for parseFeatureFlagsFromUrl() — table-driven.
 * AC-P0-B11
 */

import { describe, it, expect } from 'vitest';
import { parseFeatureFlagsFromUrl } from '../featureFlags.js';

describe('parseFeatureFlagsFromUrl', () => {
  it('returns {} for empty string', () => {
    expect(parseFeatureFlagsFromUrl('')).toEqual({});
  });

  it('returns {} for null/undefined', () => {
    expect(parseFeatureFlagsFromUrl(null)).toEqual({});
    expect(parseFeatureFlagsFromUrl(undefined)).toEqual({});
  });

  it('returns {} when ?ff= is absent', () => {
    expect(parseFeatureFlagsFromUrl('?other=value')).toEqual({});
  });

  it('returns {} when ?ff= is empty', () => {
    expect(parseFeatureFlagsFromUrl('?ff=')).toEqual({});
  });

  it('handles a single flag', () => {
    expect(parseFeatureFlagsFromUrl('?ff=newDashboard')).toEqual({
      newDashboard: true,
    });
  });

  it('handles multiple flags separated by commas', () => {
    expect(parseFeatureFlagsFromUrl('?ff=alpha,beta,gamma')).toEqual({
      alpha: true,
      beta: true,
      gamma: true,
    });
  });

  it('deduplicates repeated flag names', () => {
    const result = parseFeatureFlagsFromUrl('?ff=foo,foo,bar');
    expect(result).toEqual({ foo: true, bar: true });
    // exactly two keys
    expect(Object.keys(result)).toHaveLength(2);
  });

  it('handles extra query params alongside ?ff=', () => {
    expect(parseFeatureFlagsFromUrl('?theme=dark&ff=newNav,beta&debug=1')).toEqual({
      newNav: true,
      beta: true,
    });
  });

  it('ignores blank segments from trailing commas', () => {
    const result = parseFeatureFlagsFromUrl('?ff=foo,,bar,');
    expect(result).toEqual({ foo: true, bar: true });
  });

  it('returns {} for completely invalid/non-string input (number)', () => {
    // Should not throw — just return empty.
    expect(parseFeatureFlagsFromUrl(42)).toEqual({});
  });
});
