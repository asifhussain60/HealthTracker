---
name: ht-plan
description: Phase planning + commit-map maintenance. Loaded by the planner agent. Pairs with ht-close-out (the planner loads ht-close-out after the build-phase STOP).
---

# ht-plan — Phase Planning

Operationalizes the planning workflow per [`reference/governance/phase-template.yaml`](../../../reference/governance/phase-template.yaml). The program-level shape (universal phase anatomy + 7-commit close-out recipe) is defined in [`_workspace/plan/program-roadmap.md`](../../../_workspace/plan/program-roadmap.md) — every new phase plan must conform to that shape.

## Creating a phase plan

1. Copy the template structure from [`phase-template.yaml`](../../../reference/governance/phase-template.yaml).
2. Use markdown for human-read plans (`.md`); YAML for purely machine-consumed plans.
3. Save to `_workspace/plan/phase-<N>-master-plan.md` (or `phase-<N>-<slug>-handoff.md` for sub-phase scope).
4. The plan MUST include:
   - PF (pre-flight) section enumerating blockers + decisions to lock
   - Build sub-phases (A..N) with commit maps
   - **Final close-out sub-phase** referencing program-roadmap.md § 1's 7-commit recipe (specialization-only; do not duplicate the recipe table — HT-CORE-003)
5. Hand to `architect` for DoR scoring.

## Plan sections (required)

```markdown
# Phase NN — <title>

**Status:** draft | active | executed | superseded
**Priority:** P0 | P1 | P2
**Created:** YYYY-MM-DD

## Vision
## Non-goals
## Problem statement
## Decisions (DoR-locked)
## Acceptance criteria
## Risks
## Architecture impact
## Test strategy
## Enforcement gates
## Sub-phases & commit map [in handoff]
```

## DoR scoring (must hit 100/100)

| Element | Points | Check |
|---|---|---|
| Vision + non-goals | 20 | Present, ≥2 non-goals |
| Decisions table | 20 | D1..Dn each with rejected alternatives |
| Acceptance criteria | 15 | Verifiable predicate per AC |
| Risks + mitigations | 10 | ≥3 with mitigation |
| Test strategy | 15 | Failing-test names, regression risks, coverage tier |
| Architecture impact | 10 | Affected modules + contracts |
| Backward compat | 10 | Preserved with proof OR breaking flagged |

Below 100 → BLOCK; loop with user.

## Commit-map maintenance

Active commit maps live in `_workspace/plan/<phase-id>-handoff.md`. Status icons:

| Icon | Meaning |
|---|---|
| ⬜ | pending |
| 🔄 | in progress |
| ✅ | done |
| 🟥 | blocked |
| ⬛ | wont-fix |

When `executor` finishes a commit, `planner` updates the icon. When the user crosses a 🛑 STOP, `planner` advances.

## Closing a phase

Closing a phase is **not** an ad-hoc planner activity. The planner loads the `ht-close-out` skill and runs the canonical 7-commit recipe (`_workspace/plan/program-roadmap.md` § 1). Sub-phase build completion alone does NOT close the phase — close-out commits 1-7 must all ship before the phase tag is pushed.

Quick prerequisites before loading ht-close-out:

1. All build sub-phase commits `✅` or `⬛` in the phase's master plan.
2. User has issued explicit `proceed` after the build-phase 🛑 STOP.

Then load `ht-close-out` and follow its 7-commit recipe (refactor → debt → sweep → audit/challenge → doc-sync → perf → tag+archive+next-phase-DoR).
