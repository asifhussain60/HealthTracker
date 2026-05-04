/**
 * List.jsx — MD3 List + ListItem primitives
 * AC-P1B-DATA
 *
 * List: density variants (default / compact / comfortable)
 * ListItem: leading/trailing slots, divider, onClick
 *
 * All colours via CSS variables — no hex in JSX.
 */

export function List({ children, density = 'default', className = '' }) {
  const classes = [
    'md3-list',
    density !== 'default' ? `md3-list--${density}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <ul className={classes} role="list">
      {children}
    </ul>
  );
}

export function ListItem({
  label,
  supporting,
  leading,
  trailing,
  divider = false,
  onClick,
  className = '',
}) {
  const classes = [
    'md3-list-item',
    divider ? 'md3-list-item--divider' : '',
    onClick ? 'md3-list-item--interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {leading && <span className="md3-list-item__leading" aria-hidden="true">{leading}</span>}
      <span className="md3-list-item__content">
        <span className="md3-list-item__label">{label}</span>
        {supporting && <span className="md3-list-item__supporting">{supporting}</span>}
      </span>
      {trailing && <span className="md3-list-item__trailing">{trailing}</span>}
    </>
  );

  if (onClick) {
    return (
      <li className={classes}>
        <button type="button" className="md3-list-item__btn" onClick={onClick}>
          {content}
        </button>
      </li>
    );
  }

  return <li className={classes}>{content}</li>;
}
