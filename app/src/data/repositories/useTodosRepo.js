/**
 * useTodosRepo.js
 *
 * Repository hook for todos domain.
 *
 * Wraps todoSlice (items) with:
 *   - audit-field stamping on every write (via shared helpers)
 *   - soft-delete pattern (deletedAt) instead of hard deletes
 *   - full CRUD surface (listTodos, getTodo, addTodo, updateTodo, removeTodo, setStatus)
 *   - sync-by-signature: every method returns a value directly, never a Promise
 *
 * Debt note (filed 2026-05-04):
 *   todoSlice is a placeholder — createTodoSlice() returns {} (no actions).
 *   All mutations are implemented via useStore.setState() directly in this repo.
 *   When Phase 3 wires full todo actions in the slice, these setState calls
 *   should be replaced with slice actions. Schema: status field is a string
 *   ('open' | 'done' | etc.) per the placeholder shape.
 *   See _workspace/scratch/observed-debt.md entry B9-DEBT-003.
 *
 * Architecture rule 5 invariant: NO async, NO await, NO Promise.resolve, NO .then.
 */

import { useStore } from '../store';
import { stampNewRecord, stampUpdate, stampSoftDelete } from './_internal/auditFields.js';

export function useTodosRepo() {
  const items = useStore((s) => s.items);

  /**
   * Returns all todo items.
   * @returns {Object[]}
   */
  function listTodos() {
    return items;
  }

  /**
   * Finds and returns a todo by id. Returns undefined if not found.
   * @param {string} id
   * @returns {Object|undefined}
   */
  function getTodo(id) {
    return items.find((t) => t.id === id);
  }

  /**
   * Stamps a new todo with audit fields and appends it to the store.
   * Returns the stamped record synchronously.
   * @param {Object} input
   * @returns {Object}
   */
  function addTodo(input) {
    const record = stampNewRecord(input);
    useStore.setState((s) => ({ items: [...s.items, record] }));
    return record;
  }

  /**
   * Merges patch onto an existing todo and bumps audit fields.
   * Returns the updated record, or undefined if id is not found.
   * @param {string} id
   * @param {Object} patch
   * @returns {Object|undefined}
   */
  function updateTodo(id, patch) {
    const existing = items.find((t) => t.id === id);
    if (!existing) return undefined;
    const updated = stampUpdate(existing, patch);
    useStore.setState((s) => ({
      items: s.items.map((t) => (t.id === id ? updated : t)),
    }));
    return updated;
  }

  /**
   * Soft-deletes a todo by setting deletedAt.
   * Returns the updated record, or undefined if id is not found.
   * @param {string} id
   * @returns {Object|undefined}
   */
  function removeTodo(id) {
    const existing = items.find((t) => t.id === id);
    if (!existing) return undefined;
    const deleted = stampSoftDelete(existing);
    useStore.setState((s) => ({
      items: s.items.map((t) => (t.id === id ? deleted : t)),
    }));
    return deleted;
  }

  /**
   * Updates the status field of a todo and bumps audit fields.
   * Returns the updated record, or undefined if id is not found.
   * @param {string} id
   * @param {string} status - New status value ('open', 'done', etc.)
   * @returns {Object|undefined}
   */
  function setStatus(id, status) {
    return updateTodo(id, { status });
  }

  return {
    listTodos,
    getTodo,
    addTodo,
    updateTodo,
    removeTodo,
    setStatus,
  };
}
