/**
 * Badge.jsx — MD3 Badge primitive (extended from P0 C1)
 * AC-P1B-DISPLAY · AC-P0-C1 (backward compatible)
 *
 * MD3 variants: dot | label (use md3-badge class system)
 * Legacy variants: any other string maps to badge + badge-{variant} for P0 consumers.
 *
 * All colours via CSS variables — no hex in JSX.
 *
 * @param {object}         props
 * @param {string|number}  [props.label]    - Text/count to display
 * @param {'dot'|'label'|string} [props.variant] - MD3 variant or legacy variant string
 * @param {string}         [props.className] - Additional class names
 */
export function Badge({ label, variant, className = '' }) {
  const md3Variants = new Set(['dot', 'label']);
  const isMd3 = variant && md3Variants.has(variant);

  if (isMd3) {
    return (
      <span className={`md3-badge md3-badge--${variant} ${className}`.trim()}>
        {variant !== 'dot' && label !== undefined ? label : null}
      </span>
    );
  }

  // Legacy P0 behavior
  const variantClass = variant ? `badge-${variant}` : '';
  return (
    <span className={`badge ${variantClass} ${className}`.trim()}>
      {label}
    </span>
  );
}
