/**
 * meals.test.js — Unit tests for meals selectors.
 *
 * HT-CORE-010: Every selector that touches user-scoped data filters by userId.
 * HT-CORE-007: All test outcomes verified with real runner output.
 */

import { describe, it, expect } from 'vitest';
import {
  selectMealInventory,
  selectFavoriteMeals,
  selectMealsByCategory,
  selectWeeklyPlan,
  selectPlanSlot,
} from '../meals.js';

// ── Fixture factory ───────────────────────────────────────────────────────────

function makeMeal(overrides = {}) {
  return {
    id: 'meal-1',
    userId: 'me',
    name: 'Chicken Bowl',
    category: 'lunch',
    favoriteStars: 0,
    deletedAt: null,
    ...overrides,
  };
}

function makePlan(overrides = {}) {
  return {
    id: 'plan-1',
    userId: 'me',
    days: {},
    deletedAt: null,
    ...overrides,
  };
}

function makeState(overrides = {}) {
  return {
    mealInventory: [],
    mealPlan: null,
    ...overrides,
  };
}

// ── selectMealInventory ───────────────────────────────────────────────────────

describe('selectMealInventory', () => {
  it('returns meals for the requested userId only (HT-CORE-010)', () => {
    const state = makeState({
      mealInventory: [
        makeMeal({ id: 'm1', userId: 'me' }),
        makeMeal({ id: 'm2', userId: 'other-user' }),
      ],
    });
    const result = selectMealInventory(state, 'me');
    expect(result.map((m) => m.id)).toEqual(['m1']);
  });

  it('excludes soft-deleted meals', () => {
    const state = makeState({
      mealInventory: [
        makeMeal({ id: 'm1', userId: 'me', deletedAt: null }),
        makeMeal({ id: 'm2', userId: 'me', deletedAt: '2026-04-01T00:00:00Z' }),
      ],
    });
    const result = selectMealInventory(state, 'me');
    expect(result.map((m) => m.id)).toEqual(['m1']);
  });

  it('returns empty array when mealInventory is empty', () => {
    expect(selectMealInventory(makeState(), 'me')).toEqual([]);
  });

  it('returns same reference on repeated call (memoization)', () => {
    const state = makeState({
      mealInventory: [makeMeal({ id: 'm1', userId: 'me' })],
    });
    const r1 = selectMealInventory(state, 'me');
    const r2 = selectMealInventory(state, 'me');
    expect(r1).toBe(r2);
  });

  it('returns new reference when state changes', () => {
    const state1 = makeState({ mealInventory: [makeMeal({ id: 'm1', userId: 'me' })] });
    const state2 = makeState({ mealInventory: [makeMeal({ id: 'm1', userId: 'me' }), makeMeal({ id: 'm2', userId: 'me' })] });
    expect(selectMealInventory(state1, 'me')).not.toBe(selectMealInventory(state2, 'me'));
  });
});

// ── selectFavoriteMeals ───────────────────────────────────────────────────────

describe('selectFavoriteMeals', () => {
  it('returns only meals with favoriteStars > 0 for userId (HT-CORE-010)', () => {
    const state = makeState({
      mealInventory: [
        makeMeal({ id: 'm1', userId: 'me', favoriteStars: 4 }),
        makeMeal({ id: 'm2', userId: 'me', favoriteStars: 0 }),
        makeMeal({ id: 'm3', userId: 'other-user', favoriteStars: 5 }),
      ],
    });
    const result = selectFavoriteMeals(state, 'me');
    expect(result.map((m) => m.id)).toEqual(['m1']);
  });

  it('orders favorites by favoriteStars descending', () => {
    const state = makeState({
      mealInventory: [
        makeMeal({ id: 'm1', userId: 'me', favoriteStars: 1 }),
        makeMeal({ id: 'm2', userId: 'me', favoriteStars: 5 }),
        makeMeal({ id: 'm3', userId: 'me', favoriteStars: 3 }),
      ],
    });
    const result = selectFavoriteMeals(state, 'me');
    expect(result.map((m) => m.id)).toEqual(['m2', 'm3', 'm1']);
  });

  it('excludes soft-deleted favorites', () => {
    const state = makeState({
      mealInventory: [
        makeMeal({ id: 'm1', userId: 'me', favoriteStars: 5, deletedAt: '2026-05-01T00:00:00Z' }),
      ],
    });
    expect(selectFavoriteMeals(state, 'me')).toEqual([]);
  });

  it('returns empty array when no favorites', () => {
    expect(selectFavoriteMeals(makeState(), 'me')).toEqual([]);
  });
});

// ── selectMealsByCategory ─────────────────────────────────────────────────────

describe('selectMealsByCategory', () => {
  it('returns meals for userId matching category (HT-CORE-010)', () => {
    const state = makeState({
      mealInventory: [
        makeMeal({ id: 'm1', userId: 'me', category: 'lunch' }),
        makeMeal({ id: 'm2', userId: 'me', category: 'dinner' }),
        makeMeal({ id: 'm3', userId: 'other-user', category: 'lunch' }),
      ],
    });
    const result = selectMealsByCategory(state, 'me', 'lunch');
    expect(result.map((m) => m.id)).toEqual(['m1']);
  });

  it('excludes soft-deleted meals in category', () => {
    const state = makeState({
      mealInventory: [
        makeMeal({ id: 'm1', userId: 'me', category: 'lunch', deletedAt: null }),
        makeMeal({ id: 'm2', userId: 'me', category: 'lunch', deletedAt: '2026-04-01T00:00:00Z' }),
      ],
    });
    expect(selectMealsByCategory(state, 'me', 'lunch').map((m) => m.id)).toEqual(['m1']);
  });

  it('returns empty array when no meals in category', () => {
    expect(selectMealsByCategory(makeState(), 'me', 'breakfast')).toEqual([]);
  });
});

// ── selectWeeklyPlan ──────────────────────────────────────────────────────────

describe('selectWeeklyPlan', () => {
  it('returns mealPlan for userId (HT-CORE-010)', () => {
    const plan = makePlan({ id: 'plan-1', userId: 'me' });
    const state = makeState({ mealPlan: plan });
    expect(selectWeeklyPlan(state, 'me')).toBe(plan);
  });

  it('returns null when mealPlan belongs to a different user', () => {
    const plan = makePlan({ id: 'plan-1', userId: 'other-user' });
    const state = makeState({ mealPlan: plan });
    expect(selectWeeklyPlan(state, 'me')).toBeNull();
  });

  it('returns null when mealPlan is null', () => {
    expect(selectWeeklyPlan(makeState(), 'me')).toBeNull();
  });

  it('returns null when mealPlan is soft-deleted', () => {
    const plan = makePlan({ userId: 'me', deletedAt: '2026-04-01T00:00:00Z' });
    const state = makeState({ mealPlan: plan });
    expect(selectWeeklyPlan(state, 'me')).toBeNull();
  });
});

// ── selectPlanSlot ────────────────────────────────────────────────────────────

describe('selectPlanSlot', () => {
  it('returns the slot for the given date and slotKey (HT-CORE-010)', () => {
    const slot = { mealId: 'meal-1', eaten: false, plateWeight: null, category: 'lunch' };
    const plan = makePlan({
      userId: 'me',
      days: { '2026-05-04': { lunch: slot } },
    });
    const state = makeState({ mealPlan: plan });
    expect(selectPlanSlot(state, 'me', '2026-05-04', 'lunch')).toBe(slot);
  });

  it('returns null when date is not in plan', () => {
    const plan = makePlan({ userId: 'me', days: {} });
    const state = makeState({ mealPlan: plan });
    expect(selectPlanSlot(state, 'me', '2026-05-04', 'lunch')).toBeNull();
  });

  it('returns null when slotKey is not in the day', () => {
    const plan = makePlan({ userId: 'me', days: { '2026-05-04': {} } });
    const state = makeState({ mealPlan: plan });
    expect(selectPlanSlot(state, 'me', '2026-05-04', 'dinner')).toBeNull();
  });

  it('returns null when plan belongs to different user', () => {
    const slot = { mealId: 'meal-1', eaten: false };
    const plan = makePlan({ userId: 'other-user', days: { '2026-05-04': { lunch: slot } } });
    const state = makeState({ mealPlan: plan });
    expect(selectPlanSlot(state, 'me', '2026-05-04', 'lunch')).toBeNull();
  });

  it('returns null when mealPlan is null', () => {
    expect(selectPlanSlot(makeState(), 'me', '2026-05-04', 'lunch')).toBeNull();
  });
});
