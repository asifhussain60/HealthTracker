/**
 * TextField.jsx — MD3 TextField primitive
 * AC-P1B-FORM
 *
 * Variants: text | numeric | time | date
 * Features: label, helperText, error + errorText, leadingIcon, trailingIcon
 *
 * All colours via CSS variables — no hex in JSX.
 */
import { useId } from 'react';

export function TextField({
  variant = 'text',
  label,
  id,
  helperText,
  error = false,
  errorText,
  leadingIcon,
  trailingIcon,
  onChange,
  value,
  defaultValue,
  disabled = false,
  placeholder,
  className = '',
  ...rest
}) {
  const inputType = {
    text: 'text',
    numeric: 'number',
    time: 'time',
    date: 'date',
  }[variant] ?? 'text';

  const generatedId = useId();
  const fieldId = id ?? `md3-tf-${generatedId}`;
  const helperId = `${fieldId}-helper`;
  const errorId = `${fieldId}-error`;

  const classes = [
    'md3-text-field',
    `md3-text-field--${variant}`,
    error ? 'md3-text-field--error' : '',
    disabled ? 'md3-text-field--disabled' : '',
    leadingIcon ? 'md3-text-field--has-leading' : '',
    trailingIcon ? 'md3-text-field--has-trailing' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const describedBy = [
    helperText ? helperId : null,
    error && errorText ? errorId : null,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <div className={classes}>
      {leadingIcon && (
        <span className="md3-text-field__leading-icon" aria-hidden="true">{leadingIcon}</span>
      )}
      <div className="md3-text-field__inner">
        {label && <label className="md3-text-field__label" htmlFor={fieldId}>{label}</label>}
        <input
          id={fieldId}
          type={inputType}
          className="md3-text-field__input"
          disabled={disabled}
          onChange={onChange}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          aria-invalid={error || undefined}
          aria-describedby={describedBy}
          {...rest}
        />
      </div>
      {trailingIcon && (
        <span className="md3-text-field__trailing-icon" aria-hidden="true">{trailingIcon}</span>
      )}
      {helperText && !error && (
        <p id={helperId} className="md3-text-field__helper">{helperText}</p>
      )}
      {error && errorText && (
        <p id={errorId} className="md3-text-field__error" role="alert">{errorText}</p>
      )}
    </div>
  );
}
