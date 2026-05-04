/**
 * LibraryItemForm.jsx — Renders one form per the schema's fields.
 *
 * Supports field types: string, number, enum, tags, stars.
 *
 * AC-P1D-D1
 */
import { useState, useId } from 'react';

/**
 * @param {Object} props
 * @param {Object} props.schema - LibrarySchema descriptor.
 * @param {Object} [props.initialValues] - Pre-fill values for edit mode.
 * @param {Function} props.onSubmit - Called with form values on save.
 * @param {Function} props.onCancel - Called on cancel.
 */
export function LibraryItemForm({ schema, initialValues = {}, onSubmit, onCancel }) {
  const [values, setValues] = useState(() => {
    const defaults = {};
    for (const field of schema.fields) {
      defaults[field.key] = initialValues[field.key] ?? '';
    }
    return defaults;
  });

  const formId = useId();

  function handleChange(key, value) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(values);
  }

  return (
    <form id={formId} onSubmit={handleSubmit}>
      {schema.fields.map((field) => {
        const inputId = `${formId}-${field.key}`;

        if (field.type === 'enum') {
          return (
            <div key={field.key} className="library-form__field">
              <label htmlFor={inputId}>{field.label}</label>
              <select
                id={inputId}
                value={values[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
              >
                <option value="">Select...</option>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          );
        }

        if (field.type === 'stars') {
          return (
            <div key={field.key} className="library-form__field">
              <label htmlFor={inputId}>{field.label}</label>
              <input
                id={inputId}
                type="number"
                min={0}
                max={5}
                value={values[field.key]}
                onChange={(e) => handleChange(field.key, Number(e.target.value))}
              />
            </div>
          );
        }

        if (field.type === 'number') {
          return (
            <div key={field.key} className="library-form__field">
              <label htmlFor={inputId}>{field.label}</label>
              <input
                id={inputId}
                type="number"
                value={values[field.key]}
                onChange={(e) => handleChange(field.key, Number(e.target.value))}
              />
            </div>
          );
        }

        // Default: string / tags (tags is a comma-separated string for simplicity)
        return (
          <div key={field.key} className="library-form__field">
            <label htmlFor={inputId}>{field.label}</label>
            <input
              id={inputId}
              type="text"
              value={values[field.key]}
              onChange={(e) => handleChange(field.key, e.target.value)}
            />
          </div>
        );
      })}

      <div className="library-form__actions">
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
