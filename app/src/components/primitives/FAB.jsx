/**
 * FAB.jsx — MD3 Floating Action Button primitive
 * AC-P1B-NAV
 *
 * Props: icon, label (aria-label for regular, visible text for extended), extended, onClick
 * All colours via CSS variables — no hex in JSX.
 */
export function FAB({ icon, label, extended = false, onClick, disabled = false, className = '' }) {
  const classes = [
    'md3-fab',
    extended ? 'md3-fab--extended' : 'md3-fab--regular',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={extended ? undefined : label}
    >
      <span className="md3-fab__icon" aria-hidden="true">{icon}</span>
      {extended && <span className="md3-fab__label">{label}</span>}
    </button>
  );
}
