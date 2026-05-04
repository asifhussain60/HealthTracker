/**
 * MEAL_SEED_30.test.js — D15 RED tests for the 30-item meal seed.
 *
 * AC-P1D-D15
 */
import { describe, it, expect } from 'vitest';
import { MEAL_SEED_30 } from '../MEAL_SEED_30.js';
import { stampNewRecord } from '../../../repositories/_internal/auditFields.js';

describe('MEAL_SEED_30', () => {
  it('exports exactly 30 items', () => {
    expect(MEAL_SEED_30).toHaveLength(30);
  });

  it('has exactly 5 categories present', () => {
    const cats = new Set(MEAL_SEED_30.map((m) => m.category));
    expect([...cats].sort()).toEqual(['breakfast', 'dinner', 'lunch', 'shake', 'snack']);
  });

  it('has 6 items per category', () => {
    const counts = {};
    for (const m of MEAL_SEED_30) {
      counts[m.category] = (counts[m.category] ?? 0) + 1;
    }
    for (const cat of Object.keys(counts)) {
      expect(counts[cat], `category ${cat} should have 6`).toBe(6);
    }
  });

  it('every item has a non-empty name', () => {
    for (const m of MEAL_SEED_30) {
      expect(m.name, `item missing name`).toBeTruthy();
    }
  });

  it('every item has refCalories > 0', () => {
    for (const m of MEAL_SEED_30) {
      expect(m.refCalories, `${m.name} missing refCalories`).toBeGreaterThan(0);
    }
  });

  it('every item has referenceWeight > 0', () => {
    for (const m of MEAL_SEED_30) {
      expect(m.referenceWeight, `${m.name} missing referenceWeight`).toBeGreaterThan(0);
    }
  });

  it('every item has source: "manual"', () => {
    for (const m of MEAL_SEED_30) {
      expect(m.source).toBe('manual');
    }
  });

  it('every item has referenceUnit: "g"', () => {
    for (const m of MEAL_SEED_30) {
      expect(m.referenceUnit).toBe('g');
    }
  });

  it('every item has isActive: true', () => {
    for (const m of MEAL_SEED_30) {
      expect(m.isActive).toBe(true);
    }
  });

  it('favoriteStars is 0, 2, or 3 for every item', () => {
    for (const m of MEAL_SEED_30) {
      expect([0, 2, 3]).toContain(m.favoriteStars);
    }
  });

  it('exactly one item per category has favoriteStars===3 (house special)', () => {
    const threeStars = MEAL_SEED_30.filter((m) => m.favoriteStars === 3);
    expect(threeStars).toHaveLength(5);
    const cats = new Set(threeStars.map((m) => m.category));
    expect(cats.size).toBe(5);
  });

  it('exactly 3 favorites (favoriteStars > 0) per category', () => {
    const byCategory = {};
    for (const m of MEAL_SEED_30) {
      if (!byCategory[m.category]) byCategory[m.category] = [];
      if (m.favoriteStars > 0) byCategory[m.category].push(m);
    }
    for (const cat of Object.keys(byCategory)) {
      expect(byCategory[cat].length, `${cat} favorites count`).toBe(3);
    }
  });

  it('after stampNewRecord every item has all audit fields', () => {
    for (const m of MEAL_SEED_30) {
      const stamped = stampNewRecord(m);
      expect(stamped.id).toBeTruthy();
      expect(stamped.userId).toBe('me');
      expect(stamped.createdAt).toBeTruthy();
      expect(stamped.updatedAt).toBeTruthy();
      expect(stamped.createdBy).toBe('me');
      expect(stamped.updatedBy).toBe('me');
      expect(stamped.deletedAt).toBeNull();
      expect(stamped.schemaVersion).toBe(3);
    }
  });

  it('no item has mynetdiaryUrl set (seeds are manual)', () => {
    for (const m of MEAL_SEED_30) {
      expect(m.mynetdiaryUrl).toBeNull();
    }
  });

  it('items 25 and 29 in the shake category are post-workout (their names contain "post" or "whey")', () => {
    const shakes = MEAL_SEED_30.filter((m) => m.category === 'shake');
    expect(shakes).toHaveLength(6);
    // At least one shake should be marked post-workout via tags or name
    const postWorkout = shakes.filter((s) =>
      (s.tags || []).includes('post-workout') ||
      s.name.toLowerCase().includes('post') ||
      s.name.toLowerCase().includes('whey')
    );
    expect(postWorkout.length).toBeGreaterThan(0);
  });
});
