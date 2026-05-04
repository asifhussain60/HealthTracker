/**
 * ProgressRing.jsx — MD3 circular progress ring (conic-gradient pattern)
 * AC-P1B-DISPLAY
 *
 * Implements the calorie-ring pattern from the wireframe using SVG.
 * Props: value (0-1), label (aria-label), size, children (inner slot)
 *
 * All colours via CSS variables — no hex in JSX.
 */
export function ProgressRing({ value = 0, label, size = 90, stroke = 9, children, className = '' }) {
  const clamped = Math.min(1, Math.max(0, value));
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = clamped * circ;
  const titleId = `progress-ring-title-${Math.random().toString(36).slice(2)}`;

  return (
    <div
      className={`md3-progress-ring ${className}`.trim()}
      style={{ width: size, height: size, position: 'relative', display: 'inline-flex' }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-labelledby={label ? titleId : undefined}
        aria-hidden={label ? undefined : 'true'}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {label && <title id={titleId}>{label}</title>}
        <circle
          className="md3-progress-ring__track"
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          className="md3-progress-ring__fill"
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      {children && (
        <div
          className="md3-progress-ring__inner"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
