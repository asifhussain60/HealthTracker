/**
 * weightSessionsSlice.test.js — E3 RED tests
 *
 * 1. Initial state has empty weightSessions array
 * 2. addWeightSession appends session with audit fields
 * 3. Adding a 3rd weight session on same day throws WeightCapExceededError
 * 4. removeWeightSession removes by id
 * 5. getWeightSessionsForDate returns only that date's sessions
 *
 * AC-P1E-E3
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { weightSessionsSliceInitial, createWeightSessionsSlice, WeightCapExceededError } from '../weightSessionsSlice.js';

function makeStore() {
  return create((set, get) => ({
    ...weightSessionsSliceInitial,
    ...createWeightSessionsSlice(set, get),
  }));
}

const DATE = '2026-05-04';

describe('weightSessionsSlice', () => {
  let store;
  beforeEach(() => { store = makeStore(); });

  it('initial state has empty weightSessions array', () => {
    expect(store.getState().weightSessions).toEqual([]);
  });

  it('addWeightSession appends a session with audit fields', () => {
    store.getState().addWeightSession({ date: DATE, routineId: 'r1', routineName: 'Upper Body' });
    const { weightSessions } = store.getState();
    expect(weightSessions).toHaveLength(1);
    expect(weightSessions[0].id).toBeTruthy();
    expect(weightSessions[0].date).toBe(DATE);
    expect(weightSessions[0].createdAt).toBeTruthy();
    expect(weightSessions[0].schemaVersion).toBe(3);
  });

  it('throws WeightCapExceededError when adding a 3rd session on same day', () => {
    store.getState().addWeightSession({ date: DATE, routineId: 'r1' });
    store.getState().addWeightSession({ date: DATE, routineId: 'r2' });
    expect(() =>
      store.getState().addWeightSession({ date: DATE, routineId: 'r3' })
    ).toThrow(WeightCapExceededError);
  });

  it('removeWeightSession removes by id', () => {
    store.getState().addWeightSession({ date: DATE, routineId: 'r1' });
    const id = store.getState().weightSessions[0].id;
    store.getState().removeWeightSession(id);
    expect(store.getState().weightSessions).toHaveLength(0);
  });

  it('getWeightSessionsForDate returns only sessions for the given date', () => {
    store.getState().addWeightSession({ date: DATE, routineId: 'r1' });
    store.getState().addWeightSession({ date: '2026-05-05', routineId: 'r2' });
    const sessions = store.getState().getWeightSessionsForDate(DATE);
    expect(sessions).toHaveLength(1);
    expect(sessions[0].routineId).toBe('r1');
  });
});
