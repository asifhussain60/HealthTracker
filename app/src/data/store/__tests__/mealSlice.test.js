import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { mealSliceInitial, createMealSlice } from '../mealSlice';

function makeStore() {
  return create((set, get) => ({
    ...mealSliceInitial,
    ...createMealSlice(set, get),
  }));
}

describe('mealSlice — unit', () => {
  let store;
  beforeEach(() => {
    store = makeStore();
  });

  it('initial state has empty mealTemplates', () => {
    expect(store.getState().mealTemplates).toEqual([]);
  });

  it('saveMealTemplate appends a template with auto-generated id', () => {
    store.getState().saveMealTemplate({ name: 'Chicken Bowl', calories: 650, protein: 55 });
    const { mealTemplates } = store.getState();
    expect(mealTemplates).toHaveLength(1);
    expect(mealTemplates[0].id).toBeTruthy();
    expect(mealTemplates[0].name).toBe('Chicken Bowl');
    expect(mealTemplates[0].calories).toBe(650);
  });

  // B10 DEBT-002: deleteMealTemplate renamed to removeMealTemplate (soft-delete).
  // The old hard-delete action is replaced; these tests now assert the soft-delete contract.

  it('removeMealTemplate soft-deletes the template by id (record stays in array)', () => {
    store.getState().saveMealTemplate({ name: 'Template A' });
    const id = store.getState().mealTemplates[0].id;
    store.getState().removeMealTemplate(id);
    const { mealTemplates } = store.getState();
    // Record still exists (soft-delete, not hard-delete)
    expect(mealTemplates).toHaveLength(1);
    // But deletedAt is set
    expect(mealTemplates[0].deletedAt).not.toBeNull();
  });

  it('removeMealTemplate leaves other templates deletedAt=null', () => {
    store.getState().saveMealTemplate({ name: 'Template A' });
    store.getState().saveMealTemplate({ name: 'Template B' });
    const idA = store.getState().mealTemplates[0].id;
    store.getState().removeMealTemplate(idA);
    const { mealTemplates } = store.getState();
    expect(mealTemplates).toHaveLength(2);
    expect(mealTemplates[0].deletedAt).not.toBeNull();   // A is soft-deleted
    expect(mealTemplates[1].deletedAt).toBeUndefined();  // B is untouched (saveMealTemplate doesn't stamp deletedAt)
    expect(mealTemplates[1].name).toBe('Template B');
  });
});
