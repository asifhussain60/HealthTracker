/**
 * MealsView.jsx — Meals view placeholder shell.
 *
 * AC-P0-C7
 * Full meals UX lands in Phase 1.D/E. This is a registered route placeholder.
 */
import { EmptyState } from '../components/primitives/EmptyState';

export function MealsView() {
  return (
    <div className="view-container">
      <EmptyState
        icon="🍽️"
        heading="Meals view coming in Phase 1"
        body="Meal planning, inventory, and macro tracking will be available in Phase 1."
      />
    </div>
  );
}
