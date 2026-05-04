/**
 * Combined-store integration test
 *
 * Verifies that `useStore` (from the new index.js) exposes every slice's
 * state and actions. Tests use direct store API (getState / setState) to
 * avoid React render-loop issues with persist middleware + renderHook.
 *
 * The setup.js provides an in-memory localStorage polyfill.
 *
 * B10 addition: migration-wiring integration test (schemaVersion promotion).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { runMigrations } from '../../migrations';
import { useStore } from '../index';
import { SEED_PROFILE, SEED_INVENTORY, SEED_WEIGHT_HISTORY } from '../../seed';

// ── Reset helpers ─────────────────────────────────────────────────────────────
// Only reset data fields (not action functions) to avoid confusing the store.
function resetStoreData() {
  useStore.setState({
    inventory: SEED_INVENTORY,
    cannabisLogs: [],
    mealTemplates: [],
    items: [],
    workoutLogs: [],
    weightHistory: SEED_WEIGHT_HISTORY,
    profile: { ...SEED_PROFILE },
    demoMode: false,
    toasts: [],
    featureFlags: {},
    activeView: null,
    photos: [],
  });
}

beforeEach(() => {
  resetStoreData();
});

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('combined-store integration', () => {
  it('exposes cannabisLogs — starts empty after reset', () => {
    expect(useStore.getState().cannabisLogs).toEqual([]);
  });

  it('addCannabisLog appends an entry to the combined store', () => {
    useStore.getState().addCannabisLog({ productId: 'p1', amount: 0.05, unit: 'g' });
    expect(useStore.getState().cannabisLogs).toHaveLength(1);
    expect(useStore.getState().cannabisLogs[0].productId).toBe('p1');
  });

  it('exposes workoutLogs — starts empty after reset', () => {
    expect(useStore.getState().workoutLogs).toEqual([]);
  });

  it('addWorkoutLog appends to the combined store', () => {
    useStore.getState().addWorkoutLog({ steps: 4000, type: 'Walk' });
    expect(useStore.getState().workoutLogs).toHaveLength(1);
  });

  it('exposes mealTemplates — starts empty', () => {
    expect(useStore.getState().mealTemplates).toEqual([]);
  });

  it('saveMealTemplate appends to combined store', () => {
    useStore.getState().saveMealTemplate({ name: 'Chicken Bowl', calories: 650, protein: 55 });
    expect(useStore.getState().mealTemplates).toHaveLength(1);
    expect(useStore.getState().mealTemplates[0].name).toBe('Chicken Bowl');
  });

  it('exposes todoSlice items — starts empty', () => {
    expect(useStore.getState().items).toEqual([]);
  });

  it('exposes profile with correct initial name', () => {
    expect(useStore.getState().profile).toBeTruthy();
    expect(useStore.getState().profile.name).toBe('Asif');
  });

  it('updateProfile merges updates in combined store', () => {
    useStore.getState().updateProfile({ name: 'Bob' });
    expect(useStore.getState().profile.name).toBe('Bob');
  });

  it('demoMode starts false', () => {
    expect(useStore.getState().demoMode).toBe(false);
  });

  it('toggleDemoMode flips in combined store', () => {
    useStore.getState().toggleDemoMode();
    expect(useStore.getState().demoMode).toBe(true);
  });

  it('featureFlags starts as empty object (uiSlice)', () => {
    expect(useStore.getState().featureFlags).toEqual({});
  });

  it('activeView starts null (uiSlice)', () => {
    expect(useStore.getState().activeView).toBeNull();
  });

  it('photos starts empty (uiSlice)', () => {
    expect(useStore.getState().photos).toEqual([]);
  });

  it('addPhoto appends to combined store (uiSlice)', () => {
    useStore.getState().addPhoto({ viewType: 'Front', dataUrl: 'data:image/png;base64,abc', date: '2026-05-04' });
    expect(useStore.getState().photos).toHaveLength(1);
    expect(useStore.getState().photos[0].viewType).toBe('Front');
    expect(useStore.getState().photos[0].id).toBeTruthy();
  });

  // ── foodSlice guards ───────────────────────────────────────────────────────
  it('foodLogs key does NOT exist in the combined store', () => {
    expect(useStore.getState().foodLogs).toBeUndefined();
  });

  it('addFoodLog action does NOT exist in combined store', () => {
    expect(useStore.getState().addFoodLog).toBeUndefined();
  });

  it('deleteFoodLog action does NOT exist in combined store', () => {
    expect(useStore.getState().deleteFoodLog).toBeUndefined();
  });

  it('getTodayFoodLogs selector does NOT exist in combined store', () => {
    expect(useStore.getState().getTodayFoodLogs).toBeUndefined();
  });

  it('getTodayCalories does NOT exist in combined store', () => {
    expect(useStore.getState().getTodayCalories).toBeUndefined();
  });

  it('getTodayProtein does NOT exist in combined store', () => {
    expect(useStore.getState().getTodayProtein).toBeUndefined();
  });

  // ── Cross-slice actions ────────────────────────────────────────────────────
  it('getDailyCannabisPlan is accessible and returns an array', () => {
    expect(typeof useStore.getState().getDailyCannabisPlan).toBe('function');
    const plan = useStore.getState().getDailyCannabisPlan();
    expect(Array.isArray(plan)).toBe(true);
  });

  it('exportJSON is accessible', () => {
    expect(typeof useStore.getState().exportJSON).toBe('function');
  });

  it('exportCSV is accessible', () => {
    expect(typeof useStore.getState().exportCSV).toBe('function');
  });

  it('importJSON is accessible and parses JSON correctly', () => {
    expect(typeof useStore.getState().importJSON).toBe('function');
    const result = useStore.getState().importJSON('{"cannabisLogs":[],"workoutLogs":[]}');
    expect(result).toBe(true);
  });

  it('importJSON returns false on invalid input', () => {
    expect(useStore.getState().importJSON('not-valid-json')).toBe(false);
  });

  // ── B10 migration wiring ───────────────────────────────────────────────────
  // Integration test: verify runMigrations is importable and promotes a v0 blob to v3.
  // Full onRehydrateStorage wiring is exercised via the persist middleware at app load;
  // this test validates the migration contract from the store's perspective.
  it('runMigrations produces schemaVersion 3 from a v0-shaped state blob', () => {
    const v0Blob = {
      inventory: [{ id: 'p1', name: 'Blue Dream', form: 'flower' }],
      cannabisLogs: [],
      mealTemplates: [],
      workoutLogs: [],
      weightHistory: [],
      items: [],
      profile: { name: 'Test User' },
    };
    const migrated = runMigrations(v0Blob);
    expect(migrated.schemaVersion).toBe(3);
    expect(migrated.inventory[0].userId).toBe('me');
    expect(migrated.profile.dailyCalorieTarget).toBe(2000);
  });

  // ── Shape invariant ────────────────────────────────────────────────────────
  it('the combined store exposes all required slice keys', () => {
    const state = useStore.getState();
    // cannabisSlice
    expect(state.inventory).toBeDefined();
    expect(state.cannabisLogs).toBeDefined();
    // mealSlice
    expect(state.mealTemplates).toBeDefined();
    // todoSlice
    expect(state.items).toBeDefined();
    // workoutSlice
    expect(state.workoutLogs).toBeDefined();
    expect(state.weightHistory).toBeDefined();
    // profileSlice
    expect(state.profile).toBeDefined();
    // uiSlice
    expect(state.demoMode).toBeDefined();
    expect(state.toasts).toBeDefined();
    expect(state.featureFlags).toBeDefined();
    expect(state.activeView !== undefined).toBe(true);
    expect(state.photos).toBeDefined();
    // NO foodLogs
    expect(state.foodLogs).toBeUndefined();
  });
});
