# reference/ — Single Source of Truth

This directory is the canonical, deduplicated source for HealthTracker's rules, guidelines, schemas, and templates. Agents read from here. Skills consult these files. The challenger enforces against them.

**Rule:** content lives in exactly one file here. If two places need the same information, one of them links to the other. Do not copy.

## Layout

```
reference/
├── README.md                       ← this index
├── governance/                     ← rules, gates, routing, templates
│   ├── ht-core-rules.yaml
│   ├── governance-gates.yaml
│   ├── anthropic-guidelines.yaml
│   ├── intent-routing.yaml
│   └── phase-template.yaml
├── architecture/                   ← code, data, and test architecture
│   ├── architecture.md
│   ├── data-model.md
│   └── test-strategy.md
├── design/                         ← MD3, UX heuristics, response patterns
│   ├── design-system.md
│   ├── uiux-heuristics.yaml
│   └── response-templates.md
├── product/                        ← roadmap, seeds, privacy
│   ├── feature-roadmap.md
│   ├── meal-library-seed.md
│   └── privacy.md
└── wireframes/                     ← runnable HTML mockups
    └── explainer.html
```

## Catalog

### `governance/` — rules and gates

| File | Owner | Purpose |
|---|---|---|
| `ht-core-rules.yaml` | architect | The 10 non-negotiable HT-CORE rules with enforcement levels. |
| `governance-gates.yaml` | architect | Gate definitions per intent (DoR, TDD, Holistic, Sweep, Governance). |
| `anthropic-guidelines.yaml` | architect | Synthesis of Anthropic engineering posts. Refresh via `/sync-guidelines`. |
| `intent-routing.yaml` | architect | User-intent → handler agent + pre-gate matrix. |
| `phase-template.yaml` | architect | Standard template for any new phase plan. |

### `architecture/` — system structure

| File | Owner | Purpose |
|---|---|---|
| `architecture.md` | architect | Project rules: layering, repository pattern, no view→store, etc. |
| `data-model.md` | architect | Table schemas, audit fields, schema versioning, migration registry. |
| `test-strategy.md` | architect | TDD discipline rules, coverage tiers, regression suite. |

### `design/` — UX language

| File | Owner | Purpose |
|---|---|---|
| `design-system.md` | architect | Design tokens, primitives, naming conventions, dark/light. |
| `uiux-heuristics.yaml` | architect | Nielsen + WAI-ARIA APG + Refactoring UI + HIG/Fluent. |
| `response-templates.md` | architect | End-state contract examples; output formatting standards. |

### `product/` — scope and policy

| File | Owner | Purpose |
|---|---|---|
| `feature-roadmap.md` | architect | Phase 0 → Phase 4 high-level scope. |
| `meal-library-seed.md` | architect | 30-row starter pack + MyNetDiary CSV importer contract. |
| `privacy.md` | architect | Medical-data treatment, PII handling, encryption envelope. |

### `wireframes/` — runnable mockups

HTML/JSX files that demonstrate visual intent before primitives ship. Not part of the build.

## How agents consume this

- `architect` reads `architecture/`, `design/design-system.md`, and the relevant `product/` file before any DESIGN/IMPLEMENT.
- `executor` reads `architecture/test-strategy.md` before writing any test or implementation.
- `auditor` reads `governance/ht-core-rules.yaml` + `architecture/architecture.md` for the four audit passes.
- `planner` reads `governance/phase-template.yaml` and `product/feature-roadmap.md` when generating new phase plans.
- `challenger` reads all three governance YAMLs (`ht-core-rules.yaml`, `anthropic-guidelines.yaml`, `design/uiux-heuristics.yaml`) and reports findings citing principle IDs.

## How updates flow

Edits to these files are governance changes. They go through `/plan` flow:

1. Open a phase doc in `_workspace/ideas/`.
2. State the change, the rationale, the affected agents.
3. `/audit` confirms no broken references in agents/skills/commands.
4. Commit with `AC-GOV-{date}` audit marker.
5. Update `framework.md` if the change affects authority or routing.
