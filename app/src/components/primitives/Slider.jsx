/**
 * Slider.jsx — MD3 Slider primitive
 * AC-P1B-FORM
 *
 * Props: label, id, min, max, step, value, onChange, ticks (optional)
 * All colours via CSS variables — no hex in JSX.
 */
import { useId } from 'react';

export function Slider({
  label,
  id,
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  ticks = false,
  disabled = false,
  className = '',
}) {
  const generatedId = useId();
  const sliderId = id ?? `md3-slider-${generatedId}`;
  const listId = ticks ? `${sliderId}-ticks` : undefined;

  // Build tick marks if requested
  const tickMarks = ticks
    ? Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => min + i * step)
    : [];

  return (
    <div className={`md3-slider-wrapper ${className}`.trim()}>
      {label && (
        <label className="md3-slider__label" htmlFor={sliderId}>{label}</label>
      )}
      <input
        id={sliderId}
        type="range"
        className="md3-slider__input"
        min={String(min)}
        max={String(max)}
        step={String(step)}
        value={value}
        onChange={onChange}
        disabled={disabled}
        list={listId}
      />
      {ticks && (
        <datalist id={listId}>
          {tickMarks.map((tick) => (
            <option key={tick} value={tick} />
          ))}
        </datalist>
      )}
    </div>
  );
}
