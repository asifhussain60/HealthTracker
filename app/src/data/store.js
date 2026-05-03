import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';
import {
  SEED_PROFILE,
  SEED_INVENTORY,
  SEED_WEIGHT_HISTORY,
} from './seed';

const today = () => format(new Date(), 'yyyy-MM-dd');

const initialState = {
  profile: SEED_PROFILE,
  inventory: SEED_INVENTORY,
  foodLogs: [],       // [{ id, date, label, name, time, calories, protein, carbs, fat, notes, cannabisTriggered, munchiesRelated, source }]
  cannabisLogs: [],   // [{ id, date, time, productId, form, sessionNumber, amount, unit, thcMg, reason, effect, munchiesTriggered, notes }]
  workoutLogs: [],    // [{ id, date, steps, walkDuration, type, completed, intensity, chestPain, sob, notes }]
  weightHistory: SEED_WEIGHT_HISTORY,
  mealTemplates: [],  // [{ id, name, label, calories, protein, carbs, fat, notes }]
  photos: [],         // [{ id, date, weight, viewType, dataUrl, notes }]
  toasts: [],         // [{ id, message, type }]
};

let toastId = 0;

export const useStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // ── Profile ──────────────────────────────────────────────
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

      // ── Food Logs ─────────────────────────────────────────────
      addFoodLog: (entry) =>
        set((s) => ({
          foodLogs: [
            ...s.foodLogs,
            { id: crypto.randomUUID(), date: today(), ...entry },
          ],
        })),

      deleteFoodLog: (id) =>
        set((s) => ({ foodLogs: s.foodLogs.filter((e) => e.id !== id) })),

      // ── Meal Templates ────────────────────────────────────────
      saveMealTemplate: (template) =>
        set((s) => ({
          mealTemplates: [
            ...s.mealTemplates,
            { id: crypto.randomUUID(), ...template },
          ],
        })),

      deleteMealTemplate: (id) =>
        set((s) => ({
          mealTemplates: s.mealTemplates.filter((t) => t.id !== id),
        })),

      // ── Cannabis Logs ─────────────────────────────────────────
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

      // ── Inventory ─────────────────────────────────────────────
      updateInventoryItem: (id, updates) =>
        set((s) => ({
          inventory: s.inventory.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      logInventoryUse: (productId, amount) => {
        set((s) => ({
          inventory: s.inventory.map((p) =>
            p.id === productId
              ? { ...p, remaining: Math.max(0, p.remaining - amount), lastUsed: today() }
              : p
          ),
        }));
      },

      // ── Workout Logs ──────────────────────────────────────────
      addWorkoutLog: (entry) =>
        set((s) => ({
          workoutLogs: [
            ...s.workoutLogs,
            { id: crypto.randomUUID(), date: today(), ...entry },
          ],
        })),

      deleteWorkoutLog: (id) =>
        set((s) => ({
          workoutLogs: s.workoutLogs.filter((e) => e.id !== id),
        })),

      // ── Weight History ────────────────────────────────────────
      addWeightEntry: (weight, date) =>
        set((s) => {
          const d = date || today();
          const existing = s.weightHistory.find((e) => e.date === d);
          const updated = existing
            ? s.weightHistory.map((e) => (e.date === d ? { ...e, weight } : e))
            : [...s.weightHistory, { date: d, weight }];
          return {
            weightHistory: updated,
            profile: { ...s.profile, currentWeight: weight },
          };
        }),

      // ── Photos ────────────────────────────────────────────────
      addPhoto: (photo) =>
        set((s) => ({
          photos: [...s.photos, { id: crypto.randomUUID(), ...photo }],
        })),

      deletePhoto: (id) =>
        set((s) => ({ photos: s.photos.filter((p) => p.id !== id) })),

      // ── Toasts ───────────────────────────────────────────────
      addToast: (message, type = 'warning') => {
        const id = ++toastId;
        set((s) => ({
          toasts: [...s.toasts, { id, message, type }],
        }));
        setTimeout(() => {
          set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
        }, 4500);
      },

      removeToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      // ── Selectors ────────────────────────────────────────────
      getTodayFoodLogs: () =>
        get().foodLogs.filter((e) => e.date === today()),

      getTodayCannabisLogs: () =>
        get().cannabisLogs.filter((e) => e.date === today()),

      getTodayWorkoutLog: () =>
        get().workoutLogs.find((e) => e.date === today()) || null,

      getTodayCalories: () =>
        get()
          .foodLogs.filter((e) => e.date === today())
          .reduce((sum, e) => sum + (Number(e.calories) || 0), 0),

      getTodayProtein: () =>
        get()
          .foodLogs.filter((e) => e.date === today())
          .reduce((sum, e) => sum + (Number(e.protein) || 0), 0),

      getTodaySessions: () =>
        get().cannabisLogs.filter((e) => e.date === today()).length,

      // ── Export ───────────────────────────────────────────────
      exportJSON: () => {
        const state = get();
        const data = {
          profile: state.profile,
          inventory: state.inventory,
          foodLogs: state.foodLogs,
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
        a.download = `healthtracker-backup-${today()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },

      exportCSV: (section) => {
        const state = get();
        let rows = [];
        let filename = '';

        if (section === 'food') {
          filename = `food-log-${today()}.csv`;
          rows = [
            ['date', 'time', 'label', 'name', 'calories', 'protein', 'carbs', 'fat', 'cannabisTriggered', 'munchiesRelated', 'notes'],
            ...state.foodLogs.map((e) => [
              e.date, e.time, e.label, e.name, e.calories, e.protein,
              e.carbs || '', e.fat || '', e.cannabisTriggered ? 1 : 0,
              e.munchiesRelated ? 1 : 0, e.notes || '',
            ]),
          ];
        } else if (section === 'cannabis') {
          filename = `cannabis-log-${today()}.csv`;
          rows = [
            ['date', 'time', 'product', 'form', 'sessionNumber', 'amount', 'unit', 'thcMg', 'reason', 'effect', 'munchiesTriggered', 'notes'],
            ...state.cannabisLogs.map((e) => {
              const prod = state.inventory.find((p) => p.id === e.productId);
              return [
                e.date, e.time, prod?.name || e.productId, e.form,
                e.sessionNumber, e.amount, e.unit, e.thcMg || '',
                e.reason, e.effect, e.munchiesTriggered ? 1 : 0, e.notes || '',
              ];
            }),
          ];
        } else if (section === 'workouts') {
          filename = `workouts-${today()}.csv`;
          rows = [
            ['date', 'steps', 'walkDuration', 'type', 'completed', 'intensity', 'chestPain', 'shortness', 'notes'],
            ...state.workoutLogs.map((e) => [
              e.date, e.steps || 0, e.walkDuration || 0, e.type || '',
              e.completed ? 1 : 0, e.intensity || '', e.chestPain ? 1 : 0,
              e.sob ? 1 : 0, e.notes || '',
            ]),
          ];
        } else if (section === 'weight') {
          filename = `weight-history-${today()}.csv`;
          rows = [
            ['date', 'weight_lb'],
            ...state.weightHistory.map((e) => [e.date, e.weight]),
          ];
        }

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
            foodLogs: parsed.foodLogs || [],
            cannabisLogs: parsed.cannabisLogs || [],
            workoutLogs: parsed.workoutLogs || [],
            weightHistory: parsed.weightHistory || [],
            mealTemplates: parsed.mealTemplates || [],
          });
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'healthtracker-store',
      partialize: (state) => ({
        profile: state.profile,
        inventory: state.inventory,
        foodLogs: state.foodLogs,
        cannabisLogs: state.cannabisLogs,
        workoutLogs: state.workoutLogs,
        weightHistory: state.weightHistory,
        mealTemplates: state.mealTemplates,
        photos: state.photos,
      }),
    }
  )
);
