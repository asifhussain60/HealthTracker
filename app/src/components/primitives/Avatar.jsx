/**
 * Avatar.jsx — MD3 Avatar primitive
 * AC-P1B-DISPLAY
 *
 * Props: initials | src+alt, size (small/medium/large)
 * All colours via CSS variables — no hex in JSX.
 */
export function Avatar({
  initials,
  src,
  alt = '',
  size = 'medium',
  className = '',
  'aria-label': ariaLabel,
  ...rest
}) {
  const classes = [
    'md3-avatar',
    `md3-avatar--${size}`,
    src ? 'md3-avatar--image' : 'md3-avatar--initials',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      role="img"
      aria-label={ariaLabel ?? (src ? alt : initials)}
      {...rest}
    >
      {src ? (
        <img src={src} alt="" className="md3-avatar__img" aria-hidden="true" />
      ) : (
        <span className="md3-avatar__initials" aria-hidden="true">
          {initials}
        </span>
      )}
    </div>
  );
}
