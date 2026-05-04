/**
 * Alert.jsx — MD3 Alert (inline alert) primitive
 * AC-P1B-CONTAINERS
 *
 * Severities: info | success | warning | error
 * Props: severity, message, onClose (optional dismiss button)
 *
 * All colours via CSS variables — no hex in JSX.
 */
export function Alert({ severity = 'info', message, onClose, children, className = '' }) {
  // error and warning are assertive; info and success are polite
  const isAssertive = severity === 'error' || severity === 'warning';

  const classes = [
    'md3-alert',
    `md3-alert--${severity}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      role={isAssertive ? 'alert' : 'status'}
      aria-live={isAssertive ? 'assertive' : 'polite'}
    >
      <span className="md3-alert__message">{message ?? children}</span>
      {onClose && (
        <button
          type="button"
          className="md3-alert__dismiss"
          onClick={onClose}
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
}
