/**
 * importExport.js
 *
 * Shared import/export envelope for every library.
 *
 * `exportLibrary({ items, schema })` — serialises library items to a JSON string.
 * `importLibrary({ jsonOrCsv, schema, repo })` — deserialises and upserts into a repo.
 *
 * Idempotency: import keyed by `id` (default). Items already present (same id)
 * are skipped, not duplicated.
 *
 * Error handling: malformed input returns `{ added: 0, skipped: 0, errors: [...] }`
 * and does NOT throw. The repo is left unchanged on parse failure.
 *
 * Architecture rules:
 *   - Sync-only: no async, no Promises.
 *   - Does not write to a slice directly; delegates to `repo.add()` (which stamps
 *     audit fields). Preserves caller-supplied `id` for idempotent re-import.
 *   - HT-CORE-003: generic over schema — no domain-specific code here.
 *
 * AC-P1A-A5
 */

// ── exportLibrary ─────────────────────────────────────────────────────────────

/**
 * Serialise library items to a JSON string.
 *
 * @param {Object} options
 * @param {Object[]} options.items       - Array of items to export (caller supplies; may include deleted).
 * @param {Object}   options.schema      - LibrarySchema descriptor.
 * @returns {string} JSON string.
 */
export function exportLibrary({ items, schema }) {
  const envelope = {
    schemaName: schema.name,
    sliceKey: schema.sliceKey,
    exportedAt: new Date().toISOString(),
    version: 1,
    items: items ?? [],
  };
  return JSON.stringify(envelope, null, 2);
}

// ── importLibrary ─────────────────────────────────────────────────────────────

/**
 * Parse and import library items from a JSON (or future CSV) string.
 *
 * Idempotency: items whose `id` already exists in the repo are skipped.
 * On parse failure, returns an errors array and leaves the repo unchanged.
 *
 * @param {Object} options
 * @param {string|null}  options.jsonOrCsv - JSON string to parse.
 * @param {Object}       options.schema    - LibrarySchema descriptor.
 * @param {Object}       options.repo      - LibraryRepo instance (target).
 * @param {Object}       [options.options] - Reserved for future options.
 * @returns {{ added: number, skipped: number, errors: string[] }}
 */
export function importLibrary({ jsonOrCsv, schema, repo }) {
  // ── Parse ────────────────────────────────────────────────────────────────
  let envelope;
  try {
    if (!jsonOrCsv || typeof jsonOrCsv !== 'string' || jsonOrCsv.trim() === '') {
      return { added: 0, skipped: 0, errors: ['Input is empty or not a string.'] };
    }
    envelope = JSON.parse(jsonOrCsv);
  } catch (err) {
    return {
      added: 0,
      skipped: 0,
      errors: [`JSON parse error: ${err.message}`],
    };
  }

  // ── Validate envelope ─────────────────────────────────────────────────────
  if (!envelope || !Array.isArray(envelope.items)) {
    return {
      added: 0,
      skipped: 0,
      errors: ['Invalid envelope: "items" array is missing.'],
    };
  }

  // ── Upsert items ──────────────────────────────────────────────────────────
  let added = 0;
  let skipped = 0;
  const errors = [];

  for (const item of envelope.items) {
    try {
      // Idempotency: skip if an item with this id already exists in the repo.
      if (item.id && repo.get(item.id) !== undefined) {
        skipped++;
        continue;
      }
      // Delegate to repo.add() which stamps audit fields.
      // Preserve the original id for idempotent re-import.
      repo.add(item);
      added++;
    } catch (err) {
      errors.push(`Failed to import item "${item?.id ?? '?'}": ${err.message}`);
    }
  }

  return { added, skipped, errors };
}
