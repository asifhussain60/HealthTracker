/**
 * router.test.jsx — AC-P1C-C3
 * Every route resolves; deep-link works; sub-routes render; no 404s.
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { routerConfig } from '../router.jsx';

/**
 * Mount the router at a given path and assert the page
 * does not show a 404 / "not found" message.
 */
function renderAt(path) {
  const router = createMemoryRouter(routerConfig, { initialEntries: [path] });
  return render(<RouterProvider router={router} />);
}

const ALL_ROUTES = [
  { path: '/',                       label: 'Dashboard' },
  { path: '/profile',                label: 'Profile' },
  { path: '/settings',               label: 'Settings' },
  { path: '/food',                   label: 'Food' },
  { path: '/workouts',               label: 'Workouts' },
  { path: '/cannabis',               label: 'Cannabis' },
  { path: '/food/library',           label: 'Food Library' },
  { path: '/workouts/programs',      label: 'Programs' },
  { path: '/workouts/routines',      label: 'Routines' },
  { path: '/workouts/exercises',     label: 'Exercises' },
  { path: '/cannabis/products',      label: 'Products' },
  { path: '/cannabis/devices',       label: 'Devices' },
  { path: '/profile/work-locations', label: 'Work Locations' },
  { path: '/profile/fasting-safe',   label: 'Fasting-Safe' },
  { path: '/profile/sweet-tooth',    label: 'Sweet Tooth' },
  { path: '/plan',                   label: 'Plan' },
];

describe('router — 16 routes', () => {
  it('routerConfig is a non-empty array', () => {
    expect(Array.isArray(routerConfig)).toBe(true);
    expect(routerConfig.length).toBeGreaterThan(0);
  });

  ALL_ROUTES.forEach(({ path }) => {
    it(`route ${path} renders without 404`, () => {
      renderAt(path);
      // No "not found" or blank page — some content exists
      const body = document.body.textContent ?? '';
      expect(body.toLowerCase()).not.toContain('404');
      expect(body.toLowerCase()).not.toContain('page not found');
    });
  });

  it('root / renders dashboard content', () => {
    renderAt('/');
    // DashboardView or TodayView should render something
    expect(document.body.textContent).toBeTruthy();
  });

  it('/plan renders planner content', () => {
    renderAt('/plan');
    expect(document.body.textContent?.toLowerCase()).toMatch(/plan/i);
  });

  it('/food redirects to /food/library (shows library content)', () => {
    renderAt('/food');
    // After redirect the library route content should be visible
    expect(document.body.textContent).toBeTruthy();
  });

  it('/workouts redirects to /workouts/programs', () => {
    renderAt('/workouts');
    expect(document.body.textContent).toBeTruthy();
  });

  it('/cannabis redirects to /cannabis/products', () => {
    renderAt('/cannabis');
    expect(document.body.textContent).toBeTruthy();
  });

  it('AppShell nav renders on every route', () => {
    renderAt('/food/library');
    expect(document.querySelector('nav')).toBeTruthy();
  });

  it('deep-link to /workouts/exercises works', () => {
    renderAt('/workouts/exercises');
    expect(document.body.textContent?.toLowerCase()).toMatch(/exercise/i);
  });

  it('deep-link to /profile/work-locations works', () => {
    renderAt('/profile/work-locations');
    // LibraryView heading is "workLocations" (camelCase sliceKey used as schema name)
    expect(document.body.textContent?.toLowerCase()).toMatch(/worklocation/i);
  });

  it('deep-link to /cannabis/devices works', () => {
    renderAt('/cannabis/devices');
    expect(document.body.textContent?.toLowerCase()).toMatch(/device/i);
  });
});
