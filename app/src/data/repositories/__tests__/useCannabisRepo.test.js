/**
 * useCannabisRepo.test.js
 *
 * Per-repo unit tests for useCannabisRepo.
 * Uses the real combined store (integration-style) with state reset between tests.
 * RED phase — ../useCannabisRepo.js doesn't exist yet; tests fail with module-not-found.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStore } from '../../store';
import { useCannabisRepo } from '../useCannabisRepo.js';

function resetStore() {
  useStore.setState({
    inventory: [],
    cannabisLogs: [],
  });
}

describe('useCannabisRepo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-04T10:00:00.000Z'));
    resetStore();
  });

  // ── listProducts ────────────────────────────────────────────────────

  describe('listProducts()', () => {
    it('returns empty array when no products in store', () => {
      const { result } = renderHook(() => useCannabisRepo());
      expect(result.current.listProducts()).toEqual([]);
    });

    it('returns current inventory', () => {
      useStore.setState({
        inventory: [{ id: 'p1', name: 'Flower A', remaining: 1.5 }],
      });
      const { result } = renderHook(() => useCannabisRepo());
      expect(result.current.listProducts()).toHaveLength(1);
      expect(result.current.listProducts()[0].id).toBe('p1');
    });

    it('return value is not a Promise', () => {
      const { result } = renderHook(() => useCannabisRepo());
      const ret = result.current.listProducts();
      expect(ret).not.toBeInstanceOf(Promise);
      expect(typeof ret.then).toBe('undefined');
    });
  });

  // ── getProduct ──────────────────────────────────────────────────────

  describe('getProduct(id)', () => {
    it('returns matching product by id', () => {
      useStore.setState({
        inventory: [
          { id: 'p1', name: 'Flower A' },
          { id: 'p2', name: 'Flower B' },
        ],
      });
      const { result } = renderHook(() => useCannabisRepo());
      expect(result.current.getProduct('p1').name).toBe('Flower A');
    });

    it('returns undefined for unknown id', () => {
      useStore.setState({ inventory: [{ id: 'p1', name: 'Flower A' }] });
      const { result } = renderHook(() => useCannabisRepo());
      expect(result.current.getProduct('nope')).toBeUndefined();
    });

    it('return value is not a Promise', () => {
      const { result } = renderHook(() => useCannabisRepo());
      const ret = result.current.getProduct('any');
      expect(ret).not.toBeInstanceOf(Promise);
      expect(typeof ret?.then).toBe('undefined');
    });
  });

  // ── addProduct ──────────────────────────────────────────────────────

  describe('addProduct(input)', () => {
    it('stamps audit fields on new product', () => {
      const { result } = renderHook(() => useCannabisRepo());
      let record;
      act(() => {
        record = result.current.addProduct({ name: 'Test Flower', thcPct: 20 });
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
      const { result } = renderHook(() => useCannabisRepo());
      let record;
      act(() => {
        record = result.current.addProduct({ name: 'Test Flower', thcPct: 20 });
      });
      expect(record.name).toBe('Test Flower');
      expect(record.thcPct).toBe(20);
    });

    it('adds product to the store inventory', () => {
      const { result } = renderHook(() => useCannabisRepo());
      act(() => {
        result.current.addProduct({ name: 'Test Flower' });
      });
      expect(result.current.listProducts()).toHaveLength(1);
    });

    it('return value is not a Promise', () => {
      const { result } = renderHook(() => useCannabisRepo());
      let ret;
      act(() => {
        ret = result.current.addProduct({ name: 'X' });
      });
      expect(ret).not.toBeInstanceOf(Promise);
      expect(typeof ret.then).toBe('undefined');
    });
  });

  // ── updateProduct ───────────────────────────────────────────────────

  describe('updateProduct(id, patch)', () => {
    it('bumps updatedAt and updatedBy but preserves createdAt and createdBy', () => {
      const existing = {
        id: 'p1',
        name: 'Flower A',
        userId: 'me',
        createdAt: '2020-01-01T00:00:00.000Z',
        createdBy: 'me',
        updatedAt: '2020-01-01T00:00:00.000Z',
        updatedBy: 'me',
        deletedAt: null,
        schemaVersion: 3,
      };
      useStore.setState({ inventory: [existing] });
      const { result } = renderHook(() => useCannabisRepo());
      let updated;
      act(() => {
        updated = result.current.updateProduct('p1', { name: 'Flower B' });
      });
      expect(updated.name).toBe('Flower B');
      expect(updated.createdAt).toBe('2020-01-01T00:00:00.000Z');
      expect(updated.createdBy).toBe('me');
      expect(updated.updatedAt).toBe('2026-05-04T10:00:00.000Z');
      expect(updated.updatedBy).toBe('me');
    });

    it('returns undefined for unknown id', () => {
      const { result } = renderHook(() => useCannabisRepo());
      let ret;
      act(() => {
        ret = result.current.updateProduct('nope', { name: 'X' });
      });
      expect(ret).toBeUndefined();
    });

    it('return value is not a Promise', () => {
      useStore.setState({
        inventory: [{ id: 'p1', name: 'A', updatedAt: '2020-01-01T00:00:00.000Z' }],
      });
      const { result } = renderHook(() => useCannabisRepo());
      let ret;
      act(() => {
        ret = result.current.updateProduct('p1', { name: 'B' });
      });
      expect(ret).not.toBeInstanceOf(Promise);
    });
  });

  // ── removeProduct ───────────────────────────────────────────────────

  describe('removeProduct(id)', () => {
    it('soft-deletes product by setting deletedAt', () => {
      const existing = {
        id: 'p1',
        name: 'Flower A',
        deletedAt: null,
        updatedAt: '2020-01-01T00:00:00.000Z',
        updatedBy: 'me',
      };
      useStore.setState({ inventory: [existing] });
      const { result } = renderHook(() => useCannabisRepo());
      let removed;
      act(() => {
        removed = result.current.removeProduct('p1');
      });
      expect(removed.deletedAt).toBe('2026-05-04T10:00:00.000Z');
      expect(removed.updatedAt).toBe('2026-05-04T10:00:00.000Z');
      expect(removed.updatedBy).toBe('me');
    });

    it('returns undefined for unknown id', () => {
      const { result } = renderHook(() => useCannabisRepo());
      let ret;
      act(() => {
        ret = result.current.removeProduct('nope');
      });
      expect(ret).toBeUndefined();
    });

    it('return value is not a Promise', () => {
      useStore.setState({
        inventory: [{ id: 'p1', name: 'A', deletedAt: null }],
      });
      const { result } = renderHook(() => useCannabisRepo());
      let ret;
      act(() => {
        ret = result.current.removeProduct('p1');
      });
      expect(ret).not.toBeInstanceOf(Promise);
    });
  });

  // ── listSessions ────────────────────────────────────────────────────

  describe('listSessions(date?)', () => {
    it('returns all sessions when no date filter', () => {
      useStore.setState({
        cannabisLogs: [
          { id: 's1', date: '2026-05-04' },
          { id: 's2', date: '2026-05-03' },
        ],
      });
      const { result } = renderHook(() => useCannabisRepo());
      expect(result.current.listSessions()).toHaveLength(2);
    });

    it('filters by date when date is provided', () => {
      useStore.setState({
        cannabisLogs: [
          { id: 's1', date: '2026-05-04' },
          { id: 's2', date: '2026-05-03' },
        ],
      });
      const { result } = renderHook(() => useCannabisRepo());
      const sessions = result.current.listSessions('2026-05-04');
      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe('s1');
    });

    it('return value is not a Promise', () => {
      const { result } = renderHook(() => useCannabisRepo());
      const ret = result.current.listSessions();
      expect(ret).not.toBeInstanceOf(Promise);
    });
  });

  // ── addSession ──────────────────────────────────────────────────────

  describe('addSession(input)', () => {
    it('stamps audit fields on new session', () => {
      const { result } = renderHook(() => useCannabisRepo());
      let record;
      act(() => {
        record = result.current.addSession({ productId: 'p1', amount: 0.05 });
      });
      expect(record.id).toBeTruthy();
      expect(record.userId).toBe('me');
      expect(record.createdAt).toBe('2026-05-04T10:00:00.000Z');
      expect(record.deletedAt).toBeNull();
      expect(record.schemaVersion).toBe(3);
    });

    it('adds session to the store cannabisLogs', () => {
      const { result } = renderHook(() => useCannabisRepo());
      act(() => {
        result.current.addSession({ productId: 'p1', amount: 0.05 });
      });
      expect(result.current.listSessions()).toHaveLength(1);
    });

    it('return value is not a Promise', () => {
      const { result } = renderHook(() => useCannabisRepo());
      let ret;
      act(() => {
        ret = result.current.addSession({ productId: 'p1', amount: 0.05 });
      });
      expect(ret).not.toBeInstanceOf(Promise);
    });
  });

  // ── removeSession ───────────────────────────────────────────────────

  describe('removeSession(id)', () => {
    it('soft-deletes session by setting deletedAt', () => {
      useStore.setState({
        cannabisLogs: [{ id: 's1', productId: 'p1', deletedAt: null }],
      });
      const { result } = renderHook(() => useCannabisRepo());
      let removed;
      act(() => {
        removed = result.current.removeSession('s1');
      });
      expect(removed.deletedAt).toBe('2026-05-04T10:00:00.000Z');
    });

    it('returns undefined for unknown id', () => {
      const { result } = renderHook(() => useCannabisRepo());
      let ret;
      act(() => {
        ret = result.current.removeSession('nope');
      });
      expect(ret).toBeUndefined();
    });

    it('return value is not a Promise', () => {
      useStore.setState({
        cannabisLogs: [{ id: 's1', deletedAt: null }],
      });
      const { result } = renderHook(() => useCannabisRepo());
      let ret;
      act(() => {
        ret = result.current.removeSession('s1');
      });
      expect(ret).not.toBeInstanceOf(Promise);
    });
  });
});
