/**
 * useProfileRepo.test.js
 *
 * Per-repo unit tests for useProfileRepo.
 * Uses the real combined store (integration-style) with state reset between tests.
 * RED phase — ../useProfileRepo.js doesn't exist yet; tests fail with module-not-found.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStore } from '../../store';
import { useProfileRepo } from '../useProfileRepo.js';

const SEED_PROFILE = {
  name: 'Test User',
  currentWeight: 200,
  bodyMetrics: { height: 70, lastUpdated: '2020-01-01' },
};

function resetStore() {
  useStore.setState({ profile: { ...SEED_PROFILE } });
}

describe('useProfileRepo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-04T10:00:00.000Z'));
    resetStore();
  });

  // ── getProfile ───────────────────────────────────────────────────────

  describe('getProfile()', () => {
    it('returns the current profile object', () => {
      const { result } = renderHook(() => useProfileRepo());
      const profile = result.current.getProfile();
      expect(profile).toBeDefined();
      expect(profile.name).toBe('Test User');
    });

    it('reflects store state', () => {
      useStore.setState({ profile: { ...SEED_PROFILE, name: 'Asif' } });
      const { result } = renderHook(() => useProfileRepo());
      expect(result.current.getProfile().name).toBe('Asif');
    });

    it('return value is not a Promise', () => {
      const { result } = renderHook(() => useProfileRepo());
      const ret = result.current.getProfile();
      expect(ret).not.toBeInstanceOf(Promise);
      expect(typeof ret.then).toBe('undefined');
    });
  });

  // ── updateProfile ────────────────────────────────────────────────────

  describe('updateProfile(patch)', () => {
    it('merges patch over profile', () => {
      const { result } = renderHook(() => useProfileRepo());
      let updated;
      act(() => {
        updated = result.current.updateProfile({ name: 'Asif' });
      });
      expect(updated.name).toBe('Asif');
    });

    it('preserves fields not in the patch', () => {
      const { result } = renderHook(() => useProfileRepo());
      let updated;
      act(() => {
        updated = result.current.updateProfile({ name: 'Asif' });
      });
      expect(updated.currentWeight).toBe(200);
    });

    it('returns the updated profile', () => {
      const { result } = renderHook(() => useProfileRepo());
      let updated;
      act(() => {
        updated = result.current.updateProfile({ name: 'Asif' });
      });
      expect(updated).toBeDefined();
      expect(updated.name).toBe('Asif');
    });

    it('return value is not a Promise', () => {
      const { result } = renderHook(() => useProfileRepo());
      let ret;
      act(() => {
        ret = result.current.updateProfile({ name: 'X' });
      });
      expect(ret).not.toBeInstanceOf(Promise);
      expect(typeof ret.then).toBe('undefined');
    });
  });

  // ── updateBodyMetrics ────────────────────────────────────────────────

  describe('updateBodyMetrics(metrics)', () => {
    it('merges metrics into bodyMetrics and sets lastUpdated', () => {
      const { result } = renderHook(() => useProfileRepo());
      let updated;
      act(() => {
        updated = result.current.updateBodyMetrics({ height: 72, waist: 36 });
      });
      expect(updated.bodyMetrics.height).toBe(72);
      expect(updated.bodyMetrics.waist).toBe(36);
      expect(updated.bodyMetrics.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('preserves existing bodyMetrics fields not in patch', () => {
      const { result } = renderHook(() => useProfileRepo());
      let updated;
      act(() => {
        updated = result.current.updateBodyMetrics({ waist: 36 });
      });
      // height was already 70 in seed
      expect(updated.bodyMetrics.height).toBe(70);
    });

    it('return value is not a Promise', () => {
      const { result } = renderHook(() => useProfileRepo());
      let ret;
      act(() => {
        ret = result.current.updateBodyMetrics({ height: 72 });
      });
      expect(ret).not.toBeInstanceOf(Promise);
      expect(typeof ret.then).toBe('undefined');
    });
  });

  // ── updateCurrentWeight ──────────────────────────────────────────────

  describe('updateCurrentWeight(weight)', () => {
    it('updates currentWeight on profile', () => {
      const { result } = renderHook(() => useProfileRepo());
      let updated;
      act(() => {
        updated = result.current.updateCurrentWeight(195);
      });
      expect(updated.currentWeight).toBe(195);
    });

    it('preserves other profile fields', () => {
      const { result } = renderHook(() => useProfileRepo());
      let updated;
      act(() => {
        updated = result.current.updateCurrentWeight(195);
      });
      expect(updated.name).toBe('Test User');
    });

    it('return value is not a Promise', () => {
      const { result } = renderHook(() => useProfileRepo());
      let ret;
      act(() => {
        ret = result.current.updateCurrentWeight(195);
      });
      expect(ret).not.toBeInstanceOf(Promise);
      expect(typeof ret.then).toBe('undefined');
    });
  });
});
