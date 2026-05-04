/**
 * IconButton.jsx — MD3 IconButton primitive
 * AC-P1B-CHROME
 *
 * Shapes: round | square
 * Sizes: small | medium | large
 * States: selected / deselected (aria-pressed for filter contexts)
 *
 * All colours via CSS variables — no hex in JSX.
 */
export function IconButton({
  shape = 'round',
  size = 'medium',
  selected,
  disabled = false,
  onClick,
  children,
  className = '',
  'aria-label': ariaLabel,
  ...rest
}) {
  const classes = [
    'md3-icon-btn',
    `md3-icon-btn--${shape}`,
    `md3-icon-btn--${size}`,
    selected ? 'md3-icon-btn--selected' : '',
    disabled ? 'md3-icon-btn--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // aria-pressed only when selected prop is provided (filter / toggle context)
  const ariaPressed = selected !== undefined ? String(Boolean(selected)) : undefined;

  return (
    <button
      type="button"
      className={classes}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      {...rest}
    >
      <span className="md3-icon-btn__icon" aria-hidden="true">{children}</span>
    </button>
  );
}
