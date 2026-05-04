/**
 * TopAppBar.jsx — MD3 TopAppBar primitive
 * AC-P1B-NAV
 *
 * Props: title, actions (slot), leadingAction (slot)
 * All colours via CSS variables — no hex in JSX.
 */
export function TopAppBar({ title, actions, leadingAction, className = '' }) {
  return (
    <header className={`md3-top-app-bar ${className}`.trim()}>
      {leadingAction && (
        <div className="md3-top-app-bar__leading">{leadingAction}</div>
      )}
      <h1 className="md3-top-app-bar__title">{title}</h1>
      {actions && (
        <div className="md3-top-app-bar__actions">{actions}</div>
      )}
    </header>
  );
}
