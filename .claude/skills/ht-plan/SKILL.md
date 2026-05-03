---
name: ht-plan
description: Phase planning + commit-map maintenance. Loaded by planner.agent.md.
---

# ht-plan — Phase Planning

Operationalizes the planning workflow per [`reference/phase-template.yaml`](../../../reference/phase-template.yaml).

## Creating a phase plan

1. Copy the template structure from [`phase-template.yaml`](../../../reference/phase-template.yaml).
2. Use markdown for human-read plans (`.md`); YAML for purely machine-consumed plans.
3. Save to `_workspace/ideas/<phase-id>-execution-plan.md`.
4. Hand to `architect` for DoR scoring.

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

Active commit maps live in `_workspace/handoffs/<phase-id>-handoff.md`. Status icons:

| Icon | Meaning |
|---|---|
| ⬜ | pending |
| 🔄 | in progress |
| ✅ | done |
| 🟥 | blocked |
| ⬛ | wont-fix |

When `executor` finishes a commit, `planner` updates the icon. When the user crosses a 🛑 STOP, `planner` advances.

## Closing a phase

1. All commits `✅` or `⬛`.
2. `auditor` reports zero P0/P1.
3. `_workspace/scratch/sweep-catalogue.md` has zero OPEN.
4. Move plan to `_workspace/archive/` with forward-pointer.
5. Status: `active` → `executed`.
6. Create next phase's handoff with cold-start protocol + new commit map.
