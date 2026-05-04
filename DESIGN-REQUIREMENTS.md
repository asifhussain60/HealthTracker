# HealthTracker — Design Requirements

**Status:** active · canonical north-star · supersedes ad-hoc design discussions
**Owner:** architect · **Updated:** 2026-05-03

This document is the single source of truth for what HealthTracker is, how it looks, how it behaves, and how Claude Code agents collaborate to build it. Everything else (`framework.md`, `reference/*.md`, `_workspace/*`) is either a detail expansion or an execution scratchpad.

---

## 1 · Vision

A personal-first health dashboard that consolidates daily routine: prayers, intermittent fasting, planner-only meals, post-meal walks, structured workouts, strict cannabis tapering, work-location logging, and discouraged sweet-tooth tracking. Today is a checklist, the past is read-only history, the future is unmade. Built as a compact, polished, production-quality Material Design 3 SPA — local-first today, multi-user Supabase tomorrow.

## 2 · Locked Decisions (DoR — 2026-05-03 / 2026-05-04)

These were confirmed via interactive Q&A and are inputs to every architect commit going forward. Stored in [_workspace/scratch/observed-debt.md](_workspace/scratch/observed-debt.md) under the `[LOCKED]` entries.

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
| 13 | Migration topology (2026-05-04) | **Single forward migration `v_legacy → v3`** in P0 B10; v1/v2 collapsed (Q1) |
| 14 | Primary color (2026-05-04) | **Blue** `oklch(55% 0.15 262)`; teal mockup divergence is documentation only (Q2a) |
| 15 | Shell gradients (2026-05-04) | **Rejected**; flat `--surface` / `--surface-variant`; glass restricted to modal backdrop + banner (Q2b) |
| 16 | Route inventory (2026-05-04) | 7 canonical routes + every library mounted as a sub-route of its parent (Q3) |
| 17 | Sub-phase ordering (2026-05-04) | Capability-spine: A (storage) → B (primitives) → C (shell+routing) → D (profile + library editors) → E (Today panels) → F (dayClose + history + evals + PWA) (Q4) |
| 18 | CLAUDE.md target (2026-05-04) | **≤100 lines**; only deterministic must-do migrates to hooks (Q5) |
| 19 | Pre-push gate (2026-05-04) | `npm run preflight` (typecheck + vitest + lint + jest-axe + bundle-budget); `/audit` agent run remains manual at STOPs (Q6) |
| 20 | Migration fixtures (2026-05-04) | Two synthetic fixtures: v0 baseline + post-`4629266` v1 state; both forward to v3 (Q7) |
| 21 | Sweet Tooth scope (2026-05-04) | Independent panel + slice + Profile sub-route; never embedded in Food (Q8) |
| 22 | PWA topology (2026-05-04) | Dropped from P0; lands once in P1.F (final sub-phase) (Q10) |
| 23 | Performance budget (2026-05-04) | LCP < **1.8 s** on 4G; initial JS ≤ **180 KB gz**; lazy-load charts (Q11) |
| 24 | Planner-first framing (2026-05-04) | `/plan` route with explicit **"Plan my week"** hero CTA is the canonical entry surface; auto-Sunday generation remains the background fallback. Food panel on Today **consumes `mealPlanSlice.days[today]`** (does not write `foodLogs` / `mealLogsSlice`); calories shown in the profile-banner ring are **derived** from `refCalories × plateWeight/refWeight` per decision #9 — no manual calorie entry on Today. Meal library is the single source of meal calorie truth (HT-CORE-003). |
| 25 | BottomNav 5-destination roster (2026-05-04) | Mobile BottomNav slots (in order): **Today · Plan · Food · Workouts · Cannabis**. Profile + Settings ride the top-app-bar avatar dropdown (MD3 secondary-destination pattern). NavRail (tablet) shows all 7 canonical parents; SideDrawer (desktop) adds the 9 library sub-routes as collapsible groups. Resolves Decision #24 nav-cap collision: 7 canonical parents > MD3 BottomNav cap of 5. |

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

Dark-first. Light theme is a sibling token map, swap via `[data-theme="light"]`. Detailed token list lives in [reference/design/design-system.md](reference/design/design-system.md) (to be updated to MD3 token names in Phase 1 / B-styles).

### Typography
System stack (`-apple-system, "Segoe UI Variable", system-ui, ...`). Tabular numerals on data. Six type scales: `display-lg, headline, title, body, label, caption`.

### Iconography
**Material Symbols** primary (rounded variant, weight 400, fill 0). Lucide as fallback for missing glyphs. **Never load full icon libraries** — tree-shake or sprite the ~40 icons we actually use.

### Components (MD3 inventory)
Cards · Chips · Buttons (filled / tonal / outlined / text / icon) · Switches · Sliders · Drawers · Bottom sheets · Snackbars · Linear & circular progress · Skeleton loaders · Empty states · Inline alerts · Tabs · Lists with leading/trailing slots · Date/time pickers.

Every component has a **counterpart in `app/src/components/primitives/`** with the same name. Storybook (Phase 1.5) documents each.

## 3.5 · Theme synthesis (from WrapBootstrap survey, 2026-05-03)

A survey of 18 WrapBootstrap themes (located at `~/PROJECTS/Wrapbootstrap/`) was conducted to inform the HealthTracker visual system. Synthesis below; full report appended to [_workspace/scratch/observed-debt.md](_workspace/scratch/observed-debt.md) as item 8.

**Adopted patterns (best-of-breed, not blind copy):**

| Source | What we take |
|---|---|
| **Material-Admin** | Material Symbols (rounded, weight 400, fill 0) · `backdrop-filter: blur(0.75rem)` modal pattern · soft-shadow formula `0 5px 5px -3px rgba(0,0,0,.15)` · 4.4rem ↔ 18rem sidebar collapse · `theme-prop()` mixin for dark/light variants |
| **Unify** | 6-step type scale (display-lg / headline / title / body / label / caption) · token naming (primary / secondary / success / warning / error) · 0.5rem baseline radius · card hover-shadow at 200ms |
| **Boomerang** | Inverse color-pair model (every fg has explicit on-fg) · comprehensive dark-mode variable set · navbar hover/active state matrix |
| **Sphere** | Parallel color+text-pair structure (replicable as CSS custom properties for taper/mood color coding) |
| **Ace** | Multi-width sidebar pattern · transition timing philosophy (0.15s micro · 200ms macro · 600ms reveal) · scrollbar theming |

**Themes skipped:** Clotheshop, Ericka, Flatland, Paperclip, Radmin, Slick, Summarize, Tales, Authenty, Mac (e-commerce / landing / outdated / non-dashboard).

### Canonical token set (final, supersedes prior § 3 colors)

```css
:root {
  /* MD3-aligned color tokens — dark-first */
  --primary:       oklch(55% 0.15 262);   /* #1E88E5 */
  --secondary:     oklch(67% 0.14 210);   /* #00BCD4 */
  --success:       oklch(60% 0.12 142);   /* #4CAF50 */
  --warning:       oklch(68% 0.12  48);   /* #FFA726 */
  --error:         oklch(59% 0.16  14);   /* #EF5350 */
  --surface:       #121212;
  --surface-variant: #1E1E1E;
  --on-surface:    rgba(255,255,255,0.87);
  --on-surface-dim: rgba(255,255,255,0.60);
  --on-surface-faint: rgba(255,255,255,0.38);
  --border:        rgba(255,255,255,0.10);

  /* Spacing — 4px base */
  --spacing-unit: 4px;
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-6: 24px; --space-8: 32px; --space-12: 48px; --space-16: 64px;

  /* Radius rhythm */
  --radius-small:  0.5rem;   /* 8px  — chips, icon buttons, form inputs */
  --radius-medium: 0.75rem;  /* 12px — cards, bottom sheets, modals */
  --radius-large:  1rem;     /* 16px — large cards, drawers */
  --radius-pill:   9999px;   /* FAB, accent badges */

  /* Soft elevation (3 levels max) */
  --elev-1: 0 2px 4px rgba(0,0,0,.12);
  --elev-2: 0 5px 5px -3px rgba(0,0,0,.15);
  --elev-3: 0 12px 16px -4px rgba(0,0,0,.25);

  /* Transition timing */
  --t-micro: 150ms cubic-bezier(0.2, 0.8, 0.2, 1);
  --t-base:  200ms cubic-bezier(0.2, 0.8, 0.2, 1);
  --t-slow:  600ms cubic-bezier(0.2, 0.8, 0.2, 1);

  /* Typography */
  --font-stack: -apple-system, BlinkMacSystemFont, "Segoe UI Variable", "Segoe UI", system-ui, Roboto, Helvetica, Arial, sans-serif;
  --font-feature: "tnum" 1;

  --text-display-lg: 3.5rem;   /* 56px */
  --text-headline:   2rem;     /* 32px */
  --text-title:      1.5rem;   /* 24px */
  --text-body:       1rem;     /* 16px */
  --text-label:      0.875rem; /* 14px */
  --text-caption:    0.75rem;  /* 12px */
}

[data-theme="light"] {
  --primary:       oklch(45% 0.18 262);   /* #1565C0 */
  --secondary:     oklch(50% 0.18 210);
  --success:       oklch(48% 0.14 142);
  --warning:       oklch(56% 0.15  48);
  --error:         oklch(45% 0.19  14);
  --surface:       #FFFFFF;
  --surface-variant: #F5F5F5;
  --on-surface:    rgba(33,33,33,0.87);
  --on-surface-dim: rgba(33,33,33,0.60);
  --on-surface-faint: rgba(33,33,33,0.38);
  --border:        rgba(0,0,0,0.10);

  --elev-1: 0 2px 4px rgba(0,0,0,.06);
  --elev-2: 0 5px 5px -3px rgba(0,0,0,.10);
  --elev-3: 0 12px 16px -4px rgba(0,0,0,.16);
}
```

### Glass treatment (non-negotiable scope)

- ✅ Modal/dialog backdrop · `backdrop-filter: blur(0.75rem)` + `rgba(0,0,0,.30)` overlay
- ✅ Always-on profile banner only · `backdrop-filter: blur(28px) saturate(160%)` + soft white border
- ❌ Cards, sidebars, lists, tabs — **never glass**. Solid `--surface-variant` for contrast.

### Iconography (final)

- **Material Symbols rounded variant** (weight 400, fill 0) — variable-font import, ~40 glyphs only, < 50 KB.
- No FontAwesome, no Lucide — single icon library to avoid mixing.

### Typography (final, no custom font import)

System stack only (Material-Admin model). Zero web-font load = faster LCP, no CLS. `font-feature-settings: "tnum" 1` on `body` for tabular numerals on every metric.

### Card pattern (canonical)

```css
.card {
  padding: var(--space-4);
  border-radius: var(--radius-medium);
  border: 1px solid var(--border);
  background: var(--surface-variant);
  box-shadow: var(--elev-1);
  transition: box-shadow var(--t-base);
}
.card:hover { box-shadow: var(--elev-2); }
.card.elevated { padding: var(--space-6); }
```

### Button hierarchy (5 variants)

| Variant | Background | Foreground | Border | Use |
|---|---|---|---|---|
| **Filled** | `var(--primary)` | `white` | none | Primary action (Complete Day, Save) |
| **Tonal** | `color-mix(in oklch, var(--primary) 20%, transparent)` | `var(--primary)` | none | Secondary action (Log weight, Add meal) |
| **Outlined** | transparent | `var(--primary)` | `1px solid var(--primary)` | Destructive secondary (Unlock day) |
| **Text** | transparent | `var(--primary)` | none | Tertiary (Cancel, Dismiss) |
| **Icon** | transparent (hover: `--primary` @ 8%) | `var(--on-surface)` | none | Nav, density, in-card actions |

All: `padding: 0.75rem 1.5rem`, `border-radius: var(--radius-small)`, `font-weight: 500`, `font-size: var(--text-label)`, `transition: all var(--t-base)`.

### Risks logged (must verify before P1 lands)

1. **Dark-first cascade discipline** — define both variants in `:root` + `[data-theme="light"]` block; never override per-component.
2. **WCAG-AA contrast verification** — every adopted color pair must hit ≥ 4.5:1 for text via WebAIM checker before merge.
3. **Glass scope creep** — comment `⚠️ Glass restricted to backdrop + banner only` in `tokens.css`.
4. **Icon library lock-in** — Material Symbols only; ban FontAwesome / Lucide imports in lint config.

### Resolved design decisions (DoR convergence — 2026-05-04)

Two divergences from canon (open as of 2026-05-03) are now resolved and locked. Mockup screenshots that disagree are review affordances only, not canon:

1. **Primary color = blue** (`oklch(55% 0.15 262)` ≈ `#1E88E5`). Rationale: 18-theme survey ranked Material-Admin/Unify blue palette best for data dashboards; calorie-ring "primary" reads as data-progress, not action; teal mockup divergence is documentation, not source-of-truth. The mockup's teal stays out of the token set.
2. **Decorative background gradients = rejected.** App shell uses flat `--surface` / `--surface-variant`. Rationale: honors § 3.5 "subtle backgrounds, high-contrast foreground text" + no-glass-on-shell discipline; ring + libTag + soft elevation already give the dashboard texture; flat surfaces win on LCP and contrast. Glass treatment remains restricted to modal backdrop and the always-on profile banner only (§ 3.5).

## 3.6 · Panel header convention (libTag)

Every dashboard panel header in § 6.4 surfaces its **source library or service path** as a small uppercase tag in the top-right of the panel header. This makes the Unified Library Pattern (§ 11.5) visible in the UI and is the single most important affordance that signals to the user which curated collection drives the panel.

```css
.panel-head .lib-tag {
  font-size: 10px;                       /* text-[10px] */
  text-transform: uppercase;
  letter-spacing: 0.15em;                /* tracking-widest */
  background: rgba(255,255,255,0.05);    /* bg-white/5 */
  color: var(--on-surface-faint);
  padding: 3px 9px;
  border-radius: var(--radius-pill);
}
```

Examples (canonical strings — copy these exactly when authoring panels):

| Panel | libTag |
|---|---|
| Spirituality / Prayers | `~/shared-services/prayer-times` |
| Workout | `workoutLibrary.routines · title field` |
| Cannabis | `cannabisProducts · session planner` |
| Food | `meals library · weekly auto-plan` |
| Sweet Tooth | `sweetToothItems · friction confirm` |
| Working from | `workLocations · session timer` |

Cross-reference: § 11.5.7.

## 4 · App Shell + Responsive Navigation

| Breakpoint | Range | Navigation |
|---|---|---|
| Mobile | 0 – 599 px | **Bottom navigation bar** — 5 destinations: **Today · Plan · Food · Workouts · Cannabis** (Profile + Settings via avatar menu). Top app bar carries title + avatar dropdown. |
| Tablet | 600 – 904 px | **Navigation rail** (icon-only, left edge) — all 7 canonical parents (`/`, `/plan`, `/food`, `/workouts`, `/cannabis`, `/profile`, `/settings`). |
| Small desktop | 905 – 1239 px | **Collapsible side drawer** — 7 parents + 9 library sub-routes as collapsible groups; collapses to rail. |
| Desktop | 1240 px + | **Persistent side drawer** — same content as small desktop; optional right-side detail panel. |

App shell renders the navigation chrome and the route outlet. Routes are **code-split** and **lazy-loaded**. Skeleton loader covers any route taking > 100 ms to mount.

### 4.1 BottomNav roster rationale (Decision #25)

The 5-slot mobile BottomNav roster is locked as **Today · Plan · Food · Workouts · Cannabis**, with Profile + Settings demoted to the top-app-bar avatar dropdown. Reasoning:

- **(a) Plan is canonical entry per Decision #24** — the "Plan my week" hero CTA is the primary user intent for the planner-first framing; BottomNav presence is non-negotiable.
- **(b) Today is the daily-checkoff surface** — highest-frequency thumb-reach destination; must occupy the leftmost slot.
- **(c) Food / Workouts / Cannabis are the three planned domains** — keeping all three on BottomNav reinforces planner-first symmetry (each slot maps to a slice the planner writes).
- **(d) Profile / Settings are infrequent destinations** — MD3 explicitly recommends moving low-frequency destinations to an avatar dropdown when BottomNav is at its 5-slot cap; an overflow drawer is rejected as anti-pattern.
- **(e) Library sub-routes are deep-link only on mobile** — reachable via each parent route's "Library" link (e.g., `/food` → `/food/library`); no flat exposure in BottomNav, NavRail covers them on tablet+.

### Container-aware layouts
Cards adapt to their container, not the viewport. A dashboard tile in a 2-column grid renders differently than the same tile in a single-column drawer.

## 5 · Application Sections

Per locked decision #16, every library declared in § 11.5.6 has a deep-linkable sub-route under its parent. Single `<LibraryView>` instance per library; URL → library name is a 1:1 mapping.

| Route | Section | Notes |
|---|---|---|
| `/` | **Dashboard** | Today's checklist + summary tiles. Replaces the legacy "Today" view. |
| `/plan` | **Planner** | Planner-first entry surface (decision #24). Hero "Plan my week" CTA, 7×4 meal grid, per-day Lock + workout chip + cannabis tiles, Build shopping list. See § 6.6. |
| `/food` | **Food** | Today's meals + IF state; weekly planner |
| `/food/library` | **Meals Library** | `<LibraryView<MealInventoryItem>>` |
| `/workouts` | **Workouts** | Today's session + Strength Gains placeholder |
| `/workouts/programs` | **Workout Programs** | `<LibraryView<WorkoutProgram>>` (Beachbody + manual) |
| `/workouts/routines` | **Workout Routines** | `<LibraryView<WorkoutRoutine>>` (custom) |
| `/workouts/exercises` | **Exercises** | `<LibraryView<Exercise>>` |
| `/cannabis` | **Cannabis** | Sessions log + taper status + daily plan |
| `/cannabis/products` | **Cannabis Products** | `<LibraryView<CannabisProduct>>` |
| `/cannabis/devices` | **Cannabis Devices** | `<LibraryView<CannabisDevice>>` |
| `/profile` | **Profile** | Personal, body metrics, sleep, IF, prayer settings, plan settings |
| `/profile/work-locations` | **Work Locations** | `<LibraryView<WorkLocation>>` |
| `/profile/fasting-safe` | **Fasting-safe Items** | `<LibraryView<FastingSafeItem>>` |
| `/profile/sweet-tooth` | **Sweet Tooth Items** | `<LibraryView<SweetToothItem>>` |
| `/settings` | **Settings** | Theme, notifications, data export, feature flags |

History is reachable from the date-strip of every routine view (week navigation goes to History when crossing the ±1 calendar-week boundary).

## 6 · Dashboard Specification

Dashboard composition (top to bottom on mobile; multi-pane on desktop):

### 6.1 Profile + Weight banner *(always visible)*
Avatar · name · brief metadata (height, age, IF window, taper week) · 4 metrics (current weight, vs last wk, goal, Δ to goal — BMI moved to Profile route) · **calorie ring cluster** (rightmost) · "+ Log weight" pill.

**Calorie ring cluster.** A 72×72 ring rendered with `conic-gradient` from `--primary` (filled portion) to `--surface-faint` (remaining), with an inset 6 px-margin disc using the banner's glass treatment (`backdrop-filter: blur(20px)` + low-alpha surface) and the **percentage centered in tabular numerals** (e.g., "16%"). Adjacent label cluster shows `Calories today` (caption, dim) · `320 / 2000` (title, on-surface) · `1680 remaining` (caption, success-tinted).

```css
.banner-ring {
  position: relative; width: 72px; height: 72px;
  border-radius: 50%;
  background: conic-gradient(var(--primary) 0deg var(--ring-deg, 0deg),
                             var(--on-surface-faint) var(--ring-deg, 0deg) 360deg);
  display: flex; align-items: center; justify-content: center;
}
.banner-ring::before {
  content: ''; position: absolute; inset: 6px; border-radius: 50%;
  background: color-mix(in oklch, var(--surface) 60%, transparent);
  backdrop-filter: blur(20px);
}
.banner-ring .pct { position: relative; font-feature-settings: "tnum" 1; font-weight: 800; }
```

The ring is the **single canonical surface for the calorie progress signal** — § 6.3 no longer carries it.

### 6.2 Date header + week strip
Today's date · prev/next day arrows · 7-chip week strip with today highlighted in `primary` gradient · range hint ("Sun → Sat").

**Mobile fallback (≤ 599 px).** When horizontal space is constrained, the 7-chip strip MAY collapse to a single-day display flanked by prev/next arrows (the variant shown in the 2026-05-03 mockup). The 7-chip strip remains canonical on tablet and up. Implementations on mobile must still expose direct-jump within the ±1-week window via tap-and-hold or a sheet.

### 6.3 Summary chip strip *(rewritten 2026-05-03 post-scope cut)*

The legacy 8-tile aggregate row (`Calories · Protein · Carbs · Fat · Workouts · Weight Δ · Cannabis (mg) · Mood`) is **removed**. Macros (protein / carbs / fat) left scope with commit `4629266`; calories now live in the § 6.1 banner ring.

What remains is a **compact summary chip strip** rendered between the banner and the accordion — small, glanceable, single-row on mobile, never the focal point:

| Chip | Value format | Target / context |
|---|---|---|
| **Workouts** | `1 ✓ · 1 ▶` | done / in-progress count vs weekly schedule (HT-CORE-001 decision 7) |
| **Weight Δ** | `▼ 0.6 lb` | vs last week, success/error coloring on direction |
| **Cannabis** | `15 / 73 mg` | today vs taper-day cap |
| **Mood** *(Phase 1.5)* | emoji + 1–5 | from Notes section |

Each chip is a tonal pill (`--surface-variant` background, `--radius-pill`, `padding: 6px 14px`, `font-size: var(--text-caption)`), label dim, value on-surface, optional trend glyph. No charts. No tile cards. The strip is purely a status snapshot — drilldown happens inside the matching accordion panel.

### 6.4 Accordion sections — exactly one expanded at a time

The accordion **single-open invariant** is canon (mobile-first cognitive load, scroll discipline). Mockups or marketing screenshots that show every panel expanded are review affordances only — production renders one expanded panel and the rest collapsed with summary chips (e.g., "Food · 320/2000 cal · BREAKFAST done"). Every panel header carries its libTag (§ 3.6).

1. **Prayers** — 5-tile horizontal grid (Fajr / Dhuhr / Asr / Maghrib / Isha) with scheduled times. libTag: `~/shared-services/prayer-times`.

2. **Workout** — three-chip selection row (Walk / Kickboxing / Weights). Tapping `Weights` reveals an **inline routine-picker dropdown** with each routine showing `title · meta` (e.g., "Chest & Triceps — 6 exercises · ~45 min") and an `+ Add` button per row; the picker is bordered tonal and collapses on selection. Below the chips, **session tiles render in a 2-col grid** (1-col on mobile) showing each session's state:
   - **Completed:** `--success` 10 % tint background, `✓` badge, volume + timing meta (e.g., "Volume 4,820 lb · 8:30–9:15 am · done").
   - **In-progress:** `--warning` border, `▶` badge, "started 4:10 pm" meta, "In progress" right-side caption.
   - All tiles end with a chevron-right affordance to drill into MyNetDiary detail.

   Hard caps (e.g., max 2 weight sessions/day) render as a red-bordered notice that disables the picker until tomorrow. libTag: `workoutLibrary.routines · title field`.

3. **Cannabis** — sessions render in a **2-col session card grid** (1-col on mobile). Each card has three rows:
   - **Top row:** time (e.g., `2:30 pm`, on-surface, weight 700) + **form-badge pill** (`EDIBLE` / `VAPE` / `FLOWER`, uppercase caption, surface-variant bg, radius-pill).
   - **Middle row:** product icon (36×36, surface bg, radius 9 px) + product name + dose meta line (e.g., "½ piece · 25 mg · ⭐⭐⭐").
   - **Bottom row:** tonal `Log session` pill button (radius-pill, primary tonal — primary at 12 % bg, primary border at 35 % alpha).

   Below the grid, the algorithm-transparency footer (§ 7) shows: `favorites-weighted · onset back-scheduled from 8 pm bedtime · variety constraint (no same product back-to-back)`. libTag: `cannabisProducts · session planner`.

4. **Food** — top of panel shows the **IF state alert strip** (only during fasting state):
   - Background: `color-mix(in oklch, var(--warning) 10%, var(--surface-variant))` with `--warning` border at 30 % alpha; padding `10px 14px`; radius-medium.
   - Left side: `FASTING` badge (`--warning` solid bg, near-black text, weight 700, uppercase caption, radius-pill) + countdown (`Window opens in 2h 14m`).
   - Right side: `14:32 since last meal · 96% 7-day adherence` (caption, dim, `strong` for the metric).
   - When `state === 'feeding-window'`: the strip flips to `--success`-tinted with `FEEDING WINDOW · closes in Xh Ym`.
   - When `state === 'eating-window-passed'`: hidden; meal rows simply dim.

   Below the strip, meals render in a **4-column grid** per row (`grid-template-columns: 36px 1fr 110px 32px`, 12 px gap, 12 px padding, radius-medium) with three visual states:

   | State | Treatment | Slot label | Sub-line |
   |---|---|---|---|
   | (a) eaten pre-window | `--success` 10 % tint background, `✓` filled check (success bg) | `Breakfast (pre-window)` | "eaten 8:30 am · before fast started" |
   | (b) feeding-window pending | solid `--surface-variant`, `○` outlined check | `Lunch · feeding window` | scheduled time |
   | (c) post-window | 50 % opacity (dimmed), outlined check | `Snack · post-window` | "window closed at 6 pm" |

   Cell layout: `[36 px icon] [1fr name + slot + time stack] [110 px plate-weight chip] [32 px check]`. The 110 px chip is **display-only** and shows e.g. `"320g of 380g ref · 680 cal"` — calories are *derived* (`refCalories × plateWeight/refWeight`) per decisions #9 + #24, never typed inline. Tapping the chip opens a bottom sheet to edit `plateWeight` for that slot (the `MealPlanSlot.plateWeight` field — total mass on the plate; renamed from `totalWeightWithPlate` 2026-05-04). The check button is circular (32×32, radius-pill, **filled `--primary` when ✓**, outlined `--on-surface-dim` when pending).

   Each slot is read out of `mealPlanSlice.days[today].{breakfast|lunch|dinner|snack|shakes[]}`; checking ✓ writes `eaten=true, eatenAt=now()` back to the plan slot. **No `mealLogsSlice` / `foodLogs` collection exists** — the plan blob *is* the consumption log (decision #24).

   When `mealPlanSlice.days[today]` is empty, the meal list is replaced by an `<EmptyState>` carrying a smaller (48 px tall) duplicate of the `/plan` hero CTA: pill button "Plan my week" → deep-link to `/plan`.

   Below the meal list: algorithm-transparency footer — `Each calorie input sums into the profile-banner ring. Weekly plan auto-generated every Sunday from favorites; tap meal to swap.` libTag: `meals library · weekly auto-plan`.

5. **Sweet Tooth** — discouraging visual treatment · 4 indulgence counters · 14-day streak strip · friction-confirm modal. **Stays in spec** (the 2026-05-03 mockup omitted this panel; canon retains it). libTag: `sweetToothItems · friction confirm`.

6. **Working from** — location picker · session timer. **Stays in spec.** libTag: `workLocations · session timer`.

7. **Notes** — free-text journal entry per day *(Phase 1.5)*. **Stays in spec.**

### 6.5 Day-complete footer
Centered `primary` filled pill button: "✓ Complete Day" → confirmation modal → locks the day. Locked banner shows summary + "⚠️ Unlock (logged as violation)" outlined button.

### 6.6 Planner route (`/plan`) *(adopted 2026-05-04, decision #24)*

`/plan` is the canonical **planner-first** entry surface — separate from the dashboard `/`. The dashboard is the *checklist*; `/plan` is the *intent*.

**Top-of-route hero CTA.** Centered, filled `--primary` pill, the single most prominent control on the route:

| Property | Value |
|---|---|
| Height | **96 px** |
| Min-width | **320 px** (auto-grows on desktop up to 480 px) |
| Border radius | `var(--radius-pill)` |
| Font | `var(--text-title)` (24 px), weight 600 |
| Label | `Plan my week` |
| Caption (dim, beneath) | `auto-fires Sundays · tap to manually rebuild` (`var(--text-caption)`, `var(--on-surface-dim)`) |
| Action | `generateWeeklyPlan({ startDate=thisSunday, profile, libraries })` → writes `mealPlanSlice` + `workoutPlanSlice` (cannabis already in `cannabisPlanSlice`) |

**7×4 meal grid.** Below the hero CTA. Rows = the 7 days of the active week (Mon–Sun within `[thisSunday-7, thisSaturday]`); columns = `Breakfast · Lunch · Dinner · Snack`. Cells render `<MealPlanSlotCard>` (icon + meal name + category chip + `refCalories` summary). A single-row **shake strip** trails each day-row for `shakes[]` (0..N).

**Per-day Lock pill.** Tonal pill at left of each day-row labelled `🔒 Lock` / `🔓 Unlock`. Toggling sets `mealPlanSlice.days[date].locked`; D16's `WeeklyPlanGenerator` honors `locks[]` so locked rows survive regeneration.

**Per-slot tap-to-swap.** Tapping any `<MealPlanSlotCard>` opens a bottom sheet listing same-category meals from `mealLibrary` ranked by `favoriteStars`; tap a card → slot updated → bottom sheet closes. No category-mixing.

**Per-day workout chip.** Below each day's meal row, a single chip shows the day's `workoutPlanSlot` (e.g., `Walk 30 min` / `LIIFT4 — Chest+Tri` / `Kickboxing 45 min`).

**Per-day cannabis tiles.** Below the workout chip, a 2-column read-only preview of the day's two planned cannabis sessions (time · product · dose) — same visual language as `<CannabisSessionTile>` from § 6.4, but read-only on `/plan`.

**Build shopping list.** Secondary tonal button at the foot of the route. Aggregates `ingredients` across `WeeklyPlan.days[*].meals[*]` and renders the result in a bottom sheet (Phase 1 — paste-friendly text; CSV/email export deferred).

**Algorithm-transparency footer (§ 7.1):** italic caption — `Favorites-weighted · no repeat within 3 days · category-constrained · cap-aware · cannabis taper-aware. Locked rows survive regeneration.`

**Empty-state hand-off pattern.** When `<FoodPanel>` on `/` finds `mealPlanSlice.days[today]` empty, the panel replaces the meal list with an `<EmptyState>` carrying a smaller (48 px tall) duplicate of the same "Plan my week" pill that deep-links to `/plan`. This is the single CTA that bridges the *no-plan* state on Today back to the planner — no other entry to plan generation exists in the dashboard.

libTag: `meals library · weekly auto-plan` (matches the Food panel libTag — they are two views of the same library).

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

### 7.1 Algorithm-transparency footers *(adopted 2026-05-03)*

Every panel that runs a **non-trivial algorithm** (recommendation, back-scheduling, auto-plan, weighted selection, hard caps) shows a small italic note at the bottom of the panel that explains the logic in one line. This is non-negotiable — the user must always understand *why* the system suggested what it suggested.

```css
.panel-algo-note {
  font-size: 10.5px;
  color: var(--on-surface-faint);
  text-align: center;
  font-style: italic;
  margin-top: 12px;          /* mt-3 */
  line-height: 1.5;
}
```

Canonical footer copy (use verbatim — these strings are part of the spec):

| Panel | Footer text |
|---|---|
| Cannabis | `favorites-weighted · onset back-scheduled from 8 pm bedtime · variety constraint (no same product back-to-back)` |
| Food | `Each calorie input sums into the profile-banner ring. Weekly plan auto-generated every Sunday from favorites; tap meal to swap.` |
| Workout (when recommendation visible) | `Most-behind track surfaces first · weekly count drives chip ordering · routines from workoutLibrary.routines (title · category · estDurationMin)` |
| Sweet Tooth | `14-day streak resets on any indulgence · color intensity scales with frequency` |

Panels without a recommendation engine (Prayers, Working from, Notes) do **not** carry an algorithm footer.

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

Locked per decision #23 (2026-05-04):

- **Initial JS** ≤ 180 KB gzip (route-split everything beyond the shell).
- **LCP** < 1.8 s on 4G; **CLS** ≤ 0.05; **INP** ≤ 200 ms.
- **Lazy-load** charts (recharts is ~100 KB; load only on routes that render charts).
- **Responsive images** with `srcset` + `loading="lazy"`.
- **Icon strategy**: tree-shake Material Symbols variable font, ship only used glyphs (~10 KB).
- **Virtualize** lists > 50 rows (history log, library views).
- **Debounce** search inputs at 200 ms.
- **Cache** API responses (Phase 2) with stale-while-revalidate.

Enforced by `npm run preflight` bundle-budget check (decision #19) gating every push.

## 11 · Architecture

```
┌────────────────────────────────────────────────────────┐
│  App Shell (responsive nav · route outlet · theme)     │
└────────────────────────────────────────────────────────┘
         │
┌────────▼────────────────────────────────────────────────┐
│  Routes (Dashboard · Plan · Food · Workouts · …)        │
│  Code-split, lazy-loaded                                 │
└────────┬────────────────────────────────────────────────┘
         │
┌────────▼────────────────────────────────────────────────┐
│  Feature components (cards · accordions · tiles)        │
│   PlannerView · FoodPanel · WorkoutPanel · …            │
└────────┬────────────────────────────────────────────────┘
         │
┌────────▼────────────────────────────────────────────────┐
│  Primitives (Tile · Card · Chip · Button · …)           │
└────────┬────────────────────────────────────────────────┘
         │
┌────────▼────────────────────────────────────────────────┐
│  WeeklyPlanGenerator service (decision #24)             │
│   reads:  libraries (meals · routines · products)        │
│   writes: mealPlanSlice · workoutPlanSlice               │
│   delegates cannabis day-plan to getDailyCannabisPlan()  │
│   does NOT write logs (no foodLogs / mealLogsSlice)      │
│   strategies: mealStrategy · workoutStrategy · cannabisStrategy │
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

The **adapter pattern is load-bearing** — it's the seam that lets Phase 2's Supabase swap be a one-file change. See [reference/architecture/architecture.md](reference/architecture/architecture.md).

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

### 11.5.7 Library-to-panel surfacing (libTag)

The Unified Library Pattern is invisible to the user unless we surface it. **Every dashboard panel header in § 6.4 shows a libTag** that names the library or service driving that panel (see § 3.6 for the visual spec). The libTag is not decorative — it's the user-facing seam between curated data (libraries) and daily checklist consumption.

| Panel (§ 6.4) | libTag string | Source library |
|---|---|---|
| Prayers | `~/shared-services/prayer-times` | external service (decision 2) |
| Workout | `workoutLibrary.routines · title field` | `workoutRoutines` |
| Cannabis | `cannabisProducts · session planner` | `cannabisProducts` |
| Food | `meals library · weekly auto-plan` | `meals` |
| Sweet Tooth | `sweetToothItems · friction confirm` | `sweetToothItems` |
| Working from | `workLocations · session timer` | `workLocations` |

If a future panel does not source from a library, it is by definition **not a daily-checklist panel** and belongs on a different route — this is an HT-CORE-003 invariant.

## 12 · Data Model

Canonical schema in [reference/architecture/data-model.md](reference/architecture/data-model.md). Highlights:

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
| **P0** | Refactor + Scaffolding *(in flight)* | Store split, calculators/selectors, repository layer, single `v_legacy → v3` migration with audit fields + `schemaVersion: 3`, `npm run preflight` script. PWA dropped (lands in P1.F per decision #22). |
| **P1** | MD3 SPA Shell + Daily Routine | App shell w/ adaptive nav; Dashboard w/ accordion model; Food / Workouts / Cannabis / Profile / Settings routes; design tokens migrated to MD3; primitives library |
| **P1.5** | Storybook + History UX | Component documentation; History view (read-only past); Notes feature |
| **P2** | Backend + Multi-User | Supabase, Google SSO, RLS, Realtime on TODOs, Web Push, .ics export, PWA offline sync |
| **P3** | TODO Logger UX | Full TODOs view + Today's TODOs card + History integration + assignment |
| **P4** | Polish | A11y polish, AI assistant flag-on, optional native shell, calendar two-way |
| **P5** | shared-services Repo | Spin out `~/PROJECTS/shared-services/prayer-times` (consumed by HT and journal); evaluate other extracted services |

### P0 close-out checklist (the active work)
See [_workspace/plan/phase-0-refactor-handoff.md](_workspace/plan/phase-0-refactor-handoff.md). Per decision #13, **B10 lands a single `v_legacy → v3` migration** (no separate B10.5/B13.5; v1/v2 collapsed). PWA dropped from P0 (decision #22).

### P1 work breakdown (canonical, capability-spine ordering — decision #17)
- **P1.A — Storage & repository layer.** `StorageAdapter`, `LibraryRepo<T>`, `AuditFields` decorator, user-scoped selectors. No UI.
- **P1.B — Theme tokens + MD3 primitives.** Tokens.css from § 3.5; primitives: Card, Chip, Button (5 variants), IconButton, Switch, Checkbox, Radio, Slider, ProgressRing, ProgressBar, TextField, BottomSheet, Modal, Snackbar, Toast, Avatar, Badge, NavRail, TopAppBar, FAB, Skeleton, EmptyState, Alert, Tabs, Lists with leading/trailing slots, Date/time pickers.
- **P1.C — App shell + routing + Profile/Settings shells.** Adaptive nav (BottomNav / NavRail / SideDrawer); 7 canonical routes mounted; `/profile` and `/settings` shells empty but routable; `<DateSelector>` honors ±1-week boundary.
- **P1.D — Profile editor + library editors.** Profile editor (every `ProfileFields` field); 7 `<LibraryView<T>>` sub-routes (`/food/library`, `/workouts/{programs,routines,exercises}`, `/cannabis/{products,devices}`, `/profile/{work-locations,fasting-safe,sweet-tooth}`); Beachbody seed for workout programs.
- **P1.E — Today panels.** Profile banner (calorie ring) → Spirituality → Workout → Cannabis → Food → Sweet Tooth (independent, decision #21) → Working from. Single-open accordion invariant tested.
- **P1.F — DayClose + History + continuous evals + PWA.** Dynamic snapshot (freezes every slice the store currently exposes); `<HistoryView>` reuses Today components read-only outside ±1 week; ANT-091 eval suite wired into CI; PWA shell + manifest land here once.
- ui-reviewer signs off via `/md3-review` at every STOP.

## 17 · Definition of Done (per phase)

Every phase closes only when **all four** are true:

1. All `⬜` commits in the phase handoff are `✅` or `WONT-FIX`.
2. `/audit` returns zero P0/P1 findings.
3. Sweep catalogue is empty or fully WONT-FIX.
4. User signs off on UX hands-on.

P1 adds: `/md3-review` returns clean.

## 18 · Non-Negotiable Rules (HT-CORE)

Defined in [reference/governance/ht-core-rules.yaml](reference/governance/ht-core-rules.yaml). All 10 in force at all times.

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

- **Start every conversation** by reading this file + `framework.md` Cold Start Protocol + the active handoff in `_workspace/plan/`.
- **Architect commits** update Sections 1–18 of this document.
- **Executor commits** never modify this document — they consume it.
- **When in doubt**, this document overrides earlier scattered design notes.

---

*This document supersedes all prior ad-hoc design discussions. If you find a contradiction between this document and a `reference/*.md` file, file a debt entry and route to the architect via `/plan`.*
