import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { workoutSliceInitial, createWorkoutSlice } from '../workoutSlice';

function makeStore(extraInitial = {}) {
  return create((set, get) => ({
    ...workoutSliceInitial,
    ...extraInitial,
    ...createWorkoutSlice(set, get),
  }));
}

describe('workoutSlice — unit', () => {
  let store;
  beforeEach(() => {
    store = makeStore();
  });

  it('initial state has empty workoutLogs and weightHistory', () => {
    const state = store.getState();
    expect(state.workoutLogs).toEqual([]);
    expect(state.weightHistory).toEqual([]);
  });

  it('addWorkoutLog appends an entry with auto-generated id', () => {
    store.getState().addWorkoutLog({ steps: 4000, type: 'Walk' });
    const { workoutLogs } = store.getState();
    expect(workoutLogs).toHaveLength(1);
    expect(workoutLogs[0].id).toBeTruthy();
    expect(workoutLogs[0].steps).toBe(4000);
  });

  it('addWorkoutLog stamps a date when not provided', () => {
    store.getState().addWorkoutLog({ steps: 1000 });
    expect(store.getState().workoutLogs[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('deleteWorkoutLog removes entry by id', () => {
    store.getState().addWorkoutLog({ steps: 4000 });
    const id = store.getState().workoutLogs[0].id;
    store.getState().deleteWorkoutLog(id);
    expect(store.getState().workoutLogs).toHaveLength(0);
  });

  it('addWeightEntry appends a new entry', () => {
    store.getState().addWeightEntry(240.0, '2026-05-01');
    const { weightHistory } = store.getState();
    expect(weightHistory).toHaveLength(1);
    expect(weightHistory[0].weight).toBe(240.0);
    expect(weightHistory[0].date).toBe('2026-05-01');
  });

  it('addWeightEntry updates existing entry for same date', () => {
    store.getState().addWeightEntry(240.0, '2026-05-01');
    store.getState().addWeightEntry(239.5, '2026-05-01');
    const { weightHistory } = store.getState();
    expect(weightHistory).toHaveLength(1);
    expect(weightHistory[0].weight).toBe(239.5);
  });

  it('getTodayWorkoutLog returns entry for today', () => {
    const today = new Date().toISOString().slice(0, 10);
    store.setState({
      workoutLogs: [
        { id: '1', date: today, steps: 5000 },
        { id: '2', date: '2020-01-01', steps: 100 },
      ],
    });
    const result = store.getState().getTodayWorkoutLog();
    expect(result).not.toBeNull();
    expect(result.id).toBe('1');
  });

  it('getTodayWorkoutLog returns null if no entry today', () => {
    store.setState({ workoutLogs: [{ id: '1', date: '2020-01-01', steps: 100 }] });
    expect(store.getState().getTodayWorkoutLog()).toBeNull();
  });
});
