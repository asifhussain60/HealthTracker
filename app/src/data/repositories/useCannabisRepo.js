/**
 * useCannabisRepo.js
 *
 * Repository hook for cannabis domain.
 *
 * Wraps cannabisSlice (inventory + cannabisLogs) with:
 *   - audit-field stamping on every write (via shared helpers)
 *   - soft-delete pattern (deletedAt) instead of hard deletes
 *   - sync-by-signature: every method returns a value directly, never a Promise
 *
 * Debt note (filed 2026-05-04):
 *   cannabisSlice has no addCannabisProduct / removeProduct actions — the slice
 *   was written to initialize inventory from seed only. The repo fills that gap
 *   by calling useStore.setState() directly. When B10 lands the Unified Library
 *   Pattern, the slice actions will be added and the direct setState calls here
 *   should be replaced. See _workspace/scratch/observed-debt.md entry B9-DEBT-001.
 *
 * Architecture rule 5 invariant: NO async, NO await, NO Promise.resolve, NO .then.
 */

import { useStore } from '../store';
import { stampNewRecord, stampUpdate, stampSoftDelete } from './_internal/auditFields.js';

export function useCannabisRepo() {
  const inventory = useStore((s) => s.inventory);
  const cannabisLogs = useStore((s) => s.cannabisLogs);

  // ── Products (inventory) ──────────────────────────────────────────────────

  /**
   * Returns the full inventory array (all products, including soft-deleted).
   * @returns {Object[]}
   */
  function listProducts() {
    return inventory;
  }

  /**
   * Finds and returns a product by id. Returns undefined if not found.
   * @param {string} id
   * @returns {Object|undefined}
   */
  function getProduct(id) {
    return inventory.find((p) => p.id === id);
  }

  /**
   * Stamps a new product with audit fields and appends it to inventory.
   * Returns the stamped record synchronously.
   * @param {Object} input
   * @returns {Object}
   */
  function addProduct(input) {
    const record = stampNewRecord(input);
    useStore.setState((s) => ({ inventory: [...s.inventory, record] }));
    return record;
  }

  /**
   * Merges patch onto an existing product and bumps audit fields.
   * Returns the updated record, or undefined if id is not found.
   * @param {string} id
   * @param {Object} patch
   * @returns {Object|undefined}
   */
  function updateProduct(id, patch) {
    const existing = inventory.find((p) => p.id === id);
    if (!existing) return undefined;
    const updated = stampUpdate(existing, patch);
    useStore.setState((s) => ({
      inventory: s.inventory.map((p) => (p.id === id ? updated : p)),
    }));
    return updated;
  }

  /**
   * Soft-deletes a product by setting deletedAt.
   * Returns the updated record, or undefined if id is not found.
   * @param {string} id
   * @returns {Object|undefined}
   */
  function removeProduct(id) {
    const existing = inventory.find((p) => p.id === id);
    if (!existing) return undefined;
    const deleted = stampSoftDelete(existing);
    useStore.setState((s) => ({
      inventory: s.inventory.map((p) => (p.id === id ? deleted : p)),
    }));
    return deleted;
  }

  // ── Sessions (cannabisLogs) ───────────────────────────────────────────────

  /**
   * Returns all sessions, optionally filtered by date string (yyyy-MM-dd).
   * @param {string} [date] - Optional date filter.
   * @returns {Object[]}
   */
  function listSessions(date) {
    if (date !== undefined) {
      return cannabisLogs.filter((s) => s.date === date);
    }
    return cannabisLogs;
  }

  /**
   * Stamps a new session with audit fields and appends it to cannabisLogs.
   * Returns the stamped record synchronously.
   * @param {Object} input
   * @returns {Object}
   */
  function addSession(input) {
    const record = stampNewRecord(input);
    useStore.setState((s) => ({ cannabisLogs: [...s.cannabisLogs, record] }));
    return record;
  }

  /**
   * Soft-deletes a session by setting deletedAt.
   * Returns the updated record, or undefined if id is not found.
   * @param {string} id
   * @returns {Object|undefined}
   */
  function removeSession(id) {
    const existing = cannabisLogs.find((s) => s.id === id);
    if (!existing) return undefined;
    const deleted = stampSoftDelete(existing);
    useStore.setState((s) => ({
      cannabisLogs: s.cannabisLogs.map((log) => (log.id === id ? deleted : log)),
    }));
    return deleted;
  }

  /**
   * Passthrough to the slice's getDailyCannabisPlan selector.
   * Returns the sessions array for today's plan synchronously.
   * @returns {Object[]}
   */
  function getDailyCannabisPlan() {
    return useStore.getState().getDailyCannabisPlan();
  }

  return {
    listProducts,
    getProduct,
    addProduct,
    updateProduct,
    removeProduct,
    listSessions,
    addSession,
    removeSession,
    getDailyCannabisPlan,
  };
}
