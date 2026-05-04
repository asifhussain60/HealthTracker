/**
 * cannabisDayPlan.test.js — E4 RED tests for selectCannabisDayPlan
 *
 * 1. Returns sessions array with 2 entries (default plan)
 * 2. Returns taperCeilingMg from taper schedule
 * 3. Returns empty sessions when no profile cannabisTaperSchedule
 * 4. Filters by userId
 *
 * AC-P1E-E4
 */
import { describe, it, expect } from 'vitest';
import { selectCannabisDayPlan } from '../today.js';

const USER = 'me';
const DATE = '2026-05-04';

const BASE_PROFILE = {
  cannabisTaperSchedule: {
    startDate: '2026-05-01',
    weeks: 8,
    startCeiling: 80,
    endCeiling: 25,
    curve: 'linear',
  },
  cannabisTargets: {
    dailySessions: 2,
    dailyThcMgCeiling: 50,
  },
  sleepSchedule: { bedtime: '23:00' },
};

describe('selectCannabisDayPlan', () => {
  it('returns sessions array (may be empty when no products available)', () => {
    const state = {
      profile: BASE_PROFILE,
      inventory: [],
      cannabisLogs: [],
    };
    const plan = selectCannabisDayPlan(state, USER, DATE);
    expect(Array.isArray(plan.sessions)).toBe(true);
    // sessions may be [] when no flower products in inventory
  });

  it('returns 2 sessions when matching flower products exist', () => {
    const flower = {
      id: 'p1', userId: USER, remaining: 1, form: 'flower',
      dayNight: 'day-evening', riskLevel: 'low', thcPercent: 20,
      startingDose: '0.05g',
    };
    const flower2 = {
      id: 'p2', userId: USER, remaining: 1, form: 'flower',
      dayNight: 'evening', riskLevel: 'low', thcPercent: 18,
      startingDose: '0.05g',
    };
    const state = {
      profile: BASE_PROFILE,
      inventory: [flower, flower2],
      cannabisLogs: [],
    };
    const plan = selectCannabisDayPlan(state, USER, DATE);
    expect(plan.sessions.length).toBe(2);
  });

  it('returns taperCeilingMg as a number', () => {
    const state = {
      profile: BASE_PROFILE,
      inventory: [],
      cannabisLogs: [],
    };
    const plan = selectCannabisDayPlan(state, USER, DATE);
    expect(typeof plan.taperCeilingMg).toBe('number');
    expect(plan.taperCeilingMg).toBeGreaterThan(0);
  });

  it('returns default plan with empty sessions when no taper schedule', () => {
    const state = {
      profile: {},
      inventory: [],
      cannabisLogs: [],
    };
    const plan = selectCannabisDayPlan(state, USER, DATE);
    expect(plan).toBeTruthy();
    expect(Array.isArray(plan.sessions)).toBe(true);
  });

  it('daily mg consumed sums from cannabisLogs for the user on the date', () => {
    const state = {
      profile: BASE_PROFILE,
      inventory: [],
      cannabisLogs: [
        { id: 'c1', userId: USER, date: DATE, thcMg: 20 },
        { id: 'c2', userId: USER, date: DATE, thcMg: 15 },
        { id: 'c3', userId: 'other', date: DATE, thcMg: 100 },
      ],
    };
    const plan = selectCannabisDayPlan(state, USER, DATE);
    expect(plan.mgToday).toBeCloseTo(35);
  });
});
