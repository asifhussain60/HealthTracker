# /plan-status — Phase Summary

Summarize all phases by status: which is active, which is in DoR review, which has open commits.

@../../.github/agents/core/planner.agent.md

---

## Procedure

1. List all plans in `_workspace/ideas/`:
   ```bash
   ls _workspace/ideas/
   ```
2. For each, parse the frontmatter (`status:`, `priority:`, `created:`).
3. List all handoffs in `_workspace/plan/`:
   ```bash
   ls _workspace/plan/
   ```
4. For the active handoff, count the commit-map status:
   - ⬜ pending
   - 🔄 in progress
   - ✅ done
   - 🟥 blocked
   - ⬛ wont-fix
5. Output a compact table:

```markdown
## Phase Status

| Phase | Status | DoR | Commits | Last Activity |
|---|---|---|---|---|
| 0 — Refactor + Scaffolding | active | 100/100 | 12/24 (3🔄, 9⬜) | 2026-05-03 |
| 1 — Cannabis + Meals | draft | -/100 | - | - |
| 2 — Backend + Multi-User | planned | - | - | - |
| 3 — TODO UX | planned | - | - | - |
| 4 — Polish | planned | - | - | - |

**Active:** Phase 0 — first ⬜ is `B3` in `phase-0-refactor-handoff.md`.
**Pending STOPs:** none.
```

End with the standard end-state contract.
