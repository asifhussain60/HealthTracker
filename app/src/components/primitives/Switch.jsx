/**
 * Switch.jsx — MD3 Switch primitive
 * AC-P1B-FORM
 *
 * Props: label, checked, onChange, disabled, id
 * Renders a native checkbox with role="switch".
 *
 * All colours via CSS variables — no hex in JSX.
 */
export function Switch({
  label,
  id,
  checked = false,
  onChange,
  disabled = false,
  className = '',
}) {
  const switchId = id ?? `md3-switch-${Math.random().toString(36).slice(2)}`;

  return (
    <div className={`md3-switch-wrapper ${className}`.trim()}>
      <input
        id={switchId}
        type="checkbox"
        role="switch"
        className="md3-switch__input"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        aria-checked={checked}
      />
      {label && (
        <label className="md3-switch__label" htmlFor={switchId}>{label}</label>
      )}
    </div>
  );
}
