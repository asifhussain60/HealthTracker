/**
 * SessionTile.jsx — Individual workout session tile.
 *
 * Displays:
 *   - Routine/activity name
 *   - Status indicator (completed=teal, in-progress=orange)
 *   - Remove (−) button (disabled on closed day)
 *
 * AC-P1E-E3
 */

/**
 * @param {object} props
 * @param {string} props.name — session label
 * @param {string} [props.status] — 'completed' | 'in-progress' | 'planned'
 * @param {boolean} [props.isClosed] — read-only if true
 * @param {function} [props.onRemove] — called on remove click
 */
export function SessionTile({ name, status = 'planned', isClosed = false, onRemove }) {
  const statusClass = status === 'completed'
    ? 'session-tile--completed'
    : status === 'in-progress'
    ? 'session-tile--in-progress'
    : '';

  return (
    <div className={`session-tile ${statusClass}`.trim()} data-testid="session-tile">
      <span className="session-tile__name">{name}</span>
      {!isClosed && (
        <button
          type="button"
          className="session-tile__remove"
          aria-label={`Remove ${name}`}
          onClick={onRemove}
        >
          −
        </button>
      )}
    </div>
  );
}
