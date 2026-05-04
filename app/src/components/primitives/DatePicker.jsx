/**
 * DatePicker.jsx — MD3 DatePicker primitive
 * AC-P1B-DATA
 *
 * Props: value (ISO date string YYYY-MM-DD), onChange, disabledDates (array of ISO strings)
 * Features: calendar grid, current month navigation, prev/next month
 *
 * All colours via CSS variables — no hex in JSX.
 */
import { useState } from 'react';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function parseDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return { year: y, month: m - 1, day: d }; // month is 0-indexed
}

function toIso(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function DatePicker({ value, onChange, disabledDates = [], className = '' }) {
  const parsed = value ? parseDate(value) : null;
  const today = new Date();
  const [viewYear, setViewYear] = useState(parsed?.year ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.month ?? today.getMonth());

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const disabledSet = new Set(disabledDates);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null); // empty cells before month starts
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  return (
    <div className={`md3-date-picker ${className}`.trim()} aria-label="Date picker">
      {/* Month navigation */}
      <div className="md3-date-picker__header">
        <button
          type="button"
          className="md3-date-picker__nav"
          onClick={prevMonth}
          aria-label="Previous month"
        >
          ‹
        </button>
        <span className="md3-date-picker__month-title">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          className="md3-date-picker__nav"
          onClick={nextMonth}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Weekday headers */}
      <div className="md3-date-picker__weekdays" aria-hidden="true">
        {WEEKDAYS.map((d) => (
          <span key={d} className="md3-date-picker__weekday">{d}</span>
        ))}
      </div>

      {/* Day grid */}
      <div className="md3-date-picker__grid">
        {days.map((day, idx) => {
          if (day === null) {
            return <span key={`empty-${idx}`} className="md3-date-picker__empty" aria-hidden="true" />;
          }
          const iso = toIso(viewYear, viewMonth, day);
          const isSelected = iso === value;
          const isDisabled = disabledSet.has(iso);

          return (
            <button
              key={iso}
              type="button"
              className={[
                'md3-date-picker__day',
                isSelected ? 'md3-date-picker__day--selected' : '',
                isDisabled ? 'md3-date-picker__day--disabled' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={isDisabled}
              aria-pressed={isSelected}
              data-date={iso}
              onClick={() => !isDisabled && onChange?.(iso)}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
