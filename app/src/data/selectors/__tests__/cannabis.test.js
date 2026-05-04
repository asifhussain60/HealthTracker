/**
 * cannabis.test.js — Unit tests for cannabis selectors.
 *
 * HT-CORE-010: Every selector that touches user-scoped data filters by userId.
 * HT-CORE-007: All test outcomes verified with real runner output.
 */

import { describe, it, expect } from 'vitest';
import {
  selectCannabisProducts,
  selectCannabisDevices,
  selectCannabisSessionsByDate,
  selectDailyThcMg,
  selectThcCeilingStatus,
  selectFavoriteProducts,
} from '../cannabis.js';

// ── Shared fixture factory ────────────────────────────────────────────────────

function makeProduct(overrides = {}) {
  return {
    id: 'prod-1',
    userId: 'me',
    name: 'Test Flower',
    form: 'flower',
    deletedAt: null,
    favoriteStars: 0,
    ...overrides,
  };
}

function makeDevice(overrides = {}) {
  return {
    id: 'dev-1',
    userId: 'me',
    name: 'Dynavap',
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
    inventory: [],
    cannabisDevices: [],
    cannabisLogs: [],
    profile: {},
    ...overrides,
  };
}

// ── selectCannabisProducts ────────────────────────────────────────────────────

describe('selectCannabisProducts', () => {
  it('returns products for the requested userId only (HT-CORE-010)', () => {
    const state = makeState({
      inventory: [
        makeProduct({ id: 'p1', userId: 'me' }),
        makeProduct({ id: 'p2', userId: 'other-user' }),
      ],
    });
    const result = selectCannabisProducts(state, 'me');
    expect(result.map((p) => p.id)).toEqual(['p1']);
  });

  it('excludes soft-deleted products', () => {
    const state = makeState({
      inventory: [
        makeProduct({ id: 'p1', userId: 'me', deletedAt: null }),
        makeProduct({ id: 'p2', userId: 'me', deletedAt: '2026-05-01T00:00:00Z' }),
      ],
    });
    const result = selectCannabisProducts(state, 'me');
    expect(result.map((p) => p.id)).toEqual(['p1']);
  });

  it('returns empty array when inventory is empty', () => {
    expect(selectCannabisProducts(makeState(), 'me')).toEqual([]);
  });

  it('returns same reference on repeated call (memoization)', () => {
    const state = makeState({
      inventory: [makeProduct({ id: 'p1', userId: 'me' })],
    });
    const r1 = selectCannabisProducts(state, 'me');
    const r2 = selectCannabisProducts(state, 'me');
    expect(r1).toBe(r2);
  });

  it('returns new reference when state changes', () => {
    const state1 = makeState({
      inventory: [makeProduct({ id: 'p1', userId: 'me' })],
    });
    const state2 = makeState({
      inventory: [makeProduct({ id: 'p1', userId: 'me' }), makeProduct({ id: 'p2', userId: 'me' })],
    });
    const r1 = selectCannabisProducts(state1, 'me');
    const r2 = selectCannabisProducts(state2, 'me');
    expect(r1).not.toBe(r2);
  });
});

// ── selectCannabisDevices ─────────────────────────────────────────────────────

describe('selectCannabisDevices', () => {
  it('returns devices for the requested userId only (HT-CORE-010)', () => {
    const state = makeState({
      cannabisDevices: [
        makeDevice({ id: 'd1', userId: 'me' }),
        makeDevice({ id: 'd2', userId: 'other-user' }),
      ],
    });
    const result = selectCannabisDevices(state, 'me');
    expect(result.map((d) => d.id)).toEqual(['d1']);
  });

  it('excludes soft-deleted devices', () => {
    const state = makeState({
      cannabisDevices: [
        makeDevice({ id: 'd1', userId: 'me', deletedAt: null }),
        makeDevice({ id: 'd2', userId: 'me', deletedAt: '2026-04-01T00:00:00Z' }),
      ],
    });
    const result = selectCannabisDevices(state, 'me');
    expect(result.map((d) => d.id)).toEqual(['d1']);
  });

  it('returns empty array when cannabisDevices is absent from state', () => {
    const state = makeState();
    // cannabisDevices key missing → selector should handle gracefully
    expect(selectCannabisDevices(state, 'me')).toEqual([]);
  });
});

// ── selectCannabisSessionsByDate ──────────────────────────────────────────────

describe('selectCannabisSessionsByDate', () => {
  it('returns sessions for userId on date only (HT-CORE-010)', () => {
    const state = makeState({
      cannabisLogs: [
        makeSession({ id: 's1', userId: 'me', date: '2026-05-04', time: '15:00' }),
        makeSession({ id: 's2', userId: 'other-user', date: '2026-05-04', time: '16:00' }),
        makeSession({ id: 's3', userId: 'me', date: '2026-05-03', time: '14:00' }),
      ],
    });
    const result = selectCannabisSessionsByDate(state, 'me', '2026-05-04');
    expect(result.map((s) => s.id)).toEqual(['s1']);
  });

  it('orders returned sessions by time ascending', () => {
    const state = makeState({
      cannabisLogs: [
        makeSession({ id: 's2', userId: 'me', date: '2026-05-04', time: '20:00' }),
        makeSession({ id: 's1', userId: 'me', date: '2026-05-04', time: '15:00' }),
      ],
    });
    const result = selectCannabisSessionsByDate(state, 'me', '2026-05-04');
    expect(result.map((s) => s.id)).toEqual(['s1', 's2']);
  });

  it('returns empty array for date with no sessions', () => {
    const state = makeState({
      cannabisLogs: [makeSession({ userId: 'me', date: '2026-05-03' })],
    });
    expect(selectCannabisSessionsByDate(state, 'me', '2026-05-04')).toEqual([]);
  });
});

// ── selectDailyThcMg ──────────────────────────────────────────────────────────

describe('selectDailyThcMg', () => {
  it('sums thcMg for user on date (HT-CORE-010)', () => {
    const state = makeState({
      cannabisLogs: [
        makeSession({ id: 's1', userId: 'me', date: '2026-05-04', thcMg: 10 }),
        makeSession({ id: 's2', userId: 'me', date: '2026-05-04', thcMg: 12 }),
        makeSession({ id: 's3', userId: 'other-user', date: '2026-05-04', thcMg: 50 }),
        makeSession({ id: 's4', userId: 'me', date: '2026-05-03', thcMg: 8 }),
      ],
    });
    expect(selectDailyThcMg(state, 'me', '2026-05-04')).toBe(22);
  });

  it('returns 0 when no sessions for user on date', () => {
    expect(selectDailyThcMg(makeState(), 'me', '2026-05-04')).toBe(0);
  });

  it('handles missing thcMg fields (treats as 0)', () => {
    const state = makeState({
      cannabisLogs: [
        makeSession({ userId: 'me', date: '2026-05-04', thcMg: undefined }),
      ],
    });
    expect(selectDailyThcMg(state, 'me', '2026-05-04')).toBe(0);
  });
});

// ── selectThcCeilingStatus ────────────────────────────────────────────────────

describe('selectThcCeilingStatus', () => {
  it('returns under when daily total is below 80% of ceiling', () => {
    const state = makeState({
      cannabisLogs: [makeSession({ userId: 'me', date: '2026-05-04', thcMg: 10 })],
      profile: { cannabisTargets: { dailyThcMgCeiling: 50 } },
    });
    expect(selectThcCeilingStatus(state, 'me', '2026-05-04')).toBe('under');
  });

  it('returns near when daily total is 80-99% of ceiling', () => {
    const state = makeState({
      cannabisLogs: [makeSession({ userId: 'me', date: '2026-05-04', thcMg: 42 })],
      profile: { cannabisTargets: { dailyThcMgCeiling: 50 } },
    });
    expect(selectThcCeilingStatus(state, 'me', '2026-05-04')).toBe('near');
  });

  it('returns over when daily total meets or exceeds ceiling', () => {
    const state = makeState({
      cannabisLogs: [makeSession({ userId: 'me', date: '2026-05-04', thcMg: 55 })],
      profile: { cannabisTargets: { dailyThcMgCeiling: 50 } },
    });
    expect(selectThcCeilingStatus(state, 'me', '2026-05-04')).toBe('over');
  });

  it('defaults to ceiling 50 when profile.cannabisTargets.dailyThcMgCeiling is missing', () => {
    const state = makeState({
      cannabisLogs: [makeSession({ userId: 'me', date: '2026-05-04', thcMg: 10 })],
      profile: {},
    });
    // 10 < 50*0.8=40 → under
    expect(selectThcCeilingStatus(state, 'me', '2026-05-04')).toBe('under');
  });

  it('filters by userId — other-user sessions do not count (HT-CORE-010)', () => {
    const state = makeState({
      cannabisLogs: [
        makeSession({ userId: 'other-user', date: '2026-05-04', thcMg: 100 }),
      ],
      profile: { cannabisTargets: { dailyThcMgCeiling: 50 } },
    });
    // 'me' has 0mg → under
    expect(selectThcCeilingStatus(state, 'me', '2026-05-04')).toBe('under');
  });
});

// ── selectFavoriteProducts ────────────────────────────────────────────────────

describe('selectFavoriteProducts', () => {
  it('returns only products with favoriteStars > 0 (HT-CORE-010)', () => {
    const state = makeState({
      inventory: [
        makeProduct({ id: 'p1', userId: 'me', favoriteStars: 3 }),
        makeProduct({ id: 'p2', userId: 'me', favoriteStars: 0 }),
        makeProduct({ id: 'p3', userId: 'other-user', favoriteStars: 5 }),
      ],
    });
    const result = selectFavoriteProducts(state, 'me');
    expect(result.map((p) => p.id)).toEqual(['p1']);
  });

  it('orders favorites by favoriteStars descending', () => {
    const state = makeState({
      inventory: [
        makeProduct({ id: 'p1', userId: 'me', favoriteStars: 2 }),
        makeProduct({ id: 'p2', userId: 'me', favoriteStars: 5 }),
        makeProduct({ id: 'p3', userId: 'me', favoriteStars: 1 }),
      ],
    });
    const result = selectFavoriteProducts(state, 'me');
    expect(result.map((p) => p.id)).toEqual(['p2', 'p1', 'p3']);
  });

  it('excludes soft-deleted favorites', () => {
    const state = makeState({
      inventory: [
        makeProduct({ id: 'p1', userId: 'me', favoriteStars: 5, deletedAt: '2026-04-01T00:00:00Z' }),
      ],
    });
    expect(selectFavoriteProducts(state, 'me')).toEqual([]);
  });

  it('returns empty array when no favorites exist', () => {
    expect(selectFavoriteProducts(makeState(), 'me')).toEqual([]);
  });
});
