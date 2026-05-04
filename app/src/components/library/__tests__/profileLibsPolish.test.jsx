/**
 * profileLibsPolish.test.jsx — AC-P1D-D12 RED
 *
 * D12 verifies /profile library route UX:
 *   - fastingSafeItems: search, add, soft-delete
 *   - workLocations: locationType filter
 *   - sweetToothItems: category filter (chocolate/candy/etc.)
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LibraryView } from '../LibraryView.jsx';
import { fastingSafeItemsSchema } from '../../../data/library/schemas/fastingSafeItems.js';
import { workLocationsSchema } from '../../../data/library/schemas/workLocations.js';
import { sweetToothItemsSchema } from '../../../data/library/schemas/sweetToothItems.js';

function makeStore(sliceKey, items = []) {
  let state = { [sliceKey]: items };
  return {
    getState: () => state,
    setState: (patch) => { state = { ...state, ...patch }; },
    subscribe: () => () => {},
  };
}

describe('fastingSafeItems library', () => {
  it('renders heading "fastingSafeItems"', () => {
    const store = makeStore('fastingSafeItems');
    render(<LibraryView schema={fastingSafeItemsSchema} store={store} />);
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('fastingSafeItems');
  });

  it('search filters items by name', () => {
    const store = makeStore('fastingSafeItems', [
      { id: '1', name: 'Water', deletedAt: null, createdAt: '', updatedAt: '', userId: 'u1' },
      { id: '2', name: 'Green Tea', deletedAt: null, createdAt: '', updatedAt: '', userId: 'u1' },
    ]);
    render(<LibraryView schema={fastingSafeItemsSchema} store={store} />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'green' } });
    expect(screen.getByText('Green Tea')).toBeTruthy();
    expect(screen.queryByText('Water')).toBeFalsy();
  });

  it('add button opens modal with form', () => {
    const store = makeStore('fastingSafeItems');
    render(<LibraryView schema={fastingSafeItemsSchema} store={store} />);
    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('sort options include Name and Stars', () => {
    const store = makeStore('fastingSafeItems');
    render(<LibraryView schema={fastingSafeItemsSchema} store={store} />);
    const sort = screen.getByRole('combobox', { name: /sort/i });
    expect(sort.innerHTML).toContain('Name');
    expect(sort.innerHTML).toContain('Stars');
  });
});

describe('workLocations library', () => {
  it('renders heading "workLocations"', () => {
    const store = makeStore('workLocations');
    render(<LibraryView schema={workLocationsSchema} store={store} />);
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('workLocations');
  });

  it('renders locationType category filter', () => {
    const store = makeStore('workLocations');
    render(<LibraryView schema={workLocationsSchema} store={store} />);
    const cat = screen.getByRole('combobox', { name: /category/i });
    expect(cat.innerHTML).toContain('office');
    expect(cat.innerHTML).toContain('remote');
  });

  it('filters by locationType', () => {
    const store = makeStore('workLocations', [
      { id: '1', name: 'Home Office', locationType: 'remote', deletedAt: null, createdAt: '', updatedAt: '', userId: 'u1' },
      { id: '2', name: 'Downtown Office', locationType: 'office', deletedAt: null, createdAt: '', updatedAt: '', userId: 'u1' },
    ]);
    render(<LibraryView schema={workLocationsSchema} store={store} />);
    fireEvent.change(screen.getByRole('combobox', { name: /category/i }), { target: { value: 'remote' } });
    expect(screen.getByText('Home Office')).toBeTruthy();
    expect(screen.queryByText('Downtown Office')).toBeFalsy();
  });
});

describe('sweetToothItems library', () => {
  it('renders heading "sweetToothItems"', () => {
    const store = makeStore('sweetToothItems');
    render(<LibraryView schema={sweetToothItemsSchema} store={store} />);
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('sweetToothItems');
  });

  it('renders category filter with sweet-tooth categories', () => {
    const store = makeStore('sweetToothItems');
    render(<LibraryView schema={sweetToothItemsSchema} store={store} />);
    const cat = screen.getByRole('combobox', { name: /category/i });
    expect(cat.innerHTML).toContain('chocolate');
    expect(cat.innerHTML).toContain('candy');
  });

  it('sort options include Calories', () => {
    const store = makeStore('sweetToothItems');
    render(<LibraryView schema={sweetToothItemsSchema} store={store} />);
    const sort = screen.getByRole('combobox', { name: /sort/i });
    expect(sort.innerHTML).toContain('Calories');
  });
});
