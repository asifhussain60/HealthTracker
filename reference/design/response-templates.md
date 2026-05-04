# HealthTracker — Response Templates

**Status:** active · **Owner:** architect · **Last updated:** 2026-05-03

Every Claude response on this repo conforms to the end-state contract. This file shows canonical examples.

## End-state contract

Every response ends with **exactly one** of:

```
### ⚡ If you say proceed, I will:
1. <action>
2. <action>
```

OR

```
✅ All work is complete.
```

Never both. Never neither.

## When to use which

- **Proceed gate** — ANY uncompleted work, ANY pending decision, ANY remediation needed.
- **Completion state** — ALL requested work done, no remediation outstanding, no follow-up implied, no blocking question pending.

## Canonical examples

### Proceed gate (most common)

```markdown
[work output]

### ⚡ If you say proceed, I will:
1. Run the failing test suite to verify the new regression test fails as expected.
2. Implement the minimal fix in `app/src/data/calculators/thcMath.js`.
3. Re-run the suite and capture verified output.
```

### Completion state (only when truly done)

```markdown
[work output]

✅ All work is complete.
```

## When the gate gets ambiguous (challenger blocks)

Anti-patterns the challenger flags:

- **Trailing prose after the gate** — gate must be the final block.
- **Both blocks** — never `⚡ If you say proceed` followed by `✅`.
- **Neither block** — "Let me know if you have questions." is not a valid ending.
- **Phrased as a question** — "Should I proceed?" instead of `### ⚡ If you say proceed, I will:`. The fixed format is the contract.
- **Empty action list** — gate without numbered actions.

## Audit trail markers (CORTEX lineage)

Commit messages for `app/` changes include audit markers:

```
feat(cannabis): add THC mg ring to Today

AC_START: AC-P0-B5
- Extracted thcMath.js from inline view logic
- Added unit tests with 100% coverage
- Added Today's second cannabis ring
AC_COMPLETE: AC-P0-B5
```

Format: `AC-{phase-id}-{commit-id}`. Example: `AC-P0-A1` for Phase 0, Commit A1.

Audit trail file `_workspace/scratch/audit-trail.md` mirrors these for cross-session reference.

## Header convention (optional, for major work)

For major work (new phase commits, plan reviews), responses may begin with:

```markdown
# 🩺 HealthTracker — {mode}

🧭 Routing: {intent} → {handler.agent.md}
```

This is informational. The end-state contract is required; the header is not.

## Prose discipline

- Cite file paths as `[file.ext](path/to/file.ext)` markdown links.
- Cite line numbers as `[file.ext:42](path/to/file.ext#L42)`.
- Use `code spans` for identifiers, function names, paths-without-rendering.
- No emojis except: 🩺 (HealthTracker mark), ⚡ (proceed gate), ✅ (completion state), 🛑 (STOP), ⬜🔄✅ (commit map status).
- Never narrate internal deliberation. State results and decisions directly.
- Brief over verbose. One clear sentence beats one clear paragraph.

## Auto-mode safety (ANT-070)

When operating after a `proceed`, follow CORE-049 Silent Autonomous Mode:

- Don't pause for confirmation between commits within the same approved phase.
- DO pause for: 🛑 STOP boundaries, gate failures, DoR drops below 100, sweep catalogue still open.
- Never silently bypass gates even in auto-mode.
