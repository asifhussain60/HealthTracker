/**
 * featureFlags.js
 *
 * Pure utility for parsing URL-based feature flag overrides.
 *
 * URL format: ?ff=flag1,flag2,flag3
 *
 * Flags enabled via URL are session-only — they are NOT written to the store
 * and disappear on next page load unless the URL still contains ?ff=.
 *
 * AC-P0-B11
 */

/**
 * Parse a URL search string and return a map of flags enabled via ?ff=.
 *
 * @param {string} searchString - The URL's search string (e.g. "?ff=foo,bar&other=1")
 * @returns {Record<string, boolean>} Map of flag name → true for each flag present.
 *   Returns {} for empty/null/undefined/non-string input or when ?ff= is absent.
 */
export function parseFeatureFlagsFromUrl(searchString) {
  if (!searchString || typeof searchString !== 'string') return {};

  let ffValue;
  try {
    const params = new URLSearchParams(searchString);
    ffValue = params.get('ff');
  } catch {
    return {};
  }

  if (!ffValue) return {};

  const result = {};
  for (const flag of ffValue.split(',')) {
    const trimmed = flag.trim();
    if (trimmed) {
      result[trimmed] = true;
    }
  }
  return result;
}
