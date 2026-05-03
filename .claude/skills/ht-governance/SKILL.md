---
name: ht-governance
description: HT-CORE rule enforcement skill. Loaded by challenger.agent.md and auditor.agent.md to score changes against the 10 non-negotiable rules.
---

# ht-governance — HT-CORE Rule Enforcement

This skill operationalizes [`reference/ht-core-rules.yaml`](../../../reference/ht-core-rules.yaml) as actionable checks.

## The 10 rules

| ID | Name | Enforcement | Quick check |
|---|---|---|---|
| HT-CORE-001 | Architecture-First | PRE-EXECUTION | Architectural assessment exists for IMPLEMENT/FIX/REFACTOR |
| HT-CORE-002 | Tests-First | PRE-EXECUTION | Failing test exists with verified output before any source-code write |
| HT-CORE-003 | Single Source of Truth | BLOCKED | grep for duplicate constants/logic across files |
| HT-CORE-004 | Holistic Validation Gate | BLOCKED | Full sweep run + verified before "complete" |
| HT-CORE-005 | Sweep Completeness | BLOCKED | sweep-catalogue.md has no OPEN entries |
| HT-CORE-006 | Convergence Loop | BLOCKED | Detect → fix → rescan until zero failures |
| HT-CORE-007 | No Fabricated Evidence | BLOCKED | Every "passes" backed by stdout citation |
| HT-CORE-008 | Audit-Field Discipline | RUNTIME | Every new record has audit fields |
| HT-CORE-009 | Schema-Versioned Persistence | RUNTIME | Schema bump = migration entry |
| HT-CORE-010 | Context Hygiene | PRINCIPLE | Selectors filter by currentUser.id |

## Per-rule deep checks

### HT-CORE-003 — duplicate detection

```bash
# Find duplicate function names across the repo
grep -rn 'function calculateThcMg' app/src/ | head
# Find duplicate constants
grep -rn 'const DAILY_THC_CEILING' app/src/ | head
```

Two definitions of the same name in different files = BLOCK unless one is in `__tests__/` factory.

### HT-CORE-008 — audit-field check

For any new schema in `data-model.md`:
- ☐ `id: string` (UUID)
- ☐ `userId: string`
- ☐ `createdAt: string` (ISO)
- ☐ `updatedAt: string` (ISO)
- ☐ `createdBy: string`
- ☐ `updatedBy: string`
- ☐ `deletedAt: string | null`
- ☐ `schemaVersion: number`

Missing any → BLOCK.

### HT-CORE-009 — migration check

For any schema change touching `app/src/data/store/slices/*.js`:
- ☐ `app/src/data/migrations/index.js` has a new entry `{ from, to, migrate }`
- ☐ Entry has a test in `app/src/data/migrations/__tests__/`
- ☐ `schemaVersion` constant bumped

Missing any → BLOCK.

### HT-CORE-010 — selector hygiene

For any `app/src/data/selectors/*.js`:
- ☐ Selector function signature accepts `userId` OR uses `useCurrentUser().id` internally
- ☐ The filter `.filter(r => r.userId === userId)` (or equivalent) is applied

Missing → WARN.

## Conflict resolution

Per [`reference/governance-gates.yaml`](../../../reference/governance-gates.yaml):

1. HT-CORE rules (highest)
2. Anthropic guidelines
3. UI/UX heuristics

When a HT-CORE rule conflicts with an Anthropic guideline, the HT-CORE rule wins. Always surface the conflict; never silently choose.

## Output format

Used by `auditor` and `challenger` — see those agents for end-state contract.
