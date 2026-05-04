/**
 * meals.test.js — AC-P1D-D4 RED
 *
 * Tests for the MealInventoryItem LibrarySchema descriptor.
 */
import { describe, it, expect } from 'vitest';
import { mealsSchema } from '../meals.js';
import { createLibraryRepo } from '../../LibraryRepo.js';

describe('mealsSchema — structure', () => {
  it('is a frozen object', () => {
    expect(Object.isFrozen(mealsSchema)).toBe(true);
  });

  it('has name "meals"', () => {
    expect(mealsSchema.name).toBe('meals');
  });

  it('has sliceKey "meals"', () => {
    expect(mealsSchema.sliceKey).toBe('meals');
  });

  it('has a non-empty fields array', () => {
    expect(Array.isArray(mealsSchema.fields)).toBe(true);
    expect(mealsSchema.fields.length).toBeGreaterThan(0);
  });

  it('has a "name" field of type string', () => {
    const nameField = mealsSchema.fields.find((f) => f.key === 'name');
    expect(nameField).toBeTruthy();
    expect(nameField.type).toBe('string');
  });

  it('has a "category" field of type enum with expected options', () => {
    const catField = mealsSchema.fields.find((f) => f.key === 'category');
    expect(catField).toBeTruthy();
    expect(catField.type).toBe('enum');
    expect(catField.options).toContain('breakfast');
    expect(catField.options).toContain('lunch');
    expect(catField.options).toContain('dinner');
    expect(catField.options).toContain('snack');
  });

  it('has a "favoriteStars" field of type stars', () => {
    const starsField = mealsSchema.fields.find((f) => f.key === 'favoriteStars');
    expect(starsField).toBeTruthy();
    expect(starsField.type).toBe('stars');
  });

  it('has a "refCalories" numeric field', () => {
    const f = mealsSchema.fields.find((f) => f.key === 'refCalories');
    expect(f).toBeTruthy();
    expect(f.type).toBe('number');
  });

  it('has categories array', () => {
    expect(Array.isArray(mealsSchema.categories)).toBe(true);
  });

  it('has sortOptions array', () => {
    expect(Array.isArray(mealsSchema.sortOptions)).toBe(true);
  });

  it('importFormat is "csv" or null', () => {
    expect(['csv', null]).toContain(mealsSchema.importFormat);
  });
});

describe('mealsSchema — round-trip via LibraryRepo', () => {
  function makeStore(items = []) {
    let state = { meals: items };
    return {
      getState: () => state,
      setState: (patch) => { state = { ...state, ...patch }; },
    };
  }

  it('adds and retrieves a MealInventoryItem', () => {
    const store = makeStore();
    const repo = createLibraryRepo({ schema: mealsSchema, store });
    const item = repo.add({ name: 'Grilled Chicken', category: 'dinner', refCalories: 450 });
    expect(item.id).toBeTruthy();
    expect(repo.list()[0].name).toBe('Grilled Chicken');
  });

  it('soft-deletes without hard-removing', () => {
    const store = makeStore();
    const repo = createLibraryRepo({ schema: mealsSchema, store });
    const item = repo.add({ name: 'Salad' });
    repo.remove(item.id);
    expect(repo.list().length).toBe(0);
    expect(repo.list({ includeDeleted: true }).length).toBe(1);
  });
});
