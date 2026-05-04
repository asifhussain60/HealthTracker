/**
 * Card.jsx — MD3 Card primitive (extended from P0 C1)
 * AC-P1B-CHROME · AC-P0-C1 (backward compatible)
 *
 * MD3 variants: filled | outlined | elevated
 * Legacy: any other variant value maps to v2-card--{variant} for P0 consumers.
 * No variant → v2-card (backward compat default).
 *
 * All colours via CSS variables — no hex in JSX.
 *
 * @param {object}            props
 * @param {React.ReactNode}   [props.header]     - Header slot content
 * @param {React.ReactNode}   props.children     - Body content
 * @param {'filled'|'outlined'|'elevated'|string} [props.variant] - Card variant
 * @param {string}            [props.className]  - Additional class names
 */
export function Card({ header, children, variant, className = '' }) {
  // MD3 variants use the new md3-card class system
  const md3Variants = new Set(['filled', 'outlined', 'elevated']);
  const isMd3 = variant && md3Variants.has(variant);

  let classes;
  if (isMd3) {
    classes = ['md3-card', `md3-card--${variant}`, className].filter(Boolean).join(' ');
  } else {
    // Legacy P0 behavior: v2-card (always present), v2-card--{variant} if provided
    const variantClass = variant ? `v2-card--${variant}` : '';
    classes = ['v2-card', variantClass, className].filter(Boolean).join(' ');
  }

  return (
    <div className={classes}>
      {header && <div className={isMd3 ? 'md3-card__header' : 'v2-card-header'}>{header}</div>}
      {children}
    </div>
  );
}
