/**
 * todaySelectors.test.js — E1 RED tests for selectWeightDeltaWeek
 *
 * 1. Returns 0 when no history
 * 2. Returns correct delta (negative = lost weight)
 * 3. Returns correct delta (positive = gained)
 * 4. Uses most recent entry in each week-window
 * 5. Filters by userId
 *
 * AC-P1E-E1
 */
import { describe, it, expect } from 'vitest';
import { selectWeightDeltaWeek } from '../today.js';

const USER = 'me';

function makeEntry(date, weight, userId = USER) {
  return { id: `w-${date}`, userId, date, weight, schemaVersion: 3, createdAt: date, updatedAt: date, createdBy: userId, updatedBy: userId, deletedAt: null };
}

describe('selectWeightDeltaWeek', () => {
  it('returns 0 when no weight history', () => {
    const state = { weightHistory: [] };
    expect(selectWeightDeltaWeek(state, USER, '2026-05-04')).toBe(0);
  });

  it('returns negative delta when weight dropped vs 7 days ago', () => {
    const state = {
      weightHistory: [
        makeEntry('2026-04-27', 241.0),
        makeEntry('2026-05-04', 238.5),
      ],
    };
    // 238.5 - 241.0 = -2.5
    expect(selectWeightDeltaWeek(state, USER, '2026-05-04')).toBeCloseTo(-2.5);
  });

  it('returns positive delta when weight gained vs 7 days ago', () => {
    const state = {
      weightHistory: [
        makeEntry('2026-04-27', 238.0),
        makeEntry('2026-05-04', 240.0),
      ],
    };
    expect(selectWeightDeltaWeek(state, USER, '2026-05-04')).toBeCloseTo(2.0);
  });

  it('picks most recent entry on/before each boundary', () => {
    const state = {
      weightHistory: [
        makeEntry('2026-04-25', 243.0), // older than 7 days
        makeEntry('2026-04-27', 241.5), // exactly 7 days before
        makeEntry('2026-04-29', 240.0), // within last week
        makeEntry('2026-05-04', 238.5), // today
      ],
    };
    // today = 238.5; one week ago = max entry on/before 2026-04-27 = 241.5
    expect(selectWeightDeltaWeek(state, USER, '2026-05-04')).toBeCloseTo(-3.0);
  });

  it('filters by userId — excludes other users', () => {
    const state = {
      weightHistory: [
        makeEntry('2026-04-27', 100.0, 'other-user'),
        makeEntry('2026-05-04', 238.5, USER),
      ],
    };
    // no entry for USER 7 days ago → returns 0
    expect(selectWeightDeltaWeek(state, USER, '2026-05-04')).toBe(0);
  });
});
