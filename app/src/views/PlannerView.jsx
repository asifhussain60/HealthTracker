/**
 * PlannerView.jsx — Planner route placeholder
 * AC-P1C-C3 / AC-P1C-C8
 *
 * Full UX in P1.D (D17 — WeeklyPlanGenerator, 7×4 meal grid, per-day lock, etc.)
 * For now: EmptyState with hero "Plan my week" pill (96px tall per design spec).
 */
import { EmptyState } from '../components/primitives/EmptyState.jsx';

export function PlannerView() {
  return (
    <div className="planner-view" data-testid="planner-view">
      <EmptyState
        icon="📅"
        heading="Plan my week"
        body="Full UX in P1.D"
        size="large"
        cta={
          <button
            type="button"
            className="planner-view__hero-pill"
            style={{ height: '96px', borderRadius: '9999px', minWidth: '320px' }}
            disabled
            aria-label="Plan my week — full UX coming in P1.D"
          >
            Plan my week
          </button>
        }
      />
      <p className="planner-view__caption" style={{ textAlign: 'center', marginTop: '8px' }}>
        auto-fires Sundays · tap to manually rebuild
      </p>
    </div>
  );
}
