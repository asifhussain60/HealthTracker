---
name: ht-tdd
description: TDD red-green-refactor enforcement for HealthTracker. Auto-loaded by executor.agent.md. Use when implementing or fixing code.
---

# ht-tdd — TDD red-green-refactor

This skill enforces HT-CORE-002 (Tests-First). Loaded by `.github/agents/core/executor.agent.md` on every IMPLEMENT/FIX.

## Procedure

### RED — write failing test

1. Identify the test tier (smoke / unit / component / integration / regression — see [`reference/architecture/test-strategy.md`](../../../reference/architecture/test-strategy.md)).
2. Place the test file in the correct location:
   - Calculators: `app/src/data/calculators/__tests__/`
   - Selectors: `app/src/data/selectors/__tests__/`
   - Components: co-located `__tests__/`
   - Integration: `app/src/__tests__/integration/`
3. Use a factory from `app/src/__tests__/factories/` to build test data WITH audit fields.
4. Write the test that captures the desired behavior.
5. Run it:
   ```bash
   cd app && npm test -- --run <path-to-test>
   ```
6. **Verify it fails** with the expected error message. Capture stdout. Cite.
7. Naming: regression tests start with `'FIX: '` and include the bug summary.

### GREEN — minimal pass

1. Write the smallest amount of production code to make the test pass.
2. Re-run the test.
3. **Verify it passes.** Capture stdout. Cite.
4. **Forbidden:** `--ignore`, `test.skip`, mocking real dependencies that should be exercised.

### REFACTOR — clean while green

1. Remove duplication.
2. Extract magic numbers to constants.
3. Extract complex conditionals to named functions.
4. Add type hints / docstrings where useful (no `any` types).
5. Add audit fields to any new persisted records (HT-CORE-008).
6. Add a migration entry if schema changed (HT-CORE-009).
7. Re-run tests; verify still green.

## Verified-output contract (HT-CORE-007)

Every "test passes" claim is backed by stdout. Format your output as:

```
RED:
  $ cd app && npm test -- --run app/src/data/calculators/__tests__/thcMath.test.js
  FAIL  app/src/data/calculators/__tests__/thcMath.test.js
    × calculateThcMg returns 0 for null thcPercent
      expected 0 to equal NaN

GREEN:
  $ cd app && npm test -- --run app/src/data/calculators/__tests__/thcMath.test.js
  PASS  app/src/data/calculators/__tests__/thcMath.test.js
    ✓ calculateThcMg returns 0 for null thcPercent
```

## Sweep catalogue interaction (HT-CORE-005)

If during GREEN/REFACTOR you discover side issues:
- DO NOT fix silently.
- DO call `support/debt-logger.agent.md` to append to `_workspace/scratch/sweep-catalogue.md`.
- Address before claiming the commit complete OR mark WONT-FIX with rationale.

## Coverage targets

| Area | Threshold |
|---|---|
| Calculators | 100% |
| Selectors | 100% |
| Repositories | ≥90% |
| Slices | ≥80% |
| Components | ≥70% |

Below threshold = P1 finding.

## Anti-patterns

- Tests with no `expect()`.
- `test.skip` left in main.
- Tests that hit real network.
- Tests that share global mutable state.
- Mocking interfaces that drift from production.

## Ending

Skill is silent on response format — the calling agent (`executor`) owns the proceed-gate / completion-state output.
