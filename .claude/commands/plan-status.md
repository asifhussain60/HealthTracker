# /plan-status — Phase Summary

Summarize all phases by status: which is active, which is in DoR review, which has open commits.

@../agents/planner.md

---

## Procedure

1. Read `_workspace/plan/program-roadmap.md` to learn the canonical 6-phase scheme (P0..P5) and universal phase shape (PF → build → close-out → handoff).
2. List all handoffs in `_workspace/plan/`:
   ```bash
   ls _workspace/plan/
   ```
3. For the active handoff, count commit-map status:
   - ⬜ pending
   - 🔄 in progress
   - ✅ done
   - 🟥 blocked
   - ⬛ wont-fix
4. Output a compact table mirroring the program-roadmap phase set:

```markdown
## Phase Status

| Phase | Theme | Status | DoR | Commits | Last Activity |
|---|---|---|---|---|---|
| P0 | Refactor + scaffolding | active | 100/100 | n/m (k⬜) | YYYY-MM-DD |
| P1 | SPA build (planner-first) | DoR-2 ready | -/100 | not-started | - |
| P2 | Backend swap (Supabase) | outlined | - | - | - |
| P3 | TODOs + assignment | outlined | - | - | - |
| P4 | Shared services + LLM | outlined | - | - | - |
| P5 | Production hardening | outlined | - | - | - |

**Active:** P0 — first ⬜ commit ID and file.
**Pending STOPs:** list any 🛑 awaiting user verification.
```

End with the standard end-state contract.
