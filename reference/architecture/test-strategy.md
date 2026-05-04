# HealthTracker — Test Strategy

**Status:** active · **Owner:** architect · **Last updated:** 2026-05-03

This document defines the TDD discipline for HealthTracker. The executor enforces. The auditor verifies.

## Discipline (HT-CORE-002)

For every IMPLEMENT and FIX:

1. **RED** — write a failing test. Run it. Verify it fails with the expected error message.
2. **GREEN** — minimal implementation to pass. No `--ignore`, no `test.skip`.
3. **REFACTOR** — clean while keeping tests green. Remove duplication. Add audit fields.

The tool of record for "the test passed" is the test runner's stdout. Never claim a test passed without showing the output (HT-CORE-007).

## Tooling

- **Runner:** Vitest (Vite-native, fast, jsdom-supported).
- **DOM:** `@testing-library/react` for component tests. No enzyme.
- **A11y:** `@testing-library/jest-dom` matchers + axe-core for component a11y.
- **Coverage:** `c8`/Vitest built-in. Thresholds in `vitest.config.js`.

## Tiers

| Tier | What | When | Where |
|---|---|---|---|
| smoke | "App renders without crashing" | every commit | `app/src/__tests__/smoke.test.jsx` |
| unit | pure functions (calculators, selectors, validators) | every change touching them | co-located `__tests__` |
| component | rendering + interaction (no real adapter) | every component change | co-located `__tests__` |
| integration | repository ↔ slice ↔ adapter | every repo or slice change | `app/src/__tests__/integration/` |
| regression | bug-specific tests (one per fix) | every FIX | co-located with the fix |

## Coverage targets

- Calculators: **100%** (pure, testable, business-critical math).
- Selectors: **100%**.
- Repositories: **≥90%**.
- Slices: **≥80%**.
- Components: **≥70%** (presentation, lower bar).
- Views: smoke + key user flows.

Below threshold = P1 finding.

## Failing-test gate

Before any production code is written for an IMPLEMENT/FIX:

1. Test file exists.
2. Test runs and fails.
3. Failure message matches what the implementation will fix.
4. Verified output captured (e.g., `npm test smoke -- --run`).

Block via `tdd-gate` in `governance-gates.yaml`.

## Regression-test rule

Every FIX produces a regression test. The test name includes the bug summary. Example:

```js
test('FIX: thcMath.calculateThcMg returns 0 for null thcPercent (was NaN before)', () => {
  expect(calculateThcMg(0.5, null)).toBe(0);
});
```

This survives in the repo permanently as a tripwire.

## Test-data strategy

- **Factories** in `app/src/__tests__/factories/` — `makeFoodLog()`, `makeCannabisProduct()`, etc.
- Factories return records WITH audit fields (HT-CORE-008) so tests don't drift from production.
- **No real timestamps** — factories accept a `now` injection; default `'2026-01-01T00:00:00Z'`.
- **Deterministic IDs** — factories accept an `id` injection; default `'test-uuid-N'`.

## Snapshot tests

- Avoid for components beyond a smoke level.
- A11y: use axe-core run, not snapshots.
- Visual regression: deferred until Phase 2 (Playwright + Percy or similar).

## Adapter testing

- `LocalStorageAdapter` is tested with a fake `localStorage` (jsdom default).
- `SupabaseAdapter` (Phase 2) is tested with `supabase-js` mock.
- The adapter contract test runs against both: same input → same output. Catches divergence.

## Migration testing

Every migration in `data/migrations/index.js` has a test:
- input: a v(N-1) state
- output: a valid v(N) state
- runs forward; idempotent if re-run.

## CI strategy

Phase 0–1: local-only tests (no CI yet — single contributor).
Phase 2: GitHub Actions on PR for the develop branch:
- Lint (ESLint)
- Typecheck (no TS today; lint suffices)
- Test suite (Vitest)
- A11y suite (axe-core)
- Build (vite build) — verifies production bundle works

PRs blocked on any failure.

## Eval-style checks (Anthropic ANT-030)

For UX-critical flows, write scenario tests beyond unit:

- "User logs a meal → Today's protein ring updates correctly"
- "User completes a TODO → it disappears from Today's TODOs card"
- "User imports a CSV → Meals inventory grows by N items"

These run alongside unit tests and act as real-world regression guards.

## Anti-patterns (auditor flags)

- Tests that always pass (no `expect()`).
- `test.skip` left in main branch.
- Tests that hit real network (use mocks).
- Tests that share state across cases (no global mutable fixtures).
- "Snapshot" tests that snapshot the implementation, not the behavior.
- Mock that drifts from production interface.
