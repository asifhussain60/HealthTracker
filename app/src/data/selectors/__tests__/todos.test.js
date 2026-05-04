/**
 * todos.test.js — Unit tests for todos selectors.
 *
 * HT-CORE-010: Every selector that touches user-scoped data filters by userId.
 * HT-CORE-007: All test outcomes verified with real runner output.
 */

import { describe, it, expect } from 'vitest';
import {
  selectMyTodos,
  selectTodosByCategory,
  selectAssignedToMe,
} from '../todos.js';

// ── Fixture factory ───────────────────────────────────────────────────────────

function makeTodo(overrides = {}) {
  return {
    id: 'todo-1',
    userId: 'me',
    assigneeId: null,
    title: 'Test todo',
    category: 'personal',
    priority: 1,
    dueDate: '2026-05-10',
    deletedAt: null,
    ...overrides,
  };
}

function makeState(overrides = {}) {
  return {
    items: [],
    ...overrides,
  };
}

// ── selectMyTodos ─────────────────────────────────────────────────────────────

describe('selectMyTodos', () => {
  it('returns todos for userId only (HT-CORE-010)', () => {
    const state = makeState({
      items: [
        makeTodo({ id: 't1', userId: 'me' }),
        makeTodo({ id: 't2', userId: 'other-user' }),
      ],
    });
    const result = selectMyTodos(state, 'me');
    expect(result.map((t) => t.id)).toEqual(['t1']);
  });

  it('excludes soft-deleted todos', () => {
    const state = makeState({
      items: [
        makeTodo({ id: 't1', userId: 'me', deletedAt: null }),
        makeTodo({ id: 't2', userId: 'me', deletedAt: '2026-05-01T00:00:00Z' }),
      ],
    });
    const result = selectMyTodos(state, 'me');
    expect(result.map((t) => t.id)).toEqual(['t1']);
  });

  it('sorts by priority descending then dueDate ascending', () => {
    const state = makeState({
      items: [
        makeTodo({ id: 't1', userId: 'me', priority: 1, dueDate: '2026-05-10' }),
        makeTodo({ id: 't2', userId: 'me', priority: 3, dueDate: '2026-05-15' }),
        makeTodo({ id: 't3', userId: 'me', priority: 3, dueDate: '2026-05-08' }),
        makeTodo({ id: 't4', userId: 'me', priority: 2, dueDate: '2026-05-12' }),
      ],
    });
    const result = selectMyTodos(state, 'me');
    // priority 3 first (earliest due date first among ties), then 2, then 1
    expect(result.map((t) => t.id)).toEqual(['t3', 't2', 't4', 't1']);
  });

  it('returns empty array when items is empty', () => {
    expect(selectMyTodos(makeState(), 'me')).toEqual([]);
  });

  it('returns same reference on repeated call (memoization)', () => {
    const state = makeState({ items: [makeTodo({ userId: 'me' })] });
    const r1 = selectMyTodos(state, 'me');
    const r2 = selectMyTodos(state, 'me');
    expect(r1).toBe(r2);
  });

  it('returns new reference when state changes', () => {
    const state1 = makeState({ items: [makeTodo({ id: 't1', userId: 'me' })] });
    const state2 = makeState({
      items: [makeTodo({ id: 't1', userId: 'me' }), makeTodo({ id: 't2', userId: 'me' })],
    });
    expect(selectMyTodos(state1, 'me')).not.toBe(selectMyTodos(state2, 'me'));
  });
});

// ── selectTodosByCategory ─────────────────────────────────────────────────────

describe('selectTodosByCategory', () => {
  it('returns todos for userId matching category (HT-CORE-010)', () => {
    const state = makeState({
      items: [
        makeTodo({ id: 't1', userId: 'me', category: 'personal' }),
        makeTodo({ id: 't2', userId: 'me', category: 'professional' }),
        makeTodo({ id: 't3', userId: 'other-user', category: 'personal' }),
      ],
    });
    const result = selectTodosByCategory(state, 'me', 'personal');
    expect(result.map((t) => t.id)).toEqual(['t1']);
  });

  it('excludes soft-deleted todos in category', () => {
    const state = makeState({
      items: [
        makeTodo({ id: 't1', userId: 'me', category: 'personal', deletedAt: null }),
        makeTodo({ id: 't2', userId: 'me', category: 'personal', deletedAt: '2026-05-01T00:00:00Z' }),
      ],
    });
    expect(selectTodosByCategory(state, 'me', 'personal').map((t) => t.id)).toEqual(['t1']);
  });

  it('returns empty array for unknown category', () => {
    expect(selectTodosByCategory(makeState(), 'me', 'unknown')).toEqual([]);
  });

  it('handles professional category', () => {
    const state = makeState({
      items: [
        makeTodo({ id: 't1', userId: 'me', category: 'professional' }),
      ],
    });
    const result = selectTodosByCategory(state, 'me', 'professional');
    expect(result.map((t) => t.id)).toEqual(['t1']);
  });
});

// ── selectAssignedToMe ────────────────────────────────────────────────────────

describe('selectAssignedToMe', () => {
  it('returns todos where assigneeId === userId (HT-CORE-010)', () => {
    const state = makeState({
      items: [
        makeTodo({ id: 't1', userId: 'other-user', assigneeId: 'me' }),
        makeTodo({ id: 't2', userId: 'other-user', assigneeId: 'other-user' }),
        makeTodo({ id: 't3', userId: 'me', assigneeId: 'me' }),
      ],
    });
    const result = selectAssignedToMe(state, 'me');
    expect(result.map((t) => t.id)).toContain('t1');
    expect(result.map((t) => t.id)).toContain('t3');
    expect(result.map((t) => t.id)).not.toContain('t2');
  });

  it('excludes soft-deleted assigned todos', () => {
    const state = makeState({
      items: [
        makeTodo({ id: 't1', userId: 'other-user', assigneeId: 'me', deletedAt: '2026-05-01T00:00:00Z' }),
        makeTodo({ id: 't2', userId: 'other-user', assigneeId: 'me', deletedAt: null }),
      ],
    });
    const result = selectAssignedToMe(state, 'me');
    expect(result.map((t) => t.id)).toEqual(['t2']);
  });

  it('returns empty array when no todos assigned to userId', () => {
    expect(selectAssignedToMe(makeState(), 'me')).toEqual([]);
  });

  it('returns empty array when assigneeId is null for all', () => {
    const state = makeState({
      items: [makeTodo({ userId: 'me', assigneeId: null })],
    });
    expect(selectAssignedToMe(state, 'me')).toEqual([]);
  });
});
