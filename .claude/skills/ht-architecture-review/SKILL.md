---
name: ht-architecture-review
description: Architecture-first review template for IMPLEMENT/REFACTOR. Loaded by architect.agent.md.
---

# ht-architecture-review — Architecture-First Review

Operationalizes HT-CORE-001. Loaded by `architect.agent.md` before any IMPLEMENT/FIX/REFACTOR.

## Template

Produce this assessment BEFORE any executor work:

```markdown
## Architectural Assessment — <feature/fix>

### Problem
<concise: what is the user/system pain?>

### Affected modules
- <file path>: <impact summary>
- <file path>: <impact summary>

### Affected contracts
- <interface | API | schema>: <impact>
- <other>: <impact>

### Current vs desired behavior
**Current:** <observable today>
**Desired:** <observable after change>

### Domain rule impact
- HT-CORE-001 (Architecture-First): satisfied by this assessment ✓
- HT-CORE-002 (Tests-First): <how tests will be written first>
- HT-CORE-003 (SSOT): <preserved | consolidating duplicates>
- HT-CORE-008 (Audit fields): <new records have them>
- HT-CORE-009 (Schema-versioned): <migration entry needed: yes/no>
- HT-CORE-010 (Context hygiene): <selector changes preserve user filtering>
- (Add more as relevant)

### Backward compatibility
- <preserved with proof | breaking-change explicitly accepted | uncertain — escalate>

### Risks & mitigations
1. <risk>: <mitigation>
2. <risk>: <mitigation>
3. <risk>: <mitigation>

### Change classification
- additive | modifying | breaking

### Proposed design
<smallest architecturally correct change>
<diagram or pseudocode if helpful>

### Test strategy
- Failing test #1: <name> — verifies <behavior>
- Failing test #2: <name> — verifies <behavior>
- Regression risks: <existing behavior at risk>
- Coverage tier: smoke | unit | component | integration | e2e
```

## Layering check

Verify the design respects [`reference/architecture.md`](../../../reference/architecture.md) layering:

```
views → repositories → selectors/calculators → store/slices → adapters
```

No upward imports. No views importing store directly. No calculators with side effects.

If the design violates layering, ESCALATE — do not silently allow.

## Single-Source-of-Truth check

For every new constant, function, or rule:
- ☐ Is there an existing place this concept lives? Use that.
- ☐ If not, is the new location canonical? Document in `reference/`.
- ☐ Are we duplicating anything? If yes, consolidate FIRST.

## DoR readiness

After the assessment, score the active plan against the DoR rubric (100 points). Below 100 → BLOCK; loop with user.

See [`reference/governance-gates.yaml`](../../../reference/governance-gates.yaml) for the rubric.

## Output

The calling agent (`architect`) produces the response with proceed-gate / completion-state ending.
