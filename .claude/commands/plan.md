# /plan — Phase Planning

Invoke `planner.agent.md` for phase plan creation, DoR review, or commit-map maintenance.

@../../.github/agents/core/planner.agent.md

---

## User Request

$ARGUMENTS

---

## Behavior

If `$ARGUMENTS` is empty:
- Read `_workspace/ideas/` and `_workspace/handoffs/` to summarize current state.
- Identify the active phase, its DoR status, and the next ⬜ commit.

If `$ARGUMENTS` describes a new phase:
- Use [`reference/phase-template.yaml`](../../../reference/phase-template.yaml).
- Save as `_workspace/ideas/<phase-id>-execution-plan.md`.
- Hand off to `architect` for DoR scoring (must hit 100/100).

If `$ARGUMENTS` references a specific commit-id:
- Update commit map status in the active handoff.
- Surface 🛑 STOPs requiring user verification.

End with the standard end-state contract.
