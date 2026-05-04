/**
 * ProgressBar.jsx — MD3 linear progress bar
 * AC-P1B-DISPLAY
 *
 * Props: value (0-1), label (aria-label), indeterminate
 * All colours via CSS variables — no hex in JSX.
 */
export function ProgressBar({ value = 0, label, indeterminate = false, className = '' }) {
  const clamped = Math.min(1, Math.max(0, value));
  const percent = Math.round(clamped * 100);

  const classes = [
    'md3-progress-bar',
    indeterminate ? 'md3-progress-bar--indeterminate' : 'md3-progress-bar--determinate',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      role="progressbar"
      aria-label={label}
      aria-valuenow={indeterminate ? undefined : percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="md3-progress-bar__fill"
        style={indeterminate ? undefined : { width: `${percent}%` }}
      />
    </div>
  );
}
