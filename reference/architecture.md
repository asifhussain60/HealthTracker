# HealthTracker — Architecture Rules

**Status:** active · **Owner:** architect · **Last updated:** 2026-05-03

This document is the single source of truth for HealthTracker's architectural rules. The auditor enforces against it. Violations are P0 unless explicitly documented as accepted technical debt in `_workspace/scratch/observed-debt.md`.

## North star

A solo-user React SPA today; a multi-user authenticated PWA tomorrow. The architecture today is engineered so the swap to backend (Phase 2) requires no rewrite — only the storage adapter changes. Selectors, repositories, components, and views never know whether they're talking to localStorage or to Supabase.

## Layering (top-down)

```
┌─────────────────────────────────────────────────────────────┐
│  views/                  presentation only                  │
│  components/             presentation primitives + cards    │
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

**Direction of dependency is one-way down.** A view never imports a slice directly. A slice never imports a repository.

## Hard rules

1. **No view imports the store directly.** Views call repositories: `useFoodRepo()`, `useCannabisRepo()`, etc. Repositories wrap the slice; tomorrow they'll wrap fetch().
2. **Every record carries audit fields.** See `data-model.md`. Enforced by HT-CORE-008.
3. **Every persisted blob carries `schemaVersion`.** Enforced by HT-CORE-009; migration registry in `data/migrations/index.js`.
4. **Selectors filter by `currentUser.id`.** Even when single-user. Enforced by HT-CORE-010.
5. **Mutations are async by signature.** Even local writes return `Promise<void>` or `Promise<Result>`. The view never has to change when storage becomes networked.
6. **Calculators are pure.** No side effects. No state reads. Inputs in, outputs out. Tested in isolation.
7. **No business logic in views.** If logic appears in JSX, hoist it to a selector or calculator.
8. **No inline styles unless a CSS variable bridge.** Inline `style={{ '--var': value }}` is allowed only for values that can't live in CSS classes (dynamic ring fill %, mood color).
9. **A11y is non-negotiable.** Every interactive element is keyboard-operable, has a visible focus ring, and meets WCAG AA contrast.

## Slice ownership

| Slice | Domain | Repositories that read it |
|---|---|---|
| `foodSlice` | foodLogs | useFoodRepo |
| `cannabisSlice` | products, devices, sessions | useCannabisRepo |
| `mealSlice` | meal inventory, weekly plan | useMealsRepo |
| `todoSlice` | TODOs (personal + professional) | useTodosRepo |
| `workoutSlice` | workout logs, weight history | useWorkoutRepo |
| `profileSlice` | profile, targets, certifications | useProfileRepo |
| `uiSlice` | demo mode, toasts, feature flags, active view | (used by views directly via hook) |

## Dependency rules

| From | Allowed to import | Forbidden |
|---|---|---|
| `views/*` | `components/*`, `data/repositories/*`, `data/selectors/*`, `contexts/*`, `data/store/uiSlice` | `data/store/*` (other slices), `data/adapters/*` |
| `components/*` | `components/*` (peers + primitives), `contexts/*` | `data/*` (presentation only) |
| `data/repositories/*` | `data/store/*`, `data/selectors/*`, `data/calculators/*`, `data/adapters/*` | `views/*`, `components/*` |
| `data/selectors/*` | `data/store/*`, `data/calculators/*` | `views/*`, `components/*`, `data/adapters/*` |
| `data/calculators/*` | (nothing — pure functions) | everything except other calculators |
| `data/store/slices/*` | `data/migrations/*` | `views/*`, `components/*`, `data/repositories/*` |
| `data/adapters/*` | (nothing) | `data/store/*`, `views/*`, `components/*` |

## Adapter contract

```js
// data/adapters/StorageAdapter.js
export class StorageAdapter {
  async load() { /* returns persisted state */ }
  async save(state) { /* persists state */ }
  async healthCheck() { /* returns { ok: boolean, ...details } */ }
}
```

`LocalStorageAdapter` implements this for today. `SupabaseAdapter` implements it for Phase 2. The store talks only to the adapter.

## Auth contract

```js
// contexts/AuthContext.jsx
const useCurrentUser = () => useContext(AuthContext);
// Returns: { id, role: 'owner' | 'member' | 'viewer', email?, name? }
// Today: { id: 'me', role: 'owner' }
// Tomorrow: hydrated from Supabase session
```

Every selector that filters records uses `useCurrentUser().id`.

## Permissions contract

```js
// data/permissions/can.js
can(user, action, resource) → boolean
// Today returns true; gets real logic in Phase 2.
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

## What's out of scope (Phase 0–4)

- React Native / native shells.
- Server-side rendering.
- Multi-region deployment.
- Anything not explicitly in `feature-roadmap.md`.
