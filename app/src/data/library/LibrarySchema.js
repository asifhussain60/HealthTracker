/**
 * LibrarySchema.js
 *
 * Declarative descriptor type for library schemas.
 *
 * `defineLibrarySchema(config)` validates the configuration, deep-freezes
 * the descriptor, and returns it. The frozen descriptor is used by:
 *   - `createLibraryRepo()` — to know which slice key to target
 *   - `<LibraryView<T>>` (P1.D) — to render form, card, search box, import drop
 *   - `importLibrary()` / `exportLibrary()` (A5) — for serialisation
 *
 * Field types: 'string' | 'number' | 'enum' | 'tags' | 'stars'
 *   - 'enum' MUST include a non-empty `options` array.
 *
 * JSDoc-typed (no TypeScript in this project).
 *
 * AC-P1A-A4
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/** Allowed field type values. */
const VALID_FIELD_TYPES = new Set(['string', 'number', 'enum', 'tags', 'stars']);

// ── Validation helpers ────────────────────────────────────────────────────────

/**
 * @param {boolean} condition
 * @param {string} message
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(`[defineLibrarySchema] ${message}`);
  }
}

/**
 * Validate a single field descriptor.
 *
 * @param {Object} field
 * @param {number} idx
 */
function validateField(field, idx) {
  assert(
    typeof field.key === 'string' && field.key.length > 0,
    `fields[${idx}] is missing a valid "key" string.`
  );
  assert(
    VALID_FIELD_TYPES.has(field.type),
    `fields[${idx}] ("${field.key}") has invalid type "${field.type}". Must be one of: ${[...VALID_FIELD_TYPES].join(', ')}.`
  );
  if (field.type === 'enum') {
    assert(
      Array.isArray(field.options) && field.options.length > 0,
      `fields[${idx}] ("${field.key}") has type="enum" but "options" is missing or empty.`
    );
  }
}

// ── Deep-freeze helper ────────────────────────────────────────────────────────

/**
 * Recursively freeze an object and all its enumerable properties.
 *
 * @param {Object} obj
 * @returns {Object} The same object, frozen.
 */
function deepFreeze(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  Object.freeze(obj);
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === 'object' && val !== null && !Object.isFrozen(val)) {
      deepFreeze(val);
    }
  }
  return obj;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Define and validate a LibrarySchema descriptor.
 *
 * @param {Object} config
 * @param {string} config.name         - Human-readable library name.
 * @param {string} config.sliceKey     - Zustand state key for the items array.
 * @param {Array}  config.fields       - Array of field descriptors.
 * @param {string[]} [config.categories]   - Optional category list for filtering.
 * @param {Object[]} [config.sortOptions]  - Optional sort option descriptors.
 * @param {string|null} [config.importFormat] - 'csv' | 'json' | null.
 * @returns {Readonly<Object>} A frozen LibrarySchema descriptor.
 *
 * @throws {Error} If validation fails.
 */
export function defineLibrarySchema(config) {
  // ── Required keys ─────────────────────────────────────────────────────────
  assert(
    typeof config?.name === 'string' && config.name.length > 0,
    '"name" is required and must be a non-empty string.'
  );
  assert(
    typeof config.sliceKey === 'string' && config.sliceKey.length > 0,
    '"sliceKey" is required and must be a non-empty string.'
  );
  assert(
    Array.isArray(config.fields),
    '"fields" is required and must be an array.'
  );

  // ── Field validation ──────────────────────────────────────────────────────
  config.fields.forEach(validateField);

  // ── Build descriptor ──────────────────────────────────────────────────────
  const descriptor = {
    name: config.name,
    sliceKey: config.sliceKey,
    fields: config.fields,
    categories: config.categories ?? [],
    sortOptions: config.sortOptions ?? [],
    importFormat: config.importFormat ?? null,
  };

  // Deep-freeze and return
  return deepFreeze(descriptor);
}
