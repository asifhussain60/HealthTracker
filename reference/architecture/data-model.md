# HealthTracker — Data Model

**Status:** active · **Owner:** architect · **Last updated:** 2026-05-04 (solo-user scope locked; multi-user fields removed from Todo. Prior update same day: PF-12 regen-immutability of eaten slots; canonical `DayClosure` with snapshot `schemaVersion`.)

This document is the canonical schema reference. Slices conform to it. Migrations enforce it. The auditor's Pass 4 (Brittleness) checks for drift.

## Audit fields (HT-CORE-008) — present on every record

```ts
type AuditFields = {
  id: string;            // UUID v4
  userId: string;        // owner — always the constant 'me' under solo-user scope
  createdAt: string;     // ISO 8601
  updatedAt: string;     // ISO 8601
  createdBy: string;     // userId of creator (= 'me')
  updatedBy: string;     // userId of last editor (= 'me')
  deletedAt: string | null;  // soft-delete timestamp; null = active
  schemaVersion: number;     // see migrations/
};
```

> **Solo-user scope (2026-05-04):** `userId` is always the constant `'me'`. The field is retained on `AuditFields` for forward-compatibility (cheap to keep, expensive to add back) and to keep HT-CORE-010 enforced in already-shipped selectors. Do not interpret `userId` as preparation for multi-user — multi-user is explicitly out of scope per `_workspace/plan/program-roadmap.md` § 0.5.

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

> **Phase 0 scope change (2026-05-03):** `foodSlice` is removed. Daily nutrition is no longer tracked in HealthTracker — MyNetDiary is the system of record. The meal planner stores reference macros (per MyNetDiary) and computes scaled macros at consumption time via `plateWeight − emptyPlateWeight` for the user's consistent-plate workflow (the `plateWeight` field on `MealPlanSlot` was named `totalWeightWithPlate` pre-2026-05-04). See [`feature-roadmap.md`](feature-roadmap.md) §Phase 1 for the planner UX.

## Slice schemas (current target — Phase 0 lands these)

### ~~foodSlice.logs[]~~ — REMOVED in Phase 0 (2026-05-03)

The food log table is being retired. Existing user data is exported to JSON via Profile → "Export legacy food logs" (Phase 0 commit B-legacy), then the table is dropped via migration v1→v2.

**Replacement model:** consumption is captured on `MealPlanSlot` (see below) — `eaten: boolean`, `eatenAt: string | null`, `plateWeight: number | null` (was `totalWeightWithPlate` pre-2026-05-04). Macros are computed on demand via `data/calculators/macroMath.js`.

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

> **Seed pack and CSV importer contract:** see [`reference/product/meal-library-seed.md`](../product/meal-library-seed.md) (30-row starter pack, MyNetDiary CSV column map, idempotent upsert rules, conflict resolution). The schema descriptor in `app/src/data/library/schemas/meals.ts` binds to the type below.

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
> food_weight = max(0, plateWeight − profile.plateDefaults[category])
> scaled.calories = refCalories × (food_weight / referenceWeight)
> // … same ratio for protein/carbs/fat
> ```
> The `plateWeight` field on `MealPlanSlot` is the user-entered total mass on the plate (food + plate). The shorthand formula `refCalories × plateWeight / referenceWeight` used in `DESIGN-REQUIREMENTS.md` § 6.4 / `meal-library-seed.md` § preface is illustrative; the actual derivation always subtracts `profile.plateDefaults[category]` first inside `macroMath.js` before scaling. Renamed from `totalWeightWithPlate` (architect pass 2026-05-04) — same field, shorter canonical name; v_legacy → v3 migration coerces.

### mealSlice.weeklyPlan : MealPlan

> **Seed pack and CSV importer contract:** see [`reference/product/meal-library-seed.md`](../product/meal-library-seed.md). `MealPlan` is the per-domain plan blob consumed by the Food panel (§ 6.4) and `/plan` (§ 6.6). Authoring is performed by `WeeklyPlanGenerator` (see `reference/architecture/architecture.md` § WeeklyPlanGenerator service); cross-domain envelope is `WeeklyPlan` below.

```ts
type MealPlan = AuditFields & {
  startDate: string;                    // ISO date (Sun) — week begins Sunday per Decision #5/#24
  days: {
    [date: string]: MealPlanDay;
  };
  algorithmConfig: {
    favoriteWeight: number;             // 1.0..3.0; favorites preferred in rotation
    repeatGapDays: number;              // default 3; no meal repeats within N days
    categoryConstraint: boolean;        // default true; respect category per slot
  };
};

type MealPlanDay = {
  breakfast: MealPlanSlot;
  lunch: MealPlanSlot;
  dinner: MealPlanSlot;
  snack: MealPlanSlot;
  shakes: MealPlanSlot[];               // 0..N shakes per day, flex-add
  locked: boolean;                      // user-locked from regen (mirrors WeeklyPlan.locks[])
};

type MealPlanSlot = {
  mealInventoryId: string | null;       // null = no meal planned
  eaten: boolean;
  eatenAt: string | null;               // ISO timestamp; used for fasting-window adherence
  plateWeight: number | null;           // grams; user-entered total mass on the plate (food + plate); was `totalWeightWithPlate` pre-2026-05-04 rename
  notes: string;
};
```

> **Regen-immutability of consumed slots (PF-12 invariant).** `WeeklyPlanGenerator` MUST NOT overwrite a `MealPlanSlot` where `eaten===true`. Any such slot is implicitly locked, independently of the day-level `MealPlanDay.locked` flag and the week-level `WeeklyPlan.locks[]`. The eaten slot's `mealInventoryId`, `eatenAt`, `plateWeight`, and `notes` are observed history; rotating them would corrupt the audit trail (HT-CORE-008) and break the variance selectors enumerated in `_workspace/plan/phase-1-master-plan.md` §8. UX-side, `<FoodPanel>` blocks meal-swap on eaten slots with a snackbar instructing the user to unmark eaten before swapping. See `architecture.md` § WeeklyPlanGenerator service for the writer-side rule.

> Shopping-list builder (Phase 1) is on-demand — a button on the Weekly Plan view. Aggregates each meal's `ingredients` across the week, scaled by category plate weight × number of plates.

### mealSlice.weeklyPlan : WeeklyPlan (cross-domain envelope)

`WeeklyPlan` is the cross-domain plan blob produced by `WeeklyPlanGenerator` (decision #24). It composes per-domain `*PlanDay` shapes into a single weekly object the `/plan` route renders. Persistence is split across slices (`mealPlanSlice`, `workoutPlanSlice`, plus derived cannabis at read-time); this envelope is a *view-time* compose, not a separate persisted slice.

```ts
type WeeklyPlan = {
  startDate: string;                    // ISO date (Sun)
  days: {
    [date: string]: {
      meals:    MealPlanDay;            // from mealPlanSlice
      workout:  WorkoutPlanDay;         // from workoutPlanSlice (P1.D)
      cannabis: CannabisPlanDay;        // derived at read-time via getDailyCannabisPlan()
    };
  };
  locks: string[];                      // ISO date list — locked rows survive regeneration
  algorithmConfig: {
    meal:     MealPlan['algorithmConfig'];
    workout:  WorkoutPlanAlgorithmConfig;     // weekly counts, fitness gating
    cannabis: CannabisPlanAlgorithmConfig;    // taper week, bedtime, ceiling
  };
};

type WorkoutPlanDay = {
  routineId: string | null;             // → workoutRoutines.id; null = rest day
  type: 'walk' | 'kickboxing' | 'weights' | 'rest';
  estDurationMin: number | null;
  locked: boolean;
};

type CannabisPlanDay = {
  sessions: { time: string; productId: string; doseMg: number }[];  // back-scheduled from bedtime
  taperCeilingMg: number;               // computed from taper formula (decisions #1, #4)
};
```

`WorkoutPlanAlgorithmConfig` and `CannabisPlanAlgorithmConfig` shapes are defined alongside their slices when those land in P1.D / P0 respectively.

### dayCloseSlice.closures[] : DayClosure (Phase 1, P1.F)

`DayClosure` finalizes a day. Once closed, all selectors that read the day return read-only values; mutations are rejected unless an `UnlockEvent` is appended (and even then, the original `closedAt` snapshot is immutable — see PF-12 (b) below).

```ts
type DayClosure = AuditFields & {
  date: string;                         // ISO date (local)
  closedAt: string;                     // ISO timestamp
  snapshot: DayClosureSnapshot;         // frozen view of every slice on the day
  unlockEvents: UnlockEvent[];          // append-only; never deletable
};

type DayClosureSnapshot = {
  schemaVersion: number;                // PF-12 (b): the snapshot carries its OWN version stamp
  meals:    MealPlanDay;                // mealPlanSlice.days[date] at closedAt
  workout:  WorkoutPlanDay;             // workoutPlanSlice.days[date]
  cannabis: CannabisPlanDay;            // derived day-plan
  prayer?:  PrayerLog;                  // prayerSlice entry for date
  weight?:  WeightEntry;                // last weight on or before date
  fasting?: { state: 'open' | 'opens-in' | 'closed-since'; computedAt: string };
  sweetTooth?: SweetSlip[];             // append-only entries on date
  workSessions?: WorkSession[];         // workSessionsSlice entries on date
};

type UnlockEvent = AuditFields & {
  unlockedAt: string;                   // ISO timestamp
  unlockedBy: string;                   // userId
  reason: string;                       // free-text rationale
  diffSummary: string;                  // human-readable summary of what changed after unlock
};
```

> **Snapshot schemaVersion (PF-12 (b)).** `DayClosureSnapshot.schemaVersion` is set to `PersistedRoot.schemaVersion` at the moment of closure and **never re-migrated**. Future store-shape migrations interpret historical snapshots through their original version, never by re-shaping in place. This applies HT-CORE-009 (Schema-Versioned Persistence) to historical projections, not just the live store. Selectors that read `DayClosure.snapshot` MUST switch on `snapshot.schemaVersion` if the shape they consume has changed across versions.
>
> **Append-only invariant.** `unlockEvents[]` is append-only. The `closedAt` timestamp and `snapshot` blob are never mutated. Re-closing a previously unlocked day appends a new `UnlockEvent` with `diffSummary` describing the delta — it does not overwrite the original snapshot.

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
};
```

> **Solo-user scope (2026-05-04):** no assignment fields. The `userId` field on `AuditFields` is always the constant `'me'`. The `assigneeId` / `assignerId` fields previously scaffolded here for a Phase-2 multi-user world have been removed per `_workspace/plan/program-roadmap.md` § 0.5.

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
      //  10. Convert MealPlan.days[date].{breakfast,lunch,dinner,snack} from string|null to MealPlanSlot{mealInventoryId, eaten:false, eatenAt:null, plateWeight:null, notes:''}. Any existing slot with the legacy `totalWeightWithPlate` key is renamed in place to `plateWeight` (architect rename 2026-05-04, semantically identical).
      //  11. Initialize MealPlan.days[date].shakes = [].
      //  12. Drop MealPlan.algorithmConfig.macroTargets; keep favoriteWeight + repeatGapDays; add categoryConstraint:true.
    } },
  // appended as schema evolves
];
```

`runMigrations(state)` runs at app load if `state.schemaVersion < CURRENT`. Versions never skip; every migration is reversible-aware (forward-only is OK if backward path is documented).

## Encryption envelope (Phase 2)

`pgcrypto` column-level encryption on sensitive fields in the cannabis, profile, and weight tables when Supabase lands. Export bundles offer optional password protection. See `privacy.md`.
