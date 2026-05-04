/**
 * dateBoundary.test.js — AC-P1C-C4
 * Pure function tests for weekRange, isWithinBoundary, clampToBoundary.
 * Caller injects today's date — no Date.now() inside the calculators.
 */
import { describe, it, expect } from 'vitest';
import {
  weekRange,
  isWithinBoundary,
  clampToBoundary,
  startOfWeekSunday,
  endOfWeekSaturday,
} from '../dateBoundary.js';

// Test anchor: Wednesday 2026-05-06 (mid-week)
const WEDNESDAY = new Date(2026, 4, 6); // month is 0-indexed

describe('startOfWeekSunday', () => {
  it('returns Sunday of the week containing the given date', () => {
    const sun = startOfWeekSunday(WEDNESDAY);
    expect(sun.getDay()).toBe(0); // 0 = Sunday
    expect(sun.toISOString().slice(0, 10)).toBe('2026-05-03');
  });

  it('returns same day if already Sunday', () => {
    const sunday = new Date(2026, 4, 3); // 2026-05-03
    const result = startOfWeekSunday(sunday);
    expect(result.toISOString().slice(0, 10)).toBe('2026-05-03');
  });
});

describe('endOfWeekSaturday', () => {
  it('returns Saturday of the week containing the given date', () => {
    const sat = endOfWeekSaturday(WEDNESDAY);
    expect(sat.getDay()).toBe(6); // 6 = Saturday
    expect(sat.toISOString().slice(0, 10)).toBe('2026-05-09');
  });
});

describe('weekRange(today)', () => {
  it('returns { start, end } with start = Sun-7 and end = Sat of current week', () => {
    const { start, end } = weekRange(WEDNESDAY);
    // start = Sunday of LAST week (7 days before this Sunday)
    expect(start.toISOString().slice(0, 10)).toBe('2026-04-26');
    // end = this Saturday
    expect(end.toISOString().slice(0, 10)).toBe('2026-05-09');
  });

  it('start is always a Sunday', () => {
    const { start } = weekRange(WEDNESDAY);
    expect(start.getDay()).toBe(0);
  });

  it('end is always a Saturday', () => {
    const { end } = weekRange(WEDNESDAY);
    expect(end.getDay()).toBe(6);
  });

  it('span is exactly 14 days (2 weeks)', () => {
    const { start, end } = weekRange(WEDNESDAY);
    const diff = (end - start) / (1000 * 60 * 60 * 24);
    expect(diff).toBe(13); // 13 days between Sun and Sat inclusive = 14 days total
  });
});

describe('isWithinBoundary(date, today)', () => {
  it('returns true for a date within [start, end]', () => {
    // 2026-05-04 is within range Apr 26 – May 09
    const monday = new Date(2026, 4, 4);
    expect(isWithinBoundary(monday, WEDNESDAY)).toBe(true);
  });

  it('returns true for today', () => {
    expect(isWithinBoundary(WEDNESDAY, WEDNESDAY)).toBe(true);
  });

  it('returns true for start boundary', () => {
    const { start } = weekRange(WEDNESDAY);
    expect(isWithinBoundary(start, WEDNESDAY)).toBe(true);
  });

  it('returns true for end boundary', () => {
    const { end } = weekRange(WEDNESDAY);
    expect(isWithinBoundary(end, WEDNESDAY)).toBe(true);
  });

  it('returns false for date before start', () => {
    const tooOld = new Date(2026, 3, 25); // April 25 — one day before start
    expect(isWithinBoundary(tooOld, WEDNESDAY)).toBe(false);
  });

  it('returns false for date after end', () => {
    const tooNew = new Date(2026, 4, 10); // May 10 — one day after end
    expect(isWithinBoundary(tooNew, WEDNESDAY)).toBe(false);
  });
});

describe('clampToBoundary(date, today)', () => {
  it('returns the date unchanged if within boundary', () => {
    const monday = new Date(2026, 4, 4);
    const result = clampToBoundary(monday, WEDNESDAY);
    expect(result.toISOString().slice(0, 10)).toBe('2026-05-04');
  });

  it('clamps to start if date is before start', () => {
    const tooOld = new Date(2026, 3, 20);
    const result = clampToBoundary(tooOld, WEDNESDAY);
    expect(result.toISOString().slice(0, 10)).toBe('2026-04-26');
  });

  it('clamps to end if date is after end', () => {
    const tooNew = new Date(2026, 5, 1);
    const result = clampToBoundary(tooNew, WEDNESDAY);
    expect(result.toISOString().slice(0, 10)).toBe('2026-05-09');
  });
});
