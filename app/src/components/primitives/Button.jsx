/**
 * Button.jsx — MD3 Button primitive
 * AC-P1B-CHROME
 *
 * Variants: filled | tonal | outlined | text | icon
 * Features: leadingIcon, trailingIcon, disabled, loading state
 *
 * All colours via CSS variables — no hex in JSX.
 */
export function Button({
  variant = 'filled',
  children,
  disabled = false,
  loading = false,
  leadingIcon,
  trailingIcon,
  onClick,
  type = 'button',
  className = '',
  'aria-label': ariaLabel,
  ...rest
}) {
  const classes = [
    'md3-btn',
    `md3-btn--${variant}`,
    loading ? 'md3-btn--loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={disabled || loading ? undefined : onClick}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      {...rest}
    >
      {leadingIcon && <span className="md3-btn__leading-icon" aria-hidden="true">{leadingIcon}</span>}
      {children}
      {trailingIcon && <span className="md3-btn__trailing-icon" aria-hidden="true">{trailingIcon}</span>}
    </button>
  );
}
