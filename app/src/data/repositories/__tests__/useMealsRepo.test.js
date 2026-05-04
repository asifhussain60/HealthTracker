/**
 * useMealsRepo.test.js
 *
 * Per-repo unit tests for useMealsRepo.
 * Uses the real combined store (integration-style) with state reset between tests.
 * RED phase — ../useMealsRepo.js doesn't exist yet; tests fail with module-not-found.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStore } from '../../store';
import { useMealsRepo } from '../useMealsRepo.js';

function resetStore() {
  useStore.setState({ mealTemplates: [] });
}

describe('useMealsRepo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-04T10:00:00.000Z'));
    resetStore();
  });

  // ── listMealTemplates ───────────────────────────────────────────────

  describe('listMealTemplates()', () => {
    it('returns empty array when no templates', () => {
      const { result } = renderHook(() => useMealsRepo());
      expect(result.current.listMealTemplates()).toEqual([]);
    });

    it('returns all meal templates from store', () => {
      useStore.setState({
        mealTemplates: [{ id: 't1', name: 'Oatmeal' }],
      });
      const { result } = renderHook(() => useMealsRepo());
      expect(result.current.listMealTemplates()).toHaveLength(1);
    });

    it('return value is not a Promise', () => {
      const { result } = renderHook(() => useMealsRepo());
      const ret = result.current.listMealTemplates();
      expect(ret).not.toBeInstanceOf(Promise);
      expect(typeof ret.then).toBe('undefined');
    });
  });

  // ── getMealTemplate ─────────────────────────────────────────────────

  describe('getMealTemplate(id)', () => {
    it('returns matching template by id', () => {
      useStore.setState({
        mealTemplates: [
          { id: 't1', name: 'Oatmeal' },
          { id: 't2', name: 'Eggs' },
        ],
      });
      const { result } = renderHook(() => useMealsRepo());
      expect(result.current.getMealTemplate('t2').name).toBe('Eggs');
    });

    it('returns undefined for unknown id', () => {
      useStore.setState({ mealTemplates: [{ id: 't1', name: 'Oatmeal' }] });
      const { result } = renderHook(() => useMealsRepo());
      expect(result.current.getMealTemplate('nope')).toBeUndefined();
    });

    it('return value is not a Promise', () => {
      const { result } = renderHook(() => useMealsRepo());
      const ret = result.current.getMealTemplate('any');
      expect(ret).not.toBeInstanceOf(Promise);
      expect(typeof ret?.then).toBe('undefined');
    });
  });

  // ── addMealTemplate ─────────────────────────────────────────────────

  describe('addMealTemplate(input)', () => {
    it('stamps audit fields on new meal template', () => {
      const { result } = renderHook(() => useMealsRepo());
      let record;
      act(() => {
        record = result.current.addMealTemplate({ name: 'Oatmeal', calories: 350 });
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

    it('preserves input fields on returned record', () => {
      const { result } = renderHook(() => useMealsRepo());
      let record;
      act(() => {
        record = result.current.addMealTemplate({ name: 'Oatmeal', calories: 350 });
      });
      expect(record.name).toBe('Oatmeal');
      expect(record.calories).toBe(350);
    });

    it('adds template to the store', () => {
      const { result } = renderHook(() => useMealsRepo());
      act(() => {
        result.current.addMealTemplate({ name: 'Oatmeal' });
      });
      expect(result.current.listMealTemplates()).toHaveLength(1);
    });

    it('return value is not a Promise', () => {
      const { result } = renderHook(() => useMealsRepo());
      let ret;
      act(() => {
        ret = result.current.addMealTemplate({ name: 'X' });
      });
      expect(ret).not.toBeInstanceOf(Promise);
      expect(typeof ret.then).toBe('undefined');
    });
  });

  // ── updateMealTemplate ──────────────────────────────────────────────

  describe('updateMealTemplate(id, patch)', () => {
    it('bumps updatedAt/updatedBy and preserves createdAt/createdBy', () => {
      const existing = {
        id: 't1',
        name: 'Oatmeal',
        userId: 'me',
        createdAt: '2020-01-01T00:00:00.000Z',
        createdBy: 'me',
        updatedAt: '2020-01-01T00:00:00.000Z',
        updatedBy: 'me',
        deletedAt: null,
        schemaVersion: 3,
      };
      useStore.setState({ mealTemplates: [existing] });
      const { result } = renderHook(() => useMealsRepo());
      let updated;
      act(() => {
        updated = result.current.updateMealTemplate('t1', { name: 'Oatmeal Plus' });
      });
      expect(updated.name).toBe('Oatmeal Plus');
      expect(updated.createdAt).toBe('2020-01-01T00:00:00.000Z');
      expect(updated.updatedAt).toBe('2026-05-04T10:00:00.000Z');
    });

    it('returns undefined for unknown id', () => {
      const { result } = renderHook(() => useMealsRepo());
      let ret;
      act(() => {
        ret = result.current.updateMealTemplate('nope', { name: 'X' });
      });
      expect(ret).toBeUndefined();
    });

    it('return value is not a Promise', () => {
      useStore.setState({
        mealTemplates: [{ id: 't1', name: 'A', updatedAt: '2020-01-01T00:00:00.000Z' }],
      });
      const { result } = renderHook(() => useMealsRepo());
      let ret;
      act(() => {
        ret = result.current.updateMealTemplate('t1', { name: 'B' });
      });
      expect(ret).not.toBeInstanceOf(Promise);
    });
  });

  // ── removeMealTemplate ──────────────────────────────────────────────

  describe('removeMealTemplate(id)', () => {
    it('soft-deletes template by setting deletedAt', () => {
      const existing = {
        id: 't1',
        name: 'Oatmeal',
        deletedAt: null,
        updatedAt: '2020-01-01T00:00:00.000Z',
        updatedBy: 'me',
      };
      useStore.setState({ mealTemplates: [existing] });
      const { result } = renderHook(() => useMealsRepo());
      let removed;
      act(() => {
        removed = result.current.removeMealTemplate('t1');
      });
      expect(removed.deletedAt).toBe('2026-05-04T10:00:00.000Z');
      expect(removed.updatedAt).toBe('2026-05-04T10:00:00.000Z');
    });

    it('returns undefined for unknown id', () => {
      const { result } = renderHook(() => useMealsRepo());
      let ret;
      act(() => {
        ret = result.current.removeMealTemplate('nope');
      });
      expect(ret).toBeUndefined();
    });

    it('return value is not a Promise', () => {
      useStore.setState({
        mealTemplates: [{ id: 't1', name: 'A', deletedAt: null }],
      });
      const { result } = renderHook(() => useMealsRepo());
      let ret;
      act(() => {
        ret = result.current.removeMealTemplate('t1');
      });
      expect(ret).not.toBeInstanceOf(Promise);
    });
  });
});
