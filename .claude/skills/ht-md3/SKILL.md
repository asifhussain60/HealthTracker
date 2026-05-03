---
name: ht-md3
description: Material Design 3 conformance checklist for HealthTracker. Auto-loaded by ui-reviewer.agent.md. Use when reviewing or implementing any UI work in app/src/components/, app/src/views/, or app/src/styles/.
---

# Material Design 3 Conformance Checklist

This skill encodes the MD3 spec from [DESIGN-REQUIREMENTS.md](../../../DESIGN-REQUIREMENTS.md) §3 as a runnable checklist.

## A. Tokens
- [ ] No inline hex colors anywhere in JSX (`grep -rE "#[0-9a-fA-F]{3,8}" app/src/components app/src/views | grep -v tokens.css`)
- [ ] No inline `style={{ color }}` / `background` / `padding` / `margin` — use a class
- [ ] All colors reference MD3 token names (`primary`, `surface-container-high`, `on-surface`, etc.)
- [ ] Spacing is on the 4 px scale (via tokens), no 5/7/9 px values
- [ ] Border radius is one of `radius-sm/md/lg/pill` (8/12/16/999)

## B. Components
- [ ] Card padding 12–16 px (use `Card` primitive, never raw `<div>`)
- [ ] Buttons: filled / tonal / outlined / text / icon — exactly one variant per CTA
- [ ] Chips for filterable categories, not buttons
- [ ] Switches for booleans, not custom checkboxes
- [ ] Bottom sheets on mobile, side panels on desktop, modals reserved for blocking flows

## C. Iconography
- [ ] Material Symbols rounded variant only
- [ ] Tree-shaken or sprited — no `import * from 'material-symbols'`
- [ ] Icon-only buttons have `aria-label`
- [ ] Decorative icons have `aria-hidden="true"`

## D. Responsive
- [ ] Component uses container queries OR consumes a `useBreakpoint()` hook
- [ ] Mobile (< 600 px): single-column, bottom nav, sticky FAB
- [ ] Tablet (600–904 px): navigation rail
- [ ] Small desktop (905–1239 px): collapsible drawer
- [ ] Desktop (1240 px+): persistent drawer + optional right pane
- [ ] Tables become list cards on mobile

## E. Accessibility
- [ ] Keyboard navigable (Tab order matches visual order)
- [ ] `:focus-visible` outline 2 px offset; never `outline:none` without replacement
- [ ] Color is never the only signal (icon + text + color)
- [ ] Contrast ≥ 4.5:1 for text, ≥ 3:1 for UI
- [ ] Modals: `role="dialog"`, `aria-modal`, focus trap, Esc closes, restore focus
- [ ] `prefers-reduced-motion` honored on all transitions

## F. UX patterns
- [ ] Skeleton loader for any route taking > 100 ms to mount
- [ ] Optimistic update for log/check actions
- [ ] Empty state has icon + title + description + primary action
- [ ] Snackbar for minor confirmations, inline alert for important issues
- [ ] Inline form validation, no modal-stacked errors

## G. Performance
- [ ] Initial JS ≤ 180 KB gzip (`npm run build` then check `dist/`)
- [ ] Heavy charts (recharts) lazy-loaded (`React.lazy`)
- [ ] Lists > 50 rows virtualized (`react-virtual` or equivalent)
- [ ] Search inputs debounced 200 ms
- [ ] No `console.log` in committed code
- [ ] CLS ≤ 0.05; LCP ≤ 2.0 s on simulated 4G

## H. Output format

When loaded by `ui-reviewer`, walk each section A → H and emit one finding per failed check:

```
[P0|P1|P2] [Section X] file:line — short description
  Recommended fix: ...
```

Verdict line at the end:
- ✅ All sections clean — pass
- 🛑 Findings present — block with priority counts (e.g., "2 P0, 5 P1, 3 P2")
