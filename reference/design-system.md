# HealthTracker — Design System

**Status:** active · **Owner:** architect · **Last updated:** 2026-05-03

The design language is **dense, calm, dark-first, clinically readable**. Inspired by health-pro dashboards (Whoop, Oura, MyFitnessPal Premium) and tuned for medical-grade tracking.

## Tokens (CSS custom properties)

Defined in `app/src/styles/tokens.css` (split out of the monolithic `index.css` in Phase 0 commit B-styles).

### Color
```css
--teal:        #14b8a6;  /* primary, CTAs, selected, "good" */
--teal-bg:     rgba(20, 184, 166, 0.12);
--teal-dim:    #0f766e;

--orange:      #f97316;  /* calories, warnings */
--orange-bg:   rgba(249, 115, 22, 0.12);
--orange-dim:  #c2410c;

--green:       #22c55e;  /* progress, weight, success */
--green-bg:    rgba(34, 197, 94, 0.12);
--green-dim:   #15803d;

--yellow:      #eab308;  /* carbs, medium-priority, caution */
--yellow-bg:   rgba(234, 179, 8, 0.12);

--red:         #ef4444;  /* over-limit, high-risk, blocked */
--red-bg:      rgba(239, 68, 68, 0.12);

--surface:     #0f172a;  /* card background */
--surface-2:   #1e293b;  /* nested surface */
--bg:          #020617;  /* page background */
--text:        #f1f5f9;  /* primary text */
--text-dim:    #94a3b8;  /* secondary text */
--text-faint:  #475569;  /* tertiary / disabled */
--border:      #334155;
```

### Typography
```css
--font-stack: -apple-system, BlinkMacSystemFont, "Segoe UI Variable",
              "Segoe UI", system-ui, Roboto, Helvetica, Arial, sans-serif;
font-feature-settings: "tnum" 1;  /* tabular numerals on data */
```

Sizes: `--text-xs: 0.75rem`, `--text-sm: 0.875rem`, `--text-base: 1rem`, `--text-lg: 1.125rem`, `--text-xl: 1.5rem`, `--text-2xl: 2rem`, `--text-hero: 3rem`.

### Spacing
4px scale: `--space-1: 4px` … `--space-12: 48px`. No 5px, no 7px.

### Radius
`--radius-sm: 6px`, `--radius-md: 10px`, `--radius-lg: 16px`, `--radius-pill: 999px`.

### Shadow
`--shadow-card: 0 1px 0 rgba(255,255,255,.04) inset, 0 4px 12px rgba(0,0,0,.4);`

### Motion
`--ease: cubic-bezier(0.2, 0.8, 0.2, 1);`
`--dur-fast: 120ms`, `--dur-base: 200ms`, `--dur-slow: 320ms`.
All animations honor `prefers-reduced-motion: reduce`.

## Primitives (`app/src/components/primitives/`)

| Primitive | Purpose | Props |
|---|---|---|
| `RingChart` | SVG donut ring | `value, max, colorClass, size, stroke, children` |
| `MacroBar` | Horizontal progress | `label, value, max, colorClass` |
| `Stars` | 1–3 favorite rating | `value, onChange, readonly` |
| `Badge` | Pill label | `variant: success\|warning\|error\|info\|neutral, children` |
| `FormField` | label+helper+error+id wrapper | `label, error, helper, children` |
| `Card` | Surface wrapper | `variant: flat\|elevated\|module, accent: teal\|orange\|...` |
| `Modal` | Dialog wrapper | `title, onClose, children` (existing; ARIA-compliant) |
| `EmptyState` | Empty UI | `icon, title, description, cta` |
| `Skeleton` | Loading placeholder | `variant: row\|card\|ring` |

## Card pattern

```jsx
<Card variant="elevated" accent="cannabis">
  <Card.Header icon={...} title="Cannabis Inventory" action={...} />
  <Card.Body>...</Card.Body>
</Card>
```

Cards have a 2px top accent border using the accent token (`--cannabis-accent: var(--teal)` for cannabis, `--food-accent: var(--orange)` for food, etc.). Hover shadow uses the accent at 12% opacity.

## Naming conventions

- CSS classes: `.v2-*` for the redesigned design system; legacy classes deprecated in commits.
- Components: PascalCase, one component per file in `components/primitives/`, grouped by domain in `components/cards/`, `components/modals/`.
- Tests: co-located in `__tests__/<Component>.test.jsx`.

## Accessibility (WCAG AA)

- Contrast: text 4.5:1, UI 3:1 (verified per token pair).
- Focus: `:focus-visible` outline with 2px offset; never `outline:none` without replacement.
- Color is never the only signal: badges have text + icon + color.
- All interactive elements `<button>` or have `role="button"` + `tabIndex={0}` + `onKeyDown` handlers.
- Modals: `role="dialog"`, `aria-modal="true"`, focus trap, Esc closes, restore focus on close.

## Cross-platform

- System font stack ensures native rendering on macOS (SF Pro) and Windows (Segoe UI).
- `font-variant-numeric: tabular-nums` on numeric components prevents Segoe's proportional jitter.
- Service worker caches `tokens.css` and primitives for offline-first.

## Anti-patterns (challenger flags these)

- Inline `style={{ color: '#14b8a6' }}` — use a class.
- Hardcoded hex outside `tokens.css`.
- New colors not in the token list.
- New sizes not on the 4px scale.
- Two badge implementations.
- Modal without `aria-modal`.
- Animation without reduced-motion guard.

## Component inventory (existing → migrating)

| Existing (single-file) | Target location | Phase |
|---|---|---|
| `RingChart` (defined in TodayView) | `components/primitives/RingChart.jsx` | C1 |
| `MacroBar` (defined in TodayView) | `components/primitives/MacroBar.jsx` | C1 |
| `Modal.jsx` | (already in components/) | (no move) |
| Inline badge styles | `components/primitives/Badge.jsx` | C1 |

## Future-proofing

A second theme (light mode) is a future concern. Today: `:root` holds tokens; flipping to `[data-theme="light"]` later requires no component changes — just sibling-scoped token overrides.
