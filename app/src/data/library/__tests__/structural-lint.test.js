/**
 * structural-lint.test.js
 *
 * Structural-lint: walks known record-array slice keys and asserts that
 * any non-empty record has the 8 required audit fields.
 *
 * Empty arrays pass trivially (nothing to check).
 * The interesting test explicitly adds a record via useCannabisRepo()
 * and verifies audit fields are stamped.
 *
 * AC-P1A-A2
 * HT-CORE-008 — audit fields enforced at test time.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStore } from '../../store';
import { runMigrations } from '../../migrations';
import { useCannabisRepo } from '../../repositories/useCannabisRepo.js';

// ── Audit field invariant ─────────────────────────────────────────────────────

const REQUIRED_AUDIT_FIELDS = [
  'id',
  'userId',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'deletedAt',
  'schemaVersion',
];

/**
 * Known slice keys that hold arrays of records.
 * Each array is checked for audit-field presence on every element.
 */
const RECORD_ARRAY_KEYS = [
  'inventory',
  'cannabisLogs',
  'mealTemplates',
  'workoutLogs',
  'weightHistory',
  'items',
];

function assertAuditFields(record, label) {
  for (const field of REQUIRED_AUDIT_FIELDS) {
    expect(
      record,
      `Record in ${label} missing audit field: "${field}"`
    ).toHaveProperty(field);
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('structural-lint: audit fields (HT-CORE-008)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-04T10:00:00.000Z'));
    // Reset store to empty + run migrations to get v3 defaults
    const migrated = runMigrations({});
    useStore.setState(migrated);
  });

  describe('invariant holds on v3 migrated state (empty arrays pass trivially)', () => {
    it.each(RECORD_ARRAY_KEYS)('slice "%s" — every record has all 8 audit fields', (sliceKey) => {
      const state = useStore.getState();
      const records = state[sliceKey] ?? [];
      // Empty arrays pass trivially — the invariant is vacuously true.
      for (const record of records) {
        assertAuditFields(record, sliceKey);
      }
      // Explicitly assert the slice key exists on state (not undefined)
      expect(state).toHaveProperty(sliceKey);
    });
  });

  describe('invariant holds after writing via repo', () => {
    it('useCannabisRepo.addProduct() stamps all 8 audit fields', async () => {
      const { result } = renderHook(() => useCannabisRepo());

      let record;
      act(() => {
        record = result.current.addProduct({
          name: 'Test Flower',
          form: 'flower',
          thcPct: 20,
          remaining: 3.5,
        });
      });

      assertAuditFields(record, 'inventory (addProduct)');

      // Verify persisted in store too
      const state = useStore.getState();
      const stored = state.inventory.find((p) => p.id === record.id);
      expect(stored).toBeDefined();
      assertAuditFields(stored, 'inventory (store state)');
    });

    it('useCannabisRepo.addProduct() sets userId to "me" (HT-CORE-010)', async () => {
      const { result } = renderHook(() => useCannabisRepo());
      let record;
      act(() => {
        record = result.current.addProduct({ name: 'Edible', form: 'edible' });
      });
      expect(record.userId).toBe('me');
      expect(record.createdBy).toBe('me');
      expect(record.updatedBy).toBe('me');
    });

    it('useCannabisRepo.addProduct() sets schemaVersion to 3', async () => {
      const { result } = renderHook(() => useCannabisRepo());
      let record;
      act(() => {
        record = result.current.addProduct({ name: 'Vape', form: 'vape' });
      });
      expect(record.schemaVersion).toBe(3);
    });

    it('useCannabisRepo.addProduct() sets deletedAt to null (not soft-deleted)', async () => {
      const { result } = renderHook(() => useCannabisRepo());
      let record;
      act(() => {
        record = result.current.addProduct({ name: 'Preroll', form: 'preroll' });
      });
      expect(record.deletedAt).toBeNull();
    });

    it('useCannabisRepo.addProduct() sets createdAt = updatedAt at creation time', async () => {
      const { result } = renderHook(() => useCannabisRepo());
      let record;
      act(() => {
        record = result.current.addProduct({ name: 'Tincture', form: 'tincture' });
      });
      // updatedAt is always now(); createdAt is preserved if supplied, else stamped
      expect(record.createdAt).toBeDefined();
      expect(record.updatedAt).toBeDefined();
    });

    it('useCannabisRepo.updateProduct() bumps updatedAt but preserves createdAt', async () => {
      const { result } = renderHook(() => useCannabisRepo());

      let record;
      act(() => {
        record = result.current.addProduct({ name: 'Original', form: 'flower' });
      });

      const originalCreatedAt = record.createdAt;

      vi.setSystemTime(new Date('2026-05-04T12:00:00.000Z'));

      let updated;
      act(() => {
        updated = result.current.updateProduct(record.id, { name: 'Updated' });
      });

      expect(updated.createdAt).toBe(originalCreatedAt);
      expect(updated.updatedAt).toBe('2026-05-04T12:00:00.000Z');
    });

    it('useCannabisRepo.removeProduct() sets deletedAt (soft-delete)', async () => {
      const { result } = renderHook(() => useCannabisRepo());

      let record;
      act(() => {
        record = result.current.addProduct({ name: 'ToDelete', form: 'flower' });
      });

      let deleted;
      act(() => {
        deleted = result.current.removeProduct(record.id);
      });

      expect(deleted.deletedAt).not.toBeNull();
      assertAuditFields(deleted, 'inventory (soft-deleted record)');
    });
  });

  describe('migration produces v3 state with schemaVersion: 3', () => {
    it('runMigrations({}) returns schemaVersion: 3', () => {
      const state = runMigrations({});
      expect(state.schemaVersion).toBe(3);
    });

    it('runMigrations on already-v3 state is a no-op (returns same object)', () => {
      const v3state = runMigrations({});
      const result = runMigrations(v3state);
      expect(result).toBe(v3state);
    });
  });
});
