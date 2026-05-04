/**
 * cannabisSlice.js
 *
 * Owns: cannabisLogs, inventory (products / devices)
 *
 * B10 note: Shape is kept at current v_legacy form.
 * The v_legacy → v3 migration (B10) will expand to products / devices / sessions
 * per the Unified Library Pattern. For now, keep current shape exactly.
 */

import { format } from 'date-fns';

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
     * Generates a pre-built plan from inventory for the day.
     * Only includes products that are available (remaining > 0),
     * not test-only, not night-only, not high-risk capsules.
     * Sessions are matched to time slots by inventory dayNight window.
     */
    getDailyCannabisPlan: () => {
      const { inventory, profile } = get();

      // Guard: profile or cannabisTargets not yet available
      if (!profile?.cannabisTargets) return [];

      const sessionCount = profile.cannabisTargets.dailySessions;

      const available = inventory.filter(
        (p) =>
          p.remaining > 0 &&
          p.form === 'flower' &&
          p.dayNight !== 'test-only' &&
          p.dayNight !== 'night-only' &&
          p.riskLevel !== 'high'
      );

      const TIME_SLOTS = [
        {
          sessionNumber: 1,
          timeLabel: 'Afternoon',
          plannedTime: '15:00',
          preference: ['day-evening', 'evening'],
          reason: 'Mood / Stress',
        },
        {
          sessionNumber: 2,
          timeLabel: 'Evening',
          plannedTime: '19:30',
          preference: ['evening-night', 'evening', 'night'],
          reason: 'Pain / Relaxation',
        },
        {
          sessionNumber: 3,
          timeLabel: 'Night',
          plannedTime: '21:30',
          preference: ['night', 'evening-night'],
          reason: 'Sleep',
        },
      ];

      const plan = [];
      const usedIds = new Set();

      for (const slot of TIME_SLOTS.slice(0, sessionCount)) {
        let product = null;

        for (const pref of slot.preference) {
          product = available.find((p) => p.dayNight === pref && !usedIds.has(p.id));
          if (product) break;
        }
        if (!product) {
          product = available.find((p) => !usedIds.has(p.id));
        }
        if (!product) continue;

        usedIds.add(product.id);

        const doseMatches = (product.startingDose || '0.05g').match(/([\d.]+)/g);
        const dose =
          doseMatches && doseMatches.length >= 2
            ? parseFloat(doseMatches[1])
            : doseMatches
            ? parseFloat(doseMatches[0])
            : 0.05;

        const thcMg = product.thcPercent
          ? parseFloat((dose * 1000 * (product.thcPercent / 100)).toFixed(1))
          : null;

        plan.push({
          sessionNumber: slot.sessionNumber,
          productId: product.id,
          productName: product.name,
          productBrand: product.brand,
          form: product.form,
          plannedTime: slot.plannedTime,
          timeLabel: slot.timeLabel,
          recommendedAmount: dose,
          unit: product.remainingUnit,
          estimatedThcMg: thcMg,
          reason: slot.reason,
          usagePlan: product.usagePlan || '',
          useWindow: product.useWindow || '',
          dayNight: product.dayNight,
          riskLevel: product.riskLevel,
          thcPercent: product.thcPercent,
        });
      }

      return plan;
    },
  };
}
