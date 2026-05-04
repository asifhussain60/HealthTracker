---
name: ht-governance
description: HT-CORE rule enforcement skill. Loaded by the challenger and auditor agents. Scoring is intent-aware (challenger) vs mechanical (auditor) — see § Author-vs-reviewer split below.
---

# ht-governance — HT-CORE Rule Enforcement

This skill operationalizes [`reference/governance/ht-core-rules.yaml`](../../../reference/governance/ht-core-rules.yaml) as actionable checks. **Both** the auditor and the challenger load it, but they operate it in different modes — see § Author-vs-reviewer split.

## Author-vs-reviewer split (ANT-088 application)

The auditor and challenger both score against HT-CORE-001..010 but their scopes are deliberately divergent so the pair gives the user *two different signals*, not one signal duplicated:

| Aspect | Auditor mode | Challenger mode |
|---|---|---|
| Posture | Mechanical / structural / inventory | Adversarial / intent-checking / spirit-of-the-rule |
| Evidence demanded | grep, find, file:line citations of *current* violations | Counter-example: a one-paragraph minimal-failing-case showing how the *next* violation would compound the current one |
| Severity scale | Critical / High / Medium / Low (HT-CORE → severity table) | BLOCK / ROLLBACK / DOR-RISK / PHASE-NOT-CLOSED (binding directives — see challenger.md) |
| When fired | On every commit at sub-phase STOP; on `/audit` | On every commit's diff at landed-time; on `/challenge`; on close-out commit 4; on DoR review |
| Required output uniqueness | List of file:line violations | List of file:line violations + counter-example + spirit-grading + binding directive |

The rules below describe the violations both modes detect. The mode-specific output discipline lives in `challenger.md` (binding directives) and `auditor.md` (4-pass procedure).

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

Per [`reference/governance/governance-gates.yaml`](../../../reference/governance/governance-gates.yaml):

1. HT-CORE rules (highest)
2. Anthropic guidelines
3. UI/UX heuristics

When a HT-CORE rule conflicts with an Anthropic guideline, the HT-CORE rule wins. Always surface the conflict; never silently choose.

## Counter-example discipline (challenger only)

Every challenger finding **must** include a *counter-example*: a minimal failing case demonstrating how the violation would compound if left unfixed. Format:

```
[CHALLENGER] HT-CORE-003 violation at framework.md:36 (agent table cites .github/agents/)
  Counter-example: if a new agent is added to .claude/agents/, framework.md
  will silently miss it AND the broken `.github/agents/` link will continue
  to be the documented authority — propagating the error to every onboarding
  session that reads the framework first.
  Spirit grade: 1/5 (the rule's intent is "one canonical owner per data
  domain"; two competing paths are zero canonical owners).
  Directive: 🛑 BLOCK until the registry is reconciled.
```

The auditor does not produce counter-examples; auditor output stays mechanical (file:line + severity + fix). This is the structural difference that makes the auditor + challenger pairing satisfy ANT-088 reviewer rotation rather than duplicating a single review.

## Spirit-grading (challenger only)

For each rule violation, the challenger grades against the *spirit* of the rule on a 1-5 scale:

- **5** — implementation honors both letter and spirit
- **4** — letter honored; spirit slightly drifted
- **3** — letter honored; spirit eroded
- **2** — letter eroded; spirit violated
- **1** — letter and spirit both violated

If grade ≤ 2: emit `🛑 BLOCK` directive. If grade = 3: emit `❌ DOR-RISK` advisory. The auditor does not spirit-grade.

## Output format

Both agents end with a verdict (PASS / WARN / BLOCK). The challenger additionally emits any binding directives (`🛑 BLOCK`, `🔄 ROLLBACK`, `❌ DOR-RISK`, `🛑 PHASE-NOT-CLOSED`) — see `.claude/agents/challenger.md` for directive semantics.
