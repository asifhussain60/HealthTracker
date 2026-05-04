import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { todoSliceInitial, createTodoSlice } from '../todoSlice';

function makeStore() {
  return create((set, get) => ({
    ...todoSliceInitial,
    ...createTodoSlice(set, get),
  }));
}

describe('todoSlice — unit', () => {
  let store;
  beforeEach(() => {
    store = makeStore();
  });

  it('initial state has empty items array', () => {
    expect(store.getState().items).toEqual([]);
  });

  it('exports todoSliceInitial with items key', () => {
    expect(todoSliceInitial).toHaveProperty('items');
    expect(Array.isArray(todoSliceInitial.items)).toBe(true);
  });

  it('createTodoSlice returns an object (placeholder — no actions yet)', () => {
    const actions = createTodoSlice(() => {}, () => ({}));
    expect(typeof actions).toBe('object');
  });
});
