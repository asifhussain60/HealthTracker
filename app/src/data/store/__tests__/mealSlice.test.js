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

  it('deleteMealTemplate removes the template by id', () => {
    store.getState().saveMealTemplate({ name: 'Template A' });
    const id = store.getState().mealTemplates[0].id;
    store.getState().deleteMealTemplate(id);
    expect(store.getState().mealTemplates).toHaveLength(0);
  });

  it('deleteMealTemplate leaves other templates intact', () => {
    store.getState().saveMealTemplate({ name: 'Template A' });
    store.getState().saveMealTemplate({ name: 'Template B' });
    const idA = store.getState().mealTemplates[0].id;
    store.getState().deleteMealTemplate(idA);
    const { mealTemplates } = store.getState();
    expect(mealTemplates).toHaveLength(1);
    expect(mealTemplates[0].name).toBe('Template B');
  });
});
