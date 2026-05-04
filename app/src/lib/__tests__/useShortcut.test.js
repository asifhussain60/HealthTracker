/**
 * useShortcut.test.js — AC-P0-C4
 * Unit tests for useShortcut hook with mac/win abstraction.
 *
 * Platform is mocked via Object.defineProperty(navigator, 'platform', ...).
 */
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useShortcut } from '../useShortcut';

// Helper to fire a keydown event with specified modifiers
function fireKeydown(key, modifiers = {}) {
  const event = new KeyboardEvent('keydown', {
    key,
    metaKey:  modifiers.metaKey  ?? false,
    ctrlKey:  modifiers.ctrlKey  ?? false,
    shiftKey: modifiers.shiftKey ?? false,
    altKey:   modifiers.altKey   ?? false,
    bubbles: true,
  });
  window.dispatchEvent(event);
}

function setPlatform(platform) {
  Object.defineProperty(navigator, 'platform', {
    configurable: true,
    get: () => platform,
  });
}

describe('useShortcut', () => {
  let callback;

  beforeEach(() => {
    callback = vi.fn();
    setPlatform('MacIntel');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls callback on mod+k (mac → metaKey)', () => {
    setPlatform('MacIntel');
    renderHook(() => useShortcut('mod+k', callback));
    fireKeydown('k', { metaKey: true });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does NOT call callback on ctrl+k when platform is mac (mod = meta)', () => {
    setPlatform('MacIntel');
    renderHook(() => useShortcut('mod+k', callback));
    fireKeydown('k', { ctrlKey: true });
    expect(callback).not.toHaveBeenCalled();
  });

  it('calls callback on mod+k (win → ctrlKey)', () => {
    setPlatform('Win32');
    renderHook(() => useShortcut('mod+k', callback));
    fireKeydown('k', { ctrlKey: true });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does NOT call callback on metaKey+k when platform is win (mod = ctrl)', () => {
    setPlatform('Win32');
    renderHook(() => useShortcut('mod+k', callback));
    fireKeydown('k', { metaKey: true });
    expect(callback).not.toHaveBeenCalled();
  });

  it('calls callback on shift+enter', () => {
    renderHook(() => useShortcut('shift+enter', callback));
    fireKeydown('Enter', { shiftKey: true });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does NOT call callback when key does not match', () => {
    renderHook(() => useShortcut('mod+k', callback));
    fireKeydown('j', { metaKey: true });
    expect(callback).not.toHaveBeenCalled();
  });

  it('does NOT call callback when modifier does not match', () => {
    renderHook(() => useShortcut('mod+k', callback));
    fireKeydown('k');
    expect(callback).not.toHaveBeenCalled();
  });

  it('calls callback on ctrl+z (explicit ctrl, not mod)', () => {
    setPlatform('MacIntel');
    renderHook(() => useShortcut('ctrl+z', callback));
    fireKeydown('z', { ctrlKey: true });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('removes event listener on unmount', () => {
    const { unmount } = renderHook(() => useShortcut('mod+k', callback));
    unmount();
    fireKeydown('k', { metaKey: true });
    expect(callback).not.toHaveBeenCalled();
  });
});
