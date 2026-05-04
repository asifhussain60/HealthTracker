/**
 * todos.js — Todo selectors.
 *
 * All selectors accept (state, userId, ...) and filter by userId.
 * HT-CORE-010: selectors filter by currentUser.id (passed as userId parameter).
 * No Date.now() / new Date() — callers inject date when needed.
 *
 * Memoization: single-input memo with reference-equality check (no reselect dependency).
 * Phase 2 schema scaffolded: assigneeId field is recognized now.
 */

// ── Memo helper ───────────────────────────────────────────────────────────────

function makeMemo(fn) {
  let lastState;
  let lastArgs;
  let lastResult;
  return function (state, ...args) {
    if (
      state === lastState &&
      lastArgs !== undefined &&
      args.length === lastArgs.length &&
      args.every((a, i) => a === lastArgs[i])
    ) {
      return lastResult;
    }
    lastState = state;
    lastArgs = args;
    lastResult = fn(state, ...args);
    return lastResult;
  };
}

// ── Shared filter helper ──────────────────────────────────────────────────────

function filterByUser(records, userId) {
  return (records ?? []).filter(
    (r) => r.userId === userId && r.deletedAt === null
  );
}

// ── selectMyTodos ─────────────────────────────────────────────────────────────

/**
 * Return Todo[] owned by userId, excluding deleted, sorted by priority desc
 * then dueDate asc.
 * HT-CORE-010: filters by userId.
 *
 * @param {Object} state
 * @param {string} userId
 * @returns {Array}
 */
export const selectMyTodos = makeMemo((state, userId) => {
  const todos = filterByUser(state.items, userId);
  return todos.slice().sort((a, b) => {
    // Priority descending (higher number = higher priority)
    const priorityDiff = (b.priority ?? 0) - (a.priority ?? 0);
    if (priorityDiff !== 0) return priorityDiff;
    // DueDate ascending (earlier due date first)
    const aDate = a.dueDate ?? '';
    const bDate = b.dueDate ?? '';
    return aDate.localeCompare(bDate);
  });
});

// ── selectTodosByCategory ─────────────────────────────────────────────────────

/**
 * Return Todo[] for userId filtered by category ('personal' | 'professional').
 * HT-CORE-010: filters by userId.
 *
 * @param {Object} state
 * @param {string} userId
 * @param {string} category
 * @returns {Array}
 */
export const selectTodosByCategory = makeMemo((state, userId, category) =>
  filterByUser(state.items, userId).filter((t) => t.category === category)
);

// ── selectAssignedToMe ────────────────────────────────────────────────────────

/**
 * Return Todo[] where assigneeId === userId (Phase 2 multi-user schema).
 * Includes todos owned by any user as long as they are assigned to userId.
 * Excludes soft-deleted todos.
 * HT-CORE-010: filters by assigneeId === userId.
 *
 * @param {Object} state
 * @param {string} userId
 * @returns {Array}
 */
export const selectAssignedToMe = makeMemo((state, userId) =>
  (state.items ?? []).filter(
    (t) => t.assigneeId === userId && t.deletedAt === null
  )
);
