/**
 * macroMath.test.js — RED phase tests for macroMath calculator
 *
 * Covers: foodWeightFromTotal, scaledMacros, consumedMacrosForSlot
 * All inputs are parameters — no store, no Date.now(), no React.
 */

import { describe, it, expect } from 'vitest';
import {
  foodWeightFromTotal,
  scaledMacros,
  consumedMacrosForSlot,
} from '../macroMath.js';

// ── foodWeightFromTotal ───────────────────────────────────────────────────────

describe('foodWeightFromTotal — max(0, plateWeight − plateDefaultGrams)', () => {
  it.each([
    // [plateWeight, plateDefaultGrams, expected]
    [500, 350, 150],    // normal dinner plate: food weight = 150g
    [350, 350, 0],      // empty plate weight only → 0
    [200, 350, 0],      // under plate weight → clamped to 0 (no negative)
    [0, 350, 0],        // zero total → 0
    [460, 460, 0],      // exactly at default → 0
    [461, 460, 1],      // 1 gram of food
    [1000, 460, 540],   // heavy plate
    [250, 0, 250],      // no plate (shake) — plateDefault = 0
  ])(
    'plateWeight=%s plateDefault=%s → foodWeight=%s',
    (plateWeight, plateDefaultGrams, expected) => {
      expect(foodWeightFromTotal(plateWeight, plateDefaultGrams)).toBe(expected);
    }
  );
});

// ── scaledMacros ──────────────────────────────────────────────────────────────

describe('scaledMacros — scales reference macros by foodWeight / referenceWeight', () => {
  const refMacros = {
    calories: 200,
    protein: 20,
    carbs: 25,
    fat: 5,
  };

  it.each([
    // [foodWeightGrams, referenceWeightGrams, expectedCalories, expectedProtein, expectedCarbs, expectedFat]
    [100, 100, 200, 20, 25, 5],      // 1:1 — same as reference
    [50, 100, 100, 10, 12.5, 2.5],   // half portion
    [200, 100, 400, 40, 50, 10],     // double portion
    [0, 100, 0, 0, 0, 0],            // no food — all zeros
    [75, 150, 100, 10, 12.5, 2.5],   // 75/150 = 0.5 ratio
  ])(
    'foodWeight=%s refWeight=%s → cal=%s prot=%s carbs=%s fat=%s',
    (foodWeightGrams, referenceWeightGrams, expectedCalories, expectedProtein, expectedCarbs, expectedFat) => {
      const result = scaledMacros(refMacros, foodWeightGrams, referenceWeightGrams);
      expect(result.calories).toBeCloseTo(expectedCalories, 2);
      expect(result.protein).toBeCloseTo(expectedProtein, 2);
      expect(result.carbs).toBeCloseTo(expectedCarbs, 2);
      expect(result.fat).toBeCloseTo(expectedFat, 2);
    }
  );

  it('returns object with all four macro keys', () => {
    const result = scaledMacros(refMacros, 100, 100);
    expect(result).toHaveProperty('calories');
    expect(result).toHaveProperty('protein');
    expect(result).toHaveProperty('carbs');
    expect(result).toHaveProperty('fat');
  });

  it('returns all zeros when referenceWeightGrams is 0 (avoid division by zero)', () => {
    const result = scaledMacros(refMacros, 100, 0);
    expect(result.calories).toBe(0);
    expect(result.protein).toBe(0);
    expect(result.carbs).toBe(0);
    expect(result.fat).toBe(0);
  });
});

// ── consumedMacrosForSlot ─────────────────────────────────────────────────────

describe('consumedMacrosForSlot — returns null for un-eaten or no plateWeight', () => {
  const mealItem = {
    referenceWeight: 100,
    refCalories: 300,
    refProtein: 25,
    refCarbs: 30,
    refFat: 8,
  };
  const plateDefaults = {
    breakfast: 250,
    lunch: 350,
    dinner: 460,
    snack: 150,
    shake: 0,
  };

  it('returns null when slot.eaten is false', () => {
    const slot = { eaten: false, plateWeight: 500, category: 'dinner' };
    expect(consumedMacrosForSlot(slot, mealItem, plateDefaults)).toBeNull();
  });

  it('returns null when slot.plateWeight is null', () => {
    const slot = { eaten: true, plateWeight: null, category: 'dinner' };
    expect(consumedMacrosForSlot(slot, mealItem, plateDefaults)).toBeNull();
  });

  it('returns null when slot.plateWeight is undefined', () => {
    const slot = { eaten: true, category: 'dinner' };
    expect(consumedMacrosForSlot(slot, mealItem, plateDefaults)).toBeNull();
  });

  it('returns null when mealInventoryItem is null', () => {
    const slot = { eaten: true, plateWeight: 600, category: 'dinner' };
    expect(consumedMacrosForSlot(slot, null, plateDefaults)).toBeNull();
  });
});

describe('consumedMacrosForSlot — computes macros for eaten slots', () => {
  const mealItem = {
    referenceWeight: 100,
    refCalories: 300,
    refProtein: 25,
    refCarbs: 30,
    refFat: 8,
  };
  const plateDefaults = {
    breakfast: 250,
    lunch: 350,
    dinner: 460,
    snack: 150,
    shake: 0,
  };

  it.each([
    // dinner: plateWeight=600, plateDefault=460 → foodWeight=140 → ratio=140/100=1.4
    // cal=420, prot=35, carbs=42, fat=11.2
    ['dinner', 600, 420, 35, 42, 11.2],
    // lunch: plateWeight=450, plateDefault=350 → foodWeight=100 → ratio=1.0
    // cal=300, prot=25, carbs=30, fat=8
    ['lunch', 450, 300, 25, 30, 8],
    // breakfast: plateWeight=350, plateDefault=250 → foodWeight=100 → ratio=1.0
    // cal=300, prot=25, carbs=30, fat=8
    ['breakfast', 350, 300, 25, 30, 8],
    // snack: plateWeight=200, plateDefault=150 → foodWeight=50 → ratio=0.5
    // cal=150, prot=12.5, carbs=15, fat=4
    ['snack', 200, 150, 12.5, 15, 4],
  ])(
    'category=%s plateWeight=%s → cal=%s prot=%s carbs=%s fat=%s',
    (category, plateWeight, expectedCalories, expectedProtein, expectedCarbs, expectedFat) => {
      const slot = { eaten: true, plateWeight, category };
      const result = consumedMacrosForSlot(slot, mealItem, plateDefaults);
      expect(result).not.toBeNull();
      expect(result.calories).toBeCloseTo(expectedCalories, 1);
      expect(result.protein).toBeCloseTo(expectedProtein, 1);
      expect(result.carbs).toBeCloseTo(expectedCarbs, 1);
      expect(result.fat).toBeCloseTo(expectedFat, 1);
    }
  );

  it('shake (no plate): plateWeight=300, plateDefault=0 → foodWeight=300 → ratio=3.0', () => {
    const slot = { eaten: true, plateWeight: 300, category: 'shake' };
    const result = consumedMacrosForSlot(slot, mealItem, plateDefaults);
    expect(result).not.toBeNull();
    // ratio = 300/100 = 3
    expect(result.calories).toBeCloseTo(900, 1);
    expect(result.protein).toBeCloseTo(75, 1);
  });

  it('clamps to zero when plate total is below plate default (foodWeight → 0)', () => {
    // dinner default=460; user entered 400 (below default) → foodWeight=0
    const slot = { eaten: true, plateWeight: 400, category: 'dinner' };
    const result = consumedMacrosForSlot(slot, mealItem, plateDefaults);
    expect(result).not.toBeNull();
    expect(result.calories).toBe(0);
    expect(result.protein).toBe(0);
    expect(result.carbs).toBe(0);
    expect(result.fat).toBe(0);
  });

  it('honors PF-12: eaten slots are read-only inputs (function never mutates slot)', () => {
    const slot = { eaten: true, plateWeight: 600, category: 'dinner' };
    const slotCopy = { ...slot };
    consumedMacrosForSlot(slot, mealItem, plateDefaults);
    expect(slot).toEqual(slotCopy); // slot is not mutated
  });
});
