/**
 * RadioGroup.jsx — MD3 RadioGroup primitive
 * AC-P1B-FORM
 *
 * Props: name, options [{value, label}], value, onChange
 * All colours via CSS variables — no hex in JSX.
 */
export function RadioGroup({
  name,
  options = [],
  value,
  onChange,
  disabled = false,
  className = '',
}) {
  return (
    <div className={`md3-radio-group ${className}`.trim()} role="radiogroup">
      {options.map((opt) => {
        const radioId = `md3-radio-${name}-${opt.value}`;
        return (
          <div key={opt.value} className="md3-radio-wrapper">
            <input
              id={radioId}
              type="radio"
              className="md3-radio__input"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange?.(opt.value)}
              disabled={disabled || opt.disabled}
            />
            <label className="md3-radio__label" htmlFor={radioId}>{opt.label}</label>
          </div>
        );
      })}
    </div>
  );
}
