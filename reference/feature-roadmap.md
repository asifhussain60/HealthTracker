# HealthTracker — Feature Roadmap

**Status:** active · **Owner:** architect · **Last updated:** 2026-05-03

This is the high-level roadmap. Phase plans live in `_workspace/ideas/` and are the canonical execution authority.

## Phases at a glance

| Phase | Name | Scope | Gate to next |
|---|---|---|---|
| 0 | Refactor + Scaffolding | Governance scaffold, store split, primitives extraction, repository layer, audit fields, schemaVersion, PWA shell | All Phase-0 commits done; auditor reports zero P0/P1 |
| 1 | Cannabis Redesign + Meals | Rename to Cannabis; favorites; add-product; THC ring on Today; device chips; Meals view; weekly plan; CSV import | User-verified UI parity + new flows; sweep catalogue closed |
| 2 | Backend + Multi-User | Supabase; Google SSO; per-user data; TODO assignment; PWA realtime on todos; Web Push + email digest; .ics export; encrypted-at-rest | Production sign-off via /audit; security review pass |
| 3 | TODO Logger UX | Full UX design + implementation for TODOs view, Today TODOs card, History integration | User-verified UX parity; coverage maintained |
| 4 | Polish | A11y polish, AI assistant flag-on, HealthKit (if native shell), calendar two-way (if needed) | Continuous; no hard close |

## Phase 0 — Refactor + Scaffolding (current)

Deliverables:
- Governance scaffold (this work — Sub-phase A)
- Code refactor under `app/` (Sub-phase B): store split, calculators, selectors, adapter, auth, repos, audit fields, schemaVersion, migrations, feature flags, adapter stubs, PWA shell
- Component decomposition (Sub-phase C): primitives, card extraction, view-registry, TODOs scaffolding
- Phase 0 close-out (Sub-phase D)

Definition of Done:
- All commits in `_workspace/ideas/healthtracker-execution-plan.md` are `done` or `wont_fix`
- `/audit` reports zero P0/P1 findings
- App still passes a smoke test (Today renders, Cannabis renders, History renders, Profile renders)
- No behavior change end-user-visible

## Phase 1 — Cannabis Redesign + Meal Planner + Intermittent Fasting + Post-meal Walks

Cannabis:
- Rename "Inventory" → "Cannabis" in sidebar
- Redesigned product cards in `v2-card` style: form badge, THC%, est mg per dose, remaining ring, favorites stars, effect chips, risk badge, device chip
- "+ Add Product" with full schema form
- Default sort: favorites desc, then remaining desc
- Today gets a second cannabis ring: THC mg today / ceiling

Devices (light touch):
- Two seeded devices (Vessel Element, Session Goods Bong)
- Recommended-device computed by product `form`; rendered as small chip on product cards

Meals (planner-only — no daily nutrition tracking):
- New `Meals` sidebar entry between Today and History
- Two tabs: **Inventory**, **Weekly Plan**
- Inventory: meal cards with category badge, favorites, MyNetDiary deep-link, ingredients/prep, reference macros (informational), "+ Add Meal", CSV/JSON import drop-zone for MyNetDiary export. Includes a `'shake'` category for protein shakes.
- Weekly Plan: **7×4 grid** (Mon–Sun × Breakfast/Lunch/Dinner/Snack) with a flex `shakes[]` row per day. Auto-generator: variety + favorites + category constraint; no repeats within 3 days; favorites weighted; "Regenerate" + per-day "Lock". On-demand **"Build shopping list"** button aggregates ingredients across the week scaled by category plate weight.
- Each slot is **check-off-able** (mark eaten; capture `totalWeightWithPlate`) AND **drag-and-droppable** across days.
- MyNetDiary is the system of record for nutrition. HT stores reference macros per recipe (from MyNetDiary) + plate weights (from profile) and computes scaled macros at consumption time as a gut-check only.

Intermittent Fasting (Phase 1):
- Profile: `fastingProtocol.enabled` (default true), `windowStart` 14:00, `windowEnd` 18:00.
- Today gets a **Fasting card** showing live state ("FASTING" / "FEEDING"), window timer, hours since last meal, countdown to fast-break.
- Soft warning on Today when a meal is check-offed outside the feeding window. Data is recorded normally; window adherence shown as a metric.

Post-meal walks (Phase 1):
- `WorkoutLog.type` extends to include `'post-meal-walk'`; `precedingMealSlotId` links to the slot whose check-off triggered it.
- On meal check-off: passive "🚶 Walk recommended in 5 min" badge appears on Today's walks card. No PWA push (Phase 2).
- Today shows walks-today / meals-today count; default target 10 minutes, configurable in Profile.

Today view composition (post-Phase-1):
- Cannabis sessions ring + THC mg ring
- Workout / steps card
- Weight card
- **Planned-meals card** (4 slots + shakes row) with check-off and macro totals (collapsible)
- **Fasting card** (live state + timer)
- **Walks card** (post-meal walk reminders + count)
- TODOs card (placeholder Phase 0; UX in Phase 3)

Definition of Done:
- All Phase 1 commits done
- /audit clean
- User verifies redesigned cannabis flow, weekly plan generator + check-off + plate-weight scaling, fasting card, post-meal walk flow hands-on

## Phase 2 — Backend + Multi-User

Backend:
- Supabase project: Postgres + Auth (Google) + RLS + Realtime + Storage
- Schema mirrors `data-model.md`
- pgcrypto on sensitive columns

Sync:
- Local-first with background sync; last-write-wins per-field
- Realtime channel on `todos` table only

Auth:
- Google SSO; AuthContext hydrates from Supabase session
- 3 roles: owner / member / viewer
- TODO ACLs: creator + assignee can edit

Notifications:
- Web Push (opt-in) for assigned TODOs
- Email digest (opt-in)

Calendar:
- One-way `.ics` feed URL per user

Definition of Done:
- /audit fix passes; no P0/P1
- Security review (manual + automated): no plaintext secrets, RLS verified, encrypted columns confirmed
- PWA install + offline + sync verified on macOS Safari, macOS Chrome, Windows Chrome, Windows Edge

## Phase 3 — TODO Logger UX

UX (you'll design this with me when ready):
- TODOs view (Inbox / Today / Upcoming / Done)
- Today's "TODOs Today" card (overdue + due today + 3 priority)
- History "TODOs" section with completion-rate chart
- Quick-add from `QuickAddModal`
- Snooze: tomorrow / next week / pick date
- Recurrence templates that materialize per-day
- Assignment UI (uses Phase 2 capability)

Definition of Done:
- /audit clean
- User verifies UX flows hands-on

## Phase 4 — Polish

Continuous:
- A11y polish (focus traps, ARIA, color-blind safe)
- AI assistant flag-on (natural-language quick-add via Claude API; macro inference)
- HealthKit if/when a native shell is added (deferred indefinitely)
- Calendar two-way (if assigned tasks need bidirectional Google Calendar sync)

No hard close — Phase 4 is the steady-state improvement lane.

## Out of scope (for at least the next 12 months)

- React Native / Capacitor native app
- Family / household account model (use individual accounts + assignments instead)
- Wearables direct integration without a native shell
- Multi-region deployment
- Full HIPAA compliance (we're medical-adjacent, not under BAA)
