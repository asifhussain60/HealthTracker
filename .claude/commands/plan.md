# /plan — Phase Planning

Invoke the `planner` agent for phase plan creation, DoR review, or commit-map maintenance.

@../agents/planner.md

---

## User Request

$ARGUMENTS

---

## Behavior

If `$ARGUMENTS` is empty:
- Read `_workspace/plan/` to summarize current state (program-roadmap.md + active phase handoff).
- Identify the active phase, its DoR status, and the next ⬜ commit.

If `$ARGUMENTS` describes a new phase:
- Use [`reference/governance/phase-template.yaml`](../../reference/governance/phase-template.yaml).
- Save as `_workspace/plan/phase-<N>-master-plan.md` (or `phase-<N>-<slug>-handoff.md` for sub-phase).
- Hand off to `architect` for DoR scoring (must hit 100/100).

If `$ARGUMENTS` references a specific commit-id:
- Update commit map status in the active handoff.
- Surface 🛑 STOPs requiring user verification.

End with the standard end-state contract.
