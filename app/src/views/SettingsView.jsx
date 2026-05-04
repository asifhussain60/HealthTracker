/**
 * SettingsView.jsx — Settings route shell
 * AC-P1C-C7
 *
 * Full settings UX in P1.D (theme toggle, export, feature flags).
 */
import { EmptyState } from '../components/primitives/EmptyState.jsx';

export function SettingsView() {
  return (
    <div className="settings-view" data-testid="settings-view">
      <EmptyState
        icon="⚙️"
        heading="Settings"
        body="Full UX in P1.D — theme toggle (dark/light), data export, feature flags"
        size="large"
      />
    </div>
  );
}
