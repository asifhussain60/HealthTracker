import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { cannabisSliceInitial, createCannabisSlice } from '../cannabisSlice';

// Harness: isolated slice-only store
function makeStore() {
  return create((set, get) => ({
    ...cannabisSliceInitial,
    ...createCannabisSlice(set, get),
  }));
}

describe('cannabisSlice — unit', () => {
  let store;
  beforeEach(() => {
    store = makeStore();
  });

  it('initial state has empty cannabisLogs and inventory', () => {
    const state = store.getState();
    expect(state.cannabisLogs).toEqual([]);
    expect(state.inventory).toEqual([]);
  });

  it('addCannabisLog appends a log with an auto-generated id', () => {
    store.getState().addCannabisLog({ productId: 'p1', amount: 0.05, unit: 'g', thcMg: 10 });
    const { cannabisLogs } = store.getState();
    expect(cannabisLogs).toHaveLength(1);
    expect(cannabisLogs[0].id).toBeTruthy();
    expect(cannabisLogs[0].productId).toBe('p1');
    expect(cannabisLogs[0].amount).toBe(0.05);
  });

  it('addCannabisLog stamps a date when not provided', () => {
    store.getState().addCannabisLog({ productId: 'p1', amount: 0.05, unit: 'g' });
    const { cannabisLogs } = store.getState();
    expect(cannabisLogs[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('deleteCannabisLog removes the entry by id', () => {
    store.getState().addCannabisLog({ productId: 'p1', amount: 0.05, unit: 'g' });
    const id = store.getState().cannabisLogs[0].id;
    store.getState().deleteCannabisLog(id);
    expect(store.getState().cannabisLogs).toHaveLength(0);
  });

  it('updateInventoryItem merges updates on matching item', () => {
    store.setState({ inventory: [{ id: 'inv-1', name: 'Flower A', remaining: 1.5 }] });
    store.getState().updateInventoryItem('inv-1', { remaining: 1.0 });
    expect(store.getState().inventory[0].remaining).toBe(1.0);
  });

  it('logInventoryUse decrements remaining and sets lastUsed', () => {
    store.setState({ inventory: [{ id: 'inv-1', name: 'Flower A', remaining: 1.5 }] });
    store.getState().logInventoryUse('inv-1', 0.5);
    const item = store.getState().inventory[0];
    expect(item.remaining).toBeCloseTo(1.0);
    expect(item.lastUsed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('logInventoryUse does not go below 0', () => {
    store.setState({ inventory: [{ id: 'inv-1', remaining: 0.1 }] });
    store.getState().logInventoryUse('inv-1', 5);
    expect(store.getState().inventory[0].remaining).toBe(0);
  });

  it('getTodayCannabisLogs returns only today entries', () => {
    const today = new Date().toISOString().slice(0, 10);
    store.setState({
      cannabisLogs: [
        { id: '1', date: today, productId: 'p1' },
        { id: '2', date: '2020-01-01', productId: 'p2' },
      ],
    });
    const result = store.getState().getTodayCannabisLogs();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('getTodaySessions returns count of today sessions', () => {
    const today = new Date().toISOString().slice(0, 10);
    store.setState({
      cannabisLogs: [
        { id: '1', date: today },
        { id: '2', date: today },
        { id: '3', date: '2020-01-01' },
      ],
    });
    expect(store.getState().getTodaySessions()).toBe(2);
  });
});
