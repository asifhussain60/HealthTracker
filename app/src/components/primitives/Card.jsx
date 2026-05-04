/**
 * Card.jsx — Basic card container with optional header/body slots.
 *
 * AC-P0-C1
 * Maps to the existing .v2-card system in index.css.
 * All colours use CSS variables only.
 *
 * @param {object} props
 * @param {React.ReactNode} [props.header]  - Header slot content
 * @param {React.ReactNode} props.children  - Body content
 * @param {string} [props.variant]          - CSS variant suffix (e.g. 'cannabis' → 'v2-card--cannabis')
 * @param {string} [props.className]        - Additional class names
 */
export function Card({ header, children, variant, className = '' }) {
  const variantClass = variant ? `v2-card--${variant}` : '';
  return (
    <div className={`v2-card ${variantClass} ${className}`.trim()}>
      {header && <div className="v2-card-header">{header}</div>}
      {children}
    </div>
  );
}
