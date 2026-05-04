/**
 * useFeature.integration.test.jsx — AC-P1D-D14 RED
 *
 * Integration tests verifying useFeature hook + URL override + uiSlice.featureFlags
 * compose correctly across the app.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFeature } from '../useFeature.js';
import { useStore } from '../../data/store/index.js';

// ── URL mock helpers ──────────────────────────────────────────────────────────

const originalLocation = window.location;

function setSearchString(search) {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { ...originalLocation, search },
  });
}

function resetLocation() {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: originalLocation,
  });
}

describe('useFeature — store-only flags', () => {
  beforeEach(() => {
    resetLocation();
    useStore.setState({ featureFlags: {} });
  });

  it('returns false when flag not in store and no URL override', () => {
    const { result } = renderHook(() => useFeature('newPlanner'));
    expect(result.current).toBe(false);
  });

  it('returns true when flag is true in store', () => {
    useStore.setState({ featureFlags: { newPlanner: true } });
    const { result } = renderHook(() => useFeature('newPlanner'));
    expect(result.current).toBe(true);
  });

  it('returns false when flag is false in store', () => {
    useStore.setState({ featureFlags: { newPlanner: false } });
    const { result } = renderHook(() => useFeature('newPlanner'));
    expect(result.current).toBe(false);
  });

  it('different flags are independent', () => {
    useStore.setState({ featureFlags: { flagA: true, flagB: false } });
    const { result: resultA } = renderHook(() => useFeature('flagA'));
    const { result: resultB } = renderHook(() => useFeature('flagB'));
    expect(resultA.current).toBe(true);
    expect(resultB.current).toBe(false);
  });
});

describe('useFeature — URL override', () => {
  beforeEach(() => {
    useStore.setState({ featureFlags: {} });
  });

  afterEach(() => {
    resetLocation();
  });

  it('URL ?ff=newPlanner makes useFeature("newPlanner") return true', () => {
    setSearchString('?ff=newPlanner');
    const { result } = renderHook(() => useFeature('newPlanner'));
    expect(result.current).toBe(true);
  });

  it('URL ?ff=a,b enables both flags', () => {
    setSearchString('?ff=flagA,flagB');
    const { result: resultA } = renderHook(() => useFeature('flagA'));
    const { result: resultB } = renderHook(() => useFeature('flagB'));
    expect(resultA.current).toBe(true);
    expect(resultB.current).toBe(true);
  });

  it('URL override wins over store false', () => {
    useStore.setState({ featureFlags: { newPlanner: false } });
    setSearchString('?ff=newPlanner');
    const { result } = renderHook(() => useFeature('newPlanner'));
    expect(result.current).toBe(true);
  });

  it('flag not in URL falls back to store', () => {
    useStore.setState({ featureFlags: { storageFlag: true } });
    setSearchString('?ff=unrelated');
    const { result } = renderHook(() => useFeature('storageFlag'));
    expect(result.current).toBe(true);
  });

  it('empty ?ff= returns false for any flag', () => {
    setSearchString('?ff=');
    const { result } = renderHook(() => useFeature('someFlag'));
    expect(result.current).toBe(false);
  });
});

describe('useFeature — settings view integration', () => {
  it('featureFlags in store renders in SettingsView', async () => {
    const { render, screen } = await import('@testing-library/react');
    const { MemoryRouter, Routes, Route } = await import('react-router-dom');
    const { SettingsView } = await import('../../views/SettingsView.jsx');

    global.URL.createObjectURL = vi.fn(() => 'blob:mock');
    global.URL.revokeObjectURL = vi.fn();

    useStore.setState({ featureFlags: { newPlanner: true, betaDashboard: false } });

    render(
      <MemoryRouter initialEntries={['/settings']}>
        <Routes>
          <Route path="/settings" element={<SettingsView />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/newPlanner/)).toBeTruthy();
    expect(screen.getByText(/betaDashboard/)).toBeTruthy();
  });
});
