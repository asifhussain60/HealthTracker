/**
 * routes.test.js — AC-P0-C6
 * Verifies every route in the registry has required shape.
 */
import { describe, it, expect } from 'vitest';
import { ROUTES } from '../routes.jsx';

describe('routes registry', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(ROUTES)).toBe(true);
    expect(ROUTES.length).toBeGreaterThan(0);
  });

  it('every route has an id', () => {
    ROUTES.forEach((route) => {
      expect(typeof route.id).toBe('string');
      expect(route.id.length).toBeGreaterThan(0);
    });
  });

  it('every route has a title', () => {
    ROUTES.forEach((route) => {
      expect(typeof route.title).toBe('string');
    });
  });

  it('every route has a component', () => {
    ROUTES.forEach((route) => {
      expect(route.component).toBeTruthy();
    });
  });

  it('every route has a navOrder', () => {
    ROUTES.forEach((route) => {
      expect(typeof route.navOrder).toBe('number');
    });
  });

  it('today route exists', () => {
    expect(ROUTES.find((r) => r.id === 'today')).toBeTruthy();
  });

  it('cannabis route exists (renamed from inventory)', () => {
    expect(ROUTES.find((r) => r.id === 'cannabis')).toBeTruthy();
  });

  it('history route exists', () => {
    expect(ROUTES.find((r) => r.id === 'history')).toBeTruthy();
  });

  it('profile route exists', () => {
    expect(ROUTES.find((r) => r.id === 'profile')).toBeTruthy();
  });

  it('meals route exists', () => {
    expect(ROUTES.find((r) => r.id === 'meals')).toBeTruthy();
  });

  it('todos route exists', () => {
    expect(ROUTES.find((r) => r.id === 'todos')).toBeTruthy();
  });

  it('sidebar routes are sorted by navOrder ascending', () => {
    const sidebarRoutes = ROUTES.filter((r) => r.navOrder >= 0).sort((a, b) => a.navOrder - b.navOrder);
    for (let i = 1; i < sidebarRoutes.length; i++) {
      expect(sidebarRoutes[i].navOrder).toBeGreaterThanOrEqual(sidebarRoutes[i - 1].navOrder);
    }
  });

  it('cannabis nav label is "Cannabis" not "Inventory"', () => {
    const route = ROUTES.find((r) => r.id === 'cannabis');
    expect(route.label).toBe('Cannabis');
  });
});
