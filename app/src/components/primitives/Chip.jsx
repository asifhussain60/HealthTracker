/**
 * Chip.jsx — MD3 Chip primitive
 * AC-P1B-CHROME
 *
 * Variants: assist | filter | input | suggestion
 * Features: leadingIcon, trailingIcon, selected state, disabled
 *
 * All colours via CSS variables — no hex in JSX.
 */
export function Chip({
  variant = 'assist',
  label,
  selected = false,
  disabled = false,
  leadingIcon,
  trailingIcon,
  onClick,
  className = '',
}) {
  const classes = [
    'md3-chip',
    `md3-chip--${variant}`,
    selected ? 'md3-chip--selected' : '',
    disabled ? 'md3-chip--disabled' : '',
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
      aria-pressed={variant === 'filter' ? selected : undefined}
    >
      {leadingIcon && <span className="md3-chip__leading-icon">{leadingIcon}</span>}
      <span className="md3-chip__label">{label}</span>
      {trailingIcon && <span className="md3-chip__trailing-icon">{trailingIcon}</span>}
    </button>
  );
}
