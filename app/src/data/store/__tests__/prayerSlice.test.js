/**
 * prayerSlice.test.js — E2 RED tests
 *
 * 1. Initial state has empty prayers object
 * 2. togglePrayer marks a prayer as done
 * 3. togglePrayer un-marks a prayer on second tap
 * 4. getPrayerStatus returns correct status
 * 5. Audit fields are stamped on toggle
 *
 * AC-P1E-E2
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { prayerSliceInitial, createPrayerSlice } from '../prayerSlice.js';

function makeStore() {
  return create((set, get) => ({
    ...prayerSliceInitial,
    ...createPrayerSlice(set, get),
  }));
}

const DATE = '2026-05-04';
const PRAYER = 'fajr';

describe('prayerSlice', () => {
  let store;
  beforeEach(() => { store = makeStore(); });

  it('initial state has empty prayers object', () => {
    expect(store.getState().prayers).toEqual({});
  });

  it('togglePrayer marks a prayer as done for a date', () => {
    store.getState().togglePrayer(DATE, PRAYER);
    const status = store.getState().prayers?.[DATE]?.[PRAYER];
    expect(status?.done).toBe(true);
  });

  it('togglePrayer un-marks a prayer on second call (toggle off)', () => {
    store.getState().togglePrayer(DATE, PRAYER);
    store.getState().togglePrayer(DATE, PRAYER);
    const status = store.getState().prayers?.[DATE]?.[PRAYER];
    expect(status?.done).toBe(false);
  });

  it('getPrayerStatus returns done=false for an untouched prayer', () => {
    const status = store.getState().getPrayerStatus(DATE, PRAYER);
    expect(status.done).toBe(false);
  });

  it('getPrayerStatus returns done=true after toggle', () => {
    store.getState().togglePrayer(DATE, PRAYER);
    const status = store.getState().getPrayerStatus(DATE, PRAYER);
    expect(status.done).toBe(true);
  });

  it('togglePrayer stamps updatedAt on the prayer record', () => {
    store.getState().togglePrayer(DATE, PRAYER);
    const status = store.getState().prayers[DATE][PRAYER];
    expect(status.updatedAt).toBeTruthy();
    expect(typeof status.updatedAt).toBe('string');
  });
});
