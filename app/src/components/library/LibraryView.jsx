/**
 * LibraryView.jsx — Generic library editor component.
 *
 * Takes a LibrarySchema descriptor and renders:
 *   - Heading with library name
 *   - Search box (filters by name)
 *   - Category filter (if schema.categories.length > 0)
 *   - Favorite filter checkbox
 *   - Sort dropdown (from schema.sortOptions)
 *   - Grid of LibraryItemCard
 *   - Import drop zone (LibraryImportDrop)
 *   - Add button → opens LibraryItemForm modal
 *   - Edit button on card → pre-fills modal
 *   - Delete button on card → soft-delete confirm dialog
 *
 * Props:
 *   schema {Object}   — LibrarySchema descriptor (from defineLibrarySchema)
 *   store  {Object}   — Store with getState()/setState() interface (injected for
 *                        testing; defaults to the real useStore singleton via a
 *                        minimal adapter when called from router.jsx)
 *
 * AC-P1D-D1
 */
import { useState, useCallback } from 'react';
import { createLibraryRepo } from '../../data/library/LibraryRepo.js';
import { LibraryGrid } from './LibraryGrid.jsx';
import { LibraryItemForm } from './LibraryItemForm.jsx';
import { LibraryImportDrop } from './LibraryImportDrop.jsx';

// ── Modal wrapper ─────────────────────────────────────────────────────────────

function ModalOverlay({ children, onClose }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="library-modal-overlay"
    >
      <div className="library-modal">
        {children}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

/**
 * @param {Object} props
 * @param {Object} props.schema - LibrarySchema descriptor.
 * @param {Object} [props.store] - Store interface. When omitted the real Zustand
 *   useStore is used via a thin subscribe-based adapter (set up by LibraryViewConnected).
 */
export function LibraryView({ schema, store }) {
  const repo = createLibraryRepo({ schema, store });

  // ── UI state ────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortKey, setSortKey] = useState('');
  const [modalState, setModalState] = useState(null); // null | 'add' | 'edit' | 'delete'
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  // Force re-render by tracking a counter when store changes
  const [_version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  // ── Derived items ───────────────────────────────────────────────────────────

  let items = repo.list();

  if (searchQuery) {
    const lower = searchQuery.toLowerCase();
    items = items.filter((r) =>
      (r.name ?? '').toLowerCase().includes(lower)
    );
  }

  if (selectedCategory) {
    items = items.filter((r) => r.category === selectedCategory);
  }

  if (favoritesOnly) {
    items = items.filter((r) => (r.favoriteStars ?? 0) > 0);
  }

  if (sortKey) {
    items = items.slice().sort((a, b) => {
      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return aVal - bVal;
      }
      return String(aVal).localeCompare(String(bVal));
    });
  }

  // ── Handlers ─────────────────────────────────────────────────────────────────

  function handleAdd(values) {
    repo.add(values);
    setModalState(null);
    bump();
  }

  function handleEdit(values) {
    repo.update(editingItem.id, values);
    setModalState(null);
    setEditingItem(null);
    bump();
  }

  function handleDeleteConfirm() {
    repo.remove(deletingItem.id);
    setModalState(null);
    setDeletingItem(null);
    bump();
  }

  function openEdit(item) {
    setEditingItem(item);
    setModalState('edit');
  }

  function openDelete(item) {
    setDeletingItem(item);
    setModalState('delete');
  }

  function closeModal() {
    setModalState(null);
    setEditingItem(null);
    setDeletingItem(null);
  }

  function handleImport(importedItems) {
    for (const item of importedItems) {
      repo.add(item);
    }
    bump();
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="library-view" data-testid={`library-view-${schema.sliceKey}`}>
      {/* Header */}
      <h1 className="library-view__heading">{schema.name}</h1>

      {/* Controls bar */}
      <div className="library-view__controls">
        {/* Search */}
        <input
          type="search"
          role="searchbox"
          aria-label="Search"
          className="library-view__search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
        />

        {/* Category filter */}
        {schema.categories && schema.categories.length > 0 && (
          <select
            aria-label="Category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="library-view__category"
          >
            <option value="">All categories</option>
            {schema.categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        )}

        {/* Favorites only */}
        <label className="library-view__fav-label">
          <input
            type="checkbox"
            aria-label="Favorites only"
            checked={favoritesOnly}
            onChange={(e) => setFavoritesOnly(e.target.checked)}
          />
          Favorites
        </label>

        {/* Sort */}
        <select
          aria-label="Sort"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          className="library-view__sort"
        >
          <option value="">Default</option>
          {schema.sortOptions && schema.sortOptions.map((opt) => (
            <option key={opt.key} value={opt.key}>{opt.label}</option>
          ))}
        </select>

        {/* Add button */}
        <button
          type="button"
          aria-label="Add item"
          onClick={() => setModalState('add')}
          className="library-view__add-btn"
        >
          Add
        </button>
      </div>

      {/* Items grid */}
      <LibraryGrid
        items={items}
        schema={schema}
        onEdit={openEdit}
        onDelete={openDelete}
      />

      {/* Import drop zone */}
      <LibraryImportDrop
        onImport={handleImport}
        importFormat={schema.importFormat}
      />

      {/* Add modal */}
      {modalState === 'add' && (
        <ModalOverlay onClose={closeModal}>
          <h2>Add {schema.name}</h2>
          <LibraryItemForm
            schema={schema}
            onSubmit={handleAdd}
            onCancel={closeModal}
          />
        </ModalOverlay>
      )}

      {/* Edit modal */}
      {modalState === 'edit' && editingItem && (
        <ModalOverlay onClose={closeModal}>
          <h2>Edit {schema.name}</h2>
          <LibraryItemForm
            schema={schema}
            initialValues={editingItem}
            onSubmit={handleEdit}
            onCancel={closeModal}
          />
        </ModalOverlay>
      )}

      {/* Delete confirm modal */}
      {modalState === 'delete' && deletingItem && (
        <ModalOverlay onClose={closeModal}>
          <p>Are you sure you want to delete &ldquo;{deletingItem.name}&rdquo;?</p>
          <button type="button" aria-label="Confirm delete" onClick={handleDeleteConfirm}>
            Confirm
          </button>
          <button type="button" aria-label="Cancel" onClick={closeModal}>
            Cancel
          </button>
        </ModalOverlay>
      )}
    </div>
  );
}
