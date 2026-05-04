/**
 * auditFields.test.js
 *
 * Unit tests for the shared audit-field stamping helpers.
 * RED phase — module doesn't exist yet; all tests fail with module-not-found.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { stampNewRecord, stampUpdate, stampSoftDelete } from './auditFields.js';

describe('auditFields helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-04T10:00:00.000Z'));
  });

  // ── stampNewRecord ──────────────────────────────────────────────────

  describe('stampNewRecord', () => {
    it('injects id, userId, createdAt, updatedAt, createdBy, updatedBy, deletedAt, schemaVersion', () => {
      const result = stampNewRecord({ name: 'test' });
      expect(result.id).toBeTruthy();
      expect(result.userId).toBe('me');
      expect(result.createdAt).toBe('2026-05-04T10:00:00.000Z');
      expect(result.updatedAt).toBe('2026-05-04T10:00:00.000Z');
      expect(result.createdBy).toBe('me');
      expect(result.updatedBy).toBe('me');
      expect(result.deletedAt).toBeNull();
      expect(result.schemaVersion).toBe(3);
    });

    it('preserves caller-supplied id if provided', () => {
      const result = stampNewRecord({ id: 'custom-id', name: 'test' });
      expect(result.id).toBe('custom-id');
    });

    it('preserves caller-supplied userId if provided', () => {
      const result = stampNewRecord({ userId: 'other-user', name: 'test' });
      expect(result.userId).toBe('other-user');
    });

    it('preserves caller-supplied createdAt if provided', () => {
      const result = stampNewRecord({ createdAt: '2020-01-01T00:00:00.000Z', name: 'test' });
      expect(result.createdAt).toBe('2020-01-01T00:00:00.000Z');
    });

    it('generates a valid UUID when id is not provided', () => {
      const result = stampNewRecord({ name: 'test' });
      expect(result.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it('preserves all caller-supplied input fields', () => {
      const result = stampNewRecord({ name: 'Flower A', thcPct: 20 });
      expect(result.name).toBe('Flower A');
      expect(result.thcPct).toBe(20);
    });

    it('return value is not a Promise', () => {
      const result = stampNewRecord({ name: 'test' });
      expect(result).not.toBeInstanceOf(Promise);
      expect(typeof result.then).toBe('undefined');
    });
  });

  // ── stampUpdate ─────────────────────────────────────────────────────

  describe('stampUpdate', () => {
    it('merges patch over existing and bumps updatedAt + updatedBy', () => {
      const existing = {
        id: 'r1',
        name: 'Old Name',
        userId: 'me',
        createdAt: '2020-01-01T00:00:00.000Z',
        createdBy: 'me',
        updatedAt: '2020-01-01T00:00:00.000Z',
        updatedBy: 'me',
        schemaVersion: 3,
      };
      const result = stampUpdate(existing, { name: 'New Name' });
      expect(result.name).toBe('New Name');
      expect(result.updatedAt).toBe('2026-05-04T10:00:00.000Z');
      expect(result.updatedBy).toBe('me');
    });

    it('preserves createdAt, createdBy, id, userId', () => {
      const existing = {
        id: 'r1',
        userId: 'me',
        createdAt: '2020-01-01T00:00:00.000Z',
        createdBy: 'me',
        updatedAt: '2020-01-01T00:00:00.000Z',
        updatedBy: 'me',
        schemaVersion: 3,
      };
      const result = stampUpdate(existing, { name: 'New Name' });
      expect(result.id).toBe('r1');
      expect(result.userId).toBe('me');
      expect(result.createdAt).toBe('2020-01-01T00:00:00.000Z');
      expect(result.createdBy).toBe('me');
    });

    it('return value is not a Promise', () => {
      const existing = { id: 'r1', updatedAt: '2020-01-01T00:00:00.000Z' };
      const result = stampUpdate(existing, { name: 'X' });
      expect(result).not.toBeInstanceOf(Promise);
      expect(typeof result.then).toBe('undefined');
    });
  });

  // ── stampSoftDelete ─────────────────────────────────────────────────

  describe('stampSoftDelete', () => {
    it('sets deletedAt and bumps updatedAt + updatedBy', () => {
      const existing = {
        id: 'r1',
        name: 'Item',
        userId: 'me',
        createdAt: '2020-01-01T00:00:00.000Z',
        createdBy: 'me',
        updatedAt: '2020-01-01T00:00:00.000Z',
        updatedBy: 'me',
        deletedAt: null,
        schemaVersion: 3,
      };
      const result = stampSoftDelete(existing);
      expect(result.deletedAt).toBe('2026-05-04T10:00:00.000Z');
      expect(result.updatedAt).toBe('2026-05-04T10:00:00.000Z');
      expect(result.updatedBy).toBe('me');
    });

    it('preserves all other fields including name, id, userId', () => {
      const existing = { id: 'r1', name: 'Item', userId: 'me', deletedAt: null };
      const result = stampSoftDelete(existing);
      expect(result.id).toBe('r1');
      expect(result.name).toBe('Item');
      expect(result.userId).toBe('me');
    });

    it('return value is not a Promise', () => {
      const existing = { id: 'r1', deletedAt: null };
      const result = stampSoftDelete(existing);
      expect(result).not.toBeInstanceOf(Promise);
      expect(typeof result.then).toBe('undefined');
    });
  });
});
