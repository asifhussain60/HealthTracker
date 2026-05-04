/**
 * RingChart.jsx — Donut/Ring chart primitive.
 *
 * AC-P0-C1
 * Extracted from TodayView.jsx (was inline).
 * colorClass controls stroke colour via CSS variable classes (ring-green, ring-orange, ring-teal, ring-red).
 * All colours use CSS variables only — no hardcoded hex.
 *
 * @param {object}  props
 * @param {number}  props.value       - Current value
 * @param {number}  props.max         - Maximum value (0 = empty ring)
 * @param {string}  [props.colorClass] - CSS class for stroke colour (default: 'ring-teal')
 * @param {number}  [props.size]      - SVG width/height in px (default: 90)
 * @param {number}  [props.stroke]    - Stroke width in px (default: 9)
 * @param {string}  [props.label]     - Accessible label for the chart
 * @param {React.ReactNode} [props.children] - Content rendered inside the ring
 */
export function RingChart({ value, max, colorClass = 'ring-teal', size = 90, stroke = 9, label, children }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, max > 0 ? value / max : 0);

  return (
    <div className={`ring-wrap ${colorClass}`} aria-label={label}>
      <svg
        className="ring-svg"
        width={size}
        height={size}
        role="img"
        aria-hidden={label ? undefined : 'true'}
      >
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />
        <circle
          className="ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeDasharray={`${pct * circ} ${circ}`}
        />
      </svg>
      <div className="ring-inner">{children}</div>
    </div>
  );
}
