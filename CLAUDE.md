# HealthTracker — Claude Code Instructions

You are Claude Code working on the HealthTracker repo.

## Read first, every conversation

0. `DESIGN-REQUIREMENTS.md` — canonical north-star (MD3 spec, locked decisions, unified Library Pattern, phase plan).
1. `framework.md` — governance contract, agent registry, file ownership.
2. `reference/governance/ht-core-rules.yaml` — the 10 non-negotiable HT-CORE rules.
3. `_workspace/plan/program-roadmap.md` — universal phase shape, refactor + cleanup cadence, 6-phase roadmap.
4. `_workspace/plan/` — newest handoff is the active commit map; first `⬜` is the next task.

Agents: `.claude/agents/` (Anthropic format). Skills: `.claude/skills/<name>/SKILL.md`. Legacy `.github/agents/` removed 2026-05-03.

## Singular entry point

`/healthtracker [intent]` is the one command for everything; it routes via `reference/governance/intent-routing.yaml`. Do not invoke specialists directly unless the user names one.

| Intent | Command |
|---|---|
| Implement / fix / refactor | `/healthtracker {intent} {description}` |
| Audit / plan / challenge / exec-next / plan-status / sync-guidelines | `/{name}` |

## Cold Start Protocol

Run at the start of every conversation:

```bash
git log --oneline -10
git branch --show-current
ls _workspace/plan/
```

Then output:

```
📍 State:
  Branch: <branch>
  Last commit: <hash> — <message>
  Active handoff: <newest file in _workspace/plan/>
  Next task: <first ⬜ in that handoff's commit map>
  Pending STOP: <yes/no — which phase>
```

Only proceed after the user confirms.

## Non-negotiable rules

The 10 HT-CORE rules live in `reference/governance/ht-core-rules.yaml`. Highlights: HT-CORE-001 Architecture-First, HT-CORE-002 Tests-First, HT-CORE-007 No Fabricated Evidence, HT-CORE-008 Audit-Field Discipline, HT-CORE-009 Schema-Versioned Persistence. Read the YAML; do not paraphrase from memory.

## DoR Hard Gate (before IMPLEMENT/FIX/PLAN)

Score must reach 100/100. Rubric in `framework.md` and `reference/governance/governance-gates.yaml`. Below 100 → blocked. Always allow QUERY/AUDIT/DEBUG.

## End-state contract

Every response ends with exactly one of:

```
### ⚡ If you say proceed, I will:
1. ...
```
or
```
✅ All work is complete.
```

Never both. Never neither.

## TDD discipline (HT-CORE-002)

For every IMPLEMENT/FIX:

1. **RED** — write failing test first; verify it fails with the expected error.
2. **GREEN** — minimal code to pass; no `--ignore`, no skips.
3. **REFACTOR** — clean while keeping tests green.

Never claim a test passes without verified stdout (HT-CORE-007).

## File ownership and sweep completeness

See `framework.md` § File ownership and write rules. Most relevant: `framework.md` + `reference/*` owned by `architect`; `app/src/**` owned by `executor` under TDD; `_workspace/scratch/observed-debt.md` is append-only via `debt-logger`. Every FIX/REFACTOR opens a SweepCatalogue (`_workspace/scratch/sweep-catalogue.md`) that BLOCKS completion until empty or every item is `WONT-FIX` with rationale (HT-CORE-005).

## Audit trail (AC markers)

Every commit and every entry in `_workspace/scratch/audit-trail.md` uses paired `AC_START` / `AC_COMPLETE` markers with format `AC-PHASE-COMMIT` (e.g., `AC-P0-D6`). The commit-msg hook blocks orphan `AC_START`.

## When to stop and ask

- Truly ambiguous work where the wrong choice is destructive.
- Canonical file writes that contradict the file-ownership table.
- DoR Hard Gate score below 100 for an IMPLEMENT/FIX/PLAN.
- A phase boundary 🛑 STOP requiring user verification.

Otherwise: make grounded best-effort decisions and keep moving.

## What this app is becoming

Solo-user PWA on localStorage. Optional cloud-backup-and-multi-device-sync (Supabase, same single user, phone + desktop) is the only Phase 2 motion; multi-user / assignment / external auth are out of scope (locked 2026-05-04 — see `_workspace/plan/program-roadmap.md` § 0.5). Audit fields + schemaVersion stay; `AuthContext` is collapsed to `CURRENT_USER_ID = 'me'` at `app/src/data/auth/currentUser.js`. See `reference/product/feature-roadmap.md`.
