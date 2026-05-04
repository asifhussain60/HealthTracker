/**
 * uiSlice.js
 *
 * Owns: demoMode, toasts, featureFlags, activeView, photos
 *
 * B11 note: featureFlags and activeView are placeholders per data-model.md §UiState.
 * Full wiring (URL ?ff= override, activeView routing) lands in B11.
 *
 * photos is kept here as it has no dedicated slice in data-model.md v_legacy shape.
 * It will be reviewed in B10 (v_legacy → v3 migration).
 */

let toastId = 0;

export const uiSliceInitial = {
  demoMode: false,
  toasts: [],         // Toast[] — { id, message, type }
  featureFlags: {},   // Record<string, boolean> — placeholder per UiState spec
  activeView: null,   // string | null — placeholder; full wiring in B11
  photos: [],         // Photo[] — { id, date, weight, viewType, dataUrl, notes }
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
  };
}
