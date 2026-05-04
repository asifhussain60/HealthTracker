/**
 * useFeature.js
 *
 * Hook: useFeature(flagName) → boolean
 *
 * Resolution order (highest priority first):
 *   1. URL ?ff= flag (session-only; not persisted to store)
 *   2. uiSlice.featureFlags value from the Zustand store
 *   3. false (default)
 *
 * URL flags are read from window.location.search on each render.
 * They are intentionally NOT written back to the store — URL-set flags
 * persist only for the browser session (while the URL retains ?ff=).
 *
 * AC-P0-B11
 */

import { useStore } from '../data/store';
import { parseFeatureFlagsFromUrl } from './featureFlags';

/**
 * @param {string} flagName - The feature flag key to check.
 * @returns {boolean} True if the flag is enabled (via URL or store), false otherwise.
 */
export function useFeature(flagName) {
  const storeFlags = useStore((state) => state.featureFlags ?? {});
  const urlFlags = parseFeatureFlagsFromUrl(
    typeof window !== 'undefined' ? window.location.search : ''
  );

  // URL override wins over store value
  if (Object.prototype.hasOwnProperty.call(urlFlags, flagName)) {
    return urlFlags[flagName];
  }

  return storeFlags[flagName] === true;
}
