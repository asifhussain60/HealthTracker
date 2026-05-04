/**
 * EmptyState.jsx — MD3 EmptyState primitive (extended from P0 C1)
 * AC-P1B-DATA · AC-P0-C1 (backward compatible)
 *
 * Props: icon, heading, body, cta, size (small/medium/large)
 * All colours via CSS variables — no hex in JSX.
 *
 * @param {object} props
 * @param {string} [props.icon]       - Emoji or text icon displayed above heading
 * @param {string} props.heading      - Primary heading text
 * @param {string} [props.body]       - Supporting body text
 * @param {React.ReactNode} [props.cta] - Call-to-action element (e.g. a button)
 * @param {'small'|'medium'|'large'} [props.size] - Size variant
 * @param {string} [props.className]  - Additional class names
 */
export function EmptyState({ icon, heading, body, cta, size, className = '' }) {
  const classes = [
    'empty-state',
    size ? `empty-state--${size}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div role="status" className={classes}>
      {icon && <div className="empty-state-icon" aria-hidden="true">{icon}</div>}
      <div className="empty-state-heading">{heading}</div>
      {body && <div className="empty-state-body">{body}</div>}
      {cta && <div className="empty-state-cta">{cta}</div>}
    </div>
  );
}
