/**
 * useTodosRepo.test.js
 *
 * Per-repo unit tests for useTodosRepo.
 * Uses the real combined store (integration-style) with state reset between tests.
 * RED phase — ../useTodosRepo.js doesn't exist yet; tests fail with module-not-found.
 *
 * Note: todoSlice is a placeholder (Phase 3 full wiring). The repo provides
 * full CRUD surface against state.items via direct store setState, since
 * createTodoSlice() exposes no actions today.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStore } from '../../store';
import { useTodosRepo } from '../useTodosRepo.js';

function resetStore() {
  useStore.setState({ items: [] });
}

describe('useTodosRepo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-04T10:00:00.000Z'));
    resetStore();
  });

  // ── listTodos ────────────────────────────────────────────────────────

  describe('listTodos()', () => {
    it('returns empty array when no todos', () => {
      const { result } = renderHook(() => useTodosRepo());
      expect(result.current.listTodos()).toEqual([]);
    });

    it('returns all items from store', () => {
      useStore.setState({ items: [{ id: 'todo-1', title: 'Buy milk' }] });
      const { result } = renderHook(() => useTodosRepo());
      expect(result.current.listTodos()).toHaveLength(1);
    });

    it('return value is not a Promise', () => {
      const { result } = renderHook(() => useTodosRepo());
      const ret = result.current.listTodos();
      expect(ret).not.toBeInstanceOf(Promise);
      expect(typeof ret.then).toBe('undefined');
    });
  });

  // ── getTodo ──────────────────────────────────────────────────────────

  describe('getTodo(id)', () => {
    it('returns matching todo by id', () => {
      useStore.setState({
        items: [
          { id: 'todo-1', title: 'Buy milk' },
          { id: 'todo-2', title: 'Go to gym' },
        ],
      });
      const { result } = renderHook(() => useTodosRepo());
      expect(result.current.getTodo('todo-2').title).toBe('Go to gym');
    });

    it('returns undefined for unknown id', () => {
      useStore.setState({ items: [{ id: 'todo-1', title: 'Buy milk' }] });
      const { result } = renderHook(() => useTodosRepo());
      expect(result.current.getTodo('nope')).toBeUndefined();
    });

    it('return value is not a Promise', () => {
      const { result } = renderHook(() => useTodosRepo());
      const ret = result.current.getTodo('any');
      expect(ret).not.toBeInstanceOf(Promise);
      expect(typeof ret?.then).toBe('undefined');
    });
  });

  // ── addTodo ──────────────────────────────────────────────────────────

  describe('addTodo(input)', () => {
    it('stamps audit fields on new todo', () => {
      const { result } = renderHook(() => useTodosRepo());
      let record;
      act(() => {
        record = result.current.addTodo({ title: 'Buy milk', status: 'open' });
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
      const { result } = renderHook(() => useTodosRepo());
      let record;
      act(() => {
        record = result.current.addTodo({ title: 'Buy milk', status: 'open' });
      });
      expect(record.title).toBe('Buy milk');
      expect(record.status).toBe('open');
    });

    it('adds todo to the store items', () => {
      const { result } = renderHook(() => useTodosRepo());
      act(() => {
        result.current.addTodo({ title: 'Buy milk' });
      });
      expect(result.current.listTodos()).toHaveLength(1);
    });

    it('return value is not a Promise', () => {
      const { result } = renderHook(() => useTodosRepo());
      let ret;
      act(() => {
        ret = result.current.addTodo({ title: 'X' });
      });
      expect(ret).not.toBeInstanceOf(Promise);
      expect(typeof ret.then).toBe('undefined');
    });
  });

  // ── updateTodo ───────────────────────────────────────────────────────

  describe('updateTodo(id, patch)', () => {
    it('bumps updatedAt/updatedBy and preserves createdAt/createdBy', () => {
      const existing = {
        id: 'todo-1',
        title: 'Buy milk',
        userId: 'me',
        createdAt: '2020-01-01T00:00:00.000Z',
        createdBy: 'me',
        updatedAt: '2020-01-01T00:00:00.000Z',
        updatedBy: 'me',
        deletedAt: null,
        schemaVersion: 3,
      };
      useStore.setState({ items: [existing] });
      const { result } = renderHook(() => useTodosRepo());
      let updated;
      act(() => {
        updated = result.current.updateTodo('todo-1', { title: 'Buy oat milk' });
      });
      expect(updated.title).toBe('Buy oat milk');
      expect(updated.createdAt).toBe('2020-01-01T00:00:00.000Z');
      expect(updated.updatedAt).toBe('2026-05-04T10:00:00.000Z');
    });

    it('returns undefined for unknown id', () => {
      const { result } = renderHook(() => useTodosRepo());
      let ret;
      act(() => {
        ret = result.current.updateTodo('nope', { title: 'X' });
      });
      expect(ret).toBeUndefined();
    });

    it('return value is not a Promise', () => {
      useStore.setState({
        items: [{ id: 'todo-1', title: 'A', updatedAt: '2020-01-01T00:00:00.000Z' }],
      });
      const { result } = renderHook(() => useTodosRepo());
      let ret;
      act(() => {
        ret = result.current.updateTodo('todo-1', { title: 'B' });
      });
      expect(ret).not.toBeInstanceOf(Promise);
    });
  });

  // ── removeTodo ───────────────────────────────────────────────────────

  describe('removeTodo(id)', () => {
    it('soft-deletes todo by setting deletedAt', () => {
      const existing = {
        id: 'todo-1',
        title: 'Buy milk',
        deletedAt: null,
        updatedAt: '2020-01-01T00:00:00.000Z',
        updatedBy: 'me',
      };
      useStore.setState({ items: [existing] });
      const { result } = renderHook(() => useTodosRepo());
      let removed;
      act(() => {
        removed = result.current.removeTodo('todo-1');
      });
      expect(removed.deletedAt).toBe('2026-05-04T10:00:00.000Z');
    });

    it('returns undefined for unknown id', () => {
      const { result } = renderHook(() => useTodosRepo());
      let ret;
      act(() => {
        ret = result.current.removeTodo('nope');
      });
      expect(ret).toBeUndefined();
    });

    it('return value is not a Promise', () => {
      useStore.setState({
        items: [{ id: 'todo-1', title: 'A', deletedAt: null }],
      });
      const { result } = renderHook(() => useTodosRepo());
      let ret;
      act(() => {
        ret = result.current.removeTodo('todo-1');
      });
      expect(ret).not.toBeInstanceOf(Promise);
    });
  });

  // ── setStatus ────────────────────────────────────────────────────────

  describe('setStatus(id, status)', () => {
    it('updates status field and bumps updatedAt', () => {
      const existing = {
        id: 'todo-1',
        title: 'Buy milk',
        status: 'open',
        updatedAt: '2020-01-01T00:00:00.000Z',
        updatedBy: 'me',
        createdAt: '2020-01-01T00:00:00.000Z',
        createdBy: 'me',
        deletedAt: null,
        schemaVersion: 3,
      };
      useStore.setState({ items: [existing] });
      const { result } = renderHook(() => useTodosRepo());
      let updated;
      act(() => {
        updated = result.current.setStatus('todo-1', 'done');
      });
      expect(updated.status).toBe('done');
      expect(updated.updatedAt).toBe('2026-05-04T10:00:00.000Z');
    });

    it('returns undefined for unknown id', () => {
      const { result } = renderHook(() => useTodosRepo());
      let ret;
      act(() => {
        ret = result.current.setStatus('nope', 'done');
      });
      expect(ret).toBeUndefined();
    });

    it('return value is not a Promise', () => {
      useStore.setState({
        items: [{ id: 'todo-1', status: 'open', updatedAt: '2020-01-01T00:00:00.000Z' }],
      });
      const { result } = renderHook(() => useTodosRepo());
      let ret;
      act(() => {
        ret = result.current.setStatus('todo-1', 'done');
      });
      expect(ret).not.toBeInstanceOf(Promise);
    });
  });
});
