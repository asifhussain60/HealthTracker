/**
 * CannabisSessionTile.jsx — One planned cannabis session tile.
 *
 * Displays planned session time, label, and a Log button.
 * AC-P1E-E4
 */

/**
 * @param {object} props
 * @param {object} props.session — planned session object from cannabisPlanner
 * @param {boolean} props.logged — true if already logged
 * @param {boolean} props.isClosed — read-only if true
 * @param {function} props.onLog — called with session when Log is tapped
 */
export function CannabisSessionTile({ session, logged = false, isClosed = false, onLog }) {
  return (
    <div
      className={[
        'cannabis-session-tile',
        logged ? 'cannabis-session-tile--logged' : '',
      ].filter(Boolean).join(' ')}
      data-testid="cannabis-session-tile"
    >
      <div className="cannabis-session-tile__time">
        {session.timeLabel ?? session.plannedTime}
      </div>
      <div className="cannabis-session-tile__reason">
        {session.reason}
      </div>
      {!logged && !isClosed && (
        <button
          type="button"
          className="cannabis-session-tile__log-btn"
          onClick={() => onLog?.(session)}
        >
          Log
        </button>
      )}
      {logged && (
        <span className="cannabis-session-tile__logged-badge">Logged ✓</span>
      )}
    </div>
  );
}
