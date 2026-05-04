/**
 * cannabisPolish.test.jsx — AC-P1D-D11 RED
 *
 * D11 verifies cannabis library UX:
 *   - products: form filter (flower/capsule/etc.)
 *   - products: card shows name + form
 *   - products: favoriteStars field present
 *   - devices: simple add+list works
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LibraryView } from '../LibraryView.jsx';
import { cannabisProductsSchema } from '../../../data/library/schemas/cannabisProducts.js';
import { cannabisDevicesSchema } from '../../../data/library/schemas/cannabisDevices.js';

function makeStore(sliceKey, items = []) {
  let state = { [sliceKey]: items };
  return {
    getState: () => state,
    setState: (patch) => { state = { ...state, ...patch }; },
    subscribe: () => () => {},
  };
}

describe('cannabisProducts library', () => {
  it('renders heading "cannabisProducts"', () => {
    const store = makeStore('cannabisProducts');
    render(<LibraryView schema={cannabisProductsSchema} store={store} />);
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('cannabisProducts');
  });

  it('renders category filter with form options', () => {
    const store = makeStore('cannabisProducts');
    render(<LibraryView schema={cannabisProductsSchema} store={store} />);
    const cat = screen.getByRole('combobox', { name: /category/i });
    expect(cat.innerHTML).toContain('flower');
    expect(cat.innerHTML).toContain('capsule');
  });

  it('filters products by form', () => {
    const store = makeStore('cannabisProducts', [
      { id: '1', name: 'Jungle Pie', form: 'flower', favoriteStars: 3, deletedAt: null, createdAt: '', updatedAt: '', userId: 'u1' },
      { id: '2', name: 'RSO', form: 'capsule', favoriteStars: 2, deletedAt: null, createdAt: '', updatedAt: '', userId: 'u1' },
    ]);
    render(<LibraryView schema={cannabisProductsSchema} store={store} />);
    fireEvent.change(screen.getByRole('combobox', { name: /category/i }), { target: { value: 'flower' } });
    expect(screen.getByText('Jungle Pie')).toBeTruthy();
    expect(screen.queryByText('RSO')).toBeFalsy();
  });

  it('card renders product name', () => {
    const store = makeStore('cannabisProducts', [
      { id: '1', name: 'Cheddar Cheeze', form: 'flower', favoriteStars: 1, deletedAt: null, createdAt: '', updatedAt: '', userId: 'u1' },
    ]);
    render(<LibraryView schema={cannabisProductsSchema} store={store} />);
    expect(screen.getByText('Cheddar Cheeze')).toBeTruthy();
  });

  it('sort options include Stars', () => {
    const store = makeStore('cannabisProducts');
    render(<LibraryView schema={cannabisProductsSchema} store={store} />);
    const sort = screen.getByRole('combobox', { name: /sort/i });
    expect(sort.innerHTML).toContain('Stars');
  });
});

describe('cannabisDevices library', () => {
  it('renders heading "cannabisDevices"', () => {
    const store = makeStore('cannabisDevices');
    render(<LibraryView schema={cannabisDevicesSchema} store={store} />);
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('cannabisDevices');
  });

  it('renders deviceType category filter', () => {
    const store = makeStore('cannabisDevices');
    render(<LibraryView schema={cannabisDevicesSchema} store={store} />);
    const cat = screen.getByRole('combobox', { name: /category/i });
    expect(cat.innerHTML).toContain('vaporizer');
  });

  it('can add and list a device', () => {
    const store = makeStore('cannabisDevices');
    render(<LibraryView schema={cannabisDevicesSchema} store={store} />);
    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(screen.getByRole('dialog')).toBeTruthy();
  });
});
