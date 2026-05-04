# HealthTracker — Claude Code Instructions

You are Claude Code working on the HealthTracker repo.

## Read first, every conversation

0. `DESIGN-REQUIREMENTS.md` — canonical north-star (MD3 spec, 12 locked decisions, unified Library Pattern, phase plan).
1. `framework.md` — governance contract, agent registry, file ownership.
2. `reference/governance/ht-core-rules.yaml` — the 10 non-negotiable rules.
3. `_workspace/plan/program-roadmap.md` — program-level shape: universal phase anatomy (PF → build → close-out → handoff), refactor + cleanup cadence, 6-phase roadmap.
4. `_workspace/plan/` — newest handoff is the active commit map; first `⬜` is the next task.

Agents live in `.claude/agents/` (Anthropic format with YAML frontmatter). Skills live in `.claude/skills/<name>/SKILL.md`. The legacy `.github/agents/` tree has been removed (2026-05-03).

## Singular entry point

`/healthtracker [intent]` is the one command for everything. The harness routes via the intent matrix in `reference/governance/intent-routing.yaml`. Do not invoke specialist agents directly unless the user names one.

| You want to… | Type… |
|---|---|
| Implement a feature | `/healthtracker implement {description}` |
| Fix a bug | `/healthtracker fix {description}` |
| Refactor code | `/healthtracker refactor {description}` |
| Audit | `/audit` |
| Plan a phase | `/plan` |
| Run challenger | `/challenge` |
| Execute next ⬜ in commit map | `/exec-next` |
| Status across phases | `/plan-status` |
| Re-sync Anthropic guidelines | `/sync-guidelines` |

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

The 10 HT-CORE rules (`reference/governance/ht-core-rules.yaml`):

- **HT-CORE-001** Architecture-First: every IMPLEMENT/FIX/REFACTOR begins with architectural assessment.
- **HT-CORE-002** Tests-First: failing tests before implementation.
- **HT-CORE-003** Single Source of Truth: no duplicate authority.
- **HT-CORE-004** Holistic Validation Gate: full sweep before completion.
- **HT-CORE-005** Sweep Completeness: SweepCatalogue must be empty or items WONT-FIX.
- **HT-CORE-006** Convergence Loop: detect-fix-rescan until zero failures.
- **HT-CORE-007** No Fabricated Evidence: never claim test passage without verified output.
- **HT-CORE-008** Audit-Field Discipline: every record has audit fields.
- **HT-CORE-009** Schema-Versioned Persistence: every persisted blob carries `schemaVersion`.
- **HT-CORE-010** Context Hygiene: selectors filter by current user even when single-user.

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
3. **REFACTOR** — clean while keeping tests green; remove duplication; add audit fields.

Never claim a test passes without showing the verified output.

## File ownership

See `framework.md` § File ownership and write rules. Most relevant:

- `framework.md`, `reference/*` → owned by `architect`. Update through `/plan` flow, not ad-hoc edits.
- `app/src/**` → owned by `executor` under TDD.
- `_workspace/scratch/observed-debt.md` → append-only via `debt-logger`. Never resolves silently.

## Sweep Completeness (HT-CORE-005)

Every FIX/REFACTOR opens a SweepCatalogue at `_workspace/scratch/sweep-catalogue.md`. The session is BLOCKED from completing until:

- All catalogued items are resolved, OR
- Items are explicitly marked WONT-FIX with rationale.

## Audit trail (AC markers)

Every commit message and every entry in `_workspace/scratch/audit-trail.md` uses paired `AC_START` / `AC_COMPLETE` markers with format `AC-PHASE-COMMIT` (e.g., `AC-P0-A1`). Never emit orphaned `AC_START`.

## When to stop and ask

- Truly ambiguous work where the wrong choice is destructive.
- Canonical file writes that contradict the file-ownership table.
- DoR Hard Gate score below 100 for an IMPLEMENT/FIX/PLAN.
- A phase boundary 🛑 STOP requiring user verification.

Otherwise: make grounded best-effort decisions and keep moving (CORE-049 Silent Autonomous Mode after explicit `proceed`).

## What this app is becoming

Today: client-only React SPA on localStorage. Phase 2: Supabase backend, Google SSO, multi-user with TODO assignment, PWA with offline sync. Engineer abstractions now (StorageAdapter, AuthContext, repository layer, audit fields, schemaVersion) so the swap is transparent. See `reference/product/feature-roadmap.md`.
