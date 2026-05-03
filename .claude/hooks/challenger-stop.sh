#!/bin/bash
# challenger-stop.sh — Auto-fire challenger after a session that touched governed paths.
#
# Hook event: Stop
# Configured in: .claude/settings.json
#
# Behavior:
#   - Detects whether the session touched app/src/, reference/, or _workspace/ideas/.
#   - If yes, prints a hint to run /challenge. (We do not automatically modify
#     the conversation — that's intrusive. The hint surfaces the recommendation.)
#   - Exits 0 always (advisory only — never blocks Stop).

set -u

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$PROJECT_DIR" || exit 0

# Get changed-but-uncommitted files plus committed-since-divergence files
CHANGED=$(git status --porcelain 2>/dev/null | awk '{print $2}')
SINCE_DIVERGENCE=$(git diff --name-only main...HEAD 2>/dev/null || true)
ALL_TOUCHED=$(printf "%s\n%s\n" "$CHANGED" "$SINCE_DIVERGENCE" | sort -u)

# Check if any touched file is under governed paths
TRIGGERED=0
echo "$ALL_TOUCHED" | while IFS= read -r f; do
  case "$f" in
    app/src/*|reference/*|_workspace/ideas/*|.github/agents/*|framework.md|CLAUDE.md)
      TRIGGERED=1
      break
      ;;
  esac
done

# Surface the recommendation if triggered
if [ "$TRIGGERED" = "1" ] || echo "$ALL_TOUCHED" | grep -qE '^(app/src/|reference/|_workspace/ideas/|\.github/agents/|framework\.md|CLAUDE\.md)'; then
  cat <<'EOF'

────────────────────────────────────────────────────────────
🩺 HealthTracker — Stop hook
This session touched governed paths (app/src/, reference/, _workspace/ideas/, .github/agents/, framework.md, or CLAUDE.md).

Recommended next action:
  /challenge   — run YAML-backed enforcement review

Or to commit the work:
  /audit       — run 4-pass holistic audit before commit
────────────────────────────────────────────────────────────

EOF
fi

exit 0
