/**
 * cannabisSlice.js
 *
 * Owns: cannabisLogs, inventory (products / devices)
 *
 * B10 note: Shape is kept at current v_legacy form.
 * The v_legacy → v3 migration (B10) will expand to products / devices / sessions
 * per the Unified Library Pattern. For now, keep current shape exactly.
 *
 * B5: getDailyCannabisPlan delegates pure logic to cannabisPlanner.planDay.
 */

import { format } from 'date-fns';
import { planDay } from '../calculators/cannabisPlanner.js';

const today = () => format(new Date(), 'yyyy-MM-dd');

export const cannabisSliceInitial = {
  inventory: [],        // CannabisProduct[] — seed data injected by index.js
  cannabisLogs: [],     // CannabisSession[]
};

/**
 * @param {Function} set - Zustand set
 * @param {Function} get - Zustand get
 * @returns {Object} action creators
 */
export function createCannabisSlice(set, get) {
  return {
    // ── Cannabis Logs ──────────────────────────────────────────────
    addCannabisLog: (entry) =>
      set((s) => ({
        cannabisLogs: [
          ...s.cannabisLogs,
          { id: crypto.randomUUID(), date: today(), ...entry },
        ],
      })),

    deleteCannabisLog: (id) =>
      set((s) => ({
        cannabisLogs: s.cannabisLogs.filter((e) => e.id !== id),
      })),

    // ── Inventory ──────────────────────────────────────────────────
    updateInventoryItem: (id, updates) =>
      set((s) => ({
        inventory: s.inventory.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        ),
      })),

    logInventoryUse: (productId, amount) =>
      set((s) => ({
        inventory: s.inventory.map((p) =>
          p.id === productId
            ? { ...p, remaining: Math.max(0, p.remaining - amount), lastUsed: today() }
            : p
        ),
      })),

    // ── Selectors ─────────────────────────────────────────────────
    getTodayCannabisLogs: () =>
      get().cannabisLogs.filter((e) => e.date === today()),

    getTodaySessions: () =>
      get().cannabisLogs.filter((e) => e.date === today()).length,

    // ── Daily Cannabis Plan ────────────────────────────────────────
    /**
     * Thin wrapper — delegates pure planning logic to cannabisPlanner.planDay.
     * taperDay defaults to 0 until the taper schedule lands in B10.
     * Returns the sessions array for backward compatibility with existing callers.
     */
    getDailyCannabisPlan: () => {
      const { inventory, profile } = get();
      const { sessions } = planDay({
        date: format(new Date(), 'yyyy-MM-dd'),
        taperDay: 0,
        profile,
        productLib: inventory,
      });
      return sessions;
    },
  };
}
