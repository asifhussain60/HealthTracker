/**
 * WalksCard.jsx — Post-meal walks log card (placeholder shell).
 *
 * AC-P0-C3
 * Empty state today; populated when post-meal walks log exists (Phase 1).
 *
 * @param {object}   props
 * @param {Object[]} [props.walkLog] - Walk log entries
 */
import { EmptyState } from '../primitives/EmptyState';

export function WalksCard({ walkLog = [] }) {
  return (
    <div className="v2-card">
      <div className="v2-card-header">
        <div className="v2-card-header-left">
          <div className="v2-card-icon">🚶</div>
          <div>
            <div className="v2-card-title">Post-Meal Walks</div>
            <div className="v2-card-sub">
              {walkLog.length > 0
                ? `${walkLog.length} walk${walkLog.length !== 1 ? 's' : ''} today`
                : 'No walks logged'}
            </div>
          </div>
        </div>
      </div>

      {walkLog.length === 0 ? (
        <EmptyState
          icon="🚶"
          heading="Post-meal walk tracking coming in Phase 1"
          body="Log your post-meal walks to track your daily movement."
        />
      ) : (
        <div>
          {walkLog.map((walk, i) => (
            <div key={walk.id ?? i} className="v2-session-card">
              <div className="v2-session-body">
                <div className="v2-session-product">{walk.type || 'Walk'}</div>
                <div className="v2-session-detail">
                  {walk.duration ? `${walk.duration} min` : ''}{walk.steps ? ` · ${walk.steps.toLocaleString()} steps` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
