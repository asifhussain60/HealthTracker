/**
 * cannabisSlice.B9debt.test.js
 *
 * RED-phase tests for B9-DEBT-001:
 *   cannabisSlice missing addCannabisProduct / updateCannabisProduct / removeCannabisProduct actions.
 *
 * These tests MUST FAIL until the actions are added to cannabisSlice.js.
 * AC-P0-B10
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { create } from 'zustand';
import { cannabisSliceInitial, createCannabisSlice } from '../cannabisSlice';

function makeStore() {
  return create((set, get) => ({
    ...cannabisSliceInitial,
    ...createCannabisSlice(set, get),
  }));
}

describe('cannabisSlice — B9-DEBT-001 addCannabisProduct / updateCannabisProduct / removeCannabisProduct', () => {
  let store;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-04T10:00:00.000Z'));
    store = makeStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('addCannabisProduct action exists on the slice', () => {
    expect(typeof store.getState().addCannabisProduct).toBe('function');
  });

  it('addCannabisProduct appends a product with audit fields to inventory', () => {
    store.getState().addCannabisProduct({ name: 'Blue Dream', form: 'flower' });
    const { inventory } = store.getState();
    expect(inventory).toHaveLength(1);
    expect(inventory[0].name).toBe('Blue Dream');
    expect(inventory[0].id).toBeTruthy();
    expect(inventory[0].userId).toBe('me');
    expect(inventory[0].createdAt).toBe('2026-05-04T10:00:00.000Z');
    expect(inventory[0].updatedAt).toBe('2026-05-04T10:00:00.000Z');
    expect(inventory[0].createdBy).toBe('me');
    expect(inventory[0].updatedBy).toBe('me');
    expect(inventory[0].deletedAt).toBeNull();
    expect(inventory[0].schemaVersion).toBe(3);
  });

  it('updateCannabisProduct action exists on the slice', () => {
    expect(typeof store.getState().updateCannabisProduct).toBe('function');
  });

  it('updateCannabisProduct merges patch and bumps updatedAt', () => {
    store.setState({
      inventory: [
        {
          id: 'p1',
          name: 'Flower A',
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
    store.getState().updateCannabisProduct('p1', { name: 'Flower B' });
    const updated = store.getState().inventory[0];
    expect(updated.name).toBe('Flower B');
    expect(updated.updatedAt).toBe('2026-05-04T10:00:00.000Z');
    expect(updated.createdAt).toBe('2020-01-01T00:00:00.000Z'); // preserved
  });

  it('removeCannabisProduct action exists on the slice', () => {
    expect(typeof store.getState().removeCannabisProduct).toBe('function');
  });

  it('removeCannabisProduct soft-deletes by setting deletedAt', () => {
    store.setState({
      inventory: [
        {
          id: 'p1',
          name: 'Flower A',
          deletedAt: null,
          updatedAt: '2020-01-01T00:00:00.000Z',
          updatedBy: 'me',
        },
      ],
    });
    store.getState().removeCannabisProduct('p1');
    const item = store.getState().inventory[0];
    expect(item.deletedAt).toBe('2026-05-04T10:00:00.000Z');
    expect(item.updatedAt).toBe('2026-05-04T10:00:00.000Z');
    // product still exists in array (soft-delete, not hard-delete)
    expect(store.getState().inventory).toHaveLength(1);
  });
});
