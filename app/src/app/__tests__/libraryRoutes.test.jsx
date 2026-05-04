/**
 * libraryRoutes.test.jsx — AC-P1D-D8 RED
 *
 * Asserts all 9 library routes render <LibraryView> with the correct
 * schema name in the heading (replacing the old <LibraryRouteShell> placeholders).
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { routerConfig } from '../router.jsx';

function renderAt(path) {
  const router = createMemoryRouter(routerConfig, { initialEntries: [path] });
  return render(<RouterProvider router={router} />);
}

const LIBRARY_ROUTES = [
  { path: '/food/library',           schemaName: 'meals' },
  { path: '/workouts/programs',      schemaName: 'workoutPrograms' },
  { path: '/workouts/routines',      schemaName: 'workoutRoutines' },
  { path: '/workouts/exercises',     schemaName: 'exercises' },
  { path: '/cannabis/products',      schemaName: 'cannabisProducts' },
  { path: '/cannabis/devices',       schemaName: 'cannabisDevices' },
  { path: '/profile/work-locations', schemaName: 'workLocations' },
  { path: '/profile/fasting-safe',   schemaName: 'fastingSafeItems' },
  { path: '/profile/sweet-tooth',    schemaName: 'sweetToothItems' },
];

describe('9 library routes — real <LibraryView> mount', () => {
  LIBRARY_ROUTES.forEach(({ path, schemaName }) => {
    it(`${path} renders LibraryView heading with "${schemaName}"`, () => {
      renderAt(path);
      const heading = screen.getByRole('heading', { level: 2, name: schemaName });
      expect(heading.textContent).toBe(schemaName);
    });
  });

  it('food/library renders search input', () => {
    renderAt('/food/library');
    expect(screen.getByRole('searchbox')).toBeTruthy();
  });

  it('cannabis/products renders Add button', () => {
    renderAt('/cannabis/products');
    expect(screen.getByRole('button', { name: /add/i })).toBeTruthy();
  });

  it('workouts/exercises renders sort dropdown', () => {
    renderAt('/workouts/exercises');
    expect(screen.getByRole('combobox', { name: /sort/i })).toBeTruthy();
  });
});
