/**
 * md3-coverage.test.js — AC-S2-MD3-CSS
 *
 * RED gate: every md3-* class used in app/src/components/primitives/ JSX
 * must have at least one matching CSS rule in app/src/styles/md3.css.
 *
 * Strategy:
 *  1. Read every .jsx file under primitives/.
 *  2. Extract all class name tokens (static strings, dynamic concatenations).
 *  3. Filter to tokens starting with "md3-".
 *  4. Read md3.css and parse all .md3-* selectors.
 *  5. Assert 100% coverage.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';

const primitivesDir = join(process.cwd(), 'src', 'components', 'primitives');
const md3CssPath = join(process.cwd(), 'src', 'styles', 'md3.css');

// ── helpers ──────────────────────────────────────────────────────────────────

/** Recursively collect all .jsx files in a directory (not __tests__). */
function collectJsx(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory() && entry !== '__tests__') {
      files.push(...collectJsx(full));
    } else if (entry.endsWith('.jsx') || entry.endsWith('.tsx')) {
      files.push(full);
    }
  }
  return files;
}

/**
 * Extract md3-* class tokens from a JSX source string.
 *
 * Scans the entire source for BEM-valid md3-* tokens but excludes tokens
 * that appear in known non-className patterns (e.g. element ID literals
 * like `md3-cb-${id}` where the token is followed by a template expression
 * `${`).
 *
 * BEM pattern: md3-block[-segment]* [__element[-segment]*] [--modifier[-segment]*]
 */
function extractMd3Classes(source) {
  const found = new Set();
  // Match full BEM tokens: md3-block[-word]* (__element[-word]*)? (--modifier[-word]*)?
  const tokenRe = /md3-[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*(?:__[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)?(?:--[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)*/g;

  let m;
  while ((m = tokenRe.exec(source)) !== null) {
    const token = m[0];
    const afterToken = source.slice(m.index + token.length, m.index + token.length + 3);
    // Skip if the token is immediately followed by a template expression ${
    // — that means it's an ID prefix, not a class name.
    if (afterToken.startsWith('-${') || afterToken.startsWith('${')) {
      continue;
    }
    // Skip very short tokens (< 8 chars) that don't look like BEM blocks
    // e.g. "md3-cb", "md3-tf", "md3-time" (all < 9 chars, no element/modifier)
    const hasElement = token.includes('__');
    const hasModifier = token.includes('--');
    const isFullBlock = token.split('-').length >= 3; // md3 + block + segment e.g. md3-nav-rail
    if (!hasElement && !hasModifier && !isFullBlock && token.length < 12) {
      // These are short single-word stems — only keep them if they appear
      // in a className= context (preceded by className= or a quote character).
      const before = source.slice(Math.max(0, m.index - 20), m.index);
      if (!before.match(/className|['"`\[,\s]/)) {
        continue;
      }
    }
    found.add(token);
  }
  return found;
}

/**
 * Parse .md3-* selectors from CSS source.
 * Extracts the first class in each rule's selector list.
 * Handles comma-separated selectors, pseudo-classes, pseudo-elements, combinators.
 *
 * Uses the same full-hyphenated-BEM regex as the JSX extractor.
 */
function extractMd3CssClasses(css) {
  const found = new Set();
  // Match .md3-block[-word]* (__element[-word]*)? (--modifier[-word]*)?
  const selectorRe = /\.md3-[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*(?:__[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)?(?:--[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)*/g;
  let m;
  while ((m = selectorRe.exec(css)) !== null) {
    // Strip the leading dot
    found.add(m[0].slice(1));
  }
  return found;
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('MD3 CSS coverage (AC-S2-MD3-CSS)', () => {
  it('md3.css exists at app/src/styles/md3.css', () => {
    expect(existsSync(md3CssPath)).toBe(true);
  });

  it('every md3-* class used in primitives/ JSX has a rule in md3.css', () => {
    // Step 1: collect JSX
    const jsxFiles = collectJsx(primitivesDir);
    expect(jsxFiles.length).toBeGreaterThan(0);

    // Step 2+3: extract md3-* used in JSX
    const usedClasses = new Set();
    for (const file of jsxFiles) {
      const src = readFileSync(file, 'utf-8');
      for (const cls of extractMd3Classes(src)) {
        usedClasses.add(cls);
      }
    }
    expect(usedClasses.size).toBeGreaterThan(0);

    // Step 4: parse md3.css selectors
    expect(existsSync(md3CssPath)).toBe(true);
    const css = readFileSync(md3CssPath, 'utf-8');
    const definedClasses = extractMd3CssClasses(css);

    // Step 5: diff
    const missing = [...usedClasses].filter((cls) => !definedClasses.has(cls));

    if (missing.length > 0) {
      console.error(
        `\n  [md3-coverage] MISSING CSS rules for ${missing.length}/${usedClasses.size} md3-* classes:\n` +
          missing.map((c) => `    .${c}`).join('\n') +
          '\n'
      );
    }

    expect(missing, `Missing CSS rules for: ${missing.join(', ')}`).toHaveLength(0);
  });

  it('md3.css contains no raw hex color values', () => {
    if (!existsSync(md3CssPath)) return; // fails on existence test above
    const css = readFileSync(md3CssPath, 'utf-8');
    // Match #RGB, #RRGGBB, #RRGGBBAA (3-8 hex digits)
    const hexRe = /#[0-9a-fA-F]{3,8}\b/g;
    const hexMatches = css.match(hexRe) ?? [];
    // Allow #ffffff and #000000 as they're used in tokens.css on-primary/on-error
    // but md3.css should not have any hex at all
    expect(
      hexMatches,
      `md3.css must not contain hex colors. Found: ${hexMatches.join(', ')}`
    ).toHaveLength(0);
  });

  it('main.jsx imports md3.css', () => {
    const mainPath = join(process.cwd(), 'src', 'main.jsx');
    const src = readFileSync(mainPath, 'utf-8');
    expect(src).toContain("'./styles/md3.css'");
  });
});
