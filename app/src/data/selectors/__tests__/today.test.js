/**
 * today.test.js — Unit tests for today selectors.
 *
 * HT-CORE-010: Every selector that touches user-scoped data filters by userId.
 * HT-CORE-007: All test outcomes verified with real runner output.
 */

import { describe, it, expect } from 'vitest';
import {
  selectTodayWeightEntry,
  selectTodayWorkoutLogs,
  selectTodayCannabisSessions,
  selectTodayCalorieRing,
} from '../today.js';

// ── Fixture factories ─────────────────────────────────────────────────────────

function makeWeightEntry(overrides = {}) {
  return {
    id: 'we-1',
    userId: 'me',
    date: '2026-05-04',
    weight: 241.8,
    deletedAt: null,
    ...overrides,
  };
}

function makeWorkoutLog(overrides = {}) {
  return {
    id: 'wl-1',
    userId: 'me',
    date: '2026-05-04',
    steps: 5000,
    deletedAt: null,
    ...overrides,
  };
}

function makeSession(overrides = {}) {
  return {
    id: 'sess-1',
    userId: 'me',
    date: '2026-05-04',
    time: '15:00',
    thcMg: 10,
    deletedAt: null,
    ...overrides,
  };
}

function makeState(overrides = {}) {
  return {
    weightHistory: [],
    workoutLogs: [],
    cannabisLogs: [],
    mealInventory: [],
    mealPlan: null,
    profile: {},
    ...overrides,
  };
}

// ── selectTodayWeightEntry ────────────────────────────────────────────────────

describe('selectTodayWeightEntry', () => {
  it('returns the latest weight entry for userId on/before date (HT-CORE-010)', () => {
    const state = makeState({
      weightHistory: [
        makeWeightEntry({ id: 'we1', userId: 'me', date: '2026-05-04', weight: 241.8 }),
        makeWeightEntry({ id: 'we2', userId: 'other-user', date: '2026-05-04', weight: 999 }),
      ],
    });
    const result = selectTodayWeightEntry(state, 'me', '2026-05-04');
    expect(result.id).toBe('we1');
  });

  it('returns the most recent entry when multiple entries exist on/before date', () => {
    const state = makeState({
      weightHistory: [
        makeWeightEntry({ id: 'we1', userId: 'me', date: '2026-05-03', weight: 242.0 }),
        makeWeightEntry({ id: 'we2', userId: 'me', date: '2026-05-04', weight: 241.8 }),
      ],
    });
    const result = selectTodayWeightEntry(state, 'me', '2026-05-04');
    expect(result.id).toBe('we2');
  });

  it('returns entry from before date when no entry on date itself', () => {
    const state = makeState({
      weightHistory: [
        makeWeightEntry({ id: 'we1', userId: 'me', date: '2026-05-03', weight: 242.0 }),
      ],
    });
    const result = selectTodayWeightEntry(state, 'me', '2026-05-04');
    expect(result.id).toBe('we1');
  });

  it('returns null when no entries exist for user', () => {
    expect(selectTodayWeightEntry(makeState(), 'me', '2026-05-04')).toBeNull();
  });

  it('returns null when only future entries exist', () => {
    const state = makeState({
      weightHistory: [
        makeWeightEntry({ userId: 'me', date: '2026-05-05' }),
      ],
    });
    expect(selectTodayWeightEntry(state, 'me', '2026-05-04')).toBeNull();
  });
});

// ── selectTodayWorkoutLogs ────────────────────────────────────────────────────

describe('selectTodayWorkoutLogs', () => {
  it('returns workout logs for userId on date only (HT-CORE-010)', () => {
    const state = makeState({
      workoutLogs: [
        makeWorkoutLog({ id: 'wl1', userId: 'me', date: '2026-05-04' }),
        makeWorkoutLog({ id: 'wl2', userId: 'other-user', date: '2026-05-04' }),
        makeWorkoutLog({ id: 'wl3', userId: 'me', date: '2026-05-03' }),
      ],
    });
    const result = selectTodayWorkoutLogs(state, 'me', '2026-05-04');
    expect(result.map((w) => w.id)).toEqual(['wl1']);
  });

  it('returns empty array when no logs for user on date', () => {
    expect(selectTodayWorkoutLogs(makeState(), 'me', '2026-05-04')).toEqual([]);
  });
});

// ── selectTodayCannabisSessions ───────────────────────────────────────────────

describe('selectTodayCannabisSessions', () => {
  it('returns cannabis sessions for userId on date only (HT-CORE-010)', () => {
    const state = makeState({
      cannabisLogs: [
        makeSession({ id: 's1', userId: 'me', date: '2026-05-04' }),
        makeSession({ id: 's2', userId: 'other-user', date: '2026-05-04' }),
        makeSession({ id: 's3', userId: 'me', date: '2026-05-03' }),
      ],
    });
    const result = selectTodayCannabisSessions(state, 'me', '2026-05-04');
    expect(result.map((s) => s.id)).toEqual(['s1']);
  });

  it('delegates to cannabis selectCannabisSessionsByDate — ordered by time', () => {
    const state = makeState({
      cannabisLogs: [
        makeSession({ id: 's2', userId: 'me', date: '2026-05-04', time: '20:00' }),
        makeSession({ id: 's1', userId: 'me', date: '2026-05-04', time: '15:00' }),
      ],
    });
    const result = selectTodayCannabisSessions(state, 'me', '2026-05-04');
    expect(result.map((s) => s.id)).toEqual(['s1', 's2']);
  });

  it('returns empty array when no sessions', () => {
    expect(selectTodayCannabisSessions(makeState(), 'me', '2026-05-04')).toEqual([]);
  });
});

// ── selectTodayCalorieRing ────────────────────────────────────────────────────

describe('selectTodayCalorieRing', () => {
  it('returns { eaten: 0, target: 2000, remaining: 2000 } when no plan exists', () => {
    const state = makeState({ profile: {} });
    const result = selectTodayCalorieRing(state, 'me', '2026-05-04');
    expect(result).toEqual({ eaten: 0, target: 2000, remaining: 2000 });
  });

  it('uses profile.dailyCalorieTarget when set', () => {
    const state = makeState({
      profile: { dailyCalorieTarget: 1800 },
    });
    const result = selectTodayCalorieRing(state, 'me', '2026-05-04');
    expect(result.target).toBe(1800);
  });

  it('sums calories from eaten slots via consumedMacrosForSlot (HT-CORE-010)', () => {
    // Build a meal plan with two eaten slots
    const mealItem = {
      id: 'meal-1',
      userId: 'me',
      referenceWeight: 400,
      refCalories: 600,
      refProtein: 40,
      refCarbs: 50,
      refFat: 15,
    };
    const state = makeState({
      profile: {
        dailyCalorieTarget: 2000,
        plateDefaults: { lunch: 200, dinner: 200 },
      },
      mealInventory: [mealItem],
      mealPlan: {
        userId: 'me',
        days: {
          '2026-05-04': {
            // eaten: true, plateWeight=600g, food weight = 600-200=400g → ratio=1 → 600 cal
            lunch: { mealId: 'meal-1', eaten: true, plateWeight: 600, category: 'lunch' },
            // eaten: false → 0 cal
            dinner: { mealId: 'meal-1', eaten: false, plateWeight: 600, category: 'dinner' },
          },
        },
      },
    });
    const result = selectTodayCalorieRing(state, 'me', '2026-05-04');
    expect(result.eaten).toBeCloseTo(600, 1);
    expect(result.target).toBe(2000);
    expect(result.remaining).toBeCloseTo(1400, 1);
  });

  it('only uses plan belonging to userId (HT-CORE-010)', () => {
    const state = makeState({
      profile: {},
      mealPlan: {
        // plan belongs to other-user → should be ignored
        userId: 'other-user',
        days: {
          '2026-05-04': {
            lunch: { mealId: 'meal-1', eaten: true, plateWeight: 600, category: 'lunch' },
          },
        },
      },
      mealInventory: [],
    });
    const result = selectTodayCalorieRing(state, 'me', '2026-05-04');
    // eaten = 0 because plan ignored
    expect(result.eaten).toBe(0);
  });

  it('defaults calorie target to 2000 when not set in profile (debt: fixed at B10)', () => {
    const state = makeState({ profile: { dailyCalorieTarget: undefined } });
    expect(selectTodayCalorieRing(state, 'me', '2026-05-04').target).toBe(2000);
  });
});
