# /challenge — YAML-Backed Enforcement Review

Invoke `challenger.agent.md` for a 3-lane review of pending changes (Anthropic / HT-CORE / UI/UX).

@../../.github/agents/core/challenger.agent.md

---

## User Request

$ARGUMENTS

---

## Flags

- `/challenge` (no args) — scan changed files since branch divergence.
- `/challenge --full` — scan the whole repo (slow).
- `/challenge <path>` — scan a specific file or folder.

## Output

Three-lane verdict with principle ID citations, conflicts surfaced, severity tiers (P0/P1/P2), and final verdict (PASS | WARN | BLOCK).

Always end with the standard end-state contract.
