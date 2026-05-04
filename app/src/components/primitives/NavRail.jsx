/**
 * NavRail.jsx — MD3 NavRail primitive (tablet 600-904px)
 * AC-P1B-NAV
 *
 * Props: items [{id, label, icon}], activeId, onNavigate
 * All colours via CSS variables — no hex in JSX.
 */
export function NavRail({ items = [], activeId, onNavigate, className = '' }) {
  return (
    <nav className={`md3-nav-rail ${className}`.trim()} aria-label="Main navigation">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={[
            'md3-nav-rail__item',
            activeId === item.id ? 'md3-nav-rail__item--active' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-current={activeId === item.id ? 'page' : undefined}
          onClick={() => onNavigate?.(item.id)}
        >
          <span className="md3-nav-rail__icon" aria-hidden="true">{item.icon}</span>
          <span className="md3-nav-rail__label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
