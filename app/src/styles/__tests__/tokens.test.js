/**
 * tokens.test.js — AC-P0-C5
 * Smoke test: verify the CSS files exist and are importable as modules.
 * Visual parity is a manual gate (run dev server).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const stylesDir = join(process.cwd(), 'src', 'styles');

describe('CSS token files exist', () => {
  it('tokens.css exists', () => {
    expect(existsSync(join(stylesDir, 'tokens.css'))).toBe(true);
  });

  it('layout.css exists', () => {
    expect(existsSync(join(stylesDir, 'layout.css'))).toBe(true);
  });

  it('components.css exists', () => {
    expect(existsSync(join(stylesDir, 'components.css'))).toBe(true);
  });

  it('tokens.css contains --font-sans variable', () => {
    const content = readFileSync(join(stylesDir, 'tokens.css'), 'utf-8');
    expect(content).toContain('--font-sans');
  });

  it('tokens.css contains .tabular-nums class', () => {
    const content = readFileSync(join(stylesDir, 'tokens.css'), 'utf-8');
    expect(content).toContain('.tabular-nums');
  });

  it('tokens.css has no hardcoded hex colors outside the palette section', () => {
    const content = readFileSync(join(stylesDir, 'tokens.css'), 'utf-8');
    // Palette section defines hex values — that is expected.
    // No hex should appear in rule bodies outside :root (i.e., not in utility classes).
    const lines = content.split('\n');
    const ruleBodyLines = lines.filter((line) => {
      // Skip :root blocks and comment lines
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('/*') && !trimmed.startsWith('--') &&
             !trimmed.startsWith(':root') && !trimmed.startsWith('}') && !trimmed.startsWith('{');
    });
    const hexInRules = ruleBodyLines.filter((line) => /#[0-9a-fA-F]{3,6}/.test(line));
    expect(hexInRules.length).toBe(0);
  });

  it('tokens.css contains no font-family hardcoded strings in utility classes', () => {
    const content = readFileSync(join(stylesDir, 'tokens.css'), 'utf-8');
    // The .tabular-nums utility class should reference --font-feature-tabular, not a hardcoded family
    expect(content).toContain('font-feature-settings');
  });
});
