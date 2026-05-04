/**
 * AccordionPanel.jsx — MD3 AccordionPanel (controlled)
 * AC-P1B-ACCORDION
 *
 * Parent owns expanded state; panel reports clicks via onToggle(id).
 * Use <AccordionGroup> to enforce the single-open invariant (PF-10).
 *
 * All colours via CSS variables — no hex in JSX.
 *
 * @param {object}          props
 * @param {string}          props.id         - Unique panel ID
 * @param {string}          props.title      - Header text
 * @param {boolean}         props.expanded   - Controlled open state
 * @param {function}        props.onToggle   - Called with (id) on header click
 * @param {React.ReactNode} props.children   - Panel body content
 * @param {string}          [props.className]
 */
export function AccordionPanel({ id, title, expanded = false, onToggle, children, className = '' }) {
  const headerId = `accordion-header-${id}`;
  const panelId = `accordion-panel-${id}`;

  return (
    <div className={`md3-accordion-panel ${className}`.trim()}>
      <h3 className="md3-accordion-panel__heading">
        <button
          id={headerId}
          type="button"
          className={[
            'md3-accordion-panel__trigger',
            expanded ? 'md3-accordion-panel__trigger--expanded' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => onToggle?.(id)}
        >
          {title}
          <span className="md3-accordion-panel__indicator" aria-hidden="true">
            {expanded ? '▲' : '▼'}
          </span>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        className={[
          'md3-accordion-panel__body',
          expanded ? 'md3-accordion-panel__body--open' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        hidden={!expanded}
      >
        {children}
      </div>
    </div>
  );
}
