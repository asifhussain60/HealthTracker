/**
 * uiSlice.js
 *
 * Owns: demoMode, toasts, featureFlags, activeView, photos.
 *
 * featureFlags is wired by useFeature() (lib/useFeature.js) with URL ?ff= override
 * (B11 — shipped). activeView is reserved per data-model.md §UiState; current routing
 * uses local React state in App.jsx and will migrate here when route persistence lands.
 *
 * photos has no dedicated slice in data-model.md; deferred to P1.D when the profile
 * editor lands (see observed-debt.md B4 / 2026-05-04 photos entry, deadline P1.D).
 */

let toastId = 0;

export const uiSliceInitial = {
  demoMode: false,
  toasts: [],         // Toast[] — { id, message, type }
  featureFlags: {},   // Record<string, boolean> — read by useFeature() (B11)
  activeView: null,   // string | null — reserved per UiState spec; routing currently in App.jsx
  photos: [],         // Photo[] — { id, date, weight, viewType, dataUrl, notes }
  theme: 'light',    // 'light' | 'dark' — persisted via uiSlice (AC-P1D-D3)
};

/**
 * @param {Function} set - Zustand set
 * @returns {Object} action creators
 */
export function createUiSlice(set) {
  return {
    // ── Demo Mode ─────────────────────────────────────────────────
    toggleDemoMode: () => set((s) => ({ demoMode: !s.demoMode })),

    // ── Toasts ────────────────────────────────────────────────────
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

    // ── Photos ────────────────────────────────────────────────────
    addPhoto: (photo) =>
      set((s) => ({
        photos: [...s.photos, { id: crypto.randomUUID(), ...photo }],
      })),

    deletePhoto: (id) =>
      set((s) => ({ photos: s.photos.filter((p) => p.id !== id) })),

    // ── Theme ─────────────────────────────────────────────────────────
    setTheme: (theme) => set(() => ({ theme })),
  };
}
