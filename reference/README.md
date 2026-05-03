# reference/ — Single Source of Truth

This directory is the canonical, deduplicated source for HealthTracker's rules, guidelines, schemas, and templates. Agents read from here. Skills consult these files. The challenger enforces against them.

**Rule:** content lives in exactly one file here. If two places need the same information, one of them links to the other. Do not copy.

## Catalog

### Governance (machine-readable)

| File | Owner | Purpose |
|---|---|---|
| `ht-core-rules.yaml` | architect | The 10 non-negotiable HT-CORE rules with enforcement levels. |
| `intent-routing.yaml` | architect | User-intent → handler agent + pre-gate matrix. |
| `governance-gates.yaml` | architect | Gate definitions per intent (DoR, TDD, Holistic, Sweep, Governance). |
| `phase-template.yaml` | architect | Standard template for any new phase plan. |

### External knowledge (machine-readable)

| File | Owner | Purpose |
|---|---|---|
| `anthropic-guidelines.yaml` | architect | Synthesis of Anthropic engineering posts. Refresh via `/sync-guidelines`. |
| `uiux-heuristics.yaml` | architect | Nielsen + WAI-ARIA APG + Refactoring UI + HIG/Fluent. |

### Project specs (human-readable)

| File | Owner | Purpose |
|---|---|---|
| `architecture.md` | architect | Project rules: layering, repository pattern, no view→store, etc. |
| `data-model.md` | architect | Table schemas, audit fields, schema versioning, migration registry. |
| `design-system.md` | architect | Design tokens, primitives, naming conventions, dark/light. |
| `feature-roadmap.md` | architect | Phase 0 → Phase 4 high-level scope. |
| `test-strategy.md` | architect | TDD discipline rules, coverage tiers, regression suite. |
| `privacy.md` | architect | Medical-data treatment, PII handling, encryption envelope. |
| `response-templates.md` | architect | End-state contract examples; output formatting standards. |

## How agents consume this

- `architect` reads `architecture.md`, `data-model.md`, `design-system.md` before any DESIGN/IMPLEMENT.
- `executor` reads `test-strategy.md` before writing any test or implementation.
- `auditor` reads `ht-core-rules.yaml` + `architecture.md` for the four audit passes.
- `planner` reads `phase-template.yaml` and `feature-roadmap.md` when generating new phase plans.
- `challenger` reads all three YAMLs (`ht-core-rules.yaml`, `anthropic-guidelines.yaml`, `uiux-heuristics.yaml`) and reports findings citing principle IDs.

## How updates flow

Edits to these files are governance changes. They go through `/plan` flow:

1. Open a phase doc in `_workspace/ideas/`.
2. State the change, the rationale, the affected agents.
3. `/audit` confirms no broken references in agents/skills/commands.
4. Commit with `AC-GOV-{date}` audit marker.
5. Update `framework.md` if the change affects authority or routing.
