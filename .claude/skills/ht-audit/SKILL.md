---
name: ht-audit
description: 4-pass audit procedure (Structure → Code → Architecture → Brittleness). Loaded by auditor.agent.md.
---

# ht-audit — 4-Pass Audit

Operationalizes the auditor's 4-pass procedure. Inspired by CORTEX repo-surgeon.

## Pass 1 — Structure (`auditor.agent.md` Pass 1)

**Goal:** repo root is clean; files live in governed locations.

```bash
# Allowed at root only:
ls -1 | grep -v -E '^(framework\.md|CLAUDE\.md|README\.md|package\.json|vite\.config\.js|eslint\.config\.js|index\.html|\.gitignore|\.gitattributes|LICENSE|app|_workspace|reference|photos)$' | grep -v -E '^\.'

# Empty directories
find . -type d -empty -not -path './.git/*' -not -path '*/node_modules/*'

# .DS_Store leak
git ls-files | grep DS_Store
```

## Pass 2 — Code

```bash
# Orphaned CSS
for f in app/src/styles/*.css; do
  base=$(basename "$f")
  grep -rq "$base" app/src/ 2>/dev/null || echo "ORPHANED CSS: $f"
done

# Orphaned components
for f in app/src/components/**/*.jsx; do
  base=$(basename "$f" .jsx)
  grep -rq "$base" app/src/ 2>/dev/null || echo "ORPHANED COMPONENT: $f"
done

# console.log in production code
grep -rn 'console\.log' app/src/ --include='*.js' --include='*.jsx' | grep -v __tests__/
```

## Pass 3 — Architecture

```bash
# View imports store directly (HT-CORE-010 + arch violation)
grep -rn "from.*data/store" app/src/views/ --include='*.jsx' | grep -v repositories

# Hardcoded user IDs outside AuthContext
grep -rn "userId: 'me'" app/src/ --include='*.js' --include='*.jsx' | grep -v contexts/AuthContext

# Schema records without audit fields (heuristic — find { id: ... } literal definitions)
grep -rn "createdAt:" app/src/data/store/ | wc -l
```

## Pass 4 — Brittleness

```bash
# Hardcoded paths
grep -rn '/Users/\|C:\\\\' app/src/ --include='*.js' --include='*.jsx'

# Stale branch refs
grep -rn 'refine-all-redesign\|main-old' .github/agents/ .claude/agents/ 2>/dev/null

# Broken markdown links
grep -rnoP '\[.*?\]\(((?!http)[^)]+)\)' framework.md reference/ .github/agents/ 2>/dev/null | while IFS=: read -r file line match; do
  path=$(echo "$match" | grep -oP '\(([^)]+)\)' | tr -d '()')
  [[ -e "$path" || "$path" =~ ^# ]] || echo "BROKEN LINK in $file:$line → $path"
done

# Zombie TODO/FIXME
grep -rn 'TODO\|FIXME\|HACK\|XXX' app/src/ --include='*.js' --include='*.jsx'
```

## Repair Plan format

```markdown
## Repair Plan — <date>

### Critical (BLOCKED)
1. <finding> → <fix>

### High (architectural debt; this phase)
1. <finding> → <fix>

### Medium (hygiene; backlog ok)
1. <finding> → <fix>

### Low (cosmetic)
1. <finding> → <fix>

### Deferred (needs human decision)
1. <finding> → <options>
```

## Execution rules

1. **Preview first.** Always show plan; user approves before execution.
2. **Non-destructive.** Move > delete. Deprecate > remove.
3. **Destructive ops require user confirmation.** Deletions, agent removals.
4. **Batch commits.** One per pass: `audit(P{N}): <summary>`.
5. **Update registries.** After structural change: `framework.md`, `AGENT-INDEX.md`.
6. **Log.** Append to `_workspace/scratch/audit-trail.md`.

## Reporting

```markdown
## Audit Summary
- Pass 1 Structure: <N findings>  (<N critical>)
- Pass 2 Code: <N findings>
- Pass 3 Architecture: <N findings>
- Pass 4 Brittleness: <N findings>
- **Total:** <N findings> (<N P0>, <N P1>, <N P2>)
- **Verdict:** PASS | WARN | BLOCK
```
