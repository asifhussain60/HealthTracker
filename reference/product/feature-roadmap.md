# HealthTracker — Feature Roadmap (product framing)

**Status:** active · **Owner:** architect · **Last updated:** 2026-05-04 (reconciled with program-roadmap.md; superseded the legacy 4-phase scheme).

> **This document is the product framing of the roadmap.** The canonical execution authority — universal phase shape, 7-commit close-out recipe, refactor + cleanup cadence, full commit maps — is `_workspace/plan/program-roadmap.md`. When the two disagree, `program-roadmap.md` wins. This file's job is to communicate *user-facing themes* and *gating user value* per phase; not to enumerate commits.

The legacy 4-phase scheme (P0..P4 with P1 = "Cannabis Redesign + Meals") was retired 2026-05-03 and replaced by the 6-phase scheme below.

---

## 6-phase roadmap

| Phase | Theme (user-facing) | Gate to next |
|---|---|---|
| **P0** | Refactor + scaffolding (no user-visible change) | Auditor + challenger PASS; sweep catalogue empty; tag `phase-0-complete` |
| **P1** | SPA build — local-first, planner-first | All 16 routes work; `/plan` is canonical entry; report-dimension matrix delivered; Lighthouse ≥ 90; tag `phase-1-complete` |
| **P2** | Backend swap — Supabase + Google SSO + multi-user | Zero data loss across LS→Supabase migration; multi-user works; RLS prevents cross-user reads; offline edits sync deterministically; tag `phase-2-complete` |
| **P3** | TODOs + assignment + collaboration | Todo lifecycle works for self-assigned and delegated; notifications deliver; delegation history append-only; tag `phase-3-complete` |
| **P4** | Shared services + LLM | Prayer-times live; HealthData adapters auto-import; Assistant produces daily summaries; degradation tested; tag `phase-4-complete` |
| **P5** | Production hardening + analytics | Zero `[OPEN]` debt; security review passed; full export/import works; `program-v1` tag pushed; post-mortem written |

Each phase ends with a mandatory close-out sub-phase (7 commits) per `program-roadmap.md` § 1. Build sub-phase completion alone does **not** close a phase.

---

## Phase 0 — Refactor + scaffolding (active)

Lift the legacy SPA onto the architecture-of-record (slices, calculators, selectors, repositories, audit fields, schemaVersion) without changing any user-facing behavior.

**Build sub-phases (active):**
- Sub-phase A — Governance scaffold (✅ shipped 2026-05-03)
- Sub-phase B — Code refactor (in progress; B1–B5 ✅ as of 2026-05-04)
- Sub-phase C — Component decomposition

**Close-out sub-phase D** — 7-commit close-out per `program-roadmap.md` § 1.

**User-visible deliverable:** none (architecture-only).

---

## Phase 1 — SPA build (local-first, planner-first)

Ship the full HealthTracker SPA on localStorage with planner-first framing, library editors for nine domains, day-close with versioned snapshots, and a PWA shell.

**Build sub-phases:** A (generic library layer) · B (MD3 primitives) · C (app shell + 16 routes) · D (profile + 9 library editors + planner) · E (Today panels) · F (DayClose + history + PWA + evals).

**Close-out sub-phase G** — 7-commit close-out, specialized to strip food-stub views (B4 transitional code), delete `store.legacy.js`, axe-core sweep, perf re-baseline against the LCP/INP/CLS/bundle budget (decision #23).

**User-visible deliverable:** the planner-first SPA — installable PWA, 16 routes, full Today + History + Settings + 9 library editors + `/plan` route.

---

## Phase 2 — Backend swap (Supabase + auth + multi-user)

Swap localStorage for Supabase behind the existing `StorageAdapter` interface; add Google SSO; enable multi-user with assignment scaffolding for Phase 3 todos.

**Build sub-phases:** A (Postgres schema + RLS + pgcrypto) · B (Auth + repository swap behind feature flag, dual-write canary) · C (RLS + multi-user UX + assignment scaffolding) · D (offline sync via PWA service worker upgrade).

**User-visible deliverable:** sign-in with Google, two devices stay in sync, offline edits reconcile on reconnect.

---

## Phase 3 — TODOs + assignment + collaboration

Activate the Todo schema scaffolded in Phase 0; add assignment UX, notifications, and a delegation-history view.

**Build sub-phases:** A (todo schema activation + lifecycle) · B (assignment UX) · C (notifications + delegation history).

**User-visible deliverable:** todo list works for self-assigned and delegated todos, with web-push notifications and a per-todo delegation timeline.

---

## Phase 4 — Shared services + LLM

Integrate real prayer-times (replaces P1 stub), HealthData adapters (Apple Health / Google Fit), and the Assistant adapter (LLM coaching, daily summaries, behavior correlations).

**Build sub-phases:** A (prayer-times real service) · B (HealthData adapters) · C (Assistant adapter on Claude API with prompt caching).

**User-visible deliverable:** prayer-times accurate to user's location; weight/steps/sleep auto-imported from device platform; daily LLM-generated summary card on the dashboard.

---

## Phase 5 — Production hardening + analytics

Make HealthTracker production-ready: telemetry, security audit, export/import maturity, and a final hardening pass that retires every remaining scaffold.

**Build sub-phases:** A (opt-in telemetry + cohort metrics, zero PII) · B (perf re-baseline against P1 budget) · C (security + privacy audit) · D (export/import maturity, including LLM journal summaries).

**Close-out sub-phase E** — Program close-out: full audit, retire ALL scaffolds, `git tag program-v1`, post-mortem written.

**User-visible deliverable:** export/import works for the entire user dataset, security review passed, app ready for general availability.

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
