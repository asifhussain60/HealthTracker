# HealthTracker Framework

**Version:** 1.0
**Last updated:** 2026-05-04 (solo-user scope locked)
**Status:** active

This document is the central governance contract for the HealthTracker repo. It lists the agents, file ownership, rules of engagement, and cross-references to the active execution plan. Update this file when phases land, agents change, or governance rules evolve.

---

## What HealthTracker is

A **solo-user** personal health-tracking React SPA. Today: client-side only (Vite + React + Zustand + localStorage), Mac-primary with first-class Windows support via PWA. Phase 2 adds optional cloud-backup + multi-device sync against a personal Supabase project for the **same** single user across phone + desktop — no Google SSO, no multi-user, no sharing, no assignment. Multi-user is explicitly out of scope per `_workspace/plan/program-roadmap.md` § 0.5. The codebase keeps the `StorageAdapter` abstraction so the localStorage→Supabase swap remains transparent.

## Authority and routing

`@healthtracker` (or `/healthtracker [intent]`) is the singular entry point. It classifies intent and delegates to a specialist. Do not invoke specialist agents directly unless explicitly named.

| Intent | Handler | Pre-Gate | Severity |
|---|---|---|---|
| IMPLEMENT | `core/executor` | DoR Hard Gate | BLOCKED |
| FIX | `core/executor` | TDD Gate | BLOCKED |
| REFACTOR | `core/executor` | Holistic Gate | BLOCKED |
| AUDIT | `core/auditor` | Sweep Gate | BLOCKED |
| PLAN | `core/planner` | DoR Hard Gate | BLOCKED |
| REVIEW | `core/challenger` | Governance Gate | WARNING |
| DEBUG | `core/auditor` | (none) | NONE |
| QUERY | `healthtracker` | (none) | NONE |

Full matrix: `reference/governance/intent-routing.yaml`. Gate definitions: `reference/governance/governance-gates.yaml`.

## Agents

All agents live at `.claude/agents/<name>.md` (Anthropic format with YAML frontmatter). The harness resolves them by `name:` frontmatter, not by path. Legacy `.github/agents/` tree was removed 2026-05-03.

| Agent | File | Role |
|---|---|---|
| `healthtracker` | `.claude/agents/healthtracker.md` | Singular entry point; classifies intent and delegates |
| `architect` | `.claude/agents/architect.md` | Architecture-first review; DoR scoring; design |
| `executor` | `.claude/agents/executor.md` | TDD red-green-refactor implementation |
| `auditor` | `.claude/agents/auditor.md` | 4-pass holistic audit (Structure → Code → Architecture → Brittleness); repair plan |
| `planner` | `.claude/agents/planner.md` | Phase planning; commit map maintenance |
| `challenger` | `.claude/agents/challenger.md` | YAML-backed enforcement: Anthropic + HT-CORE + UI/UX. Block / rollback / DoR-veto authority. |
| `ui-reviewer` | `.claude/agents/ui-reviewer.md` | CSS/theme/a11y review |
| `debt-logger` | `.claude/agents/debt-logger.md` | Append observed debt to `_workspace/scratch/observed-debt.md` |

Discover by `ls .claude/agents/` — there is no separate index file.

## Skills (Claude Code)

| Skill | Location | Purpose |
|---|---|---|
| `ht-tdd` | `.claude/skills/ht-tdd/SKILL.md` | TDD red-green-refactor enforcement |
| `ht-governance` | `.claude/skills/ht-governance/SKILL.md` | HT-CORE rule enforcement |
| `ht-plan` | `.claude/skills/ht-plan/SKILL.md` | Phase + commit-map maintenance |
| `ht-audit` | `.claude/skills/ht-audit/SKILL.md` | 4-pass auditor procedure |
| `ht-architecture-review` | `.claude/skills/ht-architecture-review/SKILL.md` | Architecture-first review template |
| `ht-md3` | `.claude/skills/ht-md3/SKILL.md` | Material Design 3 conformance checklist (loaded by ui-reviewer) |
| `ht-close-out` | `.claude/skills/ht-close-out/SKILL.md` | Mandatory 7-commit phase close-out recipe (refactor → debt → sweep → audit → doc-sync → perf → tag) |

## Slash commands

| Command | Purpose |
|---|---|
| `/healthtracker [intent]` | Singular entry — routes to the right agent |
| `/plan` | Invoke `planner` for phase planning |
| `/audit` | Invoke `auditor` for 4-pass holistic audit |
| `/exec-next` | Execute next ⬜ in active commit map |
| `/challenge` | Run `challenger` against current branch |
| `/plan-status` | Summarize all phases by status |
| `/sync-guidelines` | Re-scrape Anthropic learn; diff `reference/governance/anthropic-guidelines.yaml` for human approval |

## Architecture

```
HealthTracker/
├── framework.md                    ← this file (governance contract)
├── CLAUDE.md                       ← Claude Code entry point
├── DESIGN-REQUIREMENTS.md          ← canonical design north-star
├── .claude/
│   ├── settings.json               ← Stop hook + commands registry
│   ├── settings.local.json         ← per-developer permissions (gitignored)
│   ├── agents/                     ← agent specifications (8 files)
│   ├── commands/                   ← slash commands (7 files)
│   ├── skills/                     ← named skills (7 dirs, each with SKILL.md)
│   └── hooks/                      ← Claude Code hooks (challenger-stop.sh, pre-commit.sh)
├── _workspace/                     ← UNTRACKED — plans, handoffs, scratch
│   ├── plan/                       ← program-roadmap + phase master plans + sub-phase handoffs
│   ├── scratch/                    ← append-only logs (debt, sweep, audit trail, perf baselines)
│   └── archive/                    ← superseded artifacts (created by ht-close-out commit 7)
├── reference/                      ← SSOT for canonical references
│   ├── governance/
│   │   ├── ht-core-rules.yaml
│   │   ├── governance-gates.yaml
│   │   ├── anthropic-guidelines.yaml
│   │   ├── intent-routing.yaml
│   │   └── phase-template.yaml
│   ├── architecture/
│   │   ├── architecture.md
│   │   ├── data-model.md
│   │   └── test-strategy.md
│   ├── design/
│   │   ├── design-system.md
│   │   ├── uiux-heuristics.yaml
│   │   └── response-templates.md
│   ├── product/
│   │   ├── feature-roadmap.md
│   │   ├── meal-library-seed.md
│   │   └── privacy.md
│   └── wireframes/                 ← runnable HTML mockups
└── app/                            ← the React SPA
    └── src/
```

## File ownership and write rules

| Path | Owner | Write Rules |
|---|---|---|
| `framework.md` | `architect` only | Update when agents/rules change. Snapshot before major edits. |
| `CLAUDE.md` | `architect` | Keep ≤ 100 lines (PF-2); deterministic must-do moves to hooks. |
| `DESIGN-REQUIREMENTS.md` | `architect` | Locked decisions list is append-only with explicit revision notes. |
| `reference/governance/*.yaml` | `architect` + `challenger` co-sign | SSOT. Do not duplicate content into agents — link instead. Challenger counter-signs amendments. |
| `reference/architecture/*.md` | `architect` | One concept, one home. |
| `reference/product/*.md` | `architect` | Cross-link to `_workspace/plan/program-roadmap.md` for phase scheme. |
| `reference/design/*.md` and `reference/design/*.yaml` | `architect` (with ui-reviewer counter-sign for design-system.md) | Keep aligned with DESIGN-REQUIREMENTS.md. |
| `.claude/agents/*.md` | `architect` | Frontmatter required. Mark deprecation; do not silently delete. |
| `.claude/commands/*.md` | `architect` | Keep aligned with `framework.md` command table. |
| `.claude/skills/<name>/SKILL.md` | `architect` | Frontmatter `name:` + `description:` required; one skill, one operational concern. |
| `.claude/hooks/*.sh` and `.claude/settings.json` | `architect` | Hooks are deterministic must-do (ANT-084). Aspirational behaviors stay in agent prompts, not hooks. |
| `_workspace/plan/program-roadmap.md` | `planner` (architect counter-signs at phase boundaries) | Universal phase shape, recipe, and 6-phase roadmap. The single program-level SSOT. |
| `_workspace/plan/phase-N-*.md` | `planner` | Phase master plan + sub-phase handoffs. Commit map is canonical work queue. Architect counter-signs at phase boundaries. |
| `_workspace/scratch/observed-debt.md` | `debt-logger` (append-only) | Never silently resolves; tracked as work. Resolution notes appended at close-out. |
| `_workspace/scratch/sweep-catalogue.md` | `executor` (open) + `challenger` (close) | Opened on every FIX/REFACTOR; closed at close-out commit 3. |
| `_workspace/scratch/audit-trail.md` | `auditor` + `challenger` (append-only) | AC_START / AC_COMPLETE markers + sweep PASS notes. |
| `_workspace/scratch/perf-baselines.md` | `executor` | Per-phase perf baseline at close-out commit 6. |
| `app/src/**` | `executor` | Tests-first. PR-shape commits matching commit map. |

## Rules of engagement

The 10 HT-CORE rules in `reference/governance/ht-core-rules.yaml` are non-negotiable. Highlights:

1. **HT-CORE-001 — Architecture-First.** Every IMPLEMENT/FIX/REFACTOR begins with an architectural assessment.
2. **HT-CORE-002 — Tests-First.** Tests must be written before implementation.
3. **HT-CORE-003 — Single Source of Truth.** No duplicate authority; one canonical owner per data domain.
4. **HT-CORE-004 — Holistic Validation.** Full sweep before claiming completion.
5. **HT-CORE-005 — Sweep Completeness.** Every fix opens a SweepCatalogue; can't complete with open items.
6. **HT-CORE-006 — Convergence Loop.** Detect-fix-rescan until zero failures.
7. **HT-CORE-007 — No Fabricated Evidence.** Never claim test passage without verified output.
8. **HT-CORE-008 — Audit-Field Discipline.** Every record has `createdAt`, `updatedAt`, `userId`, etc.
9. **HT-CORE-009 — Schema-Versioned Persistence.** Every persisted blob carries `schemaVersion`.
10. **HT-CORE-010 — Context Hygiene.** Selectors filter by current user even when single-user.

## End-state contract

Every response ends with **exactly one** of:

```
### ⚡ If you say proceed, I will:
1. ...
2. ...
```
or
```
✅ All work is complete.
```

Never both. Never neither.

## Active execution plan

`_workspace/plan/program-roadmap.md` is the single source of truth for the program — universal phase shape (PF → build → close-out → handoff), refactor + cleanup cadence at four levels each, and the 6-phase roadmap (P0..P5). Per-phase commit maps live in `_workspace/plan/phase-N-*.md`.

**Active:** P0 (Refactor + Scaffolding). Sub-phases A → D, with sub-phase D re-aligned 2026-05-04 to the canonical 7-commit close-out recipe (D1, D3, D4, D5, D6, D7a, D7b; D2 retired).

## DoR Hard Gate

Locks before any IMPLEMENT/FIX/PLAN intent proceeds. Score must reach 100/100 across:

- Vision + non-goals stated (20)
- Decisions table locked with rejected alternatives (20)
- Acceptance criteria measurable (15)
- Risks + mitigations identified (10)
- Test strategy in place (15)
- Architecture impact assessed (10)
- Backward compatibility addressed (10)

Below 100 → blocked. Always allow QUERY/AUDIT/DEBUG.

## Cold Start Protocol

At the start of every new conversation:

```bash
git log --oneline -10
git branch --show-current
ls _workspace/plan/
```

Output:

```
📍 State:
  Branch: <branch>
  Last commit: <hash> — <message>
  Active handoff: <filename>
  Next task: <first ⬜ in commit map>
  Pending STOP: <yes/no>
  healthtracker-orchestrator: active
```

Proceed only on user confirmation.
