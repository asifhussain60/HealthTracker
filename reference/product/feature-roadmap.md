# HealthTracker — Feature Roadmap (product framing)

**Status:** active · **Owner:** architect · **Last updated:** 2026-05-04 (solo-user scope locked; multi-user / sharing / assignment removed from P2 + P3).

> **Scope:** solo-user. Multi-user / sharing / assignment is explicitly out of scope as of 2026-05-04. See `_workspace/plan/program-roadmap.md` § 0.5 for the authoritative scope statement.

> **This document is the product framing of the roadmap.** The canonical execution authority — universal phase shape, 7-commit close-out recipe, refactor + cleanup cadence, full commit maps — is `_workspace/plan/program-roadmap.md`. When the two disagree, `program-roadmap.md` wins. This file's job is to communicate *user-facing themes* and *gating user value* per phase; not to enumerate commits.

The legacy 4-phase scheme (P0..P4 with P1 = "Cannabis Redesign + Meals") was retired 2026-05-03 and replaced by the 6-phase scheme below.

---

## 6-phase roadmap

| Phase | Theme (user-facing) | Gate to next |
|---|---|---|
| **P0** | Refactor + scaffolding (no user-visible change) | Auditor + challenger PASS; sweep catalogue empty; tag `phase-0-complete` |
| **P1** | SPA build — local-first, planner-first | All 16 routes work; `/plan` is canonical entry; report-dimension matrix delivered; Lighthouse ≥ 90; tag `phase-1-complete` |
| **P2** | Cloud backup + multi-device sync (still solo) | Zero data loss across LS→Supabase migration; same user signed in on phone + desktop converges; offline edits sync deterministically; tag `phase-2-complete` |
| **P3** | TODO UX (single-user) | Solo todo lifecycle works (open/done/snoozed); recurrence creates the next instance; opt-in self-reminders deliver; tag `phase-3-complete` |
| **P4** | Shared services + LLM | Prayer-times live; HealthData adapters auto-import; Assistant produces daily summaries; degradation tested; tag `phase-4-complete` |
| **P5** | Production hardening + analytics | Zero `[OPEN]` debt; security review passed; full export/import works; `program-v1` tag pushed; post-mortem written |

Each phase ends with a mandatory close-out sub-phase (7 commits) per `program-roadmap.md` § 1. Build sub-phase completion alone does **not** close a phase.

---

## Phase 0 — Refactor + scaffolding (close-out in progress)

Lift the legacy SPA onto the architecture-of-record (slices, calculators, selectors, repositories, audit fields, schemaVersion) without changing any user-facing behavior.

**Build sub-phases (all ✅ as of 2026-05-04):**
- Sub-phase A — Governance scaffold (✅ 2026-05-03; framework + agents + skills)
- Sub-phase B — Code refactor (✅ 2026-05-04; B1–B12, B15 — slice split, calculators, selectors, StorageAdapter, repos, single forward migration v_legacy → v3, preflight script, adapter stubs. B13 + B14 retired per the DoR convergence rewrite.)
- Sub-phase C — Component decomposition (✅ 2026-05-04; C1–C8 — 8 primitives, TodayView card decomposition, route registry, MealsView/TodosView shells, CannabisProductScorecard extraction.)

**Close-out sub-phase D — 7-commit close-out per `program-roadmap.md` § 1 (in progress).** Commits: D1 refactor (✅), D3 debt resolution (✅), D4 sweep close (✅), D5 audit + challenge (✅), D6 doc sync (this commit), D7a perf baseline, D7b tag + handoff. D2 retired (Phase 1 master plan already exists).

**User-visible deliverable:** none (architecture-only). 605 tests across 54 test files; preflight clean; bundle 196.85 KB gz.

---

## Phase 1 — SPA build (local-first, planner-first)

Ship the full HealthTracker SPA on localStorage with planner-first framing, library editors for nine domains, day-close with versioned snapshots, and a PWA shell.

**Build sub-phases:** A (generic library layer) · B (MD3 primitives) · C (app shell + 16 routes) · D (profile + 9 library editors + planner) · E (Today panels) · F (DayClose + history + PWA + evals).

**Close-out sub-phase G** — 7-commit close-out, specialized to strip food-stub views (B4 transitional code), delete `store.legacy.js`, axe-core sweep, perf re-baseline against the LCP/INP/CLS/bundle budget (decision #23).

**User-visible deliverable:** the planner-first SPA — installable PWA, 16 routes, full Today + History + Settings + 9 library editors + `/plan` route.

---

## Phase 2 — Cloud backup + multi-device sync (still solo)

*(rescoped 2026-05-04 — solo-user scope)* Swap localStorage for an optional cloud-backed `StorageAdapter` so the same single user can use HealthTracker across their devices. No multi-user, no Google SSO, no RLS, no assignment. Auth is a long-lived device key issued at first install — no interactive sign-in flow.

**Build sub-phases:** A (cloud schema mirror, pgcrypto envelope retained) · B (`StorageAdapter` swap behind a feature flag with dual-write canary) · C (multi-device offline sync via PWA service worker upgrade, last-write-wins).

**User-visible deliverable:** the same user signed in across phone + desktop sees converged data, with offline edits reconciling on reconnect.

---

## Phase 3 — TODO UX (single-user)

*(rescoped 2026-05-04 — solo-user scope)* Activate the Todo schema scaffolded in Phase 0 as a personal TODO list. No assignment, no delegation, no notifications-for-others.

**Build sub-phases:** A (todo schema activation + lifecycle: open/done/snoozed) · B (recurrence engine + snooze handler) · C (optional self-reminders via web push).

**User-visible deliverable:** solo todo list with recurrence, snooze, due dates, optional self-reminders.

---

## Phase 4 — Shared services + LLM

Integrate real prayer-times (replaces P1 stub), HealthData adapters (Apple Health / Google Fit), and the Assistant adapter (LLM coaching, daily summaries, behavior correlations).

**Build sub-phases:** A (prayer-times real service) · B (HealthData adapters) · C (Assistant adapter on Claude API with prompt caching).

**User-visible deliverable:** prayer-times accurate to user's location; weight/steps/sleep auto-imported from device platform; daily LLM-generated summary card on the dashboard.

---

## Phase 5 — Production hardening + analytics

*(rescoped 2026-05-04 — solo-user scope)* Make HealthTracker production-ready for the single user: opt-in telemetry, device-local data review, export/import maturity, and a final hardening pass that retires every remaining scaffold. The original "external multi-user security audit" framing is dropped — there is no multi-user surface to attack.

**Build sub-phases:** A (opt-in telemetry + cohort metrics, zero PII) · B (perf re-baseline against P1 budget) · C (device-local data review + export/import maturity) · D (export bundle hardening, including LLM journal summaries).

**Close-out sub-phase E** — Program close-out: full audit, retire ALL scaffolds, `git tag program-v1`, post-mortem written.

**User-visible deliverable:** export/import works for the entire user dataset, device-local data review passed, app ready for daily personal use.

---

## Cross-references

| Concern | Authoritative file |
|---|---|
| Active phase's commit map | `_workspace/plan/phase-{N}-*.md` |
| Universal phase shape + 7-commit close-out recipe | `_workspace/plan/program-roadmap.md` § 1 |
| Close-out skill (operationalizes the recipe) | `.claude/skills/ht-close-out/SKILL.md` |
| Locked design decisions | `DESIGN-REQUIREMENTS.md` § 2 |
| Data model | `reference/architecture/data-model.md` |
| Architecture | `reference/architecture/architecture.md` |
| Privacy + encryption envelope | `reference/product/privacy.md` |
| Governance contract | `framework.md` |
| HT-CORE rules | `reference/governance/ht-core-rules.yaml` |
