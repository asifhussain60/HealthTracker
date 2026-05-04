#!/bin/bash
# install-hooks.sh — One-shot installer for HealthTracker git hooks.
#
# Run after `git clone` or any time .claude/hooks/*.sh is updated:
#   bash .claude/hooks/install-hooks.sh
#
# Hooks installed:
#   .git/hooks/pre-commit  ← .claude/hooks/pre-commit.sh   (path/clutter checks)
#   .git/hooks/commit-msg  ← .claude/hooks/commit-msg.sh   (AC marker pairing)
#
# This script is idempotent: re-running it overwrites the linked hooks.

set -eu

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
cd "$PROJECT_DIR"

GIT_HOOKS_DIR="$(git rev-parse --git-path hooks)"
SOURCE_DIR=".claude/hooks"

if [ ! -d "$GIT_HOOKS_DIR" ]; then
  echo "❌ install-hooks: not in a git working tree (no $GIT_HOOKS_DIR)."
  exit 1
fi

install_one() {
  local src="$1" dst="$2"
  if [ ! -f "$src" ]; then
    echo "⚠️ install-hooks: skipping $src (file not found)"
    return
  fi
  cp "$src" "$dst"
  chmod +x "$dst"
  echo "✅ installed $dst ← $src"
}

install_one "$SOURCE_DIR/pre-commit.sh" "$GIT_HOOKS_DIR/pre-commit"
install_one "$SOURCE_DIR/commit-msg.sh" "$GIT_HOOKS_DIR/commit-msg"

echo ""
echo "Hooks installed. Verify with:"
echo "  ls -la $GIT_HOOKS_DIR/{pre-commit,commit-msg}"
