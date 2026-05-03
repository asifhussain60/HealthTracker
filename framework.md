# HealthTracker Framework

**Version:** 1.0
**Last updated:** 2026-05-03
**Status:** active

This document is the central governance contract for the HealthTracker repo. It lists the agents, file ownership, rules of engagement, and cross-references to the active execution plan. Update this file when phases land, agents change, or governance rules evolve.

---

## What HealthTracker is

A personal/family health-tracking React SPA. Today: solo, client-side only (Vite + React + Zustand + localStorage), Mac-primary with first-class Windows support via PWA. Future (Phase 2): Google SSO, multi-user with task assignment, Supabase backend. The codebase is engineered now so the future shift requires no rewrite — abstractions stay; storage adapter swaps.

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

Full matrix: `reference/intent-routing.yaml`. Gate definitions: `reference/governance-gates.yaml`.

## Agents

| Agent | Location | Role |
|---|---|---|
| `healthtracker` | `.github/agents/healthtracker.agent.md` | Singular entry point; classifies intent and delegates |
| `architect` | `.github/agents/core/architect.agent.md` | Architecture-first review; DoR scoring; design |
| `executor` | `.github/agents/core/executor.agent.md` | TDD red-green-refactor implementation |
| `auditor` | `.github/agents/core/auditor.agent.md` | 4-pass holistic audit (Structure → Code → Architecture → Brittleness); repair plan |
| `planner` | `.github/agents/core/planner.agent.md` | Phase planning; commit map maintenance |
| `challenger` | `.github/agents/core/challenger.agent.md` | YAML-backed enforcement: Anthropic + HT-CORE + UI/UX |
| `ui-reviewer` | `.github/agents/support/ui-reviewer.agent.md` | CSS/theme/a11y review |
| `debt-logger` | `.github/agents/support/debt-logger.agent.md` | Append observed debt to `_workspace/scratch/observed-debt.md` |

Full registry: `.github/agents/AGENT-INDEX.md`.

## Skills (Claude Code)

| Skill | Location | Purpose |
|---|---|---|
| `ht-tdd` | `.claude/skills/ht-tdd/SKILL.md` | TDD red-green-refactor enforcement |
| `ht-governance` | `.claude/skills/ht-governance/SKILL.md` | HT-CORE rule enforcement |
| `ht-plan` | `.claude/skills/ht-plan/SKILL.md` | Phase + commit-map maintenance |
| `ht-audit` | `.claude/skills/ht-audit/SKILL.md` | 4-pass auditor procedure |
| `ht-architecture-review` | `.claude/skills/ht-architecture-review/SKILL.md` | Architecture-first review template |

## Slash commands

| Command | Purpose |
|---|---|
| `/healthtracker [intent]` | Singular entry — routes to the right agent |
| `/plan` | Invoke `planner` for phase planning |
| `/audit` | Invoke `auditor` for 4-pass holistic audit |
| `/exec-next` | Execute next ⬜ in active commit map |
| `/challenge` | Run `challenger` against current branch |
| `/plan-status` | Summarize all phases by status |
| `/sync-guidelines` | Re-scrape Anthropic learn; diff `reference/anthropic-guidelines.yaml` for human approval |

## Architecture

```
HealthTracker/
├── framework.md                    ← this file (governance contract)
├── CLAUDE.md                       ← Claude Code entry point
├── .github/
│   ├── agents/                     ← agent specifications
│   └── hooks/                      ← git hooks (pre-commit)
├── .claude/
│   ├── settings.json               ← Stop hook + commands registry
│   ├── settings.local.json         ← per-developer permissions (gitignored)
│   ├── commands/                   ← slash commands
│   ├── skills/                     ← named skills
│   └── hooks/                      ← Claude Code hooks
├── _workspace/                     ← UNTRACKED — plans, handoffs, scratch
│   ├── ideas/                      ← execution plans
│   ├── handoffs/                   ← phase handoff docs with commit maps
│   ├── scratch/                    ← debt log, sweep catalogue, audit trail
│   └── archive/                    ← superseded artifacts
├── reference/                      ← SSOT for canonical references
│   ├── ht-core-rules.yaml
│   ├── anthropic-guidelines.yaml
│   ├── uiux-heuristics.yaml
│   ├── intent-routing.yaml
│   ├── governance-gates.yaml
│   ├── phase-template.yaml
│   ├── architecture.md
│   ├── data-model.md
│   ├── design-system.md
│   ├── feature-roadmap.md
│   ├── test-strategy.md
│   ├── privacy.md
│   └── response-templates.md
└── app/                            ← the React SPA
    └── src/
```

## File ownership and write rules

| Path | Owner | Write Rules |
|---|---|---|
| `framework.md` | `architect` only | Update when agents/rules change. Snapshot before major edits. |
| `reference/*.yaml` | `architect` + `challenger` | SSOT. Do not duplicate content into agents — link instead. |
| `reference/*.md` | `architect` | One concept, one home. |
| `.github/agents/*.agent.md` | `architect` | Frontmatter required. Mark deprecation; do not silently delete. |
| `.claude/commands/*.md` | `architect` | Keep aligned with `framework.md` command table. |
| `_workspace/ideas/*.md` | `planner` | Locked DoR before any commit; phases A..N with gates. |
| `_workspace/handoffs/*.md` | `planner` + `executor` | Commit map is canonical work queue. |
| `_workspace/scratch/observed-debt.md` | `debt-logger` (append-only) | Never silently resolves; tracked as work. |
| `app/src/**` | `executor` | Tests-first. PR-shape commits matching commit map. |

## Rules of engagement

The 10 HT-CORE rules in `reference/ht-core-rules.yaml` are non-negotiable. Highlights:

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

`_workspace/ideas/healthtracker-execution-plan.md` is the single source of truth for the roadmap. Phase 0 (Refactor + Scaffolding) is active. Sub-phases A → D with 🛑 STOPs between for human verification.

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
ls _workspace/handoffs/
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
