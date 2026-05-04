/**
 * thcMath.test.js — RED phase tests for thcMath calculator
 *
 * Covers: calculateThcMg, dailyThcTotal, weeklyThcTotal, thcCeilingStatus
 * All inputs are parameters — no store, no Date.now(), no React.
 */

import { describe, it, expect } from 'vitest';
import {
  calculateThcMg,
  dailyThcTotal,
  weeklyThcTotal,
  thcCeilingStatus,
} from '../thcMath.js';

// ── calculateThcMg ────────────────────────────────────────────────────────────

describe('calculateThcMg — flower/inhalation (thcPercent, grams)', () => {
  it.each([
    // [amount, unit, thcPercent, form, bioavailability, expected]
    // 0.05g × 1000 mg/g × 0.20 THC × 0.30 bioavail = 3.0 mg
    [0.05, 'g', 20, 'flower', 0.30, 3.0],
    // 0.1g × 1000 × 0.25 × 0.30 = 7.5
    [0.1, 'g', 25, 'flower', 0.30, 7.5],
    // 0g = 0
    [0, 'g', 20, 'flower', 0.30, 0],
    // 0.05g × 1000 × 0.18 × 0.30 = 2.7
    [0.05, 'g', 18, 'flower', 0.30, 2.7],
  ])(
    'amount=%s%s thcPercent=%s form=%s bioavail=%s → %s mg',
    (amount, unit, thcPercent, form, bioavailability, expected) => {
      expect(calculateThcMg({ amount, unit, thcPercent, form, bioavailability })).toBeCloseTo(
        expected,
        2
      );
    }
  );
});

describe('calculateThcMg — capsule/oral (thcMgPerUnit)', () => {
  it.each([
    // oral capsule: amount (units) × thcMgPerUnit × oralBioavail
    // 1 cap × 10 mg × 0.20 = 2.0 mg
    [1, 'cap', null, 'capsule', 0.20, 10, 2.0],
    // 2 caps × 5 mg × 0.20 = 2.0 mg
    [2, 'cap', null, 'capsule', 0.20, 5, 2.0],
    // 0 caps = 0
    [0, 'cap', null, 'capsule', 0.20, 10, 0],
  ])(
    'amount=%s%s form=%s oral bioavail=%s thcMgPerUnit=%s → %s mg',
    (amount, unit, _thcPercent, form, bioavailability, thcMgPerUnit, expected) => {
      expect(
        calculateThcMg({ amount, unit, thcPercent: null, thcMgPerUnit, form, bioavailability })
      ).toBeCloseTo(expected, 2);
    }
  );
});

describe('calculateThcMg — edible/tincture (thcMgPerUnit, oral)', () => {
  it.each([
    // edible: 1 unit × 25 mg × 0.20 = 5.0 mg
    [1, 'unit', 'edible', 0.20, 25, 5.0],
    // tincture: 2 × 15 × 0.20 = 6.0 mg
    [2, 'ml', 'tincture', 0.20, 15, 6.0],
  ])(
    'amount=%s form=%s oral bioavail=%s thcMgPerUnit=%s → %s mg',
    (amount, unit, form, bioavailability, thcMgPerUnit, expected) => {
      expect(
        calculateThcMg({ amount, unit, thcPercent: null, thcMgPerUnit, form, bioavailability })
      ).toBeCloseTo(expected, 2);
    }
  );
});

describe('calculateThcMg — edge cases', () => {
  it('returns 0 when both thcPercent and thcMgPerUnit are null', () => {
    expect(
      calculateThcMg({ amount: 1, unit: 'g', thcPercent: null, thcMgPerUnit: null, form: 'flower', bioavailability: 0.30 })
    ).toBe(0);
  });

  it('returns 0 when bioavailability is 0', () => {
    expect(
      calculateThcMg({ amount: 0.1, unit: 'g', thcPercent: 20, form: 'flower', bioavailability: 0 })
    ).toBe(0);
  });
});

// ── dailyThcTotal ─────────────────────────────────────────────────────────────

describe('dailyThcTotal', () => {
  const sessions = [
    { date: '2026-05-01', thcMg: 3.0 },
    { date: '2026-05-01', thcMg: 5.5 },
    { date: '2026-05-02', thcMg: 4.0 },
    { date: '2026-05-01', thcMg: 2.5 },
  ];

  it('sums thcMg for the given date', () => {
    expect(dailyThcTotal(sessions, '2026-05-01')).toBeCloseTo(11.0, 2);
  });

  it('returns only sessions on the given date', () => {
    expect(dailyThcTotal(sessions, '2026-05-02')).toBeCloseTo(4.0, 2);
  });

  it('returns 0 when no sessions on given date', () => {
    expect(dailyThcTotal(sessions, '2026-05-03')).toBe(0);
  });

  it('returns 0 for empty sessions array', () => {
    expect(dailyThcTotal([], '2026-05-01')).toBe(0);
  });

  it('handles sessions with missing thcMg (treats as 0)', () => {
    const sessionsWithMissing = [
      { date: '2026-05-01', thcMg: 3.0 },
      { date: '2026-05-01' }, // no thcMg
    ];
    expect(dailyThcTotal(sessionsWithMissing, '2026-05-01')).toBeCloseTo(3.0, 2);
  });
});

// ── weeklyThcTotal ────────────────────────────────────────────────────────────

describe('weeklyThcTotal', () => {
  // Build sessions spanning two weeks
  const sessions = [
    { date: '2026-04-27', thcMg: 10 }, // Sun before week
    { date: '2026-04-28', thcMg: 5 },  // day 0 of week (Mon-indexed? weekStart is Mon 04-28)
    { date: '2026-04-29', thcMg: 6 },
    { date: '2026-04-30', thcMg: 7 },
    { date: '2026-05-01', thcMg: 4 },
    { date: '2026-05-02', thcMg: 3 },
    { date: '2026-05-03', thcMg: 2 },
    { date: '2026-05-04', thcMg: 1 },  // day 6 of week
    { date: '2026-05-05', thcMg: 20 }, // outside week
  ];

  it('sums thcMg for 7 days starting from weekStartDate (inclusive)', () => {
    // Week: 2026-04-28 through 2026-05-04 = 5+6+7+4+3+2+1 = 28
    expect(weeklyThcTotal(sessions, '2026-04-28')).toBeCloseTo(28, 2);
  });

  it('excludes sessions before weekStartDate', () => {
    // Week: 2026-04-29 through 2026-05-05 = 6+7+4+3+2+1+20 = 43
    expect(weeklyThcTotal(sessions, '2026-04-29')).toBeCloseTo(43, 2);
  });

  it('returns 0 for empty sessions', () => {
    expect(weeklyThcTotal([], '2026-04-28')).toBe(0);
  });

  it('returns 0 when no sessions in the 7-day window', () => {
    expect(weeklyThcTotal(sessions, '2026-06-01')).toBe(0);
  });
});

// ── thcCeilingStatus ──────────────────────────────────────────────────────────

describe('thcCeilingStatus', () => {
  it.each([
    // [dailyMg, ceilingMg, expected]
    [0, 50, 'under'],
    [25, 50, 'under'],         // 50% of ceiling — under
    [39, 50, 'under'],         // just under 80%
    [40, 50, 'near'],          // exactly 80% — near
    [45, 50, 'near'],          // 90% — near
    [49, 50, 'near'],          // just under ceiling
    [50, 50, 'over'],          // exactly at ceiling
    [60, 50, 'over'],          // over
    [0, 80, 'under'],
    [63, 80, 'under'],         // 78.75% — under
    [64, 80, 'near'],          // 80% — near
    [80, 80, 'over'],          // at ceiling
    [100, 80, 'over'],         // over
  ])(
    'dailyMg=%s ceilingMg=%s → %s',
    (dailyMg, ceilingMg, expected) => {
      expect(thcCeilingStatus(dailyMg, ceilingMg)).toBe(expected);
    }
  );

  it('handles 0 ceiling gracefully (returns over when consumed > 0)', () => {
    expect(thcCeilingStatus(1, 0)).toBe('over');
  });

  it('returns under when both dailyMg and ceilingMg are 0', () => {
    expect(thcCeilingStatus(0, 0)).toBe('under');
  });
});
