/**
 * DateSelector.jsx — Current-week date navigator with ±1-week boundary
 * AC-P1C-C4
 *
 * Props:
 *   today:     Date   — injected today (no internal Date.now())
 *   value:     Date   — currently selected date
 *   onChange:  (Date) => void
 *   readOnly?: boolean — when true, disables all interaction
 *
 * Boundary: [startOfWeek(today) - 7 days, endOfWeek(today)]
 * Outside boundary: component renders in history/read-only mode.
 */
import { format, addDays, subDays } from 'date-fns';
import {
  weekRange,
  isWithinBoundary,
  clampToBoundary,
} from '../data/calculators/dateBoundary.js';

export function DateSelector({ today, value, onChange, readOnly = false }) {
  const { start, end } = weekRange(today);

  // Normalize dates to midnight for comparison
  const normalize = (d) => {
    const n = new Date(d);
    n.setHours(0, 0, 0, 0);
    return n;
  };

  const normalizedValue = normalize(value);
  const normalizedStart = normalize(start);
  const normalizedEnd   = normalize(end);
  const normalizedToday = normalize(today);

  const isAtStart   = normalizedValue <= normalizedStart;
  const isAtEnd     = normalizedValue >= normalizedEnd;
  const isOutOfBounds = !isWithinBoundary(value, today);

  const effectiveReadOnly = readOnly || isOutOfBounds;

  const handlePrev = () => {
    if (effectiveReadOnly || isAtStart) return;
    const prev = subDays(normalizedValue, 1);
    onChange(clampToBoundary(prev, today));
  };

  const handleNext = () => {
    if (effectiveReadOnly || isAtEnd) return;
    const next = addDays(normalizedValue, 1);
    onChange(clampToBoundary(next, today));
  };

  const handleToday = () => {
    if (readOnly) return;
    onChange(normalizedToday);
  };

  const isToday = normalizedValue.getTime() === normalizedToday.getTime();

  return (
    <div
      className={[
        'date-selector',
        isOutOfBounds ? 'date-selector--readonly' : '',
      ].filter(Boolean).join(' ')}
      data-readonly={isOutOfBounds ? 'true' : undefined}
    >
      <button
        type="button"
        className="date-selector__nav date-selector__nav--prev"
        aria-label="Previous day"
        onClick={handlePrev}
        disabled={effectiveReadOnly || isAtStart}
        aria-disabled={effectiveReadOnly || isAtStart ? 'true' : undefined}
      >
        ‹
      </button>

      <div className="date-selector__display">
        <span className="date-selector__date">
          {format(normalizedValue, 'EEE, MMM d, yyyy')}
        </span>
        {isOutOfBounds && (
          <span className="date-selector__history-badge">History</span>
        )}
      </div>

      <button
        type="button"
        className="date-selector__nav date-selector__nav--next"
        aria-label="Next day"
        onClick={handleNext}
        disabled={effectiveReadOnly || isAtEnd}
        aria-disabled={effectiveReadOnly || isAtEnd ? 'true' : undefined}
      >
        ›
      </button>

      <button
        type="button"
        className={[
          'date-selector__today-pill',
          isToday ? 'date-selector__today-pill--active' : '',
        ].filter(Boolean).join(' ')}
        onClick={handleToday}
        disabled={readOnly}
        aria-label="Today"
        aria-pressed={isToday}
      >
        Today
      </button>
    </div>
  );
}
