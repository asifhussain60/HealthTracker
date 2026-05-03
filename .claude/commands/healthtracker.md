# /healthtracker — Singular Entry Point

This is the one command for everything in the HealthTracker repo.

Load the agent and route via the intent matrix.

@../../.github/agents/healthtracker.agent.md

---

## User Request

$ARGUMENTS

---

## Routing Contract

If `$ARGUMENTS` is empty or contains only `/healthtracker`, render the introduction:
- Show available sub-commands and one-line descriptions.
- Show the active commit map state from `_workspace/handoffs/`.
- End with `### ⚡ If you say proceed [intent], I will:` listing top 3 next actions.

If `$ARGUMENTS` contains a natural-language request:
1. Classify intent against `reference/intent-routing.yaml`.
2. Apply the pre-gate from `reference/governance-gates.yaml`.
3. Delegate to the right specialist agent.
4. End with the standard end-state contract.

## Sub-commands

| Typed | Equivalent |
|---|---|
| `/healthtracker plan` | `/plan` |
| `/healthtracker audit` | `/audit` |
| `/healthtracker challenge` | `/challenge` |
| `/healthtracker exec-next` | `/exec-next` |
| `/healthtracker plan-status` | `/plan-status` |
| `/healthtracker sync-guidelines` | `/sync-guidelines` |
| `/healthtracker implement {desc}` | IMPLEMENT intent → executor |
| `/healthtracker fix {desc}` | FIX intent → executor |
| `/healthtracker refactor {desc}` | REFACTOR intent → executor |
| `/healthtracker debug {desc}` | DEBUG intent → auditor |
