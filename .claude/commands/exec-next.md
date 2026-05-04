# /exec-next — Execute Next ⬜ in Active Commit Map

Identify the active handoff, find the first `⬜` commit, and execute it.

@../../.github/agents/healthtracker.agent.md

---

## Procedure

1. **Locate active handoff:**
   ```bash
   ls -t _workspace/plan/*.md | head -1
   ```

2. **Find first ⬜ commit:**
   - Read the handoff's Commit Map section.
   - First `⬜ <commit-id>` is the next task.
   - If no `⬜` exists but `🛑 STOP` does → halt, surface to user.
   - If commit map is empty → suggest `/plan` for next phase.

3. **Apply pre-gate:**
   - Look up the commit's intent (most are IMPLEMENT or REFACTOR).
   - Apply `reference/governance/governance-gates.yaml` pre-gate.
   - If gate blocks, surface and end with proceed gate.

4. **Delegate:**
   - IMPLEMENT/FIX/REFACTOR → `executor` (after `architect` produces assessment).
   - AUDIT → `auditor`.

5. **Update commit map:**
   - On start: `⬜` → `🔄`.
   - On commit landed: `🔄` → `✅`.

6. **End-state contract:**
   - If commit landed and more work remains: `⚡ If you say proceed, I will: 1. Execute next ⬜...`.
   - If 🛑 STOP reached: surface STOP and required user-verification steps.
   - If commit map fully done: `✅ Phase X complete.` + propose next phase.
