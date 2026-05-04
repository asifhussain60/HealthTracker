/**
 * prayerSlice.js — Daily prayer tracking slice.
 *
 * Owns: prayers — keyed by date → prayer name → { done, updatedAt }
 *
 * Actions:
 *   togglePrayer(date, prayer) — toggle done state, stamp updatedAt
 *   getPrayerStatus(date, prayer) — return { done } for a prayer on a date
 *
 * AC-P1E-E2
 * HT-CORE-008: audit field (updatedAt) stamped on every write.
 * HT-CORE-009: schemaVersion: 3 on every persisted record.
 */

export const prayerSliceInitial = {
  prayers: {},
  // Shape: { [date]: { [prayerKey]: { done: boolean, updatedAt: string } } }
};

/**
 * @param {Function} set - Zustand set
 * @param {Function} get - Zustand get
 * @returns {Object} action creators
 */
export function createPrayerSlice(set, get) {
  return {
    /**
     * Toggle the done state of a prayer for a given date.
     * Stamps updatedAt on every write.
     *
     * @param {string} date - YYYY-MM-DD
     * @param {string} prayer - lowercase prayer key (fajr, zohr, asr, maghrib, isha)
     */
    togglePrayer(date, prayer) {
      set((s) => {
        const day = s.prayers[date] ?? {};
        const current = day[prayer] ?? { done: false };
        return {
          prayers: {
            ...s.prayers,
            [date]: {
              ...day,
              [prayer]: {
                done: !current.done,
                updatedAt: new Date().toISOString(),
                schemaVersion: 3,
              },
            },
          },
        };
      });
    },

    /**
     * Return the prayer status for a given date and prayer.
     * Returns { done: false } when not yet set.
     *
     * @param {string} date - YYYY-MM-DD
     * @param {string} prayer - lowercase prayer key
     * @returns {{ done: boolean, updatedAt?: string }}
     */
    getPrayerStatus(date, prayer) {
      const s = get();
      return s.prayers?.[date]?.[prayer] ?? { done: false };
    },
  };
}
