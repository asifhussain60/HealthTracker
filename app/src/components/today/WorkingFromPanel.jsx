/**
 * WorkingFromPanel.jsx — Working from location panel.
 *
 * - Location picker (from workLocations library)
 * - Session timer (Start/Stop)
 * - Daily tile-grid showing today's sessions
 * - Closed day → Start disabled
 *
 * AC-P1E-E7
 */
import { useState } from 'react';

/**
 * @param {object} props
 * @param {Array<{id:string, name:string}>} props.locations
 * @param {Array}  props.sessions — today's WorkSession[]
 * @param {Object|null} props.activeSession — currently open session (endedAt===null)
 * @param {boolean} props.isClosed
 * @param {function} props.onStartSession — called with locationId
 * @param {function} props.onEndSession — called with sessionId
 * @param {string} props.date — YYYY-MM-DD
 */
export function WorkingFromPanel({
  locations = [],
  sessions = [],
  activeSession = null,
  isClosed = false,
  onStartSession,
  onEndSession,
  date,
}) {
  const [selectedLocationId, setSelectedLocationId] = useState(
    locations[0]?.id ?? null
  );

  const todaySessions = sessions.filter((s) => s.date === date);

  function handleStart() {
    if (isClosed || !selectedLocationId) return;
    onStartSession?.(selectedLocationId);
  }

  function handleStop() {
    if (!activeSession) return;
    onEndSession?.(activeSession.id);
  }

  return (
    <div className="working-from-panel" data-testid="working-from-panel">
      {/* Location picker */}
      <div className="working-from-panel__locations">
        {locations.map((loc) => (
          <button
            key={loc.id}
            type="button"
            className={[
              'working-from-panel__loc-chip',
              selectedLocationId === loc.id ? 'working-from-panel__loc-chip--selected' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => !isClosed && setSelectedLocationId(loc.id)}
            disabled={isClosed}
            aria-pressed={selectedLocationId === loc.id}
          >
            {loc.name}
          </button>
        ))}
      </div>

      {/* Session timer controls */}
      <div className="working-from-panel__controls">
        {!activeSession ? (
          <button
            type="button"
            className="working-from-panel__start-btn"
            data-testid="start-session-btn"
            disabled={isClosed}
            onClick={handleStart}
          >
            Start session
          </button>
        ) : (
          <button
            type="button"
            className="working-from-panel__stop-btn"
            data-testid="stop-session-btn"
            onClick={handleStop}
          >
            Stop session
          </button>
        )}
      </div>

      {/* Today's session tiles */}
      <div className="working-from-panel__sessions">
        {todaySessions.map((session) => {
          const loc = locations.find((l) => l.id === session.locationId);
          const dur = session.durationMinutes != null
            ? `${session.durationMinutes} min`
            : 'In progress…';
          return (
            <div
              key={session.id}
              className="working-from-panel__session-tile"
              data-testid="work-session-tile"
            >
              <span className="working-from-panel__session-loc">
                {loc?.name ?? session.locationId}
              </span>
              <span className="working-from-panel__session-dur tabular-nums">
                {dur}
              </span>
            </div>
          );
        })}
        {todaySessions.length === 0 && (
          <div className="working-from-panel__empty">No sessions today</div>
        )}
      </div>
    </div>
  );
}
