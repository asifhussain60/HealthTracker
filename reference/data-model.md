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
    };
    todos: { items: Todo[] };
    workout: { logs: WorkoutLog[]; weightHistory: WeightEntry[] };
    profile: ProfileFields;
    ui: UiState;
  };
};
```

## Slice schemas (current target — Phase 0 lands these)

### foodSlice.logs[] : FoodLog

```ts
type FoodLog = AuditFields & {
  date: string;          // ISO date (yyyy-MM-dd)
  label: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Munchies';
  name: string;
  time: string | null;   // ISO time HH:mm
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes: string;
  cannabisTriggered: boolean;
  munchiesRelated: boolean;
  source: 'manual' | 'meal-template' | 'mynetdiary-import';
  mealInventoryId: string | null;  // optional link
};
```

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
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
  sodium: number | null;
  ingredients: string;             // free-text
  notes: string;
  favoriteStars: 0 | 1 | 2 | 3;
  source: 'manual' | 'mynetdiary-import' | 'csv-import';
};
```

### mealSlice.weeklyPlan : MealPlan

```ts
type MealPlan = AuditFields & {
  startDate: string;               // ISO date (Mon)
  days: {
    [date: string]: {
      breakfast: string | null;     // mealInventoryId
      lunch: string | null;
      dinner: string | null;
      snack: string | null;
      locked: boolean;              // user-locked from regen
    };
  };
  algorithmConfig: {
    macroTargets: { calories, protein, carbs, fat };
    favoriteWeight: number;         // 1.0..3.0
    repeatGapDays: number;          // default 3
  };
};
```

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
  walkDuration: number;
  type: string;
  completed: boolean;
  intensity: 'low' | 'moderate' | 'high' | '';
  chestPain: boolean;
  sob: boolean;
  notes: string;
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
  nutritionTargets: { calories, protein, carbs, fat };
  cannabisTargets: {
    dailyThcMgCeiling: number;          // default 50
    inhalationBioavailability: number;  // default 0.30
    oralBioavailability: number;        // default 0.20
  };
  certification: { issueDate, expirationDate, ... };
};
```

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
  // appended as schema evolves
];
```

`runMigrations(state)` runs at app load if `state.schemaVersion < CURRENT`. Versions never skip; every migration is reversible-aware (forward-only is OK if backward path is documented).

## Encryption envelope (Phase 2)

`pgcrypto` column-level encryption on sensitive fields in the cannabis, profile, and weight tables when Supabase lands. Export bundles offer optional password protection. See `privacy.md`.
