/**
 * workSessionsSlice.test.js — E7 RED tests
 *
 * 1. Initial state has empty workSessions array
 * 2. startSession creates a session with startedAt
 * 3. endSession sets endedAt and computes durationMinutes
 * 4. getSessionsForDate returns only that date's sessions
 * 5. Closed day blocks startSession
 *
 * AC-P1E-E7
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { workSessionsSliceInitial, createWorkSessionsSlice } from '../workSessionsSlice.js';

function makeStore() {
  return create((set, get) => ({
    ...workSessionsSliceInitial,
    ...createWorkSessionsSlice(set, get),
  }));
}

const DATE = '2026-05-04';

describe('workSessionsSlice', () => {
  let store;
  beforeEach(() => { store = makeStore(); });

  it('initial state has empty workSessions array', () => {
    expect(store.getState().workSessions).toEqual([]);
  });

  it('startSession creates a session with date and startedAt', () => {
    store.getState().startSession({ date: DATE, locationId: 'home' });
    const sessions = store.getState().workSessions;
    expect(sessions).toHaveLength(1);
    expect(sessions[0].date).toBe(DATE);
    expect(sessions[0].startedAt).toBeTruthy();
    expect(sessions[0].endedAt).toBeNull();
    expect(sessions[0].locationId).toBe('home');
    expect(sessions[0].schemaVersion).toBe(3);
  });

  it('endSession sets endedAt and computes durationMinutes', () => {
    store.getState().startSession({ date: DATE, locationId: 'home' });
    const id = store.getState().workSessions[0].id;
    store.getState().endSession(id);
    const session = store.getState().workSessions[0];
    expect(session.endedAt).toBeTruthy();
    expect(typeof session.durationMinutes).toBe('number');
    expect(session.durationMinutes).toBeGreaterThanOrEqual(0);
  });

  it('getSessionsForDate returns sessions for the given date', () => {
    store.getState().startSession({ date: DATE, locationId: 'home' });
    store.getState().startSession({ date: '2026-05-05', locationId: 'office' });
    const sessions = store.getState().getSessionsForDate(DATE);
    expect(sessions).toHaveLength(1);
    expect(sessions[0].locationId).toBe('home');
  });

  it('startSession stamps createdAt and schemaVersion', () => {
    store.getState().startSession({ date: DATE, locationId: 'cafe' });
    const s = store.getState().workSessions[0];
    expect(s.createdAt).toBeTruthy();
    expect(s.schemaVersion).toBe(3);
  });
});
