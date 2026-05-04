import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { create } from 'zustand';
import { uiSliceInitial, createUiSlice } from '../uiSlice';

function makeStore() {
  return create((set, get) => ({
    ...uiSliceInitial,
    ...createUiSlice(set, get),
  }));
}

describe('uiSlice — unit', () => {
  let store;
  beforeEach(() => {
    store = makeStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initial state: demoMode=false, toasts=[], featureFlags={}, activeView=null, photos=[]', () => {
    const state = store.getState();
    expect(state.demoMode).toBe(false);
    expect(state.toasts).toEqual([]);
    expect(state.featureFlags).toEqual({});
    expect(state.activeView).toBeNull();
    expect(state.photos).toEqual([]);
  });

  it('toggleDemoMode flips demoMode', () => {
    store.getState().toggleDemoMode();
    expect(store.getState().demoMode).toBe(true);
    store.getState().toggleDemoMode();
    expect(store.getState().demoMode).toBe(false);
  });

  it('addToast appends a toast with id, message, type', () => {
    store.getState().addToast('Hello', 'success');
    const { toasts } = store.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('Hello');
    expect(toasts[0].type).toBe('success');
    expect(toasts[0].id).toBeTruthy();
  });

  it('addToast defaults type to warning', () => {
    store.getState().addToast('Careful');
    expect(store.getState().toasts[0].type).toBe('warning');
  });

  it('addToast auto-removes the toast after 4500ms', () => {
    store.getState().addToast('Bye', 'info');
    expect(store.getState().toasts).toHaveLength(1);
    vi.advanceTimersByTime(4500);
    expect(store.getState().toasts).toHaveLength(0);
  });

  it('removeToast removes by id immediately', () => {
    store.getState().addToast('Remove me', 'info');
    const id = store.getState().toasts[0].id;
    store.getState().removeToast(id);
    expect(store.getState().toasts).toHaveLength(0);
  });

  it('addPhoto appends a photo with auto-generated id', () => {
    store.getState().addPhoto({ viewType: 'Front', dataUrl: 'data:image/png;base64,abc', date: '2026-05-04' });
    const { photos } = store.getState();
    expect(photos).toHaveLength(1);
    expect(photos[0].id).toBeTruthy();
    expect(photos[0].viewType).toBe('Front');
  });

  it('deletePhoto removes by id', () => {
    store.getState().addPhoto({ viewType: 'Front', dataUrl: 'data:image/png;base64,abc', date: '2026-05-04' });
    const id = store.getState().photos[0].id;
    store.getState().deletePhoto(id);
    expect(store.getState().photos).toHaveLength(0);
  });
});
