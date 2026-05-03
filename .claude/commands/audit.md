# /audit — 4-Pass Holistic Audit

Invoke `auditor.agent.md` to run the 4-pass audit (Structure → Code → Architecture → Brittleness).

@../../.github/agents/core/auditor.agent.md

---

## User Request

$ARGUMENTS

---

## Flags

- `/audit` (no args) — preview mode; produces Repair Plan but does not execute fixes.
- `/audit fix` — execute the Repair Plan after generating it; destructive ops require user confirmation.
- `/audit --pass <N>` — run only pass N (1=Structure, 2=Code, 3=Architecture, 4=Brittleness).
- `/audit --full` — full-repo scan (default is changed-files only on a feature branch).

## End-state

Always end with verdict (PASS | WARN | BLOCK) and the standard end-state contract.
