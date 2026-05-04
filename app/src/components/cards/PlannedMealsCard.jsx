/**
 * PlannedMealsCard.jsx — Planned Meals card (placeholder shell).
 *
 * AC-P0-C3
 * Empty state today; populated when meal inventory exists (Phase 1.D/E).
 * Full UX lands in Phase 1.
 *
 * @param {object}   props
 * @param {Object[]} [props.mealInventory] - Meal items (empty → show placeholder)
 */
import { EmptyState } from '../primitives/EmptyState';

export function PlannedMealsCard({ mealInventory = [] }) {
  return (
    <div className="v2-card v2-card--food">
      <div className="v2-card-header">
        <div className="v2-card-header-left">
          <div className="v2-card-icon v2-card-icon--food">🍽️</div>
          <div>
            <div className="v2-card-title">Planned Meals</div>
            <div className="v2-card-sub">
              {mealInventory.length > 0
                ? `${mealInventory.length} items in inventory`
                : 'No meal plan yet'}
            </div>
          </div>
        </div>
      </div>

      <EmptyState
        icon="🍽️"
        heading="Meal planning coming in Phase 1"
        body="Set up your meal inventory and weekly plan in the next phase."
      />
    </div>
  );
}
