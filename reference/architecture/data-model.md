# HealthTracker — Data Model

**Status:** active · **Owner:** architect · **Last updated:** 2026-05-03

This document is the canonical schema reference. Slices conform to it. Migrations enforce it. The auditor's Pass 4 (Brittleness) checks for drift.

## Audit fields (HT-CORE-008) — present on every record

```ts
type AuditFields = {
  id: string;            // UUID v4
  userId: string;        // owner — 'me' today, real user id Phase 2
  createdAt: string;     // ISO 8601
  updatedAt: string;     // ISO 8601
  createdBy: string;     // userId of creator
  updatedBy: string;     // userId of last editor
  deletedAt: string | null;  // soft-delete timestamp; null = active
  schemaVersion: number;     // see migrations/
};
```

Soft-delete only. Hard-delete is a P0 violation.

## Persisted root (HT-CORE-009)

```ts
type PersistedRoot = {
  schemaVersion: number;       // bumped on every migration
  generatedAt: string;
  user: { id, role };
  slices: {
    food: { logs: FoodLog[] };
    cannabis: {
      products: CannabisProduct[];
      devices: CannabisDevice[];
      sessions: CannabisSession[];
    };
    meals: {
      inventory: MealInventoryItem[];
      weeklyPlan: MealPlan | null;
      weeklyPlanHistory: MealPlan[];
    };
    todos: { items: Todo[] };
    workout: { logs: WorkoutLog[]; weightHistory: WeightEntry[] };
    profile: ProfileFields;
    ui: UiState;
  };
};
```

> **Phase 0 scope change (2026-05-03):** `foodSlice` is removed. Daily nutrition is no longer tracked in HealthTracker — MyNetDiary is the system of record. The meal planner stores reference macros (per MyNetDiary) and computes scaled macros at consumption time via `totalWeightWithPlate − emptyPlateWeight` for the user's consistent-plate workflow. See [`feature-roadmap.md`](feature-roadmap.md) §Phase 1 for the planner UX.

## Slice schemas (current target — Phase 0 lands these)

### ~~foodSlice.logs[]~~ — REMOVED in Phase 0 (2026-05-03)

The food log table is being retired. Existing user data is exported to JSON via Profile → "Export legacy food logs" (Phase 0 commit B-legacy), then the table is dropped via migration v1→v2.

**Replacement model:** consumption is captured on `MealPlanSlot` (see below) — `eaten: boolean`, `eatenAt: string | null`, `totalWeightWithPlate: number | null`. Macros are computed on demand via `data/calculators/macroMath.js`.

Munchies tracking stays on `cannabisSlice.sessions[].munchiesTriggered` + `munchiesLevel` (self-contained; no food-log cross-reference).

### cannabisSlice.products[] : CannabisProduct

```ts
type CannabisProduct = AuditFields & {
  name: string;
  brand: string;
  form: 'flower' | 'capsule' | 'cartridge' | 'infused-preroll' | 'edible' | 'tincture';
  type: string;          // e.g., "Hybrid / Full Spectrum"
  orderedAmount: number;
  orderedUnit: string;
  orderedLabel: string;
  remaining: number;
  remainingUnit: string;
  thcPercent: number | null;
  thcMgPerUnit: number | null;
  cbdPercent: number | null;
  riskLevel: 'low' | 'medium' | 'high';
  munchiesRisk: 'low' | 'medium' | 'high';
  sedationRisk: 'low' | 'medium' | 'high';
  effects: string[];
  qualities: string[];
  dayNight: 'day' | 'evening' | 'night' | 'any';
  useWindow: string;     // human-readable
  startingDose: string;
  maxTestDose: string;
  usagePlan: string;
  notToExceed: string;
  lastUsed: string | null;
  notes: string;
  // Phase 1 additions:
  favoriteStars: 0 | 1 | 2 | 3;
  recommendedDeviceId: string | null;  // → CannabisDevice.id
};
```

### cannabisSlice.devices[] : CannabisDevice

```ts
type CannabisDevice = AuditFields & {
  name: string;
  brand: string;
  type: 'vape' | 'pipe' | 'other';
  notes: string;
};
```

### cannabisSlice.sessions[] : CannabisSession

```ts
type CannabisSession = AuditFields & {
  date: string;
  time: string;
  productId: string;
  deviceId: string | null;       // optional, populated for inhalation
  form: CannabisProduct['form'];
  sessionNumber: number;
  amount: number;
  unit: string;
  thcMg: number;                  // computed via thcMath.calculateThcMg
  method: string;
  reason: string;
  effect: string;
  munchiesTriggered: boolean;
  munchiesLevel: 0 | 1 | 2 | 3 | 4 | 5;
  productivityScore: 0 | 1 | 2 | 3 | 4 | 5 | null;
  productivityImpacts: string[];
  painRelief: 0 | 1 | 2 | 3 | 4 | 5 | null;
  medicalBenefit: string;
  wouldUseAgain: boolean | null;
  preUsePain: 0 | 1 | 2 | 3 | 4 | 5 | null;
  preUseAnxiety: 0 | 1 | 2 | 3 | 4 | 5 | null;
  preUseMood: 0 | 1 | 2 | 3 | 4 | 5 | null;
  preUseEnergy: 0 | 1 | 2 | 3 | 4 | 5 | null;
  checklistConfirmed: boolean;
  notes: string;
};
```

### mealSlice.inventory[] : MealInventoryItem

```ts
type MealInventoryItem = AuditFields & {
  name: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'shake';
  tags: string[];                       // e.g., ['halal', 'high-protein', 'pre-workout']
  ingredients: string;                  // free-text
  prepNotes: string;
  mynetdiaryUrl: string | null;         // deep-link to MyNetDiary food page
  favoriteStars: 0 | 1 | 2 | 3;
  source: 'manual' | 'mynetdiary' | 'csv-import';
  // Reference macros from MyNetDiary (set once, never change for a given recipe):
  referenceWeight: number;              // grams; e.g., 100
  referenceUnit: 'g' | 'oz';            // unit of referenceWeight
  refCalories: number;
  refProtein: number;                   // grams
  refCarbs: number;                     // grams
  refFat: number;                       // grams
  // Optional micronutrients (no plans to scale further; user adds if known):
  refFiber: number | null;
  refSodium: number | null;
};
```

> **Plate-weight scaling math** (in `data/calculators/macroMath.js`):
> ```
> food_weight = max(0, totalWeightWithPlate − profile.plateDefaults[category])
> scaled.calories = refCalories × (food_weight / referenceWeight)
> // … same ratio for protein/carbs/fat
> ```

### mealSlice.weeklyPlan : MealPlan

```ts
type MealPlan = AuditFields & {
  startDate: string;                    // ISO date (Mon)
  days: {
    [date: string]: {
      breakfast: MealPlanSlot;
      lunch: MealPlanSlot;
      dinner: MealPlanSlot;
      snack: MealPlanSlot;
      shakes: MealPlanSlot[];           // 0..N shakes per day, flex-add
      locked: boolean;                  // user-locked from regen
    };
  };
  algorithmConfig: {
    favoriteWeight: number;             // 1.0..3.0; favorites preferred in rotation
    repeatGapDays: number;              // default 3; no meal repeats within N days
    categoryConstraint: boolean;        // default true; respect category per slot
  };
};

type MealPlanSlot = {
  mealInventoryId: string | null;       // null = no meal planned
  eaten: boolean;
  eatenAt: string | null;               // ISO timestamp; used for fasting-window adherence
  totalWeightWithPlate: number | null;  // grams; user enters at check-off
  notes: string;
};
```

> Shopping-list builder (Phase 1) is on-demand — a button on the Weekly Plan view. Aggregates each meal's `ingredients` across the week, scaled by category plate weight × number of plates.

### todoSlice.items[] : Todo (Phase 3 schema, scaffolded Phase 0)

```ts
type Todo = AuditFields & {
  title: string;
  notes: string;
  category: 'personal' | 'professional';
  priority: 1 | 2 | 3;
  status: 'open' | 'done' | 'snoozed';
  dueDate: string | null;
  completedAt: string | null;
  tags: string[];
  parentId: string | null;
  recurrence: 'daily' | 'weekly' | 'weekdays' | null;
  // Phase 2 additions (scaffolded with field, no UI today):
  assigneeId: string | null;
  assignerId: string | null;
};
```

### workoutSlice.logs[] : WorkoutLog

```ts
type WorkoutLog = AuditFields & {
  date: string;
  steps: number;
  walkDuration: number;                 // minutes
  type: 'walk' | 'post-meal-walk' | 'cardio' | 'strength' | 'mobility' | 'other';
  completed: boolean;
  intensity: 'low' | 'moderate' | 'high' | '';
  chestPain: boolean;
  sob: boolean;
  notes: string;
  // Phase 0 addition (post-meal walk linkage):
  precedingMealSlotId: string | null;   // links a 'post-meal-walk' to the slot whose check-off triggered it
};
```

### workoutSlice.weightHistory[] : WeightEntry

```ts
type WeightEntry = AuditFields & {
  date: string;
  weight: number;
};
```

### profileSlice.profile : ProfileFields

```ts
type ProfileFields = AuditFields & {
  name: string;
  height: number;
  startingWeight: number;
  currentWeight: number;
  goalWeight: number;
  bodyMetrics: { ... };
  medicalFlags: string[];
  dietaryRules: string[];
  cannabisTargets: {
    dailyThcMgCeiling: number;          // default 50
    inhalationBioavailability: number;  // default 0.30
    oralBioavailability: number;        // default 0.20
  };
  certification: { issueDate, expirationDate, ... };
  // Phase 0 additions (scope change 2026-05-03):
  fastingProtocol: {
    enabled: boolean;                   // default true
    windowStart: string;                // 'HH:mm'; default '14:00'
    windowEnd: string;                  // 'HH:mm'; default '18:00'
    timezone: string;                   // IANA tz; default Intl.DateTimeFormat().resolvedOptions().timeZone
  };
  plateDefaults: {
    breakfast: number;                  // grams; default 250
    lunch: number;                      // grams; default 350
    dinner: number;                     // grams; default 460
    snack: number;                      // grams; default 150
    shake: number;                      // grams; default 0 (no plate; user enters total liquid weight directly)
  };
  walkDefaults: {
    postMealTargetMinutes: number;      // default 10
    reminderEnabled: boolean;           // default true
  };
};
```

> **Note:** `nutritionTargets` (was: calories/protein/carbs/fat) is REMOVED in Phase 0 migration v1→v2. MyNetDiary is the system of record for daily macro targets; HT computes derived totals only as a Today gut-check.

### uiSlice : UiState

```ts
type UiState = {
  demoMode: boolean;
  activeView: keyof typeof VIEWS;
  toasts: { id, message, type }[];      // ephemeral; not persisted
  featureFlags: { [flag: string]: boolean };
};
```

## ID strategy

- All records use **UUID v4** for `id`. Existing `'inv-N'` strings get migrated in Phase 0 commit B9.
- IDs are stable across user sessions and (Phase 2) syncs.

## Date strategy

- All dates are **ISO 8601 strings**, not Date objects.
- Timezone handling: store local date for daily logs (food, cannabis, workout); UTC for everything else.

## Migration registry

```js
// data/migrations/index.js
export const migrations = [
  { from: 0, to: 1, migrate: (state) => { /* add audit fields, schemaVersion */ } },
  { from: 1, to: 2, migrate: (state) => {
      // Phase 0 scope change (2026-05-03):
      //   1. Export legacy foodSlice.logs[] to localStorage 'ht-legacy-foodlogs-export-<timestamp>' for user retrieval.
      //   2. Drop foodSlice entirely.
      //   3. Drop profileSlice.profile.nutritionTargets.
      //   4. Add profileSlice.profile.fastingProtocol with defaults.
      //   5. Add profileSlice.profile.plateDefaults with defaults.
      //   6. Add profileSlice.profile.walkDefaults with defaults.
      //   7. Add mealSlice.weeklyPlanHistory = [].
      //   8. MealInventoryItem: drop {servingSize, calories, protein, carbs, fat, fiber, sodium}; require {referenceWeight, referenceUnit, refCalories, refProtein, refCarbs, refFat}; add {tags, prepNotes, mynetdiaryUrl}.
      //   9. Coerce existing MealInventoryItem entries: missing reference fields → set to 100g + previously-stored macros (lossless if old fields present).
      //  10. Convert MealPlan.days[date].{breakfast,lunch,dinner,snack} from string|null to MealPlanSlot{mealInventoryId, eaten:false, eatenAt:null, totalWeightWithPlate:null, notes:''}.
      //  11. Initialize MealPlan.days[date].shakes = [].
      //  12. Drop MealPlan.algorithmConfig.macroTargets; keep favoriteWeight + repeatGapDays; add categoryConstraint:true.
    } },
  // appended as schema evolves
];
```

`runMigrations(state)` runs at app load if `state.schemaVersion < CURRENT`. Versions never skip; every migration is reversible-aware (forward-only is OK if backward path is documented).

## Encryption envelope (Phase 2)

`pgcrypto` column-level encryption on sensitive fields in the cannabis, profile, and weight tables when Supabase lands. Export bundles offer optional password protection. See `privacy.md`.
