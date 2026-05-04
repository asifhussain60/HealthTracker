/**
 * profileLibs.test.js — AC-P1D-D7 RED
 *
 * Tests for workLocations and sweetToothItems LibrarySchema descriptors.
 * (fastingSafeItems schema is already tested in P1.A)
 */
import { describe, it, expect } from 'vitest';
import { workLocationsSchema } from '../workLocations.js';
import { sweetToothItemsSchema } from '../sweetToothItems.js';
import { createLibraryRepo } from '../../LibraryRepo.js';

// ── workLocations ─────────────────────────────────────────────────────────────

describe('workLocationsSchema', () => {
  it('is frozen', () => expect(Object.isFrozen(workLocationsSchema)).toBe(true));
  it('has name "workLocations"', () => expect(workLocationsSchema.name).toBe('workLocations'));
  it('has sliceKey "workLocations"', () => expect(workLocationsSchema.sliceKey).toBe('workLocations'));

  it('has a name field', () => {
    expect(workLocationsSchema.fields.find((f) => f.key === 'name')).toBeTruthy();
  });

  it('has an address field', () => {
    expect(workLocationsSchema.fields.find((f) => f.key === 'address')).toBeTruthy();
  });

  it('has a locationType field (enum)', () => {
    const f = workLocationsSchema.fields.find((f) => f.key === 'locationType');
    expect(f).toBeTruthy();
    expect(f.type).toBe('enum');
    expect(f.options).toContain('office');
    expect(f.options).toContain('remote');
    expect(f.options).toContain('hybrid');
  });

  it('round-trips via LibraryRepo', () => {
    const store = { state: { workLocations: [] } };
    store.getState = () => store.state;
    store.setState = (p) => { store.state = { ...store.state, ...p }; };
    const repo = createLibraryRepo({ schema: workLocationsSchema, store });
    const item = repo.add({ name: 'Home Office', locationType: 'remote' });
    expect(item.id).toBeTruthy();
    expect(repo.list()[0].name).toBe('Home Office');
  });
});

// ── sweetToothItems ───────────────────────────────────────────────────────────

describe('sweetToothItemsSchema', () => {
  it('is frozen', () => expect(Object.isFrozen(sweetToothItemsSchema)).toBe(true));
  it('has name "sweetToothItems"', () => expect(sweetToothItemsSchema.name).toBe('sweetToothItems'));
  it('has sliceKey "sweetToothItems"', () => expect(sweetToothItemsSchema.sliceKey).toBe('sweetToothItems'));

  it('has a name field', () => {
    expect(sweetToothItemsSchema.fields.find((f) => f.key === 'name')).toBeTruthy();
  });

  it('has a category field (enum)', () => {
    const f = sweetToothItemsSchema.fields.find((f) => f.key === 'category');
    expect(f).toBeTruthy();
    expect(f.type).toBe('enum');
  });

  it('has a calories field (number)', () => {
    const f = sweetToothItemsSchema.fields.find((f) => f.key === 'calories');
    expect(f).toBeTruthy();
    expect(f.type).toBe('number');
  });

  it('round-trips via LibraryRepo', () => {
    const store = { state: { sweetToothItems: [] } };
    store.getState = () => store.state;
    store.setState = (p) => { store.state = { ...store.state, ...p }; };
    const repo = createLibraryRepo({ schema: sweetToothItemsSchema, store });
    const item = repo.add({ name: 'Chocolate Bar', category: 'chocolate', calories: 250 });
    expect(item.id).toBeTruthy();
    expect(repo.list()[0].category).toBe('chocolate');
  });
});
