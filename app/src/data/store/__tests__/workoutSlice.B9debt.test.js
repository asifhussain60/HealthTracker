/**
 * workoutSlice.B9debt.test.js
 *
 * RED-phase tests for B9-DEBT-004:
 *   workoutSlice.addWorkoutLog and addWeightEntry must stamp audit fields
 *   via stampNewRecord when writing records.
 *
 * These tests MUST FAIL until B10 pipes the actions through stampNewRecord.
 * AC-P0-B10
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { create } from 'zustand';
import { workoutSliceInitial, createWorkoutSlice } from '../workoutSlice';

function makeStore(extraInitial = {}) {
  return create((set, get) => ({
    ...workoutSliceInitial,
    profile: { currentWeight: 240 },
    ...extraInitial,
    ...createWorkoutSlice(set, get),
  }));
}

describe('workoutSlice — B9-DEBT-004 audit fields on addWorkoutLog / addWeightEntry', () => {
  let store;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-04T10:00:00.000Z'));
    store = makeStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── addWorkoutLog ────────────────────────────────────────────────────────

  it('addWorkoutLog stamps userId on the record', () => {
    store.getState().addWorkoutLog({ steps: 5000, type: 'walk' });
    const log = store.getState().workoutLogs[0];
    expect(log.userId).toBe('me');
  });

  it('addWorkoutLog stamps createdAt on the record', () => {
    store.getState().addWorkoutLog({ steps: 5000, type: 'walk' });
    const log = store.getState().workoutLogs[0];
    expect(log.createdAt).toBe('2026-05-04T10:00:00.000Z');
  });

  it('addWorkoutLog stamps updatedAt on the record', () => {
    store.getState().addWorkoutLog({ steps: 5000, type: 'walk' });
    const log = store.getState().workoutLogs[0];
    expect(log.updatedAt).toBe('2026-05-04T10:00:00.000Z');
  });

  it('addWorkoutLog stamps createdBy and updatedBy on the record', () => {
    store.getState().addWorkoutLog({ steps: 5000, type: 'walk' });
    const log = store.getState().workoutLogs[0];
    expect(log.createdBy).toBe('me');
    expect(log.updatedBy).toBe('me');
  });

  it('addWorkoutLog stamps deletedAt: null on the record', () => {
    store.getState().addWorkoutLog({ steps: 5000, type: 'walk' });
    const log = store.getState().workoutLogs[0];
    expect(log.deletedAt).toBeNull();
  });

  it('addWorkoutLog stamps schemaVersion: 3 on the record', () => {
    store.getState().addWorkoutLog({ steps: 5000, type: 'walk' });
    const log = store.getState().workoutLogs[0];
    expect(log.schemaVersion).toBe(3);
  });

  // ── addWeightEntry ───────────────────────────────────────────────────────

  it('addWeightEntry stamps userId on the record', () => {
    store.getState().addWeightEntry(240, '2026-05-04');
    const entry = store.getState().weightHistory[0];
    expect(entry.userId).toBe('me');
  });

  it('addWeightEntry stamps createdAt on the record', () => {
    store.getState().addWeightEntry(240, '2026-05-04');
    const entry = store.getState().weightHistory[0];
    expect(entry.createdAt).toBe('2026-05-04T10:00:00.000Z');
  });

  it('addWeightEntry stamps deletedAt: null on the record', () => {
    store.getState().addWeightEntry(240, '2026-05-04');
    const entry = store.getState().weightHistory[0];
    expect(entry.deletedAt).toBeNull();
  });

  it('addWeightEntry stamps schemaVersion: 3 on the record', () => {
    store.getState().addWeightEntry(240, '2026-05-04');
    const entry = store.getState().weightHistory[0];
    expect(entry.schemaVersion).toBe(3);
  });
});
