/**
 * TodosView.jsx — TODOs view placeholder shell.
 *
 * AC-P0-C7
 * Full TODOs UX lands in Phase 3. This is a registered route placeholder.
 */
import { EmptyState } from '../components/primitives/EmptyState';

export function TodosView() {
  return (
    <div className="view-container">
      <EmptyState
        icon="📋"
        heading="TODOs coming in Phase 3"
        body="Task management and assignment will be available in Phase 3."
      />
    </div>
  );
}
