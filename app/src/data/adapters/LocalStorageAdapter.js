/**
 * LocalStorageAdapter
 *
 * A thin, synchronous wrapper around window.localStorage that:
 *   - Isolates all localStorage calls to one module (no scattered getItem/setItem)
 *   - Catches QuotaExceededError and re-throws as a typed StorageQuotaError
 *   - Provides a prefix-aware clear() for targeted namespace cleanup
 *
 * Implements the {@link StorageAdapter} interface (see StorageAdapter.js).
 *
 * Dependency direction: this module imports nothing from the app layer.
 * Slices/repos may import from here; the reverse is forbidden.
 */

// ── Custom error ──────────────────────────────────────────────────────────────

/**
 * Thrown by setItem when the underlying localStorage signals a quota overflow.
 *
 * @property {string} key        - The key that was being written.
 * @property {number} byteLength - Approximate byte cost: value.length (UTF-16 code units).
 */
export class StorageQuotaError extends Error {
  /**
   * @param {string} key
   * @param {number} byteLength
   */
  constructor(key, byteLength) {
    super(`localStorage quota exceeded while writing key "${key}" (≈${byteLength} bytes)`);
    this.name = 'StorageQuotaError';
    this.key = key;
    this.byteLength = byteLength;
  }
}

// ── Adapter ───────────────────────────────────────────────────────────────────

export class LocalStorageAdapter {
  /**
   * Retrieve a stored string value.
   *
   * @param {string} key
   * @returns {string | null} The stored value, or null if the key is absent.
   */
  getItem(key) {
    return localStorage.getItem(key);
  }

  /**
   * Persist a string value.
   *
   * On a QuotaExceededError the method emits a console.warn and re-throws a
   * {@link StorageQuotaError} so callers can decide how to handle it.
   *
   * @param {string} key
   * @param {string} value
   * @returns {void}
   * @throws {StorageQuotaError} When the storage quota is exceeded.
   */
  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      if (
        err.name === 'QuotaExceededError' ||
        err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        (err instanceof DOMException && err.code === 22)
      ) {
        const byteLength = typeof value === 'string' ? value.length : 0;
        console.warn(
          `[LocalStorageAdapter] Quota exceeded writing key "${key}" (≈${byteLength} bytes).`,
          err,
        );
        throw new StorageQuotaError(key, byteLength);
      }
      // Unexpected error — re-throw as-is so callers see it.
      throw err;
    }
  }

  /**
   * Delete a key. No-op when the key does not exist.
   *
   * @param {string} key
   * @returns {void}
   */
  removeItem(key) {
    localStorage.removeItem(key);
  }

  /**
   * Clear storage entries.
   *
   * - clear()          → removes ALL keys (delegates to localStorage.clear())
   * - clear('prefix')  → removes only keys whose names start with `prefix`
   *
   * The prefix variant is useful for namespace-scoped teardown (e.g. Zustand
   * persist keys all share the "ht-" prefix) without wiping third-party keys.
   *
   * @param {string} [prefix] - Optional key prefix filter.
   * @returns {void}
   */
  clear(prefix) {
    if (prefix === undefined || prefix === null || prefix === '') {
      localStorage.clear();
      return;
    }

    // Collect matching keys first to avoid mutating while iterating.
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k !== null && k.startsWith(prefix)) {
        toRemove.push(k);
      }
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  }
}
