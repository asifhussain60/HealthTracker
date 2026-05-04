/**
 * profileSlice.js
 *
 * Owns: profile (name, weight journey, bodyMetrics, medicalFlags,
 *        dietaryRules, nutritionTargets, cannabisTargets, certification)
 *
 * B10 note: The v_legacy → v3 migration (B10) will add prayerSettings,
 * sleepSchedule, intermittentFasting, etc. per data-model.md §ProfileFields.
 */

import { format } from 'date-fns';

const today = () => format(new Date(), 'yyyy-MM-dd');

/**
 * Returns the initial state object for the profile slice.
 *
 * @param {Object} seedProfile - The SEED_PROFILE to use as default profile.
 * @returns {{ profile: Object }}
 */
export function profileSliceInitial(seedProfile) {
  return {
    profile: seedProfile,
  };
}

/**
 * @param {Function} set - Zustand set
 * @returns {Object} action creators
 */
export function createProfileSlice(set) {
  return {
    // ── Profile ──────────────────────────────────────────────────
    updateProfile: (updates) =>
      set((s) => ({ profile: { ...s.profile, ...updates } })),

    updateBodyMetrics: (metrics) =>
      set((s) => ({
        profile: {
          ...s.profile,
          bodyMetrics: { ...s.profile.bodyMetrics, ...metrics, lastUpdated: today() },
        },
      })),

    updateCurrentWeight: (weight) =>
      set((s) => ({
        profile: { ...s.profile, currentWeight: weight },
      })),

    setMedicalClearance: (cleared, date) =>
      set((s) => ({
        profile: {
          ...s.profile,
          medicalFlags: {
            ...s.profile.medicalFlags,
            medicalClearance: cleared,
            medicalClearanceDate: date || null,
          },
        },
      })),

    toggleCertificationLock: () =>
      set((s) => ({
        profile: {
          ...s.profile,
          certification: {
            ...s.profile.certification,
            unlocked: !s.profile.certification.unlocked,
          },
        },
      })),
  };
}
