/**
 * fastingIntakeSlice.js — Fasting-safe intake counters.
 *
 * Owns: fastingIntake — keyed by date → { water: number, greenTea: number, ... }
 *
 * AC-P1E-E5
 * HT-CORE-008: updatedAt stamped on every write.
 * HT-CORE-009: schemaVersion: 3.
 */

export const fastingIntakeSliceInitial = {
  fastingIntake: {},
  // { [date]: { water: number, greenTea: number, updatedAt: string, schemaVersion: 3 } }
};

/**
 * @param {Function} set - Zustand set
 * @param {Function} get - Zustand get
 * @returns {Object} action creators
 */
export function createFastingIntakeSlice(set, get) {
  return {
    /**
     * Increment a fasting-safe item counter for a date.
     * @param {string} date - YYYY-MM-DD
     * @param {string} item - item key (e.g. 'water', 'greenTea')
     */
    incrementFastingItem(date, item) {
      set((s) => {
        const day = s.fastingIntake[date] ?? {};
        return {
          fastingIntake: {
            ...s.fastingIntake,
            [date]: {
              ...day,
              [item]: (day[item] ?? 0) + 1,
              updatedAt: new Date().toISOString(),
              schemaVersion: 3,
            },
          },
        };
      });
    },

    /**
     * Get fasting intake counters for a date.
     * @param {string} date - YYYY-MM-DD
     * @returns {object}
     */
    getFastingIntake(date) {
      return get().fastingIntake[date] ?? {};
    },
  };
}
