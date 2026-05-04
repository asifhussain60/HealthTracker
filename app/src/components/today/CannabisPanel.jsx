/**
 * CannabisPanel.jsx — Today's cannabis panel.
 *
 * Shows the 2 algorithm-planned sessions with Log buttons.
 * mg-today / mg-cap display with taper ceiling status.
 * Ceiling status: under / near / over.
 * Closed day → read-only.
 *
 * AC-P1E-E4
 */
import { CannabisSessionTile } from './CannabisSessionTile.jsx';

/**
 * @param {object} props
 * @param {{ sessions: Array, taperCeilingMg: number }} props.plan
 * @param {number} props.mgToday — mg consumed today
 * @param {'under'|'near'|'over'} props.ceilingStatus
 * @param {boolean} props.isClosed
 * @param {function} props.onLog — called with session object
 * @param {string[]} [props.loggedSessionNumbers] — session numbers already logged
 */
export function CannabisPanel({
  plan,
  mgToday = 0,
  ceilingStatus = 'under',
  isClosed = false,
  onLog,
  loggedSessionNumbers = [],
}) {
  const sessions = plan?.sessions ?? [];
  const ceilingMg = plan?.taperCeilingMg ?? 0;

  return (
    <div className="cannabis-panel" data-testid="cannabis-panel">
      {/* mg summary */}
      <div className="cannabis-panel__summary">
        <span
          className="cannabis-panel__mg-today tabular-nums"
          data-testid="mg-today"
        >
          {Math.round(mgToday)} mg
        </span>
        <span className="cannabis-panel__divider"> / </span>
        <span
          className="cannabis-panel__mg-cap tabular-nums"
          data-testid="mg-cap"
        >
          {Math.round(ceilingMg)} mg cap
        </span>
      </div>

      {/* Ceiling status indicator */}
      <div
        className={`cannabis-panel__ceiling-status cannabis-panel__ceiling-status--${ceilingStatus}`}
        data-testid="ceiling-status"
        data-status={ceilingStatus}
        aria-label={`Ceiling status: ${ceilingStatus}`}
      >
        {ceilingStatus === 'over' && 'Over ceiling'}
        {ceilingStatus === 'near' && 'Near ceiling'}
        {ceilingStatus === 'under' && 'Under ceiling'}
      </div>

      {/* Session tiles */}
      <div className="cannabis-panel__sessions">
        {sessions.map((session, idx) => (
          <CannabisSessionTile
            key={session.sessionNumber ?? idx}
            session={session}
            logged={loggedSessionNumbers.includes(session.sessionNumber)}
            isClosed={isClosed}
            onLog={onLog}
          />
        ))}
        {sessions.length === 0 && (
          <div className="cannabis-panel__empty">No sessions planned</div>
        )}
      </div>
    </div>
  );
}
