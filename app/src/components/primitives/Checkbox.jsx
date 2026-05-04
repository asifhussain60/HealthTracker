/**
 * Checkbox.jsx — MD3 Checkbox primitive
 * AC-P1B-FORM
 *
 * States: checked | unchecked | indeterminate
 * All colours via CSS variables — no hex in JSX.
 */
import { useRef, useEffect, useId } from 'react';

export function Checkbox({
  label,
  id,
  checked = false,
  indeterminate = false,
  onChange,
  disabled = false,
  className = '',
}) {
  const ref = useRef(null);
  const generatedId = useId();
  const checkId = id ?? `md3-cb-${generatedId}`;

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <div className={`md3-checkbox-wrapper ${className}`.trim()}>
      <input
        ref={ref}
        id={checkId}
        type="checkbox"
        className="md3-checkbox__input"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        data-indeterminate={indeterminate ? 'true' : undefined}
      />
      {label && (
        <label className="md3-checkbox__label" htmlFor={checkId}>{label}</label>
      )}
    </div>
  );
}
