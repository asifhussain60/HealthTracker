/**
 * HealthDataAdapter.js
 *
 * Interface typedef for health platform data access.
 *
 * Phase 4+ — Apple Health (iOS PWA) and Google Fit (Android/web) implementations.
 * For Phase 0/1, only the typedef exists. There is no manual fallback adapter
 * because direct user entry goes through the existing slices/repos.
 *
 * @typedef {Object} HealthDataReading
 * @property {string} date          - ISO date string (YYYY-MM-DD)
 * @property {string} metric        - e.g. 'steps' | 'heartRate' | 'weight'
 * @property {number} value
 * @property {string} unit
 */

/**
 * @typedef {Object} HealthDataAdapter
 * @property {() => string}                              getProvider   - 'apple-health' | 'google-fit' | 'manual'
 * @property {(date: string) => HealthDataReading[]}     getReadings   - All readings for a given date.
 * @property {() => boolean}                             isAvailable   - Whether the platform adapter is usable.
 *
 * Phase 4+ only. No implementation exists in Phase 0/1.
 */

// Null export — confirms typedef presence at import time (used by smoke tests).
// Do NOT instantiate. See AC-P0-B12.
export const HealthDataAdapter = null;
