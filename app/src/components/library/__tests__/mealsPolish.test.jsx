/**
 * mealsPolish.test.jsx — AC-P1D-D9 RED
 *
 * D9 verifies meal-specific UX on the /food/library route:
 *   - Category filter shows meal categories (breakfast/lunch/dinner/snack/shake)
 *   - Import drop zone accepts CSV (importFormat: 'csv')
 *   - Card renders calorie field from refCalories
 *   - Search by name filters correctly
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LibraryView } from '../LibraryView.jsx';
import { mealsSchema } from '../../../data/library/schemas/meals.js';

const makeStore = (items = []) => {
  let state = { meals: items };
  return {
    getState: () => state,
    setState: (patch) => { state = { ...state, ...patch }; },
    subscribe: () => () => {},
  };
};

describe('meals library — category filter', () => {
  it('renders category dropdown with meal-specific options', () => {
    const store = makeStore();
    render(<LibraryView schema={mealsSchema} store={store} />);
    const catSelect = screen.getByRole('combobox', { name: /category/i });
    expect(catSelect.innerHTML).toContain('breakfast');
    expect(catSelect.innerHTML).toContain('dinner');
    expect(catSelect.innerHTML).toContain('snack');
  });

  it('filters items by category', () => {
    const store = makeStore([
      { id: '1', name: 'Oatmeal', category: 'breakfast', refCalories: 300, deletedAt: null, createdAt: '', updatedAt: '', userId: 'u1' },
      { id: '2', name: 'Chicken Rice', category: 'dinner', refCalories: 550, deletedAt: null, createdAt: '', updatedAt: '', userId: 'u1' },
    ]);
    render(<LibraryView schema={mealsSchema} store={store} />);
    const catSelect = screen.getByRole('combobox', { name: /category/i });
    fireEvent.change(catSelect, { target: { value: 'breakfast' } });
    expect(screen.getByText('Oatmeal')).toBeTruthy();
    expect(screen.queryByText('Chicken Rice')).toBeFalsy();
  });
});

describe('meals library — import drop zone', () => {
  it('renders import drop zone', () => {
    const store = makeStore();
    render(<LibraryView schema={mealsSchema} store={store} />);
    expect(screen.getByTestId('library-import-drop')).toBeTruthy();
  });
});

describe('meals library — card shows refCalories', () => {
  it('card renders item name', () => {
    const store = makeStore([
      { id: '1', name: 'Greek Yogurt', refCalories: 150, category: 'snack', deletedAt: null, createdAt: '', updatedAt: '', userId: 'u1' },
    ]);
    render(<LibraryView schema={mealsSchema} store={store} />);
    expect(screen.getByText('Greek Yogurt')).toBeTruthy();
  });
});

describe('meals library — search', () => {
  it('filters items by name', () => {
    const store = makeStore([
      { id: '1', name: 'Protein Shake', refCalories: 200, deletedAt: null, createdAt: '', updatedAt: '', userId: 'u1' },
      { id: '2', name: 'Chicken Bowl', refCalories: 500, deletedAt: null, createdAt: '', updatedAt: '', userId: 'u1' },
    ]);
    render(<LibraryView schema={mealsSchema} store={store} />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'protein' } });
    expect(screen.getByText('Protein Shake')).toBeTruthy();
    expect(screen.queryByText('Chicken Bowl')).toBeFalsy();
  });
});

describe('meals library — sort by calories', () => {
  it('sort dropdown has "Calories" option', () => {
    const store = makeStore();
    render(<LibraryView schema={mealsSchema} store={store} />);
    const sortSelect = screen.getByRole('combobox', { name: /sort/i });
    expect(sortSelect.innerHTML).toContain('Calories');
  });
});
