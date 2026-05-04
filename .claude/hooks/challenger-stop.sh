#!/bin/bash
# challenger-stop.sh — Stop-hook advisory + AC marker backstop.
#
# Hook event: Stop
# Configured in: .claude/settings.json
#
# Behavior:
#   - Detects whether the session touched governed paths (file-ownership
#     table in framework.md). If yes, surfaces a hint to run /challenge or
#     /audit. We do not modify the conversation (intrusive); the hint is
#     advisory only.
#   - Additionally checks for orphan AC_START in the most recent commit
#     and warns if found (HT-CORE-007 retroactive backstop, in case the
#     commit-msg hook was bypassed via --no-verify).
#   - Exits 0 always (Stop hook never blocks).

set -eu

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$PROJECT_DIR" || exit 0

# All file paths (uncommitted + since divergence from main)
CHANGED=$(git status --porcelain 2>/dev/null | awk '{print $NF}' || true)
SINCE_DIVERGENCE=$(git diff --name-only main...HEAD 2>/dev/null || true)
ALL_TOUCHED=$(printf "%s\n%s\n" "$CHANGED" "$SINCE_DIVERGENCE" | sort -u)

# Single grep — no subshell variable to lose. Path list mirrors the
# governed surface from framework.md "File ownership and write rules".
GOVERNED_REGEX='^(app/src/|reference/|_workspace/plan/|\.claude/agents/|\.claude/skills/|\.claude/commands/|\.claude/hooks/|framework\.md|CLAUDE\.md|DESIGN-REQUIREMENTS\.md)'

if echo "$ALL_TOUCHED" | grep -qE "$GOVERNED_REGEX"; then
  cat <<'EOF'

────────────────────────────────────────────────────────────
🩺 HealthTracker — Stop hook
This session touched governed paths (app/src/, reference/, _workspace/plan/,
.claude/agents|skills|commands|hooks/, framework.md, CLAUDE.md, or
DESIGN-REQUIREMENTS.md).

Recommended next action:
  /challenge   — run YAML-backed enforcement review (intent-aware)

Or before committing:
  /audit       — run 4-pass holistic audit (mechanical sweep)
────────────────────────────────────────────────────────────

EOF
fi

# AC marker retroactive backstop (HT-CORE-007).
# If the last commit message has an AC_START with no matching AC_COMPLETE,
# warn loudly. The commit-msg hook should have caught this, but if the user
# bypassed it (--no-verify), surface the violation here.
LAST_MSG=$(git log -1 --pretty=%B 2>/dev/null || echo "")
if [ -n "$LAST_MSG" ]; then
  STARTS=$(echo "$LAST_MSG" | grep -c '^AC_START AC-' || true)
  COMPLETES=$(echo "$LAST_MSG" | grep -c '^AC_COMPLETE AC-' || true)
  if [ "$STARTS" != "$COMPLETES" ]; then
    cat <<EOF

⚠️  HealthTracker — orphan AC marker detected in last commit
   AC_START lines:    $STARTS
   AC_COMPLETE lines: $COMPLETES

This bypassed the commit-msg hook. HT-CORE-007 violation.
Fix: amend the last commit to add the missing AC_COMPLETE marker.

EOF
  fi
fi

exit 0
