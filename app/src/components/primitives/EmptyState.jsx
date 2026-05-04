/**
 * EmptyState.jsx — Icon + heading + body + CTA placeholder.
 *
 * AC-P0-C1
 * Replaces scattered empty-state divs across the app with a consistent component.
 * All colours use CSS variables only.
 *
 * @param {object} props
 * @param {string} [props.icon]       - Emoji or text icon displayed above heading
 * @param {string} props.heading      - Primary heading text
 * @param {string} [props.body]       - Supporting body text
 * @param {React.ReactNode} [props.cta] - Call-to-action element (e.g. a button)
 * @param {string} [props.className]  - Additional class names
 */
export function EmptyState({ icon, heading, body, cta, className = '' }) {
  return (
    <div role="status" className={`empty-state ${className}`.trim()}>
      {icon && <div className="empty-state-icon" aria-hidden="true">{icon}</div>}
      <div className="empty-state-heading">{heading}</div>
      {body && <div className="empty-state-body">{body}</div>}
      {cta && <div className="empty-state-cta">{cta}</div>}
    </div>
  );
}
