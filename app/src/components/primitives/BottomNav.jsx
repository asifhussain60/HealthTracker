/**
 * BottomNav.jsx — MD3 BottomNav primitive (<600px)
 * AC-P1B-NAV
 *
 * Props: items [{id, label, icon}], activeId, onNavigate
 * Decision #25: 5-destination roster (Today · Plan · Food · Workouts · Cannabis)
 *
 * All colours via CSS variables — no hex in JSX.
 */
export function BottomNav({ items = [], activeId, onNavigate, className = '' }) {
  return (
    <nav className={`md3-bottom-nav ${className}`.trim()} aria-label="Main navigation">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={[
            'md3-bottom-nav__item',
            activeId === item.id ? 'md3-bottom-nav__item--active' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-current={activeId === item.id ? 'page' : undefined}
          onClick={() => onNavigate?.(item.id)}
        >
          <span className="md3-bottom-nav__icon" aria-hidden="true">{item.icon}</span>
          <span className="md3-bottom-nav__label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
