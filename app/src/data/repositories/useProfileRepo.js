/**
 * useProfileRepo.js
 *
 * Repository hook for profile domain.
 *
 * Wraps profileSlice (profile singleton) with:
 *   - passthrough to existing slice actions (updateProfile, updateBodyMetrics, updateCurrentWeight)
 *   - returns the updated profile state after each mutation (sync)
 *   - sync-by-signature: every method returns a value directly, never a Promise
 *
 * Profile is a singleton — no add/remove methods. No audit-field stamping needed
 * (profile is not a list record; it's a configuration object).
 *
 * Architecture rule 5 invariant: NO async, NO await, NO Promise.resolve, NO .then.
 */

import { useStore } from '../store';

export function useProfileRepo() {
  const profile = useStore((s) => s.profile);
  const updateProfileAction = useStore((s) => s.updateProfile);
  const updateBodyMetricsAction = useStore((s) => s.updateBodyMetrics);
  const updateCurrentWeightAction = useStore((s) => s.updateCurrentWeight);

  /**
   * Returns the current profile object.
   * @returns {Object}
   */
  function getProfile() {
    return profile;
  }

  /**
   * Merges patch onto the profile and returns the updated profile.
   * @param {Object} patch
   * @returns {Object}
   */
  function updateProfile(patch) {
    updateProfileAction(patch);
    return useStore.getState().profile;
  }

  /**
   * Merges metrics into profile.bodyMetrics (with lastUpdated stamp from the slice).
   * Returns the updated profile.
   * @param {Object} metrics
   * @returns {Object}
   */
  function updateBodyMetrics(metrics) {
    updateBodyMetricsAction(metrics);
    return useStore.getState().profile;
  }

  /**
   * Updates profile.currentWeight.
   * Returns the updated profile.
   * @param {number} weight
   * @returns {Object}
   */
  function updateCurrentWeight(weight) {
    updateCurrentWeightAction(weight);
    return useStore.getState().profile;
  }

  return {
    getProfile,
    updateProfile,
    updateBodyMetrics,
    updateCurrentWeight,
  };
}
