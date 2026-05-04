#!/bin/bash
# commit-msg.sh — Enforce AC_START / AC_COMPLETE pairing per HT-CORE-007 and
# `CLAUDE.md` § "Audit trail (AC markers)".
#
# Install via .claude/hooks/install-hooks.sh — copies to .git/hooks/commit-msg.
#
# Git invokes this hook with the path to the commit message file as $1.
# Block the commit if any AC_START AC-... line lacks a matching
# AC_COMPLETE AC-... line in the same message. Orphan AC_START → fail.

set -eu

MSG_FILE="${1:-}"
[ -n "$MSG_FILE" ] && [ -r "$MSG_FILE" ] || exit 0

starts=$(grep -c '^AC_START AC-' "$MSG_FILE" 2>/dev/null || echo 0)
completes=$(grep -c '^AC_COMPLETE AC-' "$MSG_FILE" 2>/dev/null || echo 0)

if [ "$starts" -ne "$completes" ]; then
  cat <<EOF
❌ commit-msg: AC marker pairing violation.
   AC_START   lines: $starts
   AC_COMPLETE lines: $completes

Every AC_START AC-<phase>-<commit> line must have a matching AC_COMPLETE.
HT-CORE-007 (No Fabricated Evidence). See CLAUDE.md § Audit trail.
EOF
  exit 1
fi

exit 0
