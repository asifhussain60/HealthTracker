import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// ── localStorage polyfill ─────────────────────────────────────────────────────
// jsdom 29 does not ship a fully functional localStorage (it warns about
// --localstorage-file and is missing several methods). We replace it with
// a complete in-memory implementation so the Zustand `persist` middleware
// works in tests without any file I/O.
const _lsStore = {};
const localStoragePolyfill = {
  getItem: (key) => _lsStore[key] ?? null,
  setItem: (key, value) => { _lsStore[key] = String(value); },
  removeItem: (key) => { delete _lsStore[key]; },
  clear: () => { Object.keys(_lsStore).forEach((k) => delete _lsStore[k]); },
  get length() { return Object.keys(_lsStore).length; },
  key: (i) => Object.keys(_lsStore)[i] ?? null,
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStoragePolyfill,
  writable: true,
  configurable: true,
});

afterEach(() => {
  // Clear localStorage between tests so persisted state does not bleed across
  localStoragePolyfill.clear();
  cleanup();
});
