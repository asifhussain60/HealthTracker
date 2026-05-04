/**
 * LibraryRepo.js
 *
 * Generic library repository factory.
 *
 * `createLibraryRepo({ schema, store })` returns a repository object with
 * CRUD + search + filter + sort operations against a named slice in the store.
 *
 * The factory is deliberately generic — it knows nothing about the concrete
 * shape of items beyond the audit-field contract. Domain-specific logic lives
 * in the `LibrarySchema<T>` descriptor (A4) and in the slice definition.
 *
 * Architecture rules:
 *   - Sync-only: no async, no Promises.
 *   - Soft-delete: remove() sets deletedAt; hard deletes are forbidden.
 *   - Audit-field stamping delegates to shared helpers (HT-CORE-008).
 *   - User-scoped: every record carries userId = CURRENT_USER_ID (HT-CORE-010).
 *   - SSOT: this is the ONE place that implements CRUD for library slices (HT-CORE-003).
 *
 * AC-P1A-A1
 */

import {
  stampNewRecord,
  stampUpdate,
  stampSoftDelete,
} from '../repositories/_internal/auditFields.js';

// ── Factory ───────────────────────────────────────────────────────────────────

/**
 * Creates a synchronous library repository for a given schema + store.
 *
 * @param {Object} options
 * @param {Object} options.schema       - LibrarySchema descriptor (or plain config with sliceKey).
 * @param {Object} options.store        - Store with getState() / setState() interface.
 * @returns {Object} Repository with: list, get, add, update, remove, restore, search, filter, sort.
 */
export function createLibraryRepo({ schema, store }) {
  const { sliceKey } = schema;

  // ── Internal helpers ──────────────────────────────────────────────────────

  /**
   * Read the current array from the store slice.
   * @returns {Object[]}
   */
  function _all() {
    return store.getState()[sliceKey] ?? [];
  }

  /**
   * Overwrite the slice array in the store.
   * @param {Object[]} arr
   */
  function _save(arr) {
    store.setState({ [sliceKey]: arr });
  }

  /**
   * Return active (non-deleted) records.
   * @returns {Object[]}
   */
  function _active() {
    return _all().filter((r) => r.deletedAt === null || r.deletedAt === undefined);
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Return items from the library.
   *
   * @param {Object} [options]
   * @param {boolean} [options.includeDeleted=false] - If true, include soft-deleted items.
   * @returns {Object[]}
   */
  function list(options = {}) {
    const { includeDeleted = false } = options;
    return includeDeleted ? _all() : _active();
  }

  /**
   * Find a single item by its primary key (id).
   *
   * @param {string} id
   * @returns {Object|undefined}
   */
  function get(id) {
    return _all().find((r) => r.id === id);
  }

  /**
   * Add a new item to the library.
   * Stamps full audit fields (HT-CORE-008).
   * Preserves caller-supplied `id` for idempotent re-import.
   *
   * @param {Object} input - Item fields (without audit fields).
   * @returns {Object} The stamped record.
   */
  function add(input) {
    const record = stampNewRecord(input);
    _save([..._all(), record]);
    return record;
  }

  /**
   * Update an existing item by id.
   * Merges patch and bumps updatedAt (HT-CORE-008).
   *
   * @param {string} id
   * @param {Object} patch - Fields to merge.
   * @returns {Object|undefined} The updated record, or undefined if not found.
   */
  function update(id, patch) {
    const arr = _all();
    const idx = arr.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    const updated = stampUpdate(arr[idx], patch);
    const next = [...arr];
    next[idx] = updated;
    _save(next);
    return updated;
  }

  /**
   * Soft-delete an item by id.
   * Sets deletedAt (HT-CORE-008). The record is NOT removed from the store.
   *
   * @param {string} id
   * @returns {Object|undefined} The soft-deleted record, or undefined if not found.
   */
  function remove(id) {
    const arr = _all();
    const idx = arr.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    const deleted = stampSoftDelete(arr[idx]);
    const next = [...arr];
    next[idx] = deleted;
    _save(next);
    return deleted;
  }

  /**
   * Restore a soft-deleted item by id.
   * Clears deletedAt and bumps updatedAt.
   *
   * @param {string} id
   * @returns {Object|undefined} The restored record, or undefined if not found.
   */
  function restore(id) {
    return update(id, { deletedAt: null });
  }

  /**
   * Case-insensitive substring search on the `name` field of active records.
   *
   * @param {string} query
   * @returns {Object[]}
   */
  function search(query) {
    if (!query) return _active();
    const lower = query.toLowerCase();
    return _active().filter((r) =>
      (r.name ?? '').toLowerCase().includes(lower)
    );
  }

  /**
   * Filter active records by a predicate function.
   *
   * @param {Function} predicate - (record) => boolean
   * @returns {Object[]}
   */
  function filter(predicate) {
    return _active().filter(predicate);
  }

  /**
   * Sort active records.
   * Default: descending by `createdAt` (most recently added first).
   *
   * @param {Function} [comparator] - Custom sort comparator (a, b) => number.
   * @returns {Object[]}
   */
  function sort(comparator) {
    const active = _active();
    if (comparator) {
      return active.slice().sort(comparator);
    }
    // Default: descending by createdAt
    return active.slice().sort((a, b) => {
      const aTs = a.createdAt ?? '';
      const bTs = b.createdAt ?? '';
      return bTs.localeCompare(aTs);
    });
  }

  return { list, get, add, update, remove, restore, search, filter, sort };
}
