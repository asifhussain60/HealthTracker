# HealthTracker — Architecture Rules

**Status:** active · **Owner:** architect · **Last updated:** 2026-05-04 (solo-user scope locked; rule 5 flipped to sync mutations; rule 1 rewritten; rule 4 annotated)

This document is the single source of truth for HealthTracker's architectural rules. The auditor enforces against it. Violations are P0 unless explicitly documented as accepted technical debt in `_workspace/scratch/observed-debt.md`.

## North star

A **solo-user** React SPA today; a **solo-user PWA with optional cloud-backup + multi-device sync** tomorrow. The architecture is engineered so the swap from localStorage to a personal Supabase project (Phase 2) requires no rewrite — only the storage adapter changes. Selectors, repositories, components, and views never know whether they're talking to localStorage or to Supabase. Multi-user, sharing, assignment, and external auth are explicitly out of scope per `_workspace/plan/program-roadmap.md` § 0.5.

## Layering (top-down)

```
┌─────────────────────────────────────────────────────────────┐
│  views/                  presentation only                  │
│  components/             presentation primitives + cards    │
├─────────────────────────────────────────────────────────────┤
│  data/services/          WeeklyPlanGenerator (decision #24) │
│                          orchestrates libraries → plan slices│
├─────────────────────────────────────────────────────────────┤
│  data/repositories/      mediator: views ↔ slices            │
├─────────────────────────────────────────────────────────────┤
│  data/selectors/         derived state (memoized, pure)     │
│  data/calculators/       pure math (THC, macro, planner)    │
├─────────────────────────────────────────────────────────────┤
│  data/store/             zustand combined slices            │
│  data/migrations/        schema-version migrations          │
├─────────────────────────────────────────────────────────────┤
│  data/adapters/          StorageAdapter (Local | Supabase)  │
│  contexts/               AuthContext, FeatureFlagsContext   │
└─────────────────────────────────────────────────────────────┘
```

**Direction of dependency is one-way down.** A view never imports a slice directly. A slice never imports a repository. The `data/services/` layer (introduced in P1.D for `WeeklyPlanGenerator`) sits **between primitives and the selector layer** — it reads via repos, writes via repos, and is invoked from view-level handlers (the `/plan` hero CTA) plus a Sunday-cron auto-firing path. Mirrors `DESIGN-REQUIREMENTS.md` § 11 architecture diagram.

### WeeklyPlanGenerator service (decision #24, P1.D)

The planner-first framing introduces a single cross-domain orchestration service:

```ts
generateWeeklyPlan({
  startDate,                    // ISO date (Sunday)
  profile,                      // ProfileFields (calorie target, taper week, fitness level)
  libraries: {
    meals,                      // MealInventoryItem[]
    workoutRoutines,            // WorkoutRoutine[] (+ programs for Beachbody)
    cannabisProducts,           // CannabisProduct[]
  },
  locks?: string[],             // ISO dates that survive regeneration
  algorithmConfig?,             // strategy-specific knobs
}) → WeeklyPlan                 // see reference/architecture/data-model.md §WeeklyPlan
```

**Boundaries:**
- **Reads:** the three domain libraries (`mealLibrary`, `workoutLibrary.routines`, `cannabisProducts`) via their repos.
- **Writes:** `mealPlanSlice` and `workoutPlanSlice` only. Cannabis day-plans are delegated to the existing `getDailyCannabisPlan()` calculator (no slice write — the calculator output is folded into `WeeklyPlan.days[date].cannabis` at read time).
- **Never writes logs.** No `foodLogs`, no `mealLogsSlice`, no `workoutLogs`. The plan blob *is* the consumption surface (decision #24).
- **Honors `locks[]`** — locked day-rows survive regeneration unchanged.
- **Regen-immutability of consumed slots (PF-12 invariant).** `WeeklyPlanGenerator` MUST NOT overwrite any `MealPlanSlot` where `eaten===true`. An eaten slot is implicitly locked — independently of, and on top of, the explicit per-day `MealPlanDay.locked` and `WeeklyPlan.locks[]` mechanisms. Overwriting an eaten slot is an HT-CORE-008 audit-trail violation: the consumed `mealInventoryId`, `eatenAt`, `plateWeight`, and `notes` are observed history and cannot be silently rotated. The same rule applies to `WorkoutPlanDay` once a workout-completion field lands (P1.E E3) — extend at that time.

**Strategy-pattern boundary.** `WeeklyPlanGenerator` composes three pluggable strategies, each a pure function (calculators tier):

| Strategy | Pure-fn signature | Pluggable knobs |
|---|---|---|
| `mealStrategy` | `(meals, profile, locks, prevDays) → MealPlanDay[]` | favorite-weighting, repeat-gap-days, category-constraint |
| `workoutStrategy` | `(routines, profile, locks, prevDays) → WorkoutPlanDay[]` | most-behind-track surfacing, weekly-count caps, fitness-level gating |
| `cannabisStrategy` | `(products, profile, taperWeek) → CannabisPlanDay[]` | wraps `getDailyCannabisPlan()`; taper ceiling + bedtime back-schedule |

Strategies live in `data/calculators/strategies/<name>.ts`. The orchestrating service in `data/services/weeklyPlanGenerator.ts` is the *only* file allowed to import all three. This isolates the cross-domain coupling to one seam — swapping a strategy (e.g., a P2 LLM-driven `mealStrategy`) is a one-file change.

Cross-references:
- `DESIGN-REQUIREMENTS.md` § 6.6 (Planner route UX contract)
- `DESIGN-REQUIREMENTS.md` § 11 (architecture diagram parity)
- `reference/product/meal-library-seed.md` (`mealLibrary` seed + CSV importer that feeds `mealStrategy`)
- `reference/architecture/data-model.md` §`WeeklyPlan` envelope shape

## Hard rules

1. **No view imports the store directly.** Views call repositories: `useCannabisRepo()`, `useMealsRepo()`, etc. Repositories wrap the slice and the storage adapter; the view-doesn't-import-store boundary is preserved across the Phase 2 LocalStorage→Supabase adapter swap.
2. **Every record carries audit fields.** See `data-model.md`. Enforced by HT-CORE-008. `userId` is always the constant `'me'` under solo-user scope.
3. **Every persisted blob carries `schemaVersion`.** Enforced by HT-CORE-009; migration registry in `data/migrations/index.js`.
4. **Selectors filter by `currentUser.id`.** Even when single-user. Enforced by HT-CORE-010. *Solo-user scope (2026-05-04):* new selectors are not required to filter by `userId`; existing filters in shipped code stay (cheap to keep; tearing them out is churn). `currentUser.id === 'me'` is a constant exported from `app/src/data/auth/currentUser.js`, not a hook.
5. **Mutations are sync.** *(rewritten 2026-05-04 under solo-user scope)* localStorage is sync, and the rescoped Phase 2 (cloud backup + multi-device sync, still solo) does not require networked storage during a write tick — sync happens *after* the local commit, transparently to the repo caller via a background queue. Repositories return values directly, not Promises. The view-doesn't-import-store rule still applies; the layering invariant is preserved without an async signature.
6. **Calculators are pure.** No side effects. No state reads. Inputs in, outputs out. Tested in isolation.
7. **No business logic in views.** If logic appears in JSX, hoist it to a selector or calculator.
8. **No inline styles unless a CSS variable bridge.** Inline `style={{ '--var': value }}` is allowed only for values that can't live in CSS classes (dynamic ring fill %, mood color).
9. **A11y is non-negotiable.** Every interactive element is keyboard-operable, has a visible focus ring, and meets WCAG AA contrast.

## Slice ownership

| Slice | Domain | Repositories that read it |
|---|---|---|
| `cannabisSlice` | products, devices, sessions | useCannabisRepo |
| `mealSlice` | meal inventory, weekly plan, plan history | useMealsRepo |
| `todoSlice` | TODOs (personal + professional) | useTodosRepo |
| `workoutSlice` | workout logs (incl. post-meal walks), weight history | useWorkoutRepo |
| `profileSlice` | profile, fasting protocol, plate defaults, walk defaults, cannabis targets | useProfileRepo |
| `uiSlice` | demo mode, toasts, feature flags, active view | (used by views directly via hook) |

> **`foodSlice` removed in Phase 0 scope change (2026-05-03).** Daily nutrition tracking is out of scope; MyNetDiary is the system of record. Consumption is captured on `MealPlanSlot` via check-off.

## Dependency rules

| From | Allowed to import | Forbidden |
|---|---|---|
| `views/*` | `components/*`, `data/repositories/*`, `data/services/*`, `data/selectors/*`, `contexts/*`, `data/store/uiSlice` | `data/store/*` (other slices), `data/adapters/*` |
| `components/*` | `components/*` (peers + primitives), `contexts/*` | `data/*` (presentation only) |
| `data/services/*` | `data/repositories/*`, `data/calculators/*` (incl. `strategies/*`), `data/selectors/*` | `views/*`, `components/*`, `data/store/*` (must go through repos), `data/adapters/*` |
| `data/repositories/*` | `data/store/*`, `data/selectors/*`, `data/calculators/*`, `data/adapters/*` | `views/*`, `components/*`, `data/services/*` |
| `data/selectors/*` | `data/store/*`, `data/calculators/*` | `views/*`, `components/*`, `data/adapters/*` |
| `data/calculators/*` | (nothing — pure functions) | everything except other calculators |
| `data/store/slices/*` | `data/migrations/*` | `views/*`, `components/*`, `data/repositories/*` |
| `data/adapters/*` | (nothing) | `data/store/*`, `views/*`, `components/*` |

### Calculators (pure functions — 100% test coverage required)

| Calculator | Purpose | Phase |
|---|---|---|
| `data/calculators/thcMath.js` | THC mg per dose; daily/weekly totals; ceiling status | 0 (extracted from existing) |
| `data/calculators/macroMath.js` | `foodWeightFromTotal()`; `scaledMacros()`; `consumedMacrosForSlot()` | 0 (plate-weight scaling) |
| `data/calculators/fastingMath.js` | `currentState()` (FASTING/FEEDING); `hoursSinceMeal()`; `timeUntilFastBreak()`; `windowAdherence()` | 0 (new) |
| `data/calculators/cannabisPlanner.js` | Daily session plan from inventory + targets + ceilings | 0 (extracted) |
| `data/calculators/mealPlanner.js` | Weekly grid generator: variety + favorites + category + repeat-gap | 1 |
| `data/calculators/strategies/mealStrategy.js` | Pluggable strategy invoked by `WeeklyPlanGenerator` (favorites + repeat-gap + category) | 1.D |
| `data/calculators/strategies/workoutStrategy.js` | Pluggable strategy: most-behind-track + weekly-count caps + fitness gating | 1.D |
| `data/calculators/strategies/cannabisStrategy.js` | Pluggable strategy: wraps `getDailyCannabisPlan()` with taper + bedtime back-schedule | 1.D |
| `data/calculators/shoppingList.js` | Aggregate ingredients across week × category plate weight | 1 |

## Adapter contract

```js
// data/adapters/StorageAdapter.js
export class StorageAdapter {
  // Hydration is sync: the adapter holds an in-memory snapshot fed from the
  // backing store on init. Repositories read from this snapshot synchronously.
  load() { /* returns persisted state from in-memory snapshot */ }
  save(state) { /* updates in-memory snapshot synchronously, queues persistence */ }
  // Networked persistence (Phase 2) runs asynchronously inside a background
  // queue, never on the write hot path. Conflict resolution is last-write-wins.
  healthCheck() { /* returns { ok: boolean, ...details } */ }
}
```

`LocalStorageAdapter` implements this for today (snapshot-write-through is effectively instant). `SupabaseAdapter` implements it for Phase 2 with a dirty-flag background queue so repos retain sync semantics. The store talks only to the adapter.

## Auth contract

*(rewritten 2026-05-04 under solo-user scope — no React Context, no hook)*

```js
// app/src/data/auth/currentUser.js
export const CURRENT_USER_ID = 'me';
```

That's the entire auth surface. There is no `AuthContext`, no `useCurrentUser` hook, no role enum. Already-shipped selectors that consume `currentUser.id` resolve to `CURRENT_USER_ID` — i.e., the string `'me'`. Phase 2's optional cloud-backup adapter uses a long-lived device key for Supabase row ownership; that key is per-device and is never exposed to selectors or views.

## Permissions contract

```js
// data/permissions/can.js
can(user, action, resource) → boolean
// Always returns true under solo-user scope (one principal, no other users
// to authorize against). Kept as a stable seam: feature gates that need
// per-feature toggling go through `uiSlice.featureFlags`, not through can().
```

## Feature flags

```js
// uiSlice
useFeature('todos.assignment') → boolean
// URL override: ?ff=todos.assignment
```

## Routing

`App.jsx` is a dispatcher reading `routes.js`:

```js
// routes.js
export const VIEWS = {
  today:    { label: 'Today',    icon: '...', component: TodayView },
  cannabis: { label: 'Cannabis', icon: '...', component: CannabisView },
  meals:    { label: 'Meals',    icon: '...', component: MealsView },
  todos:    { label: 'TODOs',    icon: '...', component: TodosView },
  history:  { label: 'History',  icon: '...', component: HistoryView },
  profile:  { label: 'Profile',  icon: '...', component: ProfileView },
};
```

URL routing is deferred — the view-registry is structured so React Router can drop in if/when needed.

## Cross-platform expectations

- **Mac primary, Windows first-class.** PWA installable on both.
- **System font stack** in `tokens.css`; no hardcoded fonts.
- **`useShortcut('mod+k')`** abstracts Cmd/Ctrl by platform.
- **Service worker** in production; cache-first static, network-first data.
- **Manifest** with maskable + any icons + wide screenshot for Windows install prompt.

## What's out of scope (Phase 0–5)

- **Multi-user.** Sharing, assignment, delegation, invites, family/group accounts. Locked solo-user 2026-05-04 per `_workspace/plan/program-roadmap.md` § 0.5.
- **External auth.** Google SSO, OAuth, email/password sign-in. Phase 2 uses a long-lived device key only.
- **RLS / row-level-security policies.** No multi-tenant surface to defend.
- React Native / native shells.
- Server-side rendering.
- Multi-region deployment.
- Anything not explicitly in `feature-roadmap.md`.
