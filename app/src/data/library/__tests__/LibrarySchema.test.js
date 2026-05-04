/**
 * LibrarySchema.test.js
 *
 * Tests for the LibrarySchema descriptor factory.
 * Verifies: frozen output, validation rules, sample schema.
 *
 * RED phase — ../LibrarySchema.js doesn't exist yet; test fails with module-not-found.
 *
 * AC-P1A-A4
 */

import { describe, it, expect } from 'vitest';
import { defineLibrarySchema } from '../LibrarySchema.js';

// ── Minimal valid config ──────────────────────────────────────────────────────

const minimalConfig = {
  name: 'TestLibrary',
  sliceKey: 'testItems',
  fields: [
    { key: 'name', label: 'Name', type: 'string' },
    { key: 'calories', label: 'Calories', type: 'number' },
  ],
};

// ── Sample meal-library schema ────────────────────────────────────────────────

const mealLibraryConfig = {
  name: 'MealLibrary',
  sliceKey: 'mealInventory',
  fields: [
    { key: 'name', label: 'Name', type: 'string' },
    { key: 'category', label: 'Category', type: 'enum', options: ['breakfast', 'lunch', 'dinner', 'snack', 'shake'] },
    { key: 'refCalories', label: 'Reference Calories', type: 'number' },
    { key: 'favoriteStars', label: 'Stars', type: 'stars', min: 0, max: 5 },
    { key: 'tags', label: 'Tags', type: 'tags' },
  ],
  categories: ['breakfast', 'lunch', 'dinner', 'snack', 'shake'],
  sortOptions: [
    { key: 'favoriteStars', label: 'Stars', direction: 'desc' },
    { key: 'name', label: 'Name', direction: 'asc' },
  ],
  importFormat: 'csv',
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('defineLibrarySchema', () => {

  // ── Frozen output ─────────────────────────────────────────────────────────

  describe('freezing', () => {
    it('returns a frozen object', () => {
      const schema = defineLibrarySchema(minimalConfig);
      expect(Object.isFrozen(schema)).toBe(true);
    });

    it('throws when attempting to mutate a frozen schema', () => {
      const schema = defineLibrarySchema(minimalConfig);
      expect(() => {
        schema.name = 'MutatedName';
      }).toThrow();
    });

    it('deep-freezes the fields array', () => {
      const schema = defineLibrarySchema(minimalConfig);
      expect(Object.isFrozen(schema.fields)).toBe(true);
    });

    it('deep-freezes each field object', () => {
      const schema = defineLibrarySchema(minimalConfig);
      for (const field of schema.fields) {
        expect(Object.isFrozen(field)).toBe(true);
      }
    });
  });

  // ── Validation: required top-level keys ──────────────────────────────────

  describe('validation — required keys', () => {
    it('throws if name is missing', () => {
      expect(() =>
        defineLibrarySchema({ sliceKey: 'x', fields: [] })
      ).toThrow(/name/i);
    });

    it('throws if sliceKey is missing', () => {
      expect(() =>
        defineLibrarySchema({ name: 'X', fields: [] })
      ).toThrow(/sliceKey/i);
    });

    it('throws if fields is missing', () => {
      expect(() =>
        defineLibrarySchema({ name: 'X', sliceKey: 'x' })
      ).toThrow(/fields/i);
    });

    it('throws if fields is not an array', () => {
      expect(() =>
        defineLibrarySchema({ name: 'X', sliceKey: 'x', fields: 'bad' })
      ).toThrow(/fields/i);
    });
  });

  // ── Validation: field-level rules ─────────────────────────────────────────

  describe('validation — field rules', () => {
    it('throws if a field is missing key', () => {
      expect(() =>
        defineLibrarySchema({
          name: 'X',
          sliceKey: 'x',
          fields: [{ label: 'Name', type: 'string' }],
        })
      ).toThrow(/key/i);
    });

    it('throws if a field is missing type', () => {
      expect(() =>
        defineLibrarySchema({
          name: 'X',
          sliceKey: 'x',
          fields: [{ key: 'name', label: 'Name' }],
        })
      ).toThrow(/type/i);
    });

    it('throws if a field has an invalid type', () => {
      expect(() =>
        defineLibrarySchema({
          name: 'X',
          sliceKey: 'x',
          fields: [{ key: 'x', label: 'X', type: 'datetime' }], // not a valid type
        })
      ).toThrow(/type/i);
    });

    it('accepts all valid field types without throwing', () => {
      const types = ['string', 'number', 'enum', 'tags', 'stars'];
      for (const type of types) {
        const fields = [
          { key: 'f', label: 'F', type, ...(type === 'enum' ? { options: ['a'] } : {}) },
        ];
        expect(() =>
          defineLibrarySchema({ name: 'X', sliceKey: 'x', fields })
        ).not.toThrow();
      }
    });

    it('throws if type=enum but options is missing', () => {
      expect(() =>
        defineLibrarySchema({
          name: 'X',
          sliceKey: 'x',
          fields: [{ key: 'cat', label: 'Category', type: 'enum' }],
        })
      ).toThrow(/options/i);
    });

    it('throws if type=enum but options is empty', () => {
      expect(() =>
        defineLibrarySchema({
          name: 'X',
          sliceKey: 'x',
          fields: [{ key: 'cat', label: 'Category', type: 'enum', options: [] }],
        })
      ).toThrow(/options/i);
    });

    it('allows type=enum with non-empty options', () => {
      expect(() =>
        defineLibrarySchema({
          name: 'X',
          sliceKey: 'x',
          fields: [{ key: 'cat', label: 'Category', type: 'enum', options: ['a', 'b'] }],
        })
      ).not.toThrow();
    });
  });

  // ── Output shape ─────────────────────────────────────────────────────────

  describe('output shape', () => {
    it('returns name and sliceKey unchanged', () => {
      const schema = defineLibrarySchema(minimalConfig);
      expect(schema.name).toBe('TestLibrary');
      expect(schema.sliceKey).toBe('testItems');
    });

    it('returns fields array with all field descriptors', () => {
      const schema = defineLibrarySchema(minimalConfig);
      expect(schema.fields).toHaveLength(2);
      expect(schema.fields[0].key).toBe('name');
      expect(schema.fields[1].key).toBe('calories');
    });

    it('sortOptions defaults to empty array if not supplied', () => {
      const schema = defineLibrarySchema(minimalConfig);
      expect(schema.sortOptions).toEqual([]);
    });

    it('categories defaults to empty array if not supplied', () => {
      const schema = defineLibrarySchema(minimalConfig);
      expect(schema.categories).toEqual([]);
    });

    it('importFormat defaults to null if not supplied', () => {
      const schema = defineLibrarySchema(minimalConfig);
      expect(schema.importFormat).toBeNull();
    });
  });

  // ── Sample meal-library schema validates ─────────────────────────────────

  describe('sample meal-library schema', () => {
    it('mealLibraryConfig validates without throwing', () => {
      expect(() => defineLibrarySchema(mealLibraryConfig)).not.toThrow();
    });

    it('meal schema has name=MealLibrary, sliceKey=mealInventory', () => {
      const schema = defineLibrarySchema(mealLibraryConfig);
      expect(schema.name).toBe('MealLibrary');
      expect(schema.sliceKey).toBe('mealInventory');
    });

    it('meal schema has 5 fields', () => {
      const schema = defineLibrarySchema(mealLibraryConfig);
      expect(schema.fields).toHaveLength(5);
    });

    it('meal schema category field has type=enum with 5 options', () => {
      const schema = defineLibrarySchema(mealLibraryConfig);
      const catField = schema.fields.find((f) => f.key === 'category');
      expect(catField).toBeDefined();
      expect(catField.type).toBe('enum');
      expect(catField.options).toHaveLength(5);
    });

    it('meal schema has importFormat=csv', () => {
      const schema = defineLibrarySchema(mealLibraryConfig);
      expect(schema.importFormat).toBe('csv');
    });

    it('meal schema has 5 categories', () => {
      const schema = defineLibrarySchema(mealLibraryConfig);
      expect(schema.categories).toHaveLength(5);
    });

    it('meal schema has 2 sortOptions', () => {
      const schema = defineLibrarySchema(mealLibraryConfig);
      expect(schema.sortOptions).toHaveLength(2);
    });
  });
});
