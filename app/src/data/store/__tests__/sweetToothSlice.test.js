/**
 * sweetToothSlice.test.js — E6 RED tests
 *
 * 1. Initial state has empty dailySlips
 * 2. addSlip appends a slip for a date
 * 3. addSlip stamps audit fields (schemaVersion, createdAt)
 * 4. Deletes are blocked — removeSlip throws
 * 5. getStreakDays returns 14-day window correctly
 *
 * AC-P1E-E6
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { sweetToothSliceInitial, createSweetToothSlice } from '../sweetToothSlice.js';

function makeStore() {
  return create((set, get) => ({
    ...sweetToothSliceInitial,
    ...createSweetToothSlice(set, get),
  }));
}

const DATE = '2026-05-04';

describe('sweetToothSlice', () => {
  let store;
  beforeEach(() => { store = makeStore(); });

  it('initial state has empty dailySlips', () => {
    expect(store.getState().dailySlips).toEqual({});
  });

  it('addSlip appends a slip to the date', () => {
    store.getState().addSlip(DATE, 'chocolate');
    const slips = store.getState().dailySlips[DATE];
    expect(slips).toHaveLength(1);
    expect(slips[0].item).toBe('chocolate');
  });

  it('addSlip stamps schemaVersion and createdAt', () => {
    store.getState().addSlip(DATE, 'candy');
    const slip = store.getState().dailySlips[DATE][0];
    expect(slip.schemaVersion).toBe(3);
    expect(slip.createdAt).toBeTruthy();
  });

  it('addSlip is append-only — same date accumulates', () => {
    store.getState().addSlip(DATE, 'chocolate');
    store.getState().addSlip(DATE, 'candy');
    expect(store.getState().dailySlips[DATE]).toHaveLength(2);
  });

  it('removeSlip throws SweetToothDeleteBlockedError', () => {
    store.getState().addSlip(DATE, 'mints');
    const id = store.getState().dailySlips[DATE][0].id;
    expect(() => store.getState().removeSlip(id)).toThrow();
  });

  it('getStreakDays returns a 14-day window array with slip counts', () => {
    store.getState().addSlip('2026-05-01', 'chocolate');
    store.getState().addSlip('2026-05-02', 'candy');
    const streak = store.getState().getStreakDays(DATE, 14);
    expect(streak).toHaveLength(14);
    // Each entry: { date, slipCount }
    const may1 = streak.find((d) => d.date === '2026-05-01');
    expect(may1.slipCount).toBe(1);
    const may4 = streak.find((d) => d.date === '2026-05-04');
    expect(may4.slipCount).toBe(0);
  });
});
