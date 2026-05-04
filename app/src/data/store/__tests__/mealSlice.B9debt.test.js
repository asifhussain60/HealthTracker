/**
 * mealSlice.B9debt.test.js
 *
 * RED-phase tests for B9-DEBT-002:
 *   mealSlice missing updateMealTemplate; removeMealTemplate is hard-delete.
 *
 * These tests MUST FAIL until B10 adds the actions.
 * AC-P0-B10
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { create } from 'zustand';
import { mealSliceInitial, createMealSlice } from '../mealSlice';

function makeStore() {
  return create((set, get) => ({
    ...mealSliceInitial,
    ...createMealSlice(set, get),
  }));
}

describe('mealSlice — B9-DEBT-002 updateMealTemplate + soft-delete removeMealTemplate', () => {
  let store;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-04T10:00:00.000Z'));
    store = makeStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('updateMealTemplate action exists on the slice', () => {
    expect(typeof store.getState().updateMealTemplate).toBe('function');
  });

  it('updateMealTemplate merges patch onto existing template and bumps updatedAt', () => {
    store.setState({
      mealTemplates: [
        {
          id: 'mt-1',
          name: 'Chicken',
          calories: 300,
          userId: 'me',
          createdAt: '2020-01-01T00:00:00.000Z',
          updatedAt: '2020-01-01T00:00:00.000Z',
          createdBy: 'me',
          updatedBy: 'me',
          deletedAt: null,
          schemaVersion: 3,
        },
      ],
    });
    store.getState().updateMealTemplate('mt-1', { name: 'Grilled Chicken', calories: 350 });
    const updated = store.getState().mealTemplates[0];
    expect(updated.name).toBe('Grilled Chicken');
    expect(updated.calories).toBe(350);
    expect(updated.updatedAt).toBe('2026-05-04T10:00:00.000Z');
    expect(updated.createdAt).toBe('2020-01-01T00:00:00.000Z'); // preserved
    expect(updated.updatedBy).toBe('me');
  });

  it('updateMealTemplate is a no-op for unknown id', () => {
    store.setState({ mealTemplates: [{ id: 'mt-1', name: 'Chicken', deletedAt: null }] });
    expect(() => store.getState().updateMealTemplate('nope', { name: 'X' })).not.toThrow();
    expect(store.getState().mealTemplates[0].name).toBe('Chicken');
  });

  it('removeMealTemplate is a soft-delete (sets deletedAt, does NOT remove from array)', () => {
    store.setState({
      mealTemplates: [
        {
          id: 'mt-1',
          name: 'Chicken',
          deletedAt: null,
          updatedAt: '2020-01-01T00:00:00.000Z',
          updatedBy: 'me',
        },
      ],
    });
    store.getState().removeMealTemplate('mt-1');
    const templates = store.getState().mealTemplates;
    // Template still in array
    expect(templates).toHaveLength(1);
    // But deletedAt is set
    expect(templates[0].deletedAt).toBe('2026-05-04T10:00:00.000Z');
    expect(templates[0].updatedAt).toBe('2026-05-04T10:00:00.000Z');
  });

  it('removeMealTemplate for unknown id does not crash or mutate array', () => {
    store.setState({ mealTemplates: [{ id: 'mt-1', name: 'Chicken', deletedAt: null }] });
    expect(() => store.getState().removeMealTemplate('nope')).not.toThrow();
    expect(store.getState().mealTemplates).toHaveLength(1);
  });
});
