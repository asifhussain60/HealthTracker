/**
 * tokens-md3.test.js — B1 RED: MD3 full-conformance token check
 * AC-P1B-TOKENS
 *
 * Reads tokens.css as raw text via fs (same pattern as existing tokens.test.js)
 * and asserts every required MD3 token is present by name.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const tokensPath = join(process.cwd(), 'src', 'styles', 'tokens.css');
const css = readFileSync(tokensPath, 'utf-8');

const REQUIRED_TOKENS = [
  // Color — blue primary + role aliases
  '--primary',
  '--primary-container',
  '--on-primary',
  '--on-primary-container',
  '--secondary',
  '--secondary-container',
  '--on-secondary',
  '--tertiary',
  '--success',
  '--warning',
  '--error',
  '--error-container',
  '--on-error',

  // Surface + on-surface
  '--surface',
  '--surface-variant',
  '--surface-container',
  '--surface-container-low',
  '--surface-container-high',
  '--on-surface',
  '--on-surface-dim',
  '--on-surface-faint',
  '--background',
  '--on-background',
  '--border',
  '--outline',
  '--outline-variant',

  // State overlays (MD3 opacity values)
  '--state-hover',
  '--state-pressed',
  '--state-focus',
  '--state-dragged',

  // Elevation (flat shell)
  '--elev-0',
  '--elev-1',
  '--elev-2',
  '--elev-3',

  // Typography — sizes
  '--text-display-lg',
  '--text-display-sm',
  '--text-headline',
  '--text-title-lg',
  '--text-title-sm',
  '--text-body-lg',
  '--text-body-sm',
  '--text-label',
  '--text-caption',

  // Typography — weights
  '--weight-display',
  '--weight-headline',
  '--weight-title',
  '--weight-body',
  '--weight-label',

  // Font stack
  '--font-sans',
  '--font-mono',

  // Spacing (4px base scale)
  '--space-1',
  '--space-2',
  '--space-3',
  '--space-4',
  '--space-5',
  '--space-6',
  '--space-8',
  '--space-12',
  '--space-16',

  // Radius scale
  '--radius-xs',
  '--radius-sm',
  '--radius-md',
  '--radius-lg',
  '--radius-xl',
  '--radius-pill',

  // Motion tokens
  '--motion-duration-short',
  '--motion-duration-medium',
  '--motion-duration-long',
  '--motion-easing-standard',
  '--motion-easing-decelerate',
  '--motion-easing-accelerate',
];

describe('tokens.css — MD3 full conformance (B1 AC-P1B-TOKENS)', () => {
  it('file is non-empty', () => {
    expect(css.trim().length).toBeGreaterThan(500);
  });

  it('blue primary token uses oklch(55% 0.15 262)', () => {
    expect(css).toMatch(/--primary\s*:\s*oklch\s*\(\s*55%\s+0\.15\s+262\s*\)/);
  });

  it('light theme block exists ([data-theme="light"])', () => {
    expect(css).toMatch(/\[data-theme="light"\]/);
  });

  it('flat shell: elev-0 is declared', () => {
    expect(css).toContain('--elev-0');
  });

  it('spacing scale covers all 9 steps', () => {
    const steps = ['--space-1', '--space-2', '--space-3', '--space-4', '--space-5',
                   '--space-6', '--space-8', '--space-12', '--space-16'];
    steps.forEach((s) => expect(css, `${s} missing`).toContain(s));
  });

  it('radius scale has all 6 sizes including pill', () => {
    ['--radius-xs', '--radius-sm', '--radius-md', '--radius-lg', '--radius-xl', '--radius-pill']
      .forEach((r) => expect(css, `${r} missing`).toContain(r));
  });

  it('motion tokens (3 durations + 3 easings) all present', () => {
    ['--motion-duration-short', '--motion-duration-medium', '--motion-duration-long',
     '--motion-easing-standard', '--motion-easing-decelerate', '--motion-easing-accelerate']
      .forEach((m) => expect(css, `${m} missing`).toContain(m));
  });

  it('state overlay tokens present', () => {
    ['--state-hover', '--state-pressed', '--state-focus', '--state-dragged']
      .forEach((s) => expect(css, `${s} missing`).toContain(s));
  });

  REQUIRED_TOKENS.forEach((token) => {
    it(`defines ${token}`, () => {
      expect(css, `${token} must be defined in tokens.css`).toContain(token);
    });
  });
});
