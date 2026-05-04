/**
 * cannabis.test.js — AC-P1D-D6 RED
 *
 * Tests for cannabisProducts and cannabisDevices LibrarySchema descriptors.
 */
import { describe, it, expect } from 'vitest';
import { cannabisProductsSchema } from '../cannabisProducts.js';
import { cannabisDevicesSchema } from '../cannabisDevices.js';
import { createLibraryRepo } from '../../LibraryRepo.js';

// ── cannabisProducts ───────────────────────────────────────────────────────────

describe('cannabisProductsSchema', () => {
  it('is frozen', () => expect(Object.isFrozen(cannabisProductsSchema)).toBe(true));
  it('has name "cannabisProducts"', () => expect(cannabisProductsSchema.name).toBe('cannabisProducts'));
  it('has sliceKey "cannabisProducts"', () => expect(cannabisProductsSchema.sliceKey).toBe('cannabisProducts'));

  it('has a name field', () => {
    expect(cannabisProductsSchema.fields.find((f) => f.key === 'name')).toBeTruthy();
  });

  it('has a form field (enum)', () => {
    const f = cannabisProductsSchema.fields.find((f) => f.key === 'form');
    expect(f).toBeTruthy();
    expect(f.type).toBe('enum');
    expect(f.options).toContain('flower');
    expect(f.options).toContain('capsule');
  });

  it('has thcPercent field (number)', () => {
    const f = cannabisProductsSchema.fields.find((f) => f.key === 'thcPercent');
    expect(f).toBeTruthy();
    expect(f.type).toBe('number');
  });

  it('has riskLevel field (enum)', () => {
    const f = cannabisProductsSchema.fields.find((f) => f.key === 'riskLevel');
    expect(f).toBeTruthy();
    expect(f.type).toBe('enum');
  });

  it('has favoriteStars field (stars)', () => {
    const f = cannabisProductsSchema.fields.find((f) => f.key === 'favoriteStars');
    expect(f).toBeTruthy();
    expect(f.type).toBe('stars');
  });

  it('round-trips via LibraryRepo', () => {
    const store = { state: { cannabisProducts: [] } };
    store.getState = () => store.state;
    store.setState = (p) => { store.state = { ...store.state, ...p }; };
    const repo = createLibraryRepo({ schema: cannabisProductsSchema, store });
    const item = repo.add({ name: 'Jungle Pie', form: 'flower', thcPercent: 20 });
    expect(item.id).toBeTruthy();
    expect(repo.list()[0].name).toBe('Jungle Pie');
  });
});

// ── cannabisDevices ────────────────────────────────────────────────────────────

describe('cannabisDevicesSchema', () => {
  it('is frozen', () => expect(Object.isFrozen(cannabisDevicesSchema)).toBe(true));
  it('has name "cannabisDevices"', () => expect(cannabisDevicesSchema.name).toBe('cannabisDevices'));
  it('has sliceKey "cannabisDevices"', () => expect(cannabisDevicesSchema.sliceKey).toBe('cannabisDevices'));

  it('has a name field', () => {
    expect(cannabisDevicesSchema.fields.find((f) => f.key === 'name')).toBeTruthy();
  });

  it('has a deviceType field (enum)', () => {
    const f = cannabisDevicesSchema.fields.find((f) => f.key === 'deviceType');
    expect(f).toBeTruthy();
    expect(f.type).toBe('enum');
  });

  it('round-trips via LibraryRepo', () => {
    const store = { state: { cannabisDevices: [] } };
    store.getState = () => store.state;
    store.setState = (p) => { store.state = { ...store.state, ...p }; };
    const repo = createLibraryRepo({ schema: cannabisDevicesSchema, store });
    const item = repo.add({ name: 'Pax 3', deviceType: 'vaporizer' });
    expect(item.id).toBeTruthy();
    expect(repo.list()[0].deviceType).toBe('vaporizer');
  });
});
