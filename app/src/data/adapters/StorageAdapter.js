/**
 * StorageAdapter — the minimal interface every storage backend must satisfy.
 *
 * This typedef documents the contract. `LocalStorageAdapter` is the only
 * implementation for solo-user scope (Phase 0). When/if a networked backend
 * is introduced (Phase 2), a new class implements this same shape so the
 * calling layer needs no changes.
 *
 * @typedef {Object} StorageAdapter
 * @property {(key: string) => string | null} getItem   - Return stored string or null.
 * @property {(key: string, value: string) => void} setItem - Persist a string value.
 * @property {(key: string) => void} removeItem         - Delete a key.
 */
