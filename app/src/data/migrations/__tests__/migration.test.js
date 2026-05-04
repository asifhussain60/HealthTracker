/**
 * migration.test.js
 *
 * TDD RED phase tests for app/src/data/migrations/index.js
 * Every test written before implementation exists; all must fail at RED, all must pass at GREEN.
 *
 * AC-P0-B10: v_legacy → v3 single forward migration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { runMigrations, CURRENT_SCHEMA_VERSION } from '../index.js';

// ---------------------------------------------------------------------------
// Synthetic fixtures
// ---------------------------------------------------------------------------

/**
 * v0 baseline — minimal store state with NO schemaVersion.
 * Represents a user who installed before any migration system existed.
 */
function makeV0Fixture() {
  return {
    inventory: [
      {
        id: 'inv-1',
        name: 'Blue Dream',
        form: 'flower',
        thcPercent: 20,
        remaining: 1.5,
        remainingUnit: 'g',
      },
    ],
    cannabisLogs: [
      {
        id: 'log-1',
        date: '2026-01-15',
        productId: 'inv-1',
        amount: 0.05,
        unit: 'g',
        thcMg: 3,
      },
    ],
    mealTemplates: [
      {
        id: 'meal-1',
        name: 'Grilled Chicken',
        calories: 300,
      },
    ],
    workoutLogs: [
      {
        id: 'wl-1',
        date: '2026-01-15',
        steps: 5000,
        type: 'walk',
        completed: true,
      },
    ],
    weightHistory: [
      {
        date: '2026-01-15',
        weight: 240,
      },
    ],
    items: [
      {
        id: 'todo-1',
        title: 'Buy groceries',
        status: 'open',
      },
    ],
    profile: {
      name: 'Test User',
      height: 70,
      currentWeight: 240,
    },
  };
}

/**
 * v1 fixture — post-4629266 shape.
 * Has foodLogs array (the legacy food tracking slice).
 * Does NOT have schemaVersion.
 */
function makeV1Fixture() {
  return {
    ...makeV0Fixture(),
    foodLogs: [
      { id: 'food-1', name: 'Chicken', calories: 300, date: '2026-01-15' },
      { id: 'food-2', name: 'Rice', calories: 200, date: '2026-01-15' },
    ],
  };
}

/**
 * Fixture with an assigneeId/assignerId leak from Phase-2 scaffolding.
 */
function makeAssigneeLeakFixture() {
  const base = makeV0Fixture();
  base.items = [
    {
      id: 'todo-1',
      title: 'Task with leaked multi-user fields',
      status: 'open',
      assigneeId: 'someone-else',
      assignerId: 'yet-another',
    },
  ];
  return base;
}

/**
 * Fixture with user-set values that must be preserved (not overwritten by defaults).
 */
function makeExistingUserValuesFixture() {
  const base = makeV0Fixture();
  base.profile = {
    ...base.profile,
    dailyCalorieTarget: 1800, // user-set; must NOT be overwritten to 2000
    dailyThcMgCeiling: 40,    // user-set; must NOT be overwritten to 50
  };
  return base;
}

// ---------------------------------------------------------------------------
// Helper: deep-clone for idempotency checks
// ---------------------------------------------------------------------------
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ---------------------------------------------------------------------------
// Mock localStorage for foodLog export tests
// ---------------------------------------------------------------------------

let localStorageStore = {};

beforeEach(() => {
  localStorageStore = {};
  globalThis.localStorage = {
    getItem: (key) => localStorageStore[key] ?? null,
    setItem: (key, value) => { localStorageStore[key] = value; },
    removeItem: (key) => { delete localStorageStore[key]; },
    clear: () => { localStorageStore = {}; },
    get length() { return Object.keys(localStorageStore).length; },
    key: (i) => Object.keys(localStorageStore)[i] ?? null,
  };
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-05-04T12:00:00.000Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

// ===========================================================================
// 1. CURRENT_SCHEMA_VERSION export
// ===========================================================================

describe('CURRENT_SCHEMA_VERSION', () => {
  it('equals 3', () => {
    expect(CURRENT_SCHEMA_VERSION).toBe(3);
  });
});

// ===========================================================================
// 2. Empty-state safety
// ===========================================================================

describe('runMigrations — empty state safety', () => {
  it('does not crash on empty object input', () => {
    expect(() => runMigrations({})).not.toThrow();
  });

  it('produces a valid v3 state from empty object input', () => {
    const result = runMigrations({});
    expect(result.schemaVersion).toBe(3);
  });

  it('provides default profile fields on empty input', () => {
    const result = runMigrations({});
    expect(result.profile).toBeDefined();
    expect(result.profile.dailyCalorieTarget).toBe(2000);
  });

  it('provides empty arrays/objects for slice containers on empty input', () => {
    const result = runMigrations({});
    expect(result.inventory).toEqual([]);
    expect(result.cannabisLogs).toEqual([]);
    expect(result.mealTemplates).toEqual([]);
    expect(result.workoutLogs).toEqual([]);
    expect(result.weightHistory).toEqual([]);
    expect(result.items).toEqual([]);
  });
});

// ===========================================================================
// 3. v0 fixture forward migration
// ===========================================================================

describe('runMigrations — v0 fixture forward', () => {
  let result;

  beforeEach(() => {
    result = runMigrations(clone(makeV0Fixture()));
  });

  it('sets schemaVersion to 3', () => {
    expect(result.schemaVersion).toBe(3);
  });

  it('all expected slice containers exist after migration', () => {
    expect(Array.isArray(result.inventory)).toBe(true);
    expect(Array.isArray(result.cannabisLogs)).toBe(true);
    expect(Array.isArray(result.mealTemplates)).toBe(true);
    expect(Array.isArray(result.workoutLogs)).toBe(true);
    expect(Array.isArray(result.weightHistory)).toBe(true);
    expect(Array.isArray(result.items)).toBe(true);
  });

  it('new slice keys are initialized', () => {
    expect(result.prayerSlice).toEqual({ logs: [] });
    expect(result.weightSessionsSlice).toEqual({ sessions: [] });
    expect(result.walkLog).toEqual({ entries: [] });
    expect(result.kickboxingLog).toEqual({ entries: [] });
    expect(result.fastingIntakeSlice).toEqual({ dailyIntake: {} });
    expect(result.sweetToothSlice).toEqual({ dailySlips: {} });
    expect(result.workSessionsSlice).toEqual({ sessions: [] });
    expect(result.dayCloseSlice).toEqual({ closures: {} });
    expect(result.workoutLibrarySlice).toEqual({ programs: [], routines: [], exercises: [] });
    expect(result.dailyCannabisPlan).toEqual({ plans: {} });
  });

  it('profile has all v3 defaults added', () => {
    expect(result.profile.dailyCalorieTarget).toBe(2000);
    expect(result.profile.prayerSettings).toMatchObject({
      location: { lat: 0, lng: 0 },
      calculationMethod: 'ISNA',
      asrSchool: 'standard',
      remindersEnabled: false,
    });
    expect(result.profile.sleepSchedule).toEqual({ bedtime: '20:00', wakeTime: '04:30' });
    expect(result.profile.intermittentFasting).toEqual({ windowStart: '14:00', windowEnd: '18:00' });
    expect(Array.isArray(result.profile.fastingSafeItems)).toBe(true);
    expect(result.profile.fastingSafeItems).toHaveLength(4);
    expect(result.profile.sweetToothPlan).toMatchObject({ weeklyCap: 3, confirmEachLog: true, deletable: false });
    expect(Array.isArray(result.profile.workLocations)).toBe(true);
    expect(result.profile.workoutPlan).toMatchObject({
      walkDailyMinutes: 30,
      kickboxingPerWeek: 5,
      weightsPerWeek: 3,
      dailyWeightSessionCap: 2,
    });
    expect(result.profile.fitnessLevel).toBe('very-poor');
    expect(result.profile.cannabisTaperSchedule).toMatchObject({
      startDate: null,
      weeks: 8,
      startCeiling: 80,
      endCeiling: 25,
      curve: 'linear',
    });
    expect(result.profile.dailyThcMgCeiling).toBe(50);
    expect(result.profile.perSessionThcMgCap).toBe(25);
    expect(result.profile.plateDefaults).toMatchObject({
      breakfast: 250,
      lunch: 350,
      dinner: 460,
      snack: 150,
      shake: 0,
    });
  });
});

// ===========================================================================
// 4. Audit-field completeness across all records
// ===========================================================================

describe('runMigrations — audit-field completeness', () => {
  const AUDIT_KEYS = ['id', 'userId', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'deletedAt', 'schemaVersion'];

  function assertAuditFields(records, _sliceName) {
    for (const rec of records) {
      for (const key of AUDIT_KEYS) {
        expect(rec).toHaveProperty(key, undefined !== rec[key] ? rec[key] : undefined);
        expect(rec[key]).not.toBeUndefined();
      }
      expect(rec.userId).toBe('me');
      expect(rec.createdBy).toBe('me');
      expect(rec.updatedBy).toBe('me');
      expect(rec.deletedAt).toBeNull();
      expect(rec.schemaVersion).toBe(3);
      expect(typeof rec.id).toBe('string');
      expect(rec.id.length).toBeGreaterThan(0);
    }
  }

  it('inventory records have all audit fields', () => {
    const result = runMigrations(clone(makeV0Fixture()));
    assertAuditFields(result.inventory, 'inventory');
  });

  it('cannabisLogs records have all audit fields', () => {
    const result = runMigrations(clone(makeV0Fixture()));
    assertAuditFields(result.cannabisLogs, 'cannabisLogs');
  });

  it('mealTemplates records have all audit fields', () => {
    const result = runMigrations(clone(makeV0Fixture()));
    assertAuditFields(result.mealTemplates, 'mealTemplates');
  });

  it('workoutLogs records have all audit fields', () => {
    const result = runMigrations(clone(makeV0Fixture()));
    assertAuditFields(result.workoutLogs, 'workoutLogs');
  });

  it('weightHistory records have all audit fields', () => {
    const result = runMigrations(clone(makeV0Fixture()));
    assertAuditFields(result.weightHistory, 'weightHistory');
  });

  it('todo items have all audit fields', () => {
    const result = runMigrations(clone(makeV0Fixture()));
    assertAuditFields(result.items, 'items');
  });

  it('backfilled records use date field for createdAt/updatedAt when available', () => {
    const result = runMigrations(clone(makeV0Fixture()));
    // workoutLogs[0] has date: '2026-01-15' so createdAt should be based on that
    const log = result.workoutLogs.find((w) => w.id === 'wl-1');
    expect(log.createdAt).toBe('2026-01-15T00:00:00.000Z');
    expect(log.updatedAt).toBe('2026-01-15T00:00:00.000Z');
  });

  it('records without date field get epoch createdAt', () => {
    const result = runMigrations(clone(makeV0Fixture()));
    const meal = result.mealTemplates.find((m) => m.id === 'meal-1');
    expect(meal.createdAt).toBe(new Date(0).toISOString());
    expect(meal.updatedAt).toBe(new Date(0).toISOString());
  });
});

// ===========================================================================
// 5. v1 fixture forward migration (foodLogs export)
// ===========================================================================

describe('runMigrations — v1 fixture with foodLogs', () => {
  let result;

  beforeEach(() => {
    result = runMigrations(clone(makeV1Fixture()));
  });

  it('foodLogs is absent from migrated state', () => {
    expect(result.foodLogs).toBeUndefined();
  });

  it('schemaVersion is 3', () => {
    expect(result.schemaVersion).toBe(3);
  });

  it('creates a localStorage key matching ht-legacy-foodlogs-export-*', () => {
    const keys = Object.keys(localStorageStore);
    const exportKey = keys.find((k) => k.startsWith('ht-legacy-foodlogs-export-'));
    expect(exportKey).toBeDefined();
  });

  it('the exported localStorage value contains the original foodLogs data', () => {
    const keys = Object.keys(localStorageStore);
    const exportKey = keys.find((k) => k.startsWith('ht-legacy-foodlogs-export-'));
    const exported = JSON.parse(localStorageStore[exportKey]);
    expect(exported).toHaveLength(2);
    expect(exported[0].name).toBe('Chicken');
    expect(exported[1].name).toBe('Rice');
  });

  it('does NOT create a foodLogs export key when foodLogs is absent (v0 fixture)', () => {
    // Re-run with v0 fixture which has no foodLogs
    localStorageStore = {};
    runMigrations(clone(makeV0Fixture()));
    const keys = Object.keys(localStorageStore);
    const exportKey = keys.find((k) => k.startsWith('ht-legacy-foodlogs-export-'));
    expect(exportKey).toBeUndefined();
  });

  it('does NOT create a foodLogs export key when foodLogs is empty array', () => {
    localStorageStore = {};
    const fixture = makeV1Fixture();
    fixture.foodLogs = [];
    runMigrations(fixture);
    const keys = Object.keys(localStorageStore);
    const exportKey = keys.find((k) => k.startsWith('ht-legacy-foodlogs-export-'));
    expect(exportKey).toBeUndefined();
  });
});

// ===========================================================================
// 6. Idempotency — migrate(migrate(state)) deep-equals migrate(state)
// ===========================================================================

describe('runMigrations — idempotency', () => {
  it('v0 fixture: running migration twice is a no-op (deep equal)', () => {
    const once = runMigrations(clone(makeV0Fixture()));
    const twice = runMigrations(clone(once));
    expect(JSON.stringify(twice)).toEqual(JSON.stringify(once));
  });

  it('v1 fixture: running migration twice is a no-op (deep equal)', () => {
    const once = runMigrations(clone(makeV1Fixture()));
    const twice = runMigrations(clone(once));
    expect(JSON.stringify(twice)).toEqual(JSON.stringify(once));
  });

  it('already-v3 state is returned unchanged', () => {
    const once = runMigrations(clone(makeV0Fixture()));
    // mark as v3
    expect(once.schemaVersion).toBe(3);
    const twice = runMigrations(once);
    expect(twice.schemaVersion).toBe(3);
    // inventory records still have audit fields
    expect(twice.inventory[0].userId).toBe('me');
  });
});

// ===========================================================================
// 7. Solo-user invariant — no assigneeId / assignerId on Todo after migration
// ===========================================================================

describe('runMigrations — solo-user invariant (PF-12)', () => {
  it('strips assigneeId from todo items', () => {
    const result = runMigrations(clone(makeAssigneeLeakFixture()));
    for (const item of result.items) {
      expect(item).not.toHaveProperty('assigneeId');
    }
  });

  it('strips assignerId from todo items', () => {
    const result = runMigrations(clone(makeAssigneeLeakFixture()));
    for (const item of result.items) {
      expect(item).not.toHaveProperty('assignerId');
    }
  });
});

// ===========================================================================
// 8. Default preservation — existing user values are NOT overwritten
// ===========================================================================

describe('runMigrations — default preservation', () => {
  it('does not overwrite user-set dailyCalorieTarget', () => {
    const result = runMigrations(clone(makeExistingUserValuesFixture()));
    expect(result.profile.dailyCalorieTarget).toBe(1800);
  });

  it('does not overwrite user-set dailyThcMgCeiling', () => {
    const result = runMigrations(clone(makeExistingUserValuesFixture()));
    expect(result.profile.dailyThcMgCeiling).toBe(40);
  });

  it('preserves existing profile.name through migration', () => {
    const result = runMigrations(clone(makeV0Fixture()));
    expect(result.profile.name).toBe('Test User');
  });
});

// ===========================================================================
// 9. Cannabis doseUnit normalization
// ===========================================================================

describe('runMigrations — cannabis doseUnit normalization', () => {
  it('maps legacy edible unit to doseUnit: piece', () => {
    const fixture = makeV0Fixture();
    fixture.inventory[0].form = 'edible';
    fixture.inventory[0].unit = 'edible';
    const result = runMigrations(fixture);
    expect(result.inventory[0].doseUnit).toBe('piece');
  });

  it('maps legacy flower unit to doseUnit: puff', () => {
    const fixture = makeV0Fixture();
    fixture.inventory[0].form = 'flower';
    const result = runMigrations(fixture);
    expect(result.inventory[0].doseUnit).toBe('puff');
  });

  it('adds thcMgPerPuff for inhalation forms', () => {
    const fixture = makeV0Fixture();
    fixture.inventory[0].form = 'flower';
    fixture.inventory[0].thcPercent = 20;
    const result = runMigrations(fixture);
    expect(result.inventory[0]).toHaveProperty('thcMgPerPuff');
  });
});

// ===========================================================================
// 10. schemaVersion: 3 smoke check
// ===========================================================================

describe('runMigrations — schemaVersion on persisted state', () => {
  it('schemaVersion is 3 on v0 fixture result', () => {
    const result = runMigrations(clone(makeV0Fixture()));
    expect(result.schemaVersion).toBe(3);
  });

  it('schemaVersion is 3 on v1 fixture result', () => {
    const result = runMigrations(clone(makeV1Fixture()));
    expect(result.schemaVersion).toBe(3);
  });

  it('schemaVersion is 3 on empty {} input', () => {
    const result = runMigrations({});
    expect(result.schemaVersion).toBe(3);
  });
});
