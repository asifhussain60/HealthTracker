---
name: ht-close-out
description: Mandatory 7-commit close-out recipe for every HealthTracker phase. Load manually after the build-phase 🛑 STOP and explicit user `proceed`. Owner agent rotates per commit (architect / debt-logger / challenger / auditor / executor / planner).
---

# ht-close-out — The mandatory 7-commit phase close-out

This skill operationalizes `_workspace/plan/program-roadmap.md` § 1. Every phase, P0 through P5, has a close-out sub-phase. Skipping or shortening close-out is an HT-CORE-004 (Holistic Validation Gate) violation and the single most reliable path to compounding tech debt.

A phase is **not done** when its build sub-phases are ⬜→✅. A phase is done when its close-out sub-phase ships all seven commits.

---

## When to load this skill

This skill loads **manually**, not automatically. The harness has no machine-checkable way to detect "all build sub-phases ✅" since that state lives in markdown checkboxes, not code. Loading is the planner's responsibility.

Load when **all** of the following are true:

1. The current phase's build sub-phases are ✅ (every ⬜ closed except retired ⬛) — verify by reading the phase's master plan.
2. The phase has a close-out sub-phase already enumerated in its master plan with seven commits referencing the recipe below.
3. The user has issued `proceed` after the build-phase 🛑 STOP.

Do NOT load while build sub-phases are still ⬜ — this skill is for closing, not building.

---

## The 7-commit recipe (mandatory order)

| # | Commit | Owner | Output | Gate |
|---|---|---|---|---|
| 1 | **Refactor pass** — strip scaffolds (ANT-089), dedupe primitives/selectors/types, simplify call paths, remove backwards-compat shims | architect | clean diff against the phase's start commit; zero `// TODO: remove in P{N+1}` markers | `npm run preflight` clean; bundle delta ≤ 0 |
| 2 | **Debt resolution** — every `[OPEN]` entry in `_workspace/scratch/observed-debt.md` whose deadline ≤ phase-N closed (with resolution note) or escalated to phase-N+1 (with rationale + new deadline) | debt-logger | debt-log delta committed; escalations logged in audit-trail | zero `[OPEN]` entries with deadline ≤ phase-N remain |
| 3 | **Sweep-catalogue final review** — `_workspace/scratch/sweep-catalogue.md` empty or every item explicitly `WONT-FIX` with rationale | challenger | catalogue closed | HT-CORE-005 |
| 4 | **/audit + /challenge full sweep** — both PASS at the phase boundary | auditor + challenger | sweep PASS notes pasted into `audit-trail.md` | both agents return PASS |
| 5 | **Doc sync** — verify `framework.md`, `CLAUDE.md`, `reference/architecture/data-model.md`, `reference/architecture/architecture.md`, `DESIGN-REQUIREMENTS.md`, `reference/product/feature-roadmap.md` describe what the code actually does | architect | doc commit + checklist showing each canonical file was opened, scanned, and either confirmed or amended | reviewer (different agent) confirms no stale references |
| 6 | **Perf + bundle re-baseline** — run the phase's perf budget; record to `_workspace/scratch/perf-baselines.md` § Phase N | executor | benchmark output committed | bundle ≤ phase budget; cold LCP < 1.8s; INP < 200ms; CLS < 0.05 (or phase-specific budget) |
| 7 | **Tag + archive + handoff** — `git tag phase-N-complete`, archive `_workspace/plan/phase-N-*.md` to `_workspace/archive/phase-N/`, draft `_workspace/plan/phase-{N+1}-master-plan.md` with PF list seeded | planner | tag exists; handoff archived; new master plan committed | next-phase DoR document exists with PF-1..PF-N items |

---

## Reviewer rotation (ANT-088 application)

ANT-088 mandates that every commit's diff is reviewed by a *different* sub-agent than the author. Within close-out the rotation is partial:

| Commit | Author | Reviewer |
|---|---|---|
| 1 — Refactor pass | architect | **executor** reviews (must run `npm run preflight` and confirm bundle delta ≤ 0; the gate criterion makes this an *automated* second-agent check) |
| 2 — Debt resolution | debt-logger | **architect** reviews (any escalation > 30% blocks; architect's responsibility to surface) |
| 3 — Sweep-catalogue final review | challenger | **self-certifies** — the challenger's job *is* the review; rotating again would just reproduce the role |
| 4 — /audit + /challenge | auditor + challenger | **dual-author rotation already satisfies ANT-088** — auditor reviews challenger's findings and vice-versa |
| 5 — Doc sync | architect | **auditor or challenger** reviews (named explicitly so the canonical-files scan gets a second pair of eyes; reviewer must confirm each canonical file was opened, not just summarized) |
| 6 — Perf re-baseline | executor | **self-certifies** — gate criteria are quantitative (bundle KB, LCP ms, etc.); reviewer rotation adds no information beyond re-running the numbers |
| 7 — Tag + archive + handoff | planner | **architect** reviews (verifies the next-phase DoR section is realistic before the tag is pushed) |

Self-certifying commits (3, 6) are explicitly so noted in the per-commit checklist — they do not silently skip reviewer rotation; they explicitly opt out with rationale.

## Per-commit checklists

### Commit 1 — Refactor pass

Owner: **architect**.

```
☐ Scan the phase's full diff (`git diff <phase-start-tag>..HEAD -- app/src/`)
☐ Identify every scaffold: feature flags, transitional files, stub functions, "// TODO: remove in P{N+1}" markers
☐ For each scaffold: confirm whether the conditions for removal are met (the dependent feature has shipped) and remove if so
☐ Dedupe: search for repeated primitives, selectors, type literals; collapse to a single source
☐ Simplify: any 3+ similar code paths that could be a single parameterized function? Apply.
☐ Remove backwards-compat shims that the phase introduced and now no longer needs
☐ `npm --prefix app run preflight` — must exit 0
☐ Bundle delta ≤ 0 vs phase-start (refactor must not GROW the bundle)
☐ AC marker: AC-P{N}-CLOSEOUT-1
```

If a scaffold cannot be removed, file a debt entry with hard deadline ≤ phase N+1 and document why it must persist. **Do not** leave the marker in code without a corresponding debt entry.

### Commit 2 — Debt resolution

Owner: **debt-logger** (delegates to architect/executor for individual fixes).

```
☐ Read `_workspace/scratch/observed-debt.md` end-to-end
☐ For each [OPEN] entry whose deadline ≤ phase-N:
    - Option A: close with a "Resolution: ..." line citing the commit/PR that fixed it
    - Option B: escalate — change deadline to ≤ phase-N+1, add rationale, log to audit-trail
☐ Confirm zero [OPEN] entries with deadline ≤ phase-N remain (grep for the deadline string)
☐ AC marker: AC-P{N}-CLOSEOUT-2
```

Escalation is allowed but must be rare and justified. If more than 30% of `[OPEN]` entries get escalated, that is a phase-shape problem — flag to the user before continuing.

### Commit 3 — Sweep-catalogue final review

Owner: **challenger**.

```
☐ Read `_workspace/scratch/sweep-catalogue.md` end-to-end
☐ Every entry must be either resolved (with resolution note) or marked WONT-FIX with rationale
☐ HT-CORE-005 — sweep cannot be deferred
☐ AC marker: AC-P{N}-CLOSEOUT-3
```

### Commit 4 — /audit + /challenge full sweep

Owner: **auditor + challenger** (run sequentially, capture both outputs).

```
☐ Run /audit (4-pass: Structure → Code → Architecture → Brittleness)
☐ Run /challenge (10 HT-CORE rules)
☐ Both must PASS — any High or Critical finding blocks close-out
☐ Paste both reports into _workspace/scratch/audit-trail.md
☐ AC marker: AC-P{N}-CLOSEOUT-4
```

If either fails: do NOT proceed to commit 5. Fix the underlying issue (which may mean reopening commits 1–3) and re-run.

### Commit 5 — Doc sync

Owner: **architect**.

Open and review each canonical file. Use this checklist verbatim:

```
☐ framework.md — agent registry, ownership table, governance contract still accurate?
☐ CLAUDE.md — ≤ 100 lines (PF-2 invariant); read-first list current; routing rules still match
☐ reference/architecture/data-model.md — every slice/type that landed in P{N} is documented; cross-refs intact
☐ reference/architecture/architecture.md — service tier, slice ownership, dependency rules match impl
☐ reference/architecture/test-strategy.md — covers any new test categories introduced this phase
☐ reference/governance/ht-core-rules.yaml — any rule that needed clarification?
☐ reference/governance/anthropic-guidelines.yaml — last sync date current?
☐ DESIGN-REQUIREMENTS.md — locked decisions still all honored; any post-impl revisions reflected
☐ reference/product/feature-roadmap.md — phase N marked done; phase N+1 framing still accurate
☐ AC marker: AC-P{N}-CLOSEOUT-5
```

The reviewer for this commit is a *different* agent than the author (ANT-088). Auditor or challenger is a good fit.

### Commit 6 — Perf + bundle re-baseline

Owner: **executor**.

```
☐ Run `npm --prefix app run preflight` bundle-budget step
☐ Run Lighthouse on a production build (where applicable; P0 has no UI surface so skip Lighthouse and record bundle only)
☐ Record results to _workspace/scratch/perf-baselines.md under "## Phase N"
☐ Confirm: bundle ≤ phase budget; LCP < 1.8s; INP < 200ms; CLS < 0.05 (skip the Lighthouse vitals for non-UI phases)
☐ Any regression vs phase-start → fix before commit 7 (no carrying perf debt forward)
☐ AC marker: AC-P{N}-CLOSEOUT-6
```

### Commit 7 — Tag + archive + handoff

Owner: **planner**.

```
☐ git tag phase-{N}-complete
☐ Move _workspace/plan/phase-{N}-*.md to _workspace/archive/phase-{N}/ (preserve filenames)
☐ Draft _workspace/plan/phase-{N+1}-master-plan.md:
    - Theme + sub-phase outline (from program-roadmap.md § 4)
    - PF list seeded from:
        a) Phase-N escalations (debt entries that moved deadlines forward)
        b) Open questions that surfaced during phase-N close-out
        c) New blockers discovered in commit 4 (audit/challenge findings deferred to N+1)
    - Universal phase shape header (4 stages from program-roadmap.md § 0)
    - 7-commit close-out table for sub-phase {final} (specialized for N+1 deltas)
☐ Confirm: tag exists, handoff archived, new master plan committed, PF list enumerates owners
☐ AC marker: AC-P{N}-CLOSEOUT-7
```

After commit 7, post `🛑 STOP — Phase N complete; tag pushed; Phase N+1 master plan drafted` and wait for user `proceed` before unloading this skill.

---

## When close-out blocks

Common blockers and the right response:

| Symptom | Don't | Do |
|---|---|---|
| Audit (commit 4) returns PASS-with-Mediums | Defer the Mediums to N+1 | Fix in place. Mediums become Highs in subsequent phases when accumulation hits a threshold. |
| Bundle re-baseline (commit 6) shows regression | "It's a few KB, ship it" | Fix. Phase budgets are non-negotiable per program-roadmap. |
| 30%+ debt entries need escalation (commit 2) | Escalate them anyway | Stop close-out. Surface to the user that the phase had under-counted scope. |
| Doc sync (commit 5) finds drift in 5+ canonical files | Fix the drift in this single commit | Split into two commits (5a, 5b) — but DO NOT skip files. |
| Refactor (commit 1) grows the bundle | Accept the regression | Identify which scaffold-removal regressed it; usually means a primitive was inlined into the scaffold. Re-extract to its own module. |

---

## What this skill does NOT do

- It does not write *new* features. Close-out is hardening, not building. Any new feature impulse during close-out is a phase-N+1 concern — file as `[OPEN]` debt and proceed.
- It does not skip steps. The seven commits are mandatory in order. If commit 1 (refactor) reveals that commit 2 (debt) needs rework, stop and re-do commit 1 — don't commingle.
- It does not run in parallel. One agent owns one commit at a time. Parallelizing close-out commits has historically introduced cross-cutting bugs that the audit (commit 4) misses.

---

## Cross-references

| Concern | File |
|---|---|
| Program-level shape | `_workspace/plan/program-roadmap.md` |
| Active phase's master plan | `_workspace/plan/phase-{N}-*.md` |
| Debt log | `_workspace/scratch/observed-debt.md` |
| Sweep catalogue | `_workspace/scratch/sweep-catalogue.md` |
| Audit trail | `_workspace/scratch/audit-trail.md` |
| Perf baselines | `_workspace/scratch/perf-baselines.md` |
| HT-CORE rules | `reference/governance/ht-core-rules.yaml` |
| Anthropic guidelines (ANT-088, ANT-089, ANT-091) | `reference/governance/anthropic-guidelines.yaml` |
