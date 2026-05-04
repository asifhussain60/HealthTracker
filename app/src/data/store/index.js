/**
 * app/src/data/store/index.js
 *
 * Combines all slices into a single persisted Zustand store.
 * Re-exports `useStore` so existing `import { useStore } from '../data/store'`
 * imports continue to work without any caller changes.
 *
 * Slice mapping (from architecture.md § Slice ownership):
 *   cannabisSlice  — inventory, cannabisLogs
 *   mealSlice      — mealTemplates
 *   todoSlice      — items (placeholder)
 *   workoutSlice   — workoutLogs, weightHistory
 *   profileSlice   — profile
 *   uiSlice        — demoMode, toasts, featureFlags, activeView, photos
 *
 * foodSlice: NOT introduced (removed per Decision #13 / D13).
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { SEED_PROFILE, SEED_INVENTORY, SEED_WEIGHT_HISTORY } from '../seed';
import { runMigrations } from '../migrations';

import { cannabisSliceInitial, createCannabisSlice } from './cannabisSlice';
import { mealSliceInitial, createMealSlice } from './mealSlice';
import { todoSliceInitial, createTodoSlice } from './todoSlice';
import { workoutSliceInitial, createWorkoutSlice } from './workoutSlice';
import { profileSliceInitial, createProfileSlice } from './profileSlice';
import { uiSliceInitial, createUiSlice } from './uiSlice';
import { librarySlicesInitial } from './librarySlices';
import { prayerSliceInitial, createPrayerSlice } from './prayerSlice';
import { weightSessionsSliceInitial, createWeightSessionsSlice } from './weightSessionsSlice';
import { fastingIntakeSliceInitial, createFastingIntakeSlice } from './fastingIntakeSlice';
import { sweetToothSliceInitial, createSweetToothSlice } from './sweetToothSlice';

// ── Combined initial state ────────────────────────────────────────────────────
// Seed data is injected here, at the boundary where slices meet persistence.
const combinedInitial = {
  // cannabisSlice (inventory seeded here)
  ...cannabisSliceInitial,
  inventory: SEED_INVENTORY,

  // mealSlice
  ...mealSliceInitial,

  // todoSlice
  ...todoSliceInitial,

  // workoutSlice (weightHistory seeded here)
  ...workoutSliceInitial,
  weightHistory: SEED_WEIGHT_HISTORY,

  // profileSlice (profile seeded here)
  ...profileSliceInitial(SEED_PROFILE),

  // uiSlice
  ...uiSliceInitial,

  // Library slices (9 — managed by LibraryRepo via createLibraryRepo)
  ...librarySlicesInitial,

  // prayerSlice — daily prayer tracking (AC-P1E-E2)
  ...prayerSliceInitial,

  // weightSessionsSlice — AC-P1E-E3
  ...weightSessionsSliceInitial,

  // fastingIntakeSlice — AC-P1E-E5
  ...fastingIntakeSliceInitial,

  // sweetToothSlice — AC-P1E-E6
  ...sweetToothSliceInitial,
};

// ── Store factory (exported for testing getInitialState support) ────────────
function buildStore(set, get) {
  return {
    ...combinedInitial,

    // Slice actions
    ...createCannabisSlice(set, get),
    ...createMealSlice(set, get),
    ...createTodoSlice(set, get),
    ...createWorkoutSlice(set, get),
    ...createProfileSlice(set, get),
    ...createUiSlice(set, get),
    ...createPrayerSlice(set, get),
    ...createWeightSessionsSlice(set, get),
    ...createFastingIntakeSlice(set, get),
    ...createSweetToothSlice(set, get),

    // ── Export / Import helpers (cross-slice; live on combined store) ────────
    exportJSON: () => {
      const state = get();
      const data = {
        profile: state.profile,
        inventory: state.inventory,
        cannabisLogs: state.cannabisLogs,
        workoutLogs: state.workoutLogs,
        weightHistory: state.weightHistory,
        mealTemplates: state.mealTemplates,
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      a.download = `healthtracker-backup-${dateStr}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },

    exportCSV: (section) => {
      const state = get();
      let rows = [];
      let filename = '';

      if (section === 'cannabis') {
        filename = `cannabis-log-${new Date().toISOString().slice(0, 10)}.csv`;
        rows = [
          ['date', 'time', 'product', 'form', 'sessionNumber', 'amount', 'unit', 'thcMg', 'method', 'reason', 'effect', 'munchiesTriggered', 'munchiesLevel', 'productivityScore', 'painRelief', 'medicalBenefit', 'wouldUseAgain', 'preUsePain', 'preUseAnxiety', 'preUseMood', 'preUseEnergy', 'notes'],
          ...state.cannabisLogs.map((e) => {
            const prod = state.inventory.find((p) => p.id === e.productId);
            return [
              e.date, e.time, prod?.name || e.productId, e.form,
              e.sessionNumber, e.amount, e.unit, e.thcMg || '',
              e.method || '', e.reason, e.effect, e.munchiesTriggered ? 1 : 0,
              e.munchiesLevel ?? '', e.productivityScore ?? '', e.painRelief ?? '',
              e.medicalBenefit ?? '', e.wouldUseAgain || '',
              e.preUsePain ?? '', e.preUseAnxiety ?? '', e.preUseMood ?? '', e.preUseEnergy ?? '',
              e.notes || '',
            ];
          }),
        ];
      } else if (section === 'workouts') {
        filename = `workouts-${new Date().toISOString().slice(0, 10)}.csv`;
        rows = [
          ['date', 'steps', 'walkDuration', 'type', 'completed', 'intensity', 'chestPain', 'shortness', 'notes'],
          ...state.workoutLogs.map((e) => [
            e.date, e.steps || 0, e.walkDuration || 0, e.type || '',
            e.completed ? 1 : 0, e.intensity || '', e.chestPain ? 1 : 0,
            e.sob ? 1 : 0, e.notes || '',
          ]),
        ];
      } else if (section === 'weight') {
        filename = `weight-history-${new Date().toISOString().slice(0, 10)}.csv`;
        rows = [
          ['date', 'weight_lb'],
          ...state.weightHistory.map((e) => [e.date, e.weight]),
        ];
      }
      // NOTE: 'food' CSV export removed (foodSlice removed per D13).
      // If section === 'food', a no-op is the correct behavior.

      if (!filename || rows.length === 0) return;

      const csv = rows.map((r) => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },

    importJSON: (data) => {
      try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        set({
          profile: parsed.profile || get().profile,
          inventory: parsed.inventory || get().inventory,
          cannabisLogs: parsed.cannabisLogs || [],
          workoutLogs: parsed.workoutLogs || [],
          weightHistory: parsed.weightHistory || [],
          mealTemplates: parsed.mealTemplates || [],
          // foodLogs from legacy exports are silently dropped (D13).
          // They will be exported to ht-legacy-foodlogs-export-<ts> in B10.
        });
        return true;
      } catch {
        return false;
      }
    },
  };
}

// ── Persisted store ───────────────────────────────────────────────────────────
export const useStore = create(
  persist(buildStore, {
    name: 'healthtracker-store',
    partialize: (state) => ({
      demoMode: state.demoMode,
      profile: state.profile,
      inventory: state.inventory,
      cannabisLogs: state.cannabisLogs,
      workoutLogs: state.workoutLogs,
      weightHistory: state.weightHistory,
      mealTemplates: state.mealTemplates,
      photos: state.photos,
      schemaVersion: state.schemaVersion,
      theme: state.theme,
      // Library slices — persisted
      meals: state.meals,
      workoutPrograms: state.workoutPrograms,
      workoutRoutines: state.workoutRoutines,
      exercises: state.exercises,
      cannabisProducts: state.cannabisProducts,
      cannabisDevices: state.cannabisDevices,
      workLocations: state.workLocations,
      fastingSafeItems: state.fastingSafeItems,
      sweetToothItems: state.sweetToothItems,
      // foodLogs intentionally omitted — removed per D13
      // prayerSlice — AC-P1E-E2
      prayers: state.prayers,
      // weightSessionsSlice — AC-P1E-E3
      weightSessions: state.weightSessions,
      // fastingIntakeSlice — AC-P1E-E5
      fastingIntake: state.fastingIntake,
      // sweetToothSlice — AC-P1E-E6
      dailySlips: state.dailySlips,
    }),

    /**
     * onRehydrateStorage — runs the v_legacy → v3 migration on every load.
     * Idempotent: if the persisted blob is already at schemaVersion 3, runMigrations
     * returns the blob unchanged. This guarantees existing users' data is upgraded
     * transparently on first launch after the B10 commit.
     *
     * AC-P0-B10 / HT-CORE-009
     */
    onRehydrateStorage: () => (rehydratedState, error) => {
      if (error || !rehydratedState) return;
      const migrated = runMigrations(rehydratedState);
      // Only write back if the migration actually changed something.
      if (migrated !== rehydratedState) {
        useStore.setState(migrated);
      }
    },
  })
);
