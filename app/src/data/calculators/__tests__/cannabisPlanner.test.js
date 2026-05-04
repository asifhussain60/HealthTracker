/**
 * cannabisPlanner.test.js — RED phase tests for cannabisPlanner
 *
 * Covers: planDay (extracted from getDailyCannabisPlan in cannabisSlice)
 * All inputs are parameters — no store, no Date.now(), no React.
 *
 * Taper formula: ceiling(d) = 80 - 55 * d / 56  (decision #4)
 */

import { describe, it, expect } from 'vitest';
import { planDay, taperCeiling } from '../cannabisPlanner.js';

// ── taperCeiling formula ─────────────────────────────────────────────────────

describe('taperCeiling — ceiling(d) = 80 - 55 * d / 56', () => {
  it.each([
    // [taperDay, expectedCeiling]
    [0, 80],           // day 0: 80 - 0 = 80
    [28, 80 - 55 * 28 / 56],  // midpoint: ~52.5
    [56, 80 - 55],     // day 56: 80 - 55 = 25
    [1, 80 - 55 / 56], // day 1
  ])(
    'taperDay=%s → ceiling≈%s',
    (taperDay, expected) => {
      expect(taperCeiling(taperDay)).toBeCloseTo(expected, 4);
    }
  );

  it('returns 80 at day 0', () => {
    expect(taperCeiling(0)).toBeCloseTo(80, 4);
  });

  it('returns 25 at day 56', () => {
    expect(taperCeiling(56)).toBeCloseTo(25, 4);
  });
});

// ── fixtures ──────────────────────────────────────────────────────────────────

const makeProduct = (overrides = {}) => ({
  id: 'p1',
  name: 'Test Flower',
  brand: 'Brand A',
  form: 'flower',
  remaining: 10,
  remainingUnit: 'g',
  dayNight: 'day-evening',
  riskLevel: 'low',
  thcPercent: 20,
  startingDose: '0.05g',
  usagePlan: 'Use as needed',
  useWindow: '15:00-21:00',
  ...overrides,
});

const makeProfile = (overrides = {}) => ({
  cannabisTargets: {
    dailySessions: 2,
    dailyThcMgCeiling: 50,
    inhalationBioavailability: 0.30,
    oralBioavailability: 0.20,
  },
  ...overrides,
});

// ── planDay — basic behavior ──────────────────────────────────────────────────

describe('planDay — returns sessions array and taperCeilingMg', () => {
  it('returns { sessions, taperCeilingMg } shape', () => {
    const result = planDay({
      date: '2026-05-04',
      taperDay: 0,
      profile: makeProfile(),
      productLib: [makeProduct()],
    });
    expect(result).toHaveProperty('sessions');
    expect(result).toHaveProperty('taperCeilingMg');
    expect(Array.isArray(result.sessions)).toBe(true);
  });

  it('returns empty sessions when productLib is empty', () => {
    const result = planDay({
      date: '2026-05-04',
      taperDay: 0,
      profile: makeProfile(),
      productLib: [],
    });
    expect(result.sessions).toHaveLength(0);
  });

  it('returns empty sessions when profile.cannabisTargets is missing', () => {
    const result = planDay({
      date: '2026-05-04',
      taperDay: 0,
      profile: {},
      productLib: [makeProduct()],
    });
    expect(result.sessions).toHaveLength(0);
  });

  it('respects dailySessions from profile (caps at 2)', () => {
    const products = [
      makeProduct({ id: 'p1', dayNight: 'day-evening' }),
      makeProduct({ id: 'p2', dayNight: 'evening' }),
      makeProduct({ id: 'p3', dayNight: 'night' }),
    ];
    const result = planDay({
      date: '2026-05-04',
      taperDay: 0,
      profile: makeProfile({ cannabisTargets: { dailySessions: 2, dailyThcMgCeiling: 50 } }),
      productLib: products,
    });
    expect(result.sessions.length).toBeLessThanOrEqual(2);
  });

  it('respects dailySessions = 3', () => {
    const products = [
      makeProduct({ id: 'p1', dayNight: 'day-evening' }),
      makeProduct({ id: 'p2', dayNight: 'evening' }),
      makeProduct({ id: 'p3', dayNight: 'night' }),
    ];
    const result = planDay({
      date: '2026-05-04',
      taperDay: 0,
      profile: makeProfile({ cannabisTargets: { dailySessions: 3, dailyThcMgCeiling: 80 } }),
      productLib: products,
    });
    expect(result.sessions.length).toBeLessThanOrEqual(3);
  });
});

describe('planDay — product filtering', () => {
  it('excludes products with remaining <= 0', () => {
    const result = planDay({
      date: '2026-05-04',
      taperDay: 0,
      profile: makeProfile(),
      productLib: [makeProduct({ remaining: 0 })],
    });
    expect(result.sessions).toHaveLength(0);
  });

  it('excludes non-flower products (capsules, etc.) by default filter', () => {
    const result = planDay({
      date: '2026-05-04',
      taperDay: 0,
      profile: makeProfile(),
      productLib: [makeProduct({ form: 'capsule' })],
    });
    // capsules are filtered out (matching existing cannabisSlice behavior)
    expect(result.sessions).toHaveLength(0);
  });

  it('excludes test-only products', () => {
    const result = planDay({
      date: '2026-05-04',
      taperDay: 0,
      profile: makeProfile(),
      productLib: [makeProduct({ dayNight: 'test-only' })],
    });
    expect(result.sessions).toHaveLength(0);
  });

  it('excludes night-only products', () => {
    const result = planDay({
      date: '2026-05-04',
      taperDay: 0,
      profile: makeProfile(),
      productLib: [makeProduct({ dayNight: 'night-only' })],
    });
    expect(result.sessions).toHaveLength(0);
  });

  it('excludes high-risk products', () => {
    const result = planDay({
      date: '2026-05-04',
      taperDay: 0,
      profile: makeProfile(),
      productLib: [makeProduct({ riskLevel: 'high' })],
    });
    expect(result.sessions).toHaveLength(0);
  });

  it('includes low-risk flower with remaining > 0', () => {
    const result = planDay({
      date: '2026-05-04',
      taperDay: 0,
      profile: makeProfile(),
      productLib: [makeProduct()],
    });
    expect(result.sessions.length).toBeGreaterThan(0);
  });
});

describe('planDay — session shape', () => {
  it('each session has required fields', () => {
    const result = planDay({
      date: '2026-05-04',
      taperDay: 0,
      profile: makeProfile(),
      productLib: [makeProduct()],
    });
    expect(result.sessions.length).toBeGreaterThan(0);
    const session = result.sessions[0];
    expect(session).toHaveProperty('sessionNumber');
    expect(session).toHaveProperty('productId');
    expect(session).toHaveProperty('plannedTime');
    expect(session).toHaveProperty('timeLabel');
    expect(session).toHaveProperty('recommendedAmount');
    expect(session).toHaveProperty('unit');
    expect(session).toHaveProperty('reason');
  });

  it('estimatedThcMg is computed when thcPercent is set', () => {
    // 0.05g × 1000 × 0.20 thc = 10mg raw; no bioavailability in original slice calc
    const result = planDay({
      date: '2026-05-04',
      taperDay: 0,
      profile: makeProfile(),
      productLib: [makeProduct({ thcPercent: 20, startingDose: '0.05g' })],
    });
    expect(result.sessions[0].estimatedThcMg).toBeDefined();
    expect(result.sessions[0].estimatedThcMg).toBeGreaterThan(0);
  });

  it('estimatedThcMg is null when thcPercent is null', () => {
    const result = planDay({
      date: '2026-05-04',
      taperDay: 0,
      profile: makeProfile(),
      productLib: [makeProduct({ thcPercent: null })],
    });
    expect(result.sessions[0].estimatedThcMg).toBeNull();
  });
});

describe('planDay — taperCeilingMg', () => {
  it.each([
    [0, 80],
    [28, 80 - 55 * 28 / 56],
    [56, 25],
  ])(
    'taperDay=%s → taperCeilingMg≈%s',
    (taperDay, expectedCeiling) => {
      const result = planDay({
        date: '2026-05-04',
        taperDay,
        profile: makeProfile(),
        productLib: [makeProduct()],
      });
      expect(result.taperCeilingMg).toBeCloseTo(expectedCeiling, 4);
    }
  );
});

describe('planDay — product preference by time slot', () => {
  it('prefers day-evening product for first slot', () => {
    const products = [
      makeProduct({ id: 'p-day', dayNight: 'day-evening' }),
      makeProduct({ id: 'p-night', dayNight: 'night' }),
    ];
    const result = planDay({
      date: '2026-05-04',
      taperDay: 0,
      profile: makeProfile({ cannabisTargets: { dailySessions: 2, dailyThcMgCeiling: 80 } }),
      productLib: products,
    });
    // first session should use day-evening product
    expect(result.sessions[0].productId).toBe('p-day');
  });

  it('does not reuse same product for two sessions', () => {
    const products = [
      makeProduct({ id: 'p1', dayNight: 'day-evening' }),
      makeProduct({ id: 'p2', dayNight: 'evening' }),
    ];
    const result = planDay({
      date: '2026-05-04',
      taperDay: 0,
      profile: makeProfile({ cannabisTargets: { dailySessions: 2, dailyThcMgCeiling: 80 } }),
      productLib: products,
    });
    const ids = result.sessions.map((s) => s.productId);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('falls back to any available product when preference not found', () => {
    // Only a night product available but 1st slot prefers day-evening/evening
    const result = planDay({
      date: '2026-05-04',
      taperDay: 0,
      profile: makeProfile({ cannabisTargets: { dailySessions: 1, dailyThcMgCeiling: 80 } }),
      productLib: [makeProduct({ id: 'p-only', dayNight: 'night' })],
    });
    // Falls back to any available product
    expect(result.sessions.length).toBeGreaterThan(0);
    expect(result.sessions[0].productId).toBe('p-only');
  });
});

describe('planDay — dose parsing from startingDose string', () => {
  it.each([
    // [startingDose, expectedDoseApprox]
    ['0.05g', 0.05],
    ['0.1g', 0.1],
    ['0.05g per session', 0.05],
  ])(
    'startingDose=%s → recommendedAmount≈%s',
    (startingDose, expectedDose) => {
      const result = planDay({
        date: '2026-05-04',
        taperDay: 0,
        profile: makeProfile(),
        productLib: [makeProduct({ startingDose })],
      });
      expect(result.sessions[0].recommendedAmount).toBeCloseTo(expectedDose, 3);
    }
  );

  it('defaults to 0.05 when startingDose is missing or unparseable', () => {
    const result = planDay({
      date: '2026-05-04',
      taperDay: 0,
      profile: makeProfile(),
      productLib: [makeProduct({ startingDose: 'no numbers' })],
    });
    expect(result.sessions[0].recommendedAmount).toBeCloseTo(0.05, 3);
  });
});

// ── planDay is pure (no mutations) ───────────────────────────────────────────

describe('planDay — purity: does not mutate inputs', () => {
  it('does not mutate productLib', () => {
    const products = [makeProduct()];
    const productsCopy = JSON.parse(JSON.stringify(products));
    planDay({
      date: '2026-05-04',
      taperDay: 0,
      profile: makeProfile(),
      productLib: products,
    });
    expect(products).toEqual(productsCopy);
  });

  it('does not mutate profile', () => {
    const profile = makeProfile();
    const profileCopy = JSON.parse(JSON.stringify(profile));
    planDay({
      date: '2026-05-04',
      taperDay: 0,
      profile,
      productLib: [makeProduct()],
    });
    expect(profile).toEqual(profileCopy);
  });
});
