#!/bin/bash
# pre-commit.sh — Lightweight pre-commit checks for HealthTracker.
#
# Install: cp .claude/hooks/pre-commit.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
#
# Behavior:
#   - Refuses commit if .DS_Store is staged.
#   - Refuses commit if a tracked file at root violates the allowlist.
#   - Refuses commit if a hardcoded /Users/ or C:\ path is in app/src/.
#   - Reminds about /challenge if reference/ or app/src/ changed.
#   - Exits 0 on success, non-zero to block commit.

set -u

# Allowed root files (in addition to allowed root directories)
ALLOWED_ROOT_FILES_REGEX='^(framework\.md|CLAUDE\.md|DESIGN-REQUIREMENTS\.md|README\.md|package\.json|vite\.config\.js|eslint\.config\.js|index\.html|\.gitignore|\.gitattributes|LICENSE)$'
ALLOWED_ROOT_DIRS_REGEX='^(app|_workspace|reference|\.claude|\.vscode)$'

EXIT=0

# Check for .DS_Store
if git diff --cached --name-only | grep -q 'DS_Store$'; then
  echo "❌ pre-commit: .DS_Store is staged. Add to .gitignore and unstage."
  EXIT=1
fi

# Check root clutter (Pass 1 of auditor; HT-CORE-005 light)
git diff --cached --name-only --diff-filter=A | while IFS= read -r f; do
  case "$f" in
    */*) ;;  # nested file, fine
    *)
      if ! echo "$f" | grep -qE "$ALLOWED_ROOT_FILES_REGEX"; then
        # Is it a directory addition? skip
        if [ -d "$f" ]; then
          if ! echo "$f" | grep -qE "$ALLOWED_ROOT_DIRS_REGEX"; then
            echo "⚠️ pre-commit: new root entry '$f' is not in the allowlist. See framework.md / auditor Pass 1."
          fi
        else
          echo "❌ pre-commit: new root file '$f' violates root hygiene. See framework.md / auditor Pass 1."
          EXIT=1
        fi
      fi
      ;;
  esac
done

# Check for hardcoded paths in app/src/
if git diff --cached --diff-filter=AM -- 'app/src/*.js' 'app/src/*.jsx' 2>/dev/null | grep -q '^+.*\(/Users/\|C:\\\\\)'; then
  echo "❌ pre-commit: hardcoded absolute path detected in staged app/src/ changes. See HT-CORE auditor Pass 4."
  EXIT=1
fi

# Reminder
if git diff --cached --name-only | grep -qE '^(app/src/|reference/|framework\.md|CLAUDE\.md|DESIGN-REQUIREMENTS\.md|\.claude/agents/)'; then
  echo "ℹ️ pre-commit: governed paths changed. Consider running /challenge before pushing."
fi

exit $EXIT
