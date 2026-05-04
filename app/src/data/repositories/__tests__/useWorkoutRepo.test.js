/**
 * useWorkoutRepo.test.js
 *
 * Per-repo unit tests for useWorkoutRepo.
 * Uses the real combined store (integration-style) with state reset between tests.
 * RED phase — ../useWorkoutRepo.js doesn't exist yet; tests fail with module-not-found.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStore } from '../../store';
import { useWorkoutRepo } from '../useWorkoutRepo.js';

function resetStore() {
  useStore.setState({ workoutLogs: [], weightHistory: [] });
}

describe('useWorkoutRepo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-04T10:00:00.000Z'));
    resetStore();
  });

  // ── listWorkoutLogs ─────────────────────────────────────────────────

  describe('listWorkoutLogs(date?)', () => {
    it('returns empty array when no logs', () => {
      const { result } = renderHook(() => useWorkoutRepo());
      expect(result.current.listWorkoutLogs()).toEqual([]);
    });

    it('returns all logs when no date filter', () => {
      useStore.setState({
        workoutLogs: [
          { id: 'w1', date: '2026-05-04' },
          { id: 'w2', date: '2026-05-03' },
        ],
      });
      const { result } = renderHook(() => useWorkoutRepo());
      expect(result.current.listWorkoutLogs()).toHaveLength(2);
    });

    it('filters by date when provided', () => {
      useStore.setState({
        workoutLogs: [
          { id: 'w1', date: '2026-05-04' },
          { id: 'w2', date: '2026-05-03' },
        ],
      });
      const { result } = renderHook(() => useWorkoutRepo());
      const logs = result.current.listWorkoutLogs('2026-05-04');
      expect(logs).toHaveLength(1);
      expect(logs[0].id).toBe('w1');
    });

    it('return value is not a Promise', () => {
      const { result } = renderHook(() => useWorkoutRepo());
      const ret = result.current.listWorkoutLogs();
      expect(ret).not.toBeInstanceOf(Promise);
      expect(typeof ret.then).toBe('undefined');
    });
  });

  // ── addWorkoutLog ───────────────────────────────────────────────────

  describe('addWorkoutLog(input)', () => {
    it('stamps audit fields on new workout log', () => {
      const { result } = renderHook(() => useWorkoutRepo());
      let record;
      act(() => {
        record = result.current.addWorkoutLog({ type: 'walk', steps: 8000 });
      });
      expect(record.id).toBeTruthy();
      expect(record.userId).toBe('me');
      expect(record.createdAt).toBe('2026-05-04T10:00:00.000Z');
      expect(record.updatedAt).toBe('2026-05-04T10:00:00.000Z');
      expect(record.createdBy).toBe('me');
      expect(record.updatedBy).toBe('me');
      expect(record.deletedAt).toBeNull();
      expect(record.schemaVersion).toBe(3);
    });

    it('preserves input fields', () => {
      const { result } = renderHook(() => useWorkoutRepo());
      let record;
      act(() => {
        record = result.current.addWorkoutLog({ type: 'walk', steps: 8000 });
      });
      expect(record.type).toBe('walk');
      expect(record.steps).toBe(8000);
    });

    it('adds log to the store', () => {
      const { result } = renderHook(() => useWorkoutRepo());
      act(() => {
        result.current.addWorkoutLog({ type: 'walk', steps: 8000 });
      });
      expect(result.current.listWorkoutLogs()).toHaveLength(1);
    });

    it('return value is not a Promise', () => {
      const { result } = renderHook(() => useWorkoutRepo());
      let ret;
      act(() => {
        ret = result.current.addWorkoutLog({ type: 'walk' });
      });
      expect(ret).not.toBeInstanceOf(Promise);
      expect(typeof ret.then).toBe('undefined');
    });
  });

  // ── removeWorkoutLog ────────────────────────────────────────────────

  describe('removeWorkoutLog(id)', () => {
    it('soft-deletes workout log by setting deletedAt', () => {
      const existing = {
        id: 'w1',
        type: 'walk',
        deletedAt: null,
        updatedAt: '2020-01-01T00:00:00.000Z',
        updatedBy: 'me',
      };
      useStore.setState({ workoutLogs: [existing] });
      const { result } = renderHook(() => useWorkoutRepo());
      let removed;
      act(() => {
        removed = result.current.removeWorkoutLog('w1');
      });
      expect(removed.deletedAt).toBe('2026-05-04T10:00:00.000Z');
    });

    it('returns undefined for unknown id', () => {
      const { result } = renderHook(() => useWorkoutRepo());
      let ret;
      act(() => {
        ret = result.current.removeWorkoutLog('nope');
      });
      expect(ret).toBeUndefined();
    });

    it('return value is not a Promise', () => {
      useStore.setState({
        workoutLogs: [{ id: 'w1', type: 'walk', deletedAt: null }],
      });
      const { result } = renderHook(() => useWorkoutRepo());
      let ret;
      act(() => {
        ret = result.current.removeWorkoutLog('w1');
      });
      expect(ret).not.toBeInstanceOf(Promise);
    });
  });

  // ── listWeightHistory ───────────────────────────────────────────────

  describe('listWeightHistory()', () => {
    it('returns empty array when no weight entries', () => {
      const { result } = renderHook(() => useWorkoutRepo());
      expect(result.current.listWeightHistory()).toEqual([]);
    });

    it('returns all weight history entries', () => {
      useStore.setState({
        weightHistory: [
          { date: '2026-05-01', weight: 210 },
          { date: '2026-05-04', weight: 209 },
        ],
      });
      const { result } = renderHook(() => useWorkoutRepo());
      expect(result.current.listWeightHistory()).toHaveLength(2);
    });

    it('return value is not a Promise', () => {
      const { result } = renderHook(() => useWorkoutRepo());
      const ret = result.current.listWeightHistory();
      expect(ret).not.toBeInstanceOf(Promise);
      expect(typeof ret.then).toBe('undefined');
    });
  });

  // ── addWeightEntry ──────────────────────────────────────────────────

  describe('addWeightEntry(input)', () => {
    it('stamps audit fields on new weight entry', () => {
      const { result } = renderHook(() => useWorkoutRepo());
      let record;
      act(() => {
        record = result.current.addWeightEntry({ date: '2026-05-04', weight: 209 });
      });
      expect(record.id).toBeTruthy();
      expect(record.userId).toBe('me');
      expect(record.createdAt).toBe('2026-05-04T10:00:00.000Z');
      expect(record.deletedAt).toBeNull();
      expect(record.schemaVersion).toBe(3);
    });

    it('preserves weight and date fields', () => {
      const { result } = renderHook(() => useWorkoutRepo());
      let record;
      act(() => {
        record = result.current.addWeightEntry({ date: '2026-05-04', weight: 209 });
      });
      expect(record.weight).toBe(209);
      expect(record.date).toBe('2026-05-04');
    });

    it('adds entry to the store weightHistory', () => {
      const { result } = renderHook(() => useWorkoutRepo());
      act(() => {
        result.current.addWeightEntry({ date: '2026-05-04', weight: 209 });
      });
      expect(result.current.listWeightHistory()).toHaveLength(1);
    });

    it('return value is not a Promise', () => {
      const { result } = renderHook(() => useWorkoutRepo());
      let ret;
      act(() => {
        ret = result.current.addWeightEntry({ date: '2026-05-04', weight: 209 });
      });
      expect(ret).not.toBeInstanceOf(Promise);
      expect(typeof ret.then).toBe('undefined');
    });
  });

  // ── getTodayWorkoutLog ──────────────────────────────────────────────

  describe('getTodayWorkoutLog()', () => {
    it('returns null when no log for today', () => {
      const { result } = renderHook(() => useWorkoutRepo());
      expect(result.current.getTodayWorkoutLog()).toBeNull();
    });

    it('returns log for today when it exists', () => {
      useStore.setState({
        workoutLogs: [
          { id: 'w1', date: '2026-05-04', type: 'walk' },
          { id: 'w2', date: '2026-05-03', type: 'weights' },
        ],
      });
      const { result } = renderHook(() => useWorkoutRepo());
      const log = result.current.getTodayWorkoutLog();
      expect(log).not.toBeNull();
      expect(log.id).toBe('w1');
    });

    it('return value is not a Promise (null is fine)', () => {
      const { result } = renderHook(() => useWorkoutRepo());
      const ret = result.current.getTodayWorkoutLog();
      expect(ret).not.toBeInstanceOf(Promise);
      expect(ret).toBeNull();
    });
  });
});
