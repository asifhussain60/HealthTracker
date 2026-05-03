# HealthTracker Agent Index

**Updated:** 2026-05-03 · **Authority:** [framework.md](../../framework.md) · **Refresh:** manual review on each phase close

---

## Loading Protocol

**Default context:** THIS FILE ONLY (~250 tokens). Specialist agents are loaded per-intent, not by default. This protects context window per [ANT-011](../../reference/anthropic-guidelines.yaml#L99) (load specialist instructions on-demand).

The user-facing entry is [`healthtracker.agent.md`](healthtracker.agent.md). All other agents are delegated capability specifications, not picker-facing entry points.

---

## Agent Registry

### Primary entry point

| Agent | Purpose |
|---|---|
| [`healthtracker.agent.md`](healthtracker.agent.md) | Singular user-facing entry. Classifies intent and delegates. |

### Core agents

| Agent | Role | Load when |
|---|---|---|
| [`core/architect.agent.md`](core/architect.agent.md) | Architecture-first review; DoR scoring; design proposals | DESIGN, PLAN, IMPLEMENT (pre-execution review) |
| [`core/executor.agent.md`](core/executor.agent.md) | TDD red-green-refactor implementation | IMPLEMENT, FIX, REFACTOR |
| [`core/auditor.agent.md`](core/auditor.agent.md) | 4-pass holistic audit (Structure → Code → Architecture → Brittleness) | AUDIT, DEBUG |
| [`core/planner.agent.md`](core/planner.agent.md) | Phase planning + commit map maintenance | PLAN |
| [`core/challenger.agent.md`](core/challenger.agent.md) | YAML-backed enforcement (Anthropic + HT-CORE + UI/UX) | REVIEW, auto via Stop hook |

### Support agents

| Agent | Role | Load when |
|---|---|---|
| [`support/ui-reviewer.agent.md`](support/ui-reviewer.agent.md) | CSS/theme/a11y review | REFACTOR/IMPLEMENT touching `app/src/styles/` or `components/` |
| [`support/debt-logger.agent.md`](support/debt-logger.agent.md) | Append observed debt; never silently resolves | invoked by all agents when out-of-scope work surfaces |

---

## Intent → Agent Mapping

Cross-references [`reference/intent-routing.yaml`](../../reference/intent-routing.yaml).

| Intent | Primary Agent | Pre-Gate | Severity |
|---|---|---|---|
| IMPLEMENT | `core/executor` | `dor-hard-gate` | BLOCKED |
| FIX | `core/executor` | `tdd-gate` | BLOCKED |
| REFACTOR | `core/executor` | `holistic-gate` | BLOCKED |
| AUDIT | `core/auditor` | `sweep-gate` | BLOCKED |
| PLAN | `core/planner` | `dor-hard-gate` | BLOCKED |
| REVIEW | `core/challenger` | `governance-gate` | WARNING |
| DEBUG | `core/auditor` | (none) | NONE |
| QUERY | `healthtracker` | (none) | NONE |

---

## Routing decision order

1. Is the request information retrieval / read-only? → QUERY
2. Did the user explicitly type a slash command? → respect it
3. Does an intent trigger phrase match? → that intent (see `intent-routing.yaml`)
4. "Make this work" / "ship X" → IMPLEMENT
5. "Y is broken" / "fix" → FIX
6. "Audit" / "review" / "clean up" → AUDIT
7. Ambiguous → ask one clarifying question; default to QUERY if still unclear

---

## When to load support agents

- `ui-reviewer` — autoload on changes to `app/src/styles/`, `app/src/components/`, or any UI-visible modification.
- `debt-logger` — never invoked alone. Other agents call it when scope-creep is detected. Append-only writes to `_workspace/scratch/observed-debt.md`.

---

## Token budget guidance

| Default | Per IMPLEMENT/FIX | Per AUDIT | Per REVIEW |
|---|---|---|---|
| ~250 tokens (this file) | architect + executor (~3.5k tokens) | auditor (~3k tokens) | challenger + 3 YAMLs (~8k tokens) |

Skills under [`.claude/skills/`](../../.claude/skills/) are loaded on-demand by the relevant agent.

---

## Lineage

This index pattern is inspired by [CORTEX](https://github.com/asifhussain60/CORTEX/tree/develop)'s `.github/agents/AGENT-INDEX.md` and right-sized for a 6-view React SPA. Heavyweight CORTEX features (78-phase registry, 33 intent types, MCP runtime DBs, Total Recall pipeline) are intentionally out of scope.
