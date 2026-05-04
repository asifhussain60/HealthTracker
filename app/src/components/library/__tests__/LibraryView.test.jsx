/**
 * LibraryView.test.jsx — AC-P1D-D1 RED
 *
 * Tests for <LibraryView> generic library editor.
 * Uses fastingSafeItemsSchema (already wired from P1.A) as the fixture schema.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { LibraryView } from '../LibraryView.jsx';
import { fastingSafeItemsSchema } from '../../../data/library/schemas/fastingSafeItems.js';

// Minimal store mock — provides the slice key as an empty array
const makeStore = (items = []) => {
  let state = { fastingSafeItems: items };
  return {
    getState: () => state,
    setState: (patch) => { state = { ...state, ...patch }; },
    subscribe: () => () => {},
  };
};

describe('LibraryView — smoke render', () => {
  it('renders the library name as heading', () => {
    const store = makeStore();
    render(<LibraryView schema={fastingSafeItemsSchema} store={store} />);
    expect(screen.getByRole('heading', { level: 2, name: /fastingSafeItems/i })).toBeTruthy();
  });

  it('renders search input', () => {
    const store = makeStore();
    render(<LibraryView schema={fastingSafeItemsSchema} store={store} />);
    expect(screen.getByRole('searchbox')).toBeTruthy();
  });

  it('renders sort dropdown', () => {
    const store = makeStore();
    render(<LibraryView schema={fastingSafeItemsSchema} store={store} />);
    expect(screen.getByRole('combobox', { name: /sort/i })).toBeTruthy();
  });

  it('renders add button', () => {
    const store = makeStore();
    render(<LibraryView schema={fastingSafeItemsSchema} store={store} />);
    expect(screen.getByRole('button', { name: /add/i })).toBeTruthy();
  });

  it('renders favorite-filter toggle', () => {
    const store = makeStore();
    render(<LibraryView schema={fastingSafeItemsSchema} store={store} />);
    expect(screen.getByRole('checkbox', { name: /favorites/i })).toBeTruthy();
  });

  it('renders import drop zone', () => {
    const store = makeStore();
    render(<LibraryView schema={fastingSafeItemsSchema} store={store} />);
    expect(screen.getByTestId('library-import-drop')).toBeTruthy();
  });
});

describe('LibraryView — search filter', () => {
  it('filters items by name when user types in search box', () => {
    const store = makeStore([
      { id: '1', name: 'Water', deletedAt: null, createdAt: '', updatedAt: '', userId: 'u1' },
      { id: '2', name: 'Green Tea', deletedAt: null, createdAt: '', updatedAt: '', userId: 'u1' },
    ]);
    render(<LibraryView schema={fastingSafeItemsSchema} store={store} />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'water' } });
    expect(screen.getByText('Water')).toBeTruthy();
    expect(screen.queryByText('Green Tea')).toBeFalsy();
  });

  it('shows all items when search is cleared', () => {
    const store = makeStore([
      { id: '1', name: 'Water', deletedAt: null, createdAt: '', updatedAt: '', userId: 'u1' },
      { id: '2', name: 'Green Tea', deletedAt: null, createdAt: '', updatedAt: '', userId: 'u1' },
    ]);
    render(<LibraryView schema={fastingSafeItemsSchema} store={store} />);
    const search = screen.getByRole('searchbox');
    fireEvent.change(search, { target: { value: 'water' } });
    fireEvent.change(search, { target: { value: '' } });
    expect(screen.getByText('Water')).toBeTruthy();
    expect(screen.getByText('Green Tea')).toBeTruthy();
  });
});

describe('LibraryView — favorite filter', () => {
  it('shows only starred items when favorite filter is checked', () => {
    const store = makeStore([
      { id: '1', name: 'Water', favoriteStars: 3, deletedAt: null, createdAt: '', updatedAt: '', userId: 'u1' },
      { id: '2', name: 'Coffee', favoriteStars: 0, deletedAt: null, createdAt: '', updatedAt: '', userId: 'u1' },
    ]);
    render(<LibraryView schema={fastingSafeItemsSchema} store={store} />);
    const favCheckbox = screen.getByRole('checkbox', { name: /favorites/i });
    fireEvent.click(favCheckbox);
    expect(screen.getByText('Water')).toBeTruthy();
    expect(screen.queryByText('Coffee')).toBeFalsy();
  });
});

describe('LibraryView — sort', () => {
  it('sorts items by name when name sort option is selected', () => {
    const store = makeStore([
      { id: '1', name: 'Zebra', favoriteStars: 0, deletedAt: null, createdAt: '2026-01-02', updatedAt: '', userId: 'u1' },
      { id: '2', name: 'Apple', favoriteStars: 0, deletedAt: null, createdAt: '2026-01-01', updatedAt: '', userId: 'u1' },
    ]);
    render(<LibraryView schema={fastingSafeItemsSchema} store={store} />);
    const sortSelect = screen.getByRole('combobox', { name: /sort/i });
    fireEvent.change(sortSelect, { target: { value: 'name' } });
    const cards = screen.getAllByTestId('library-item-card');
    expect(cards[0].textContent).toContain('Apple');
    expect(cards[1].textContent).toContain('Zebra');
  });
});

describe('LibraryView — add flow', () => {
  it('opens add modal when add button is clicked', () => {
    const store = makeStore();
    render(<LibraryView schema={fastingSafeItemsSchema} store={store} />);
    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('closes modal on cancel', () => {
    const store = makeStore();
    render(<LibraryView schema={fastingSafeItemsSchema} store={store} />);
    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('dialog')).toBeFalsy();
  });
});

describe('LibraryView — edit flow', () => {
  it('opens edit modal when edit button is clicked on a card', () => {
    const store = makeStore([
      { id: '1', name: 'Water', deletedAt: null, createdAt: '', updatedAt: '', userId: 'u1' },
    ]);
    render(<LibraryView schema={fastingSafeItemsSchema} store={store} />);
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByDisplayValue('Water')).toBeTruthy();
  });
});

describe('LibraryView — soft-delete', () => {
  it('shows confirm dialog when delete button is clicked', () => {
    const store = makeStore([
      { id: '1', name: 'Water', deletedAt: null, createdAt: '', updatedAt: '', userId: 'u1' },
    ]);
    render(<LibraryView schema={fastingSafeItemsSchema} store={store} />);
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText(/are you sure/i)).toBeTruthy();
  });

  it('soft-deletes item on confirm', () => {
    const store = makeStore([
      { id: '1', name: 'Water', deletedAt: null, createdAt: '', updatedAt: '', userId: 'u1' },
    ]);
    render(<LibraryView schema={fastingSafeItemsSchema} store={store} />);
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
    expect(screen.queryByText('Water')).toBeFalsy();
  });
});

describe('LibraryView — category filter', () => {
  it('renders category filter when schema has categories', () => {
    const { defineLibrarySchema } = require('../../../data/library/LibrarySchema.js');
    const schemaWithCats = defineLibrarySchema({
      name: 'Test',
      sliceKey: 'testSlice',
      fields: [{ key: 'name', label: 'Name', type: 'string' }],
      categories: ['Alpha', 'Beta'],
    });
    const store = {
      getState: () => ({ testSlice: [] }),
      setState: () => {},
      subscribe: () => () => {},
    };
    render(<LibraryView schema={schemaWithCats} store={store} />);
    expect(screen.getByRole('combobox', { name: /category/i })).toBeTruthy();
  });
});
