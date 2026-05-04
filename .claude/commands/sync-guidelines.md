# /sync-guidelines — Re-sync Anthropic Guidelines YAML

Re-fetch anthropic.com/learn + linked engineering posts and produce a diff against `reference/governance/anthropic-guidelines.yaml`.

---

## Procedure

1. **Fetch index:**
   ```bash
   curl -sL "https://www.anthropic.com/engineering" -A "Mozilla/5.0" | grep -oE 'href="[^"]+"' | grep -E '/engineering/' | sort -u
   ```

2. **Fetch each linked engineering post** (limit ~25 to keep token cost manageable). Skip duplicates.

3. **Parse content** — extract testable principles only ("do X", "don't Y", "consider Z").

4. **Synthesize candidate YAML** matching the schema in `reference/governance/anthropic-guidelines.yaml`.

5. **Diff:**
   - New principles → propose with rationale.
   - Removed principles → propose archival (move to `_workspace/archive/`, don't delete from history).
   - Changed principles → propose edit with side-by-side.

6. **Detect contradictions** between new content and existing entries; surface them in the diff.

7. **Output** a diff-formatted preview, NOT a write:

```markdown
## Anthropic Guidelines Sync — <date>

### New principles to add
- [ANT-080] <principle>: <detail> (sources: [<post-id>])

### Modified principles
- [ANT-010] <was>: <new>: <reason>

### Archived (sources removed)
- [ANT-XXX] <was>: archived because source post no longer linked from /engineering

### Contradictions surfaced
- <description>: <reconciliation>

### Diff stat
- +N principles, ~N modified, -N archived
```

8. **Wait for user approval** before writing changes to `reference/governance/anthropic-guidelines.yaml`.

## Hard rule

NEVER write to `reference/governance/anthropic-guidelines.yaml` without explicit user approval of the diff. Per HT-CORE-007 (No Fabricated Evidence) and HT-CORE-003 (SSOT), the YAML reflects what's actually published, not what we recall.

## End-state contract

End with:
```
### ⚡ If you say proceed, I will:
1. Apply the diff above to reference/governance/anthropic-guidelines.yaml.
2. Bump the meta.generated_at field.
3. Commit as `chore(governance): sync Anthropic guidelines <date>`.
```
