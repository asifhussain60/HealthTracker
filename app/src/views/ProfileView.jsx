/**
 * ProfileView.jsx — Profile route shell
 * AC-P1C-C6
 *
 * Full profile editor UX in P1.D (every ProfileFields field, deep-links to sub-routes).
 * Legacy implementation available in git history (commit before AC-P1C-C3).
 */
import { EmptyState } from '../components/primitives/EmptyState.jsx';

export function ProfileView() {
  return (
    <div className="profile-view" data-testid="profile-view">
      <EmptyState
        icon="👤"
        heading="Profile editor"
        body="Full UX in P1.D — name, height/age, IF window, calorie target, sleep, prayer, fitness level, workout plan, sweet-tooth plan"
        size="large"
      />
    </div>
  );
}
