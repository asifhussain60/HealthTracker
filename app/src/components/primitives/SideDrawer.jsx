/**
 * SideDrawer.jsx — MD3 SideDrawer primitive (≥905px)
 * AC-P1B-NAV
 *
 * Props: open, items [{id, label, icon}], activeId, onNavigate, onClose
 * Decision #25: shows all 7 canonical parents + library sub-routes as collapsible groups
 *
 * All colours via CSS variables — no hex in JSX.
 */
export function SideDrawer({ open, items = [], activeId, onNavigate, onClose, className = '' }) {
  const classes = [
    'md3-side-drawer',
    open ? 'md3-side-drawer--open' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} aria-hidden={!open}>
      {open && (
        <div
          className="md3-side-drawer__backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <nav className="md3-side-drawer__panel" aria-label="Main navigation">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={[
              'md3-side-drawer__item',
              activeId === item.id ? 'md3-side-drawer__item--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-current={activeId === item.id ? 'page' : undefined}
            onClick={() => onNavigate?.(item.id)}
          >
            <span className="md3-side-drawer__icon" aria-hidden="true">{item.icon}</span>
            <span className="md3-side-drawer__label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
