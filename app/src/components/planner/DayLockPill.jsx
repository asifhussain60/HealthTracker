/**
 * DayLockPill.jsx — Per-day lock toggle pill.
 *
 * Props:
 *   date    {string}   - ISO date for this row.
 *   locked  {boolean}  - Current lock state.
 *   onToggle {Function} - Called with (date, !locked) when clicked.
 *
 * AC-P1D-D17
 */

/**
 * @param {Object} props
 * @param {string} props.date
 * @param {boolean} props.locked
 * @param {Function} props.onToggle
 */
export function DayLockPill({ date, locked, onToggle }) {
  return (
    <button
      type="button"
      className={`day-lock-pill${locked ? ' day-lock-pill--locked' : ''}`}
      data-testid="day-lock-pill"
      data-date={date}
      aria-pressed={locked}
      aria-label={locked ? `Unlock ${date}` : `Lock ${date}`}
      onClick={() => onToggle(date, !locked)}
    >
      {locked ? 'Locked' : 'Lock'}
    </button>
  );
}
