/**
 * TodosCard.jsx — TODOs card placeholder shell.
 *
 * AC-P0-C2
 * Full TODOs view is Phase 3. This is a placeholder for the TodayView card slot.
 */
import { EmptyState } from '../primitives/EmptyState';

export function TodosCard() {
  return (
    <div className="v2-card">
      <div className="v2-card-header">
        <div className="v2-card-header-left">
          <div className="v2-card-icon">📋</div>
          <div>
            <div className="v2-card-title">To-Dos</div>
            <div className="v2-card-sub">Coming in Phase 3</div>
          </div>
        </div>
      </div>
      <EmptyState
        icon="📋"
        heading="To-Dos coming in Phase 3"
        body="Task management will be available in a future update."
      />
    </div>
  );
}
