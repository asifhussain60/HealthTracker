/**
 * TimePicker.jsx — MD3 TimePicker primitive
 * AC-P1B-DATA
 *
 * Props: value (HH:MM), onChange, label, id
 * Uses native time input for maximum accessibility and platform consistency.
 *
 * All colours via CSS variables — no hex in JSX.
 */
import { useId } from 'react';

export function TimePicker({ value, onChange, label, id, disabled = false, className = '' }) {
  const generatedId = useId();
  const inputId = id ?? `md3-time-${generatedId}`;

  return (
    <div className={`md3-time-picker ${className}`.trim()}>
      {label && (
        <label className="md3-time-picker__label" htmlFor={inputId}>{label}</label>
      )}
      <input
        id={inputId}
        type="time"
        className="md3-time-picker__input"
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}
