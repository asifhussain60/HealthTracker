/**
 * FormField.jsx — Label + input wrapper with optional hint text.
 *
 * AC-P0-C1
 * Extracted from modal patterns in the existing codebase.
 * Composes with any input element passed as children.
 *
 * @param {object} props
 * @param {string} props.label        - Field label text
 * @param {string} props.htmlFor      - Matches the child input's id
 * @param {string} [props.hint]       - Hint/help text shown below the input
 * @param {React.ReactNode} props.children - The input element
 */
export function FormField({ label, htmlFor, hint, children }) {
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && <div className="form-hint">{hint}</div>}
    </div>
  );
}
