/**
 * app/src/data/migrations/index.js
 *
 * Migration registry for the HealthTracker persisted store.
 *
 * Architecture:
 *   - Single forward migration: v_legacy → v3
 *   - Idempotent: running runMigrations() on an already-v3 state is a no-op
 *   - AC-P0-B10
 *
 * The migration number here is 3 because this is Phase 0, commit B10.
 * The schemaVersion matches the AuditFields.schemaVersion on every record.
 *
 * HT-CORE-008: every record gets audit fields.
 * HT-CORE-009: every persisted blob carries schemaVersion.
 * HT-CORE-010: userId always 'me' under solo-user scope.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

export const CURRENT_SCHEMA_VERSION = 3;

/** The single userId constant for solo-user scope (matches auth/currentUser.js). */
const USER_ID = 'me';

// ── Form → doseUnit mapping table (B10 step 6) ───────────────────────────────

const FORM_TO_DOSE_UNIT = {
  edible:          'piece',
  flower:          'puff',
  vape:            'puff',
  'infused-preroll': 'puff',
  preroll:         'puff',
  cartridge:       'puff',
  capsule:         'capsule',
  tincture:        'drop',
};

/** Forms that have inhalation mode and therefore may have thcMgPerPuff. */
const INHALATION_FORMS = new Set(['flower', 'vape', 'infused-preroll', 'preroll', 'cartridge']);

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Stamps a legacy record with missing audit fields.
 * Preserves any existing values (idempotent backfill).
 *
 * @param {Object} record - Partial record from legacy state.
 * @returns {Object} Record with all audit fields set.
 */
function backfillAuditFields(record) {
  // Determine the best timestamp to use for createdAt/updatedAt:
  // If the record has a `date` field (ISO date yyyy-MM-dd), convert to ISO 8601 timestamp.
  // Otherwise, use epoch (clearly synthetic, distinguishable from real data).
  let syntheticTs;
  if (record.date) {
    syntheticTs = new Date(record.date + 'T00:00:00.000Z').toISOString();
  } else {
    syntheticTs = new Date(0).toISOString();
  }

  return {
    ...record,
    id:            record.id            ?? crypto.randomUUID(),
    userId:        record.userId        ?? USER_ID,
    createdAt:     record.createdAt     ?? syntheticTs,
    updatedAt:     record.updatedAt     ?? syntheticTs,
    createdBy:     record.createdBy     ?? USER_ID,
    updatedBy:     record.updatedBy     ?? USER_ID,
    deletedAt:     record.deletedAt     ?? null,
    schemaVersion: CURRENT_SCHEMA_VERSION,
  };
}

/**
 * Backfills audit fields across an array of records.
 * @param {Object[]} arr
 * @returns {Object[]}
 */
function backfillArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(backfillAuditFields);
}

/**
 * Returns value if it passes the guard, otherwise returns defaultValue.
 * Only sets a default when the key is missing (undefined), not when it has
 * a falsy user-set value (0, '', false, null are preserved as valid user choices).
 *
 * @param {Object} obj
 * @param {string} key
 * @param {*} defaultValue
 * @returns {*}
 */
function defaultIfMissing(obj, key, defaultValue) {
  return obj[key] !== undefined ? obj[key] : defaultValue;
}

// ── Profile default builder (B10 step 4) ─────────────────────────────────────

/**
 * Merges v3 ProfileField defaults onto an existing profile object.
 * All values are only applied if NOT already present (preserves user config).
 *
 * @param {Object} profile
 * @returns {Object} Profile with v3 defaults applied.
 */
function applyProfileDefaults(profile) {
  const p = profile || {};

  return {
    ...p,
    // § B10 step 4 — new ProfileField keys with defaults
    dailyCalorieTarget:   defaultIfMissing(p, 'dailyCalorieTarget', 2000),

    prayerSettings: p.prayerSettings ?? {
      location:          { lat: 0, lng: 0 },
      calculationMethod: 'ISNA',
      asrSchool:         'standard',
      remindersEnabled:  false,
    },

    sleepSchedule: p.sleepSchedule ?? {
      bedtime:  '20:00',
      wakeTime: '04:30',
    },

    intermittentFasting: p.intermittentFasting ?? {
      windowStart: '14:00',
      windowEnd:   '18:00',
    },

    fastingSafeItems: p.fastingSafeItems ?? [
      { id: 'water',       name: 'Water',        defaultDailyTarget: 8 },
      { id: 'green-tea',   name: 'Green Tea' },
      { id: 'black-coffee', name: 'Black Coffee' },
      { id: 'electrolytes', name: 'Electrolytes' },
    ],

    sweetToothPlan: p.sweetToothPlan ?? {
      weeklyCap:      3,
      confirmEachLog: true,
      deletable:      false,
    },

    workLocations: p.workLocations ?? [],

    workoutPlan: p.workoutPlan ?? {
      walkDailyMinutes:     30,
      kickboxingPerWeek:    5,
      weightsPerWeek:       3,
      dailyWeightSessionCap: 2,
    },

    fitnessLevel: p.fitnessLevel ?? 'very-poor',

    cannabisTaperSchedule: p.cannabisTaperSchedule ?? {
      startDate:    null,
      weeks:        8,
      startCeiling: 80,
      endCeiling:   25,
      curve:        'linear',
    },

    // dailyThcMgCeiling: preserve user value; default 50
    dailyThcMgCeiling: defaultIfMissing(p, 'dailyThcMgCeiling', 50),

    perSessionThcMgCap: p.perSessionThcMgCap ?? 25,

    plateDefaults: p.plateDefaults ?? {
      breakfast: 250,
      lunch:     350,
      dinner:    460,
      snack:     150,
      shake:     0,
    },
  };
}

// ── Cannabis product normalization (B10 step 6 + 7) ──────────────────────────

/**
 * Adds per-form doseUnit and (for inhalation) thcMgPerPuff to a CannabisProduct.
 * @param {Object} product
 * @returns {Object}
 */
function normalizeCannabisProduct(product) {
  const form = product.form;
  const doseUnit = product.doseUnit ?? (FORM_TO_DOSE_UNIT[form] || 'unit');

  let thcMgPerPuff = product.thcMgPerPuff ?? null;

  return {
    ...product,
    doseUnit,
    ...(INHALATION_FORMS.has(form) ? { thcMgPerPuff } : {}),
  };
}

// ── Main migration function ───────────────────────────────────────────────────

/**
 * migrateLegacyToV3
 *
 * Performs the single forward migration from any legacy state to v3.
 * Steps match the B10 handoff entry numbering.
 *
 * @param {Object} state - Raw persisted state (any version).
 * @returns {Object} Migrated state with schemaVersion: 3.
 */
function migrateLegacyToV3(state) {
  // ── Step 1: Export legacy foodLogs ────────────────────────────────────────
  // If state has a non-empty foodLogs array (v1 users), export it to localStorage
  // under a timestamped key so data is not silently lost.
  if (Array.isArray(state.foodLogs) && state.foodLogs.length > 0) {
    const exportKey = `ht-legacy-foodlogs-export-${Date.now()}`;
    try {
      localStorage.setItem(exportKey, JSON.stringify(state.foodLogs));
    } catch {
      // localStorage may not be available in test environments; fail silently.
    }
  }

  // ── Step 2: Drop foodSlice ────────────────────────────────────────────────
  const { foodLogs: _dropped, ...withoutFood } = state;

  // ── Step 3: Backfill audit fields across all slice arrays ─────────────────
  const inventory     = backfillArray(withoutFood.inventory     ?? []).map(normalizeCannabisProduct);
  const cannabisLogs  = backfillArray(withoutFood.cannabisLogs  ?? []);
  const mealTemplates = backfillArray(withoutFood.mealTemplates ?? []);
  const workoutLogs   = backfillArray(withoutFood.workoutLogs   ?? []);
  const weightHistory = backfillArray(withoutFood.weightHistory ?? []);
  // todoSlice.items — also strip assigneeId / assignerId (step 9)
  const items = backfillArray(withoutFood.items ?? []).map((item) => {
    const { assigneeId: _a, assignerId: _b, ...clean } = item;
    return clean;
  });

  // ── Step 4: Apply v3 ProfileFields defaults ───────────────────────────────
  const profile = applyProfileDefaults(withoutFood.profile ?? {});

  // ── Step 5: Initialize new slice keys with empty containers ───────────────
  const prayerSlice        = withoutFood.prayerSlice        ?? { logs: [] };
  const weightSessionsSlice = withoutFood.weightSessionsSlice ?? { sessions: [] };
  const walkLog            = withoutFood.walkLog            ?? { entries: [] };
  const kickboxingLog      = withoutFood.kickboxingLog      ?? { entries: [] };
  const fastingIntakeSlice = withoutFood.fastingIntakeSlice ?? { dailyIntake: {} };
  const sweetToothSlice    = withoutFood.sweetToothSlice    ?? { dailySlips: {} };
  const workSessionsSlice  = withoutFood.workSessionsSlice  ?? { sessions: [] };
  const dayCloseSlice      = withoutFood.dayCloseSlice      ?? { closures: {} };
  const workoutLibrarySlice = withoutFood.workoutLibrarySlice ?? {
    programs: [],
    routines: [],
    exercises: [],
  };
  const dailyCannabisPlan  = withoutFood.dailyCannabisPlan  ?? { plans: {} };

  // ── Step 8: Set top-level schemaVersion: 3 ───────────────────────────────
  return {
    ...withoutFood,
    // Slices
    inventory,
    cannabisLogs,
    mealTemplates,
    workoutLogs,
    weightHistory,
    items,
    profile,
    // New slice keys (step 5)
    prayerSlice,
    weightSessionsSlice,
    walkLog,
    kickboxingLog,
    fastingIntakeSlice,
    sweetToothSlice,
    workSessionsSlice,
    dayCloseSlice,
    workoutLibrarySlice,
    dailyCannabisPlan,
    // Top-level schemaVersion (step 8)
    schemaVersion: CURRENT_SCHEMA_VERSION,
  };
}

// ── Migration registry ────────────────────────────────────────────────────────

const migrations = [
  { from: 'v_legacy', to: 3, migrate: migrateLegacyToV3 },
];

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * runMigrations
 *
 * Detects the current schemaVersion of the persisted state and walks
 * forward through the migration chain until CURRENT_SCHEMA_VERSION is reached.
 *
 * Idempotent: if schemaVersion already equals CURRENT_SCHEMA_VERSION,
 * the state is returned as-is (no mutations).
 *
 * @param {Object} state - The persisted state blob (may be partial / legacy).
 * @returns {Object} State at CURRENT_SCHEMA_VERSION.
 */
export function runMigrations(state) {
  // Guard: if already at current version, return unchanged.
  if (state && state.schemaVersion === CURRENT_SCHEMA_VERSION) {
    return state;
  }

  // Currently only one migration exists: v_legacy → v3.
  // As the schema evolves, append to migrations[] and let the loop handle chaining.
  let current = state ?? {};
  for (const m of migrations) {
    if (current.schemaVersion !== CURRENT_SCHEMA_VERSION) {
      current = m.migrate(current);
    }
  }

  return current;
}

export { migrations };
