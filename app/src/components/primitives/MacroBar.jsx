/**
 * MacroBar.jsx — Horizontal progress bar for macro nutrients.
 *
 * AC-P0-C1
 * Extracted from TodayView.jsx (was inline).
 * colorClass: bar-teal | bar-yellow | bar-orange
 * All colours use CSS variables only — no hardcoded hex.
 *
 * @param {object} props
 * @param {string} props.label      - Nutrient label (e.g. "Protein")
 * @param {number} props.value      - Current consumed value
 * @param {number} props.max        - Target maximum
 * @param {string} [props.colorClass] - CSS colour variant (default: 'bar-teal')
 */
export function MacroBar({ label, value, max, colorClass = 'bar-teal' }) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0);

  return (
    <div className={`macro-bar ${colorClass}`} style={{ '--fill': `${pct}%` }}>
      <div className="macro-bar-row">
        <span className="macro-bar-name">{label}</span>
        <span className="macro-bar-value">
          {value}g <span className="macro-bar-max">/ {max}g</span>
        </span>
      </div>
      <div className="macro-bar-track">
        <div className="macro-bar-fill" />
      </div>
    </div>
  );
}
