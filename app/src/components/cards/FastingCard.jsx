/**
 * FastingCard.jsx — Live fasting window state card.
 *
 * AC-P0-C3
 * Computes live state from fastingMath.currentState().
 * Caller injects `now` (ISO string) for testability — no Date.now() in this component.
 *
 * @param {object} props
 * @param {{ enabled: boolean, windowStart: string, windowEnd: string }} props.fastingProtocol
 * @param {string} [props.now] - ISO 8601 timestamp (default: new Date().toISOString())
 */
import { currentState } from '../../data/calculators/fastingMath';

function formatMinutes(minutes) {
  if (minutes == null) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function FastingCard({ fastingProtocol, now }) {
  const nowStr = now ?? new Date().toISOString();
  const state  = currentState(nowStr, fastingProtocol, null);

  const stateLabel = {
    'open':         'Open — eating window',
    'opens-in':     'Opens in',
    'closed-since': 'Closed',
  }[state.state] ?? state.state;

  const stateColor = {
    'open':         'var(--green)',
    'opens-in':     'var(--yellow)',
    'closed-since': 'var(--text-dimmer)',
  }[state.state] ?? 'var(--text-dim)';

  return (
    <div className="v2-card">
      <div className="v2-card-header">
        <div className="v2-card-header-left">
          <div className="v2-card-icon">⏱</div>
          <div>
            <div className="v2-card-title">Fasting Window</div>
            <div className="v2-card-sub">
              {fastingProtocol?.enabled
                ? `${fastingProtocol.windowStart} – ${fastingProtocol.windowEnd}`
                : 'Protocol disabled'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: stateColor }}>
          {stateLabel}
          {state.state === 'opens-in' && state.minutesUntilOpen != null && (
            <span style={{ fontSize: 14, fontWeight: 400, marginLeft: 6 }}>
              {formatMinutes(state.minutesUntilOpen)}
            </span>
          )}
          {state.state === 'closed-since' && state.minutesSinceClose != null && (
            <span style={{ fontSize: 14, fontWeight: 400, marginLeft: 6 }}>
              {formatMinutes(state.minutesSinceClose)} ago
            </span>
          )}
        </div>

        {fastingProtocol?.enabled && (
          <div style={{ fontSize: 13, color: 'var(--text-dimmer)', marginTop: 8 }}>
            Window: {fastingProtocol.windowStart} – {fastingProtocol.windowEnd}
          </div>
        )}
      </div>
    </div>
  );
}
