# HealthTracker — Design Requirements

**Status:** active · canonical north-star · supersedes ad-hoc design discussions
**Owner:** architect · **Updated:** 2026-05-03

This document is the single source of truth for what HealthTracker is, how it looks, how it behaves, and how Claude Code agents collaborate to build it. Everything else (`framework.md`, `reference/*.md`, `_workspace/*`) is either a detail expansion or an execution scratchpad.

---

## 1 · Vision

A personal-first health dashboard that consolidates daily routine: prayers, intermittent fasting, planner-only meals, post-meal walks, structured workouts, strict cannabis tapering, work-location logging, and discouraged sweet-tooth tracking. Today is a checklist, the past is read-only history, the future is unmade. Built as a compact, polished, production-quality Material Design 3 SPA — local-first today, multi-user Supabase tomorrow.

## 2 · Locked Decisions (DoR — 2026-05-03)

These were confirmed via interactive Q&A and are inputs to every architect commit going forward. Stored in [_workspace/scratch/observed-debt.md](_workspace/scratch/observed-debt.md) under the `[LOCKED]` entry.

| # | Topic | Decision |
|---|---|---|
| 1 | Cannabis dose cap | **25 mg per session** (hard block) + **50 mg daily** (taper baseline) |
| 2 | Prayer times | New `~/PROJECTS/shared-services` repo, **local astronomical calc only** (ISNA/MWL/Egypt/Karachi/Jafari methods), consumed by HT and journal repos |
| 3 | Cannabis taper curve | **Linear ramp** |
| 4 | Taper values | **80 mg → 25 mg over 8 weeks**, formula `ceiling(d) = 80 − 55·d/56` |
| 5 | Week-nav boundary | **±1 calendar week** (last Sun → this Sat); outside = read-only History |
| 6 | Allowed-during-fast | **Strict 4**: water · green tea · black coffee · electrolytes |
| 7 | Workout schedule | **Weekly count + most-behind recommendation** (walk daily, kickboxing 5×/wk, weights 3×/wk) |
| 8 | Bedtime peak (cannabis) | **Clear before sleep** — back-scheduled from 8:00 pm bedtime |
| 9 | Daily calorie tracking | **Reversed prior decision** — Today now sums per-recipe calories vs. `dailyCalorieTarget` (default 2000); MyNetDiary remains source of per-recipe values |
| 10 | Sleep schedule | **Bedtime 8:00 pm, wake 4:30 am** — drives prayer reminders, cannabis last-call, IF window |
| 11 | Beachbody seed | **LIIFT4** (weights), **Core de Force** (kickboxing), **21 Day Fix** (onramp); fitnessLevel default = `very-poor` |
| 12 | Plate-weight scaling | **Removed** entirely from scope (commit `4629266`) |

## 3 · Material Design 3 Design Language

### Foundation
- **Compact but readable** — never sacrifice legibility for density.
- **Mobile-first, desktop-optimized** — never just stretch mobile to desktop.
- **8 px spacing system**, **12–16 px card padding**, **rounded corners** (8/12/16/24 px), **soft shadows** preferred over heavy elevation.
- **Subtle backgrounds, high-contrast foreground text**.
- **Minimal visual clutter** — every pixel earns its keep.

### Color (semantic, MD3 tokens)
| Token | Use |
|---|---|
| `primary` | Main actions, selected nav, brand accent |
| `secondary` | Supporting actions, accent fills |
| `tertiary` | Decorative accents (rare) |
| `success` | Completed / on-target |
| `warning` | Attention required |
| `error` | Destructive or failed |
| `surface`, `surface-variant`, `surface-container-*` | Layout neutrals at three elevation levels |
| `on-*` variants | Foreground text on each surface |

Dark-first. Light theme is a sibling token map, swap via `[data-theme="light"]`. Detailed token list lives in [reference/design-system.md](reference/design-system.md) (to be updated to MD3 token names in Phase 1 / B-styles).

### Typography
System stack (`-apple-system, "Segoe UI Variable", system-ui, ...`). Tabular numerals on data. Six type scales: `display-lg, headline, title, body, label, caption`.

### Iconography
**Material Symbols** primary (rounded variant, weight 400, fill 0). Lucide as fallback for missing glyphs. **Never load full icon libraries** — tree-shake or sprite the ~40 icons we actually use.

### Components (MD3 inventory)
Cards · Chips · Buttons (filled / tonal / outlined / text / icon) · Switches · Sliders · Drawers · Bottom sheets · Snackbars · Linear & circular progress · Skeleton loaders · Empty states · Inline alerts · Tabs · Lists with leading/trailing slots · Date/time pickers.

Every component has a **counterpart in `app/src/components/primitives/`** with the same name. Storybook (Phase 1.5) documents each.

## 4 · App Shell + Responsive Navigation

| Breakpoint | Range | Navigation |
|---|---|---|
| Mobile | 0 – 599 px | **Bottom navigation bar** (5 destinations max), top app bar with title + actions |
| Tablet | 600 – 904 px | **Navigation rail** (icon-only, left edge) |
| Small desktop | 905 – 1239 px | **Collapsible side drawer** (icons + labels, collapses to rail) |
| Desktop | 1240 px + | **Persistent side drawer**, optional right-side detail panel |

App shell renders the navigation chrome and the route outlet. Routes are **code-split** and **lazy-loaded**. Skeleton loader covers any route taking > 100 ms to mount.

### Container-aware layouts
Cards adapt to their container, not the viewport. A dashboard tile in a 2-column grid renders differently than the same tile in a single-column drawer.

## 5 · Application Sections

| Route | Section | Notes |
|---|---|---|
| `/` | **Dashboard** | Today's checklist + summary tiles. Replaces the legacy "Today" view. |
| `/food` | **Food** | Meal library + weekly planner + intermittent fasting state |
| `/workouts` | **Workouts** | Library (Beachbody + custom routines) + Today's session + Strength gains |
| `/cannabis` | **Cannabis** | Sessions log + taper status + plan |
| `/cannabis/inventory` | **Cannabis Inventory** | Products, devices, restocking |
| `/profile` | **Profile** | Personal, body metrics, sleep, fasting, prayer settings, work locations, plan settings |
| `/settings` | **Settings** | App preferences, theme, notifications, data export, feature flags |

History is reachable from the date-strip of every routine view (week navigation goes to History when crossing the ±1 calendar-week boundary).

## 6 · Dashboard Specification

Dashboard composition (top to bottom on mobile; multi-pane on desktop):

### 6.1 Profile + Weight banner *(always visible)*
Avatar · name · brief metadata (height, age, IF window, taper week) · 5 metrics (current weight, vs last wk, goal, Δ to goal, BMI) · "+ Log weight" pill.

### 6.2 Date header + week strip
Today's date · prev/next day arrows · 7-chip week strip with today highlighted in `primary` gradient · range hint ("Sun → Sat").

### 6.3 Daily aggregate summary tiles
Compact tiles for: **Calories** · **Protein** · **Carbs** · **Fat** · **Workouts** · **Weight Δ** · **Cannabis (mg)** · **Mood** *(Phase 1.5)*. Each tile is value + trend + target.

### 6.4 Accordion sections — exactly one expanded at a time
Collapsed headers show summary chips (e.g., "Food · 320/2000 cal · BREAKFAST done"). Sections:

1. **Prayers** — 5-tile horizontal grid (Fajr / Dhuhr / Asr / Maghrib / Isha) with scheduled times
2. **Workout** — 3 track tiles (Walk / Kickboxing / Weights), today's recommendation highlighted
3. **Cannabis** — split: Limits (metric strip + progress bar) ←→ Sessions (3 planned tiles, back-scheduled from bedtime)
4. **Food** — fasting state · allowed-during-fast counters · feeding window meals · daily calorie sum vs target
5. **Sweet Tooth** — discouraging visual treatment · 4 indulgence counters · 14-day streak strip · friction-confirm modal
6. **Working from** — location picker · session timer
7. **Notes** — free-text journal entry per day *(Phase 1.5)*

### 6.5 Day-complete footer
Centered `primary` filled pill button: "✓ Complete Day" → confirmation modal → locks the day. Locked banner shows summary + "⚠️ Unlock (logged as violation)" outlined button.

## 7 · UX Behavior

- **Preserve scroll position** between routes (router scroll restoration).
- **Skeleton loaders** instead of blank loading screens.
- **Optimistic updates** for logging flows (counter increments, check-offs, weight log).
- **Inline validation** for forms (no modal-stacked errors).
- **Clear empty states** (icon + title + description + primary action).
- **Human-readable errors** ("Couldn't save weight — check your connection" not `Error 500`).
- **Snackbars** for minor confirmations ("+1 water"); auto-dismiss 4 s.
- **Inline alerts** for important issues (fasting-window violations, dose-cap blocks).
- **Avoid excessive modals** — bottom sheets on mobile, side panels on desktop.

## 8 · Responsive Behavior

| Surface | Mobile | Tablet | Desktop |
|---|---|---|---|
| Layout | Single-column | 2-col where helpful | Multi-pane |
| Nav | Bottom bar | Navigation rail | Side drawer |
| Primary action | Sticky FAB | Inline in app bar | Inline in app bar |
| Tables | List cards | List cards or compact tables | Dense tables |
| Quick entry | Bottom sheets | Bottom sheets | Right-side detail panel |
| Hover states | n/a | n/a | enabled |
| Keyboard shortcuts | n/a | partial | enabled (`?` reveals overlay) |

## 9 · Accessibility (WCAG AA)

- Every control keyboard-navigable.
- Every icon-only button has `aria-label`.
- Every form field has a visible label *and* associated `<label for>`.
- `:focus-visible` outline 2 px offset; never `outline:none` without replacement.
- Color is never the only signal: badges have icon + text + color.
- Contrast: text ≥ 4.5:1, UI ≥ 3:1.
- Modals: `role="dialog"`, `aria-modal`, focus trap, Esc closes, restore focus.
- `prefers-reduced-motion` honored on all transitions.

## 10 · Performance Budget

- **Initial JS** ≤ 180 KB gzip (route-split everything beyond the shell).
- **Lazy-load** charts (recharts is ~100 KB; load only on routes that render charts).
- **Responsive images** with `srcset` + `loading="lazy"`.
- **Icon strategy**: tree-shake Material Symbols variable font, ship only used glyphs (~10 KB).
- **Virtualize** lists > 50 rows (history log, inventory).
- **Debounce** search inputs at 200 ms.
- **Cache** API responses (Phase 2) with stale-while-revalidate.
- **CLS** ≤ 0.05; **LCP** ≤ 2.0 s on 4G; **INP** ≤ 200 ms.

## 11 · Architecture

```
┌────────────────────────────────────────────────────────┐
│  App Shell (responsive nav · route outlet · theme)     │
└────────────────────────────────────────────────────────┘
         │
┌────────▼────────────────────────────────────────────────┐
│  Routes (Dashboard · Food · Workouts · Cannabis · ...)  │
│  Code-split, lazy-loaded                                 │
└────────┬────────────────────────────────────────────────┘
         │
┌────────▼────────────────────────────────────────────────┐
│  Feature components (cards · accordions · tiles)        │
└────────┬────────────────────────────────────────────────┘
         │
┌────────▼────────────────────────────────────────────────┐
│  Primitives (Tile · Card · Chip · Button · …)           │
└────────┬────────────────────────────────────────────────┘
         │
┌────────▼────────────────────────────────────────────────┐
│  Selectors (filter by currentUser.id, HT-CORE-010)      │
└────────┬────────────────────────────────────────────────┘
         │
┌────────▼────────────────────────────────────────────────┐
│  Repositories (useCannabisRepo · useMealsRepo · …)      │
└────────┬────────────────────────────────────────────────┘
         │
┌────────▼────────────────────────────────────────────────┐
│  StorageAdapter — interface (HT-CORE-003)               │
│   ├─ LocalStorageAdapter (Phase 0–1)                    │
│   └─ SupabaseAdapter (Phase 2)                          │
└─────────────────────────────────────────────────────────┘
```

The **adapter pattern is load-bearing** — it's the seam that lets Phase 2's Supabase swap be a one-file change. See [reference/architecture.md](reference/architecture.md).

## 11.5 · Unified Library Pattern

A **library** is a user-curated, persistent collection of typed items that the daily checklist consumes. Every library in HealthTracker — Cannabis Products, Cannabis Devices, Meals, Workout Programs, Workout Routines, Exercises, Work Locations, Fasting-safe Items, Sweet Tooth Items — is built on the same generic primitive. This is the only library pattern; ad-hoc per-domain implementations are an HT-CORE-003 violation.

### 11.5.1 Library item base

Every library item extends:

```ts
type LibraryItem = AuditFields & {
  name: string;
  category?: string;            // free or domain enum
  tags: string[];               // user-defined search/filter
  favoriteStars: 0 | 1 | 2 | 3; // surfaces in "recommended" filters
  isActive: boolean;            // soft retire (separate from deletedAt soft-delete)
  iconHint?: string;            // material-symbol name OR emoji
  notes: string;                // free-text
  // …domain-specific fields appended
};
```

### 11.5.2 Generic repo + hook

```ts
// app/src/data/library/library.contract.ts
interface LibraryRepo<T extends LibraryItem> {
  list(filter?: LibraryFilter): T[];
  get(id: string): T | null;
  create(item: Omit<T, keyof AuditFields>): T;
  update(id: string, patch: Partial<T>): T;
  softDelete(id: string): void;     // sets deletedAt
  restore(id: string): void;        // clears deletedAt
  setFavorite(id: string, stars: 0|1|2|3): T;
  setActive(id: string, isActive: boolean): T;
  importMany(items: T[]): { added: number; skipped: number };
  exportAll(): T[];
}

// app/src/data/library/useLibrary.ts
function useLibrary<T extends LibraryItem>(name: LibraryName): LibraryRepo<T>;
```

`LibraryName` enum: `'cannabisProducts' | 'cannabisDevices' | 'meals' | 'workoutPrograms' | 'workoutRoutines' | 'exercises' | 'workLocations' | 'fastingSafeItems' | 'sweetToothItems'`.

Domain repos (e.g., `useMealsRepo`) are thin wrappers that **compose** the generic and add domain-specific selectors:

```ts
function useMealsRepo() {
  const lib = useLibrary<MealInventoryItem>('meals');
  return {
    ...lib,
    getByCategory: (cat) => lib.list({ where: { category: cat } }),
    getRecommendedForToday: () => /* favorites-weighted, no-3-day-repeat */,
    sumCalories: (ids) => /* per-recipe sum */,
  };
}
```

### 11.5.3 Generic UI primitives

In `app/src/components/library/`:

- `<LibraryView library={name}>` — full-page list with search · category filter · favorite filter · "Add" CTA · sort.
- `<LibraryGrid items={...}>` — responsive grid of `<LibraryItemCard>`.
- `<LibraryItemCard item={...}>` — MD3 card showing icon + name + category chip + favorite stars + domain meta line.
- `<LibraryItemForm item={...} schema={...}>` — generic add/edit, fields rendered from a Zod-style schema descriptor.
- `<LibraryImportDrop accept="csv,json">` — paste / drag-and-drop importer.

Domain views (e.g., `MealsInventoryView`) compose these generics and add domain-specific tabs (e.g., "Weekly Plan" sits next to the standard "Library" tab).

### 11.5.4 Schema descriptor (extension point)

Each library declares its schema descriptor in `app/src/data/library/schemas/<name>.ts`:

```ts
export const mealsSchema: LibrarySchema<MealInventoryItem> = {
  fields: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'category', label: 'Category', type: 'enum', options: ['breakfast','lunch','dinner','snack','shake'], required: true },
    { name: 'mynetdiaryUrl', label: 'MyNetDiary URL', type: 'url' },
    { name: 'refCalories', label: 'Calories per recipe (paste from MyNetDiary)', type: 'number', min: 0 },
    // …
  ],
  defaultIcon: 'restaurant',
  cardMeta: (item) => `${item.category} · ${item.refCalories ?? '?'} cal`,
};
```

The form, validation, card display, and import format all derive from this single descriptor. Adding a new library = author one schema descriptor + one slice + one route.

### 11.5.5 Persistence

Each library is a slice in the Zustand store:

```ts
{ slices: { libraries: { meals: { items: [], schemaVersion: N }, cannabisProducts: {...}, ... } } }
```

All slices share `schemaVersion` + migration registration (HT-CORE-009). Audit fields populate via `LibraryRepo.create` (HT-CORE-008).

### 11.5.6 The complete library inventory

| Library | Daily-checklist consumer | Notable fields beyond LibraryItem base |
|---|---|---|
| `cannabisProducts` | Cannabis Sessions card | form, thcPercent, thcMgPerPuff, riskLevel, recommendedDeviceId |
| `cannabisDevices` | Cannabis Sessions tile (device chip) | type, brand |
| `meals` | Today Food card · Weekly Plan | category, refCalories, mynetdiaryUrl, ingredients |
| `workoutPrograms` | Today Workout card (today's pick) | source ('beachbody'\|'manual'), episodes[], difficulty, targetBodyParts[] |
| `workoutRoutines` | Today Workout card (custom routines) | exercises[], totalDurationMinutes |
| `exercises` | Inside `workoutRoutines.exercises[]` | targetBodyPart, defaultSets, defaultReps, defaultRestSeconds |
| `workLocations` | Today "Working from" tile | type, address, distanceMiles, wifiQuality |
| `fastingSafeItems` | Today Food card (counter tiles during fast) | defaultDailyTarget, isAlwaysOn |
| `sweetToothItems` | Today Sweet Tooth card | discouraged: true (always), categoryColor: 'red' |

Eight libraries today; the pattern accommodates new libraries without core changes.

## 12 · Data Model

Canonical schema in [reference/data-model.md](reference/data-model.md). Highlights:

- Every record carries audit fields: `id, userId, createdAt, updatedAt, createdBy, updatedBy, deletedAt, schemaVersion` (HT-CORE-008).
- Every persisted blob carries `schemaVersion` and has a registered migration (HT-CORE-009).
- Soft-delete only — hard-delete is a P0 violation.
- Slices: `cannabis · meals · todos · workout · profile · prayer · sweetTooth · dayClose · dailyWork · workoutLibrary · ui`.
- Selectors filter by `currentUser.id` even in single-user mode (HT-CORE-010).

Pending data-model expansions (per `observed-debt.md` items 6–7g) land in **migration v2 → v3** (architect commit `B10.5`).

## 13 · Agent Topology

Located in `.claude/agents/<name>.md` per Anthropic best practice, each with YAML frontmatter (`name`, `description`, `tools`, `model`).

| Agent | Purpose | Routed by |
|---|---|---|
| `healthtracker` | Singular user-facing entry point — classifies intent and routes to specialist | `/healthtracker` |
| `architect` | Architecture-first review; owns `framework.md` + `reference/*` + `DESIGN-REQUIREMENTS.md` | `/plan` initial pass |
| `planner` | Phase planning, commit-map maintenance, handoff authorship | `/plan` |
| `executor` | TDD red-green-refactor implementation under `app/src/` | `/exec-next` |
| `auditor` | 4-pass holistic audit (Structure → Code → Architecture → Brittleness) | `/audit` |
| `challenger` | YAML-backed governance enforcement against the 10 HT-CORE rules | `/challenge` |
| `ui-reviewer` | MD3 + a11y + responsive review specialist | architect → ui-reviewer for UI-touching commits |
| `debt-logger` | Append-only writes to `observed-debt.md`; never resolves silently | architect or executor when surfacing debt |

## 14 · Skill Inventory

Located in `.claude/skills/<name>/SKILL.md` (already correctly structured).

| Skill | Loaded by | Purpose |
|---|---|---|
| `ht-governance` | challenger, auditor | Score changes against 10 HT-CORE rules |
| `ht-architecture-review` | architect | Architecture-first review template |
| `ht-audit` | auditor | 4-pass audit procedure |
| `ht-plan` | planner | Phase planning + commit-map maintenance |
| `ht-tdd` | executor | TDD red-green-refactor enforcement |
| `ht-md3` | ui-reviewer | **NEW** — Material Design 3 conformance checklist |

## 15 · Slash Commands

In `.claude/commands/<name>.md`. Each command is a thin wrapper that loads the right agent + skill set.

`/healthtracker [intent]` · `/plan` · `/exec-next` · `/audit` · `/challenge` · `/plan-status` · `/sync-guidelines` · **NEW** `/md3-review` (ui-reviewer pass).

## 16 · Phase Plan

| Phase | Name | Headline |
|---|---|---|
| **P0** | Refactor + Scaffolding *(in flight)* | Store split, primitives, repository layer, audit fields, schemaVersion, PWA shell |
| **P1** | MD3 SPA Shell + Daily Routine | App shell w/ adaptive nav; Dashboard w/ accordion model; Food / Workouts / Cannabis / Profile / Settings routes; design tokens migrated to MD3; primitives library |
| **P1.5** | Storybook + History UX | Component documentation; History view (read-only past); Notes feature |
| **P2** | Backend + Multi-User | Supabase, Google SSO, RLS, Realtime on TODOs, Web Push, .ics export, PWA offline sync |
| **P3** | TODO Logger UX | Full TODOs view + Today's TODOs card + History integration + assignment |
| **P4** | Polish | A11y polish, AI assistant flag-on, optional native shell, calendar two-way |
| **P5** | shared-services Repo | Spin out `~/PROJECTS/shared-services/prayer-times` (consumed by HT and journal); evaluate other extracted services |

### P0 close-out checklist (the active work)
See [_workspace/handoffs/phase-0-refactor-handoff.md](_workspace/handoffs/phase-0-refactor-handoff.md). Open commits: B4 → B14, then C1 → C3+. Architect must land **B10.5 + B13.5** (data-model expansion per `observed-debt.md` items 6–7g) **before** executor work continues on B-track.

### P1 work breakdown (preview)
1. Migrate design tokens in `app/src/styles/tokens.css` to MD3 names.
2. Build app shell with responsive nav (`AppShell.jsx`, `BottomNav.jsx`, `NavRail.jsx`, `SideDrawer.jsx`).
3. Primitives: `Card`, `Tile`, `Chip`, `Button` (filled/tonal/outlined/text/icon), `Switch`, `Slider`, `Drawer`, `BottomSheet`, `Snackbar`, `Skeleton`, `EmptyState`, `Alert`, `Tabs`.
4. Dashboard route with summary tiles + accordion model.
5. Food / Workouts / Cannabis / Cannabis Inventory / Profile / Settings routes.
6. Lazy-load + skeleton loaders + optimistic updates wired throughout.
7. Material Symbols sprite (~40 glyphs only).
8. A11y audit pass on every component.
9. ui-reviewer signs off via `/md3-review`.

## 17 · Definition of Done (per phase)

Every phase closes only when **all four** are true:

1. All `⬜` commits in the phase handoff are `✅` or `WONT-FIX`.
2. `/audit` returns zero P0/P1 findings.
3. Sweep catalogue is empty or fully WONT-FIX.
4. User signs off on UX hands-on.

P1 adds: `/md3-review` returns clean.

## 18 · Non-Negotiable Rules (HT-CORE)

Defined in [reference/ht-core-rules.yaml](reference/ht-core-rules.yaml). All 10 in force at all times.

| Code | Rule |
|---|---|
| HT-CORE-001 | Architecture-First |
| HT-CORE-002 | Tests-First |
| HT-CORE-003 | Single Source of Truth |
| HT-CORE-004 | Holistic Validation Gate |
| HT-CORE-005 | Sweep Completeness |
| HT-CORE-006 | Convergence Loop |
| HT-CORE-007 | No Fabricated Evidence |
| HT-CORE-008 | Audit-Field Discipline |
| HT-CORE-009 | Schema-Versioned Persistence |
| HT-CORE-010 | Context Hygiene |

## 19 · Cleanup Manifest

Repo cleanup is staged in `_workspace/scratch/cleanup-checklist.md`. Destructive operations require explicit user approval. See that file for the live list.

## 20 · How to Use This Document

- **Start every conversation** by reading this file + `framework.md` Cold Start Protocol + the active handoff in `_workspace/handoffs/`.
- **Architect commits** update Sections 1–18 of this document.
- **Executor commits** never modify this document — they consume it.
- **When in doubt**, this document overrides earlier scattered design notes.

---

*This document supersedes all prior ad-hoc design discussions. If you find a contradiction between this document and a `reference/*.md` file, file a debt entry and route to the architect via `/plan`.*
