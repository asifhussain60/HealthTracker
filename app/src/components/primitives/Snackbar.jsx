/**
 * Snackbar.jsx — MD3 Snackbar primitive (bottom-screen transient)
 * AC-P1B-CONTAINERS
 *
 * Props: open, message, onClose, action { label, onClick }, duration (ms, default 4000)
 * Auto-dismisses after duration if onClose provided.
 *
 * All colours via CSS variables — no hex in JSX.
 */
import { useEffect } from 'react';

export function Snackbar({ open, message, onClose, action, duration = 4000, className = '' }) {
  // Auto-dismiss
  useEffect(() => {
    if (!open || !onClose) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [open, onClose, duration]);

  const classes = [
    'md3-snackbar',
    open ? 'md3-snackbar--open' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} role="status" aria-live="polite" aria-atomic="true">
      <span className="md3-snackbar__message">{message}</span>
      {action && (
        <button
          type="button"
          className="md3-snackbar__action"
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
