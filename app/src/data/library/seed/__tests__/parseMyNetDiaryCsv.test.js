/**
 * parseMyNetDiaryCsv.test.js — D15 RED tests for the CSV parser.
 *
 * AC-P1D-D15
 */
import { describe, it, expect } from 'vitest';
import { parseMyNetDiaryCsv } from '../parseMyNetDiaryCsv.js';

// ── CSV fixture helpers ───────────────────────────────────────────────────────

function makeRow(overrides = {}) {
  const defaults = {
    'Recipe Name': 'Chicken Salad',
    'Calories': '350',
    'Protein (g)': '30',
    'Carbs (g)': '15',
    'Fat (g)': '10',
    'URL': '',
    'Category': 'lunch',
    'Favorite Stars': '2',
    'Tags': 'halal,high-protein',
    'Ingredients': 'Chicken, lettuce, tomato',
    'Prep Notes': 'Mix well',
    'Reference Weight (g)': '300',
  };
  return { ...defaults, ...overrides };
}

function rowsToCsv(rows) {
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(','),
    ...rows.map((r) =>
      headers.map((h) => {
        const v = r[h] ?? '';
        // Wrap in quotes if contains comma
        return v.toString().includes(',') ? `"${v}"` : v;
      }).join(',')
    ),
  ];
  return lines.join('\n');
}

// Existing library (simulates state before import)
function makeExistingLibrary(items = []) {
  return items;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('parseMyNetDiaryCsv — happy path', () => {
  it('parses a single row and returns added:1', () => {
    const csv = rowsToCsv([makeRow()]);
    const result = parseMyNetDiaryCsv(csv, makeExistingLibrary());
    expect(result.added).toBe(1);
    expect(result.updated).toBe(0);
    expect(result.skipped).toBe(0);
    expect(result.needsAttention).toHaveLength(0);
    expect(result.items).toHaveLength(1);
  });

  it('maps Recipe Name → name', () => {
    const csv = rowsToCsv([makeRow({ 'Recipe Name': 'Test Meal' })]);
    const result = parseMyNetDiaryCsv(csv, makeExistingLibrary());
    expect(result.items[0].name).toBe('Test Meal');
  });

  it('maps Calories → refCalories as number', () => {
    const csv = rowsToCsv([makeRow({ 'Calories': '450' })]);
    const result = parseMyNetDiaryCsv(csv, makeExistingLibrary());
    expect(result.items[0].refCalories).toBe(450);
  });

  it('maps Protein (g) → refProtein', () => {
    const csv = rowsToCsv([makeRow({ 'Protein (g)': '25' })]);
    const result = parseMyNetDiaryCsv(csv, makeExistingLibrary());
    expect(result.items[0].refProtein).toBe(25);
  });

  it('maps Carbs (g) → refCarbs', () => {
    const csv = rowsToCsv([makeRow({ 'Carbs (g)': '40' })]);
    const result = parseMyNetDiaryCsv(csv, makeExistingLibrary());
    expect(result.items[0].refCarbs).toBe(40);
  });

  it('maps Fat (g) → refFat', () => {
    const csv = rowsToCsv([makeRow({ 'Fat (g)': '12' })]);
    const result = parseMyNetDiaryCsv(csv, makeExistingLibrary());
    expect(result.items[0].refFat).toBe(12);
  });

  it('maps Category → category (lowercase)', () => {
    const csv = rowsToCsv([makeRow({ 'Category': 'Breakfast' })]);
    const result = parseMyNetDiaryCsv(csv, makeExistingLibrary());
    expect(result.items[0].category).toBe('breakfast');
  });

  it('maps Reference Weight (g) → referenceWeight', () => {
    const csv = rowsToCsv([makeRow({ 'Reference Weight (g)': '250' })]);
    const result = parseMyNetDiaryCsv(csv, makeExistingLibrary());
    expect(result.items[0].referenceWeight).toBe(250);
  });

  it('defaults referenceWeight to 100 if missing', () => {
    const row = makeRow();
    delete row['Reference Weight (g)'];
    const csv = rowsToCsv([row]);
    const result = parseMyNetDiaryCsv(csv, makeExistingLibrary());
    expect(result.items[0].referenceWeight).toBe(100);
  });

  it('maps Favorite Stars → favoriteStars as number', () => {
    const csv = rowsToCsv([makeRow({ 'Favorite Stars': '3' })]);
    const result = parseMyNetDiaryCsv(csv, makeExistingLibrary());
    expect(result.items[0].favoriteStars).toBe(3);
  });

  it('maps Tags → tags as array (trimmed, lowercased)', () => {
    const csv = rowsToCsv([makeRow({ 'Tags': 'Halal, High-Protein, IF-Friendly' })]);
    const result = parseMyNetDiaryCsv(csv, makeExistingLibrary());
    expect(result.items[0].tags).toEqual(['halal', 'high-protein', 'if-friendly']);
  });

  it('handles tags with commas in quoted field', () => {
    const headers = ['Recipe Name', 'Calories', 'Tags'];
    const csv = `${headers.join(',')}\n"Meal One","300","halal, high-protein"`;
    const result = parseMyNetDiaryCsv(csv, makeExistingLibrary());
    expect(result.items[0].tags).toEqual(['halal', 'high-protein']);
  });

  it('sets source: "csv-import" when no URL', () => {
    const csv = rowsToCsv([makeRow({ 'URL': '' })]);
    const result = parseMyNetDiaryCsv(csv, makeExistingLibrary());
    expect(result.items[0].source).toBe('csv-import');
  });

  it('sets source: "mynetdiary" when URL is a mynetdiary.com URL', () => {
    const csv = rowsToCsv([makeRow({ 'URL': 'https://www.mynetdiary.com/food.do?id=12345' })]);
    const result = parseMyNetDiaryCsv(csv, makeExistingLibrary());
    expect(result.items[0].source).toBe('mynetdiary');
  });
});

describe('parseMyNetDiaryCsv — idempotency', () => {
  it('importing same CSV twice yields added:0, skipped:1 on second call (name-based)', () => {
    const csv = rowsToCsv([makeRow({ 'Recipe Name': 'UniqueTestMeal' })]);
    const firstResult = parseMyNetDiaryCsv(csv, makeExistingLibrary());
    // Second call with the first call's items as existing library
    const secondResult = parseMyNetDiaryCsv(csv, firstResult.items);
    expect(secondResult.added).toBe(0);
    expect(secondResult.updated + secondResult.skipped).toBeGreaterThanOrEqual(1);
  });

  it('importing same CSV twice with 6 rows: second time added:0, updated/skipped:6', () => {
    const rows = [
      makeRow({ 'Recipe Name': 'Meal A' }),
      makeRow({ 'Recipe Name': 'Meal B' }),
      makeRow({ 'Recipe Name': 'Meal C' }),
      makeRow({ 'Recipe Name': 'Meal D' }),
      makeRow({ 'Recipe Name': 'Meal E' }),
      makeRow({ 'Recipe Name': 'Meal F' }),
    ];
    const csv = rowsToCsv(rows);
    const firstResult = parseMyNetDiaryCsv(csv, makeExistingLibrary());
    const secondResult = parseMyNetDiaryCsv(csv, firstResult.items);
    expect(secondResult.added).toBe(0);
    expect(secondResult.updated + secondResult.skipped).toBe(6);
  });
});

describe('parseMyNetDiaryCsv — edge cases', () => {
  it('empty Calories → refCalories: null, needs-cal badge', () => {
    const csv = rowsToCsv([makeRow({ 'Calories': '' })]);
    const result = parseMyNetDiaryCsv(csv, makeExistingLibrary());
    // Row is imported but refCalories is null
    expect(result.items[0].refCalories).toBeNull();
    expect(result.needsAttention.some((n) => n.reason === 'needs-cal')).toBe(true);
  });

  it('blank name row is rejected with missing-name reason', () => {
    const csv = rowsToCsv([makeRow({ 'Recipe Name': '' })]);
    const result = parseMyNetDiaryCsv(csv, makeExistingLibrary());
    expect(result.added).toBe(0);
    expect(result.needsAttention.some((n) => n.reason === 'missing-name')).toBe(true);
  });

  it('negative macro value rejects row', () => {
    const csv = rowsToCsv([makeRow({ 'Protein (g)': '-5' })]);
    const result = parseMyNetDiaryCsv(csv, makeExistingLibrary());
    expect(result.added).toBe(0);
    expect(result.needsAttention.some((n) => n.reason.startsWith('negative-macro'))).toBe(true);
  });

  it('returns errors array (not throw) on malformed CSV — mismatched quotes', () => {
    const malformed = 'Recipe Name,Calories\n"Broken meal,300';
    expect(() => parseMyNetDiaryCsv(malformed, makeExistingLibrary())).not.toThrow();
    // The function should still return a result object
    const result = parseMyNetDiaryCsv(malformed, makeExistingLibrary());
    expect(result).toHaveProperty('added');
    expect(result).toHaveProperty('needsAttention');
  });

  it('category keyword heuristic: "oatmeal" in name → breakfast when no Category column', () => {
    const row = { 'Recipe Name': 'Steel-cut oatmeal', 'Calories': '300' };
    const csv = `Recipe Name,Calories\n${row['Recipe Name']},${row.Calories}`;
    const result = parseMyNetDiaryCsv(csv, makeExistingLibrary());
    expect(result.items[0].category).toBe('breakfast');
  });

  it('category keyword heuristic: "shake" in name → shake when no Category column', () => {
    const csv = 'Recipe Name,Calories\nProtein shake,250';
    const result = parseMyNetDiaryCsv(csv, makeExistingLibrary());
    expect(result.items[0].category).toBe('shake');
  });

  it('missing category with unknown name → snack with needs-category in needsAttention', () => {
    const csv = 'Recipe Name,Calories\nUnknown food item,200';
    const result = parseMyNetDiaryCsv(csv, makeExistingLibrary());
    expect(result.items[0].category).toBe('snack');
    expect(result.needsAttention.some((n) => n.reason === 'needs-category')).toBe(true);
  });
});
