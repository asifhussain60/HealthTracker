/**
 * Badge.jsx — Label pill with variant styling.
 *
 * AC-P0-C1
 * Extracted from inline badge spans in TodayView / InventoryView.
 * All colours use CSS variables via existing badge-* classes.
 *
 * @param {object} props
 * @param {string} props.label        - Text to display
 * @param {string} [props.variant]    - CSS variant suffix (e.g. 'cannabis' → 'badge-cannabis')
 * @param {string} [props.className]  - Additional class names
 */
export function Badge({ label, variant, className = '' }) {
  const variantClass = variant ? `badge-${variant}` : '';
  return (
    <span className={`badge ${variantClass} ${className}`.trim()}>
      {label}
    </span>
  );
}
