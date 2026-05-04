/**
 * LibraryRouteShell.jsx — Generic placeholder for the 9 library routes
 * AC-P1C-C3
 *
 * Props:
 *   name:    string  — human-readable library name
 *   phase:   string  — e.g. "P1.D" (when full UX lands)
 *   icon:    string  — optional emoji/text icon
 */
import { EmptyState } from '../components/primitives/EmptyState.jsx';

export function LibraryRouteShell({ name, phase = 'P1.D', icon = '📚' }) {
  return (
    <div className="library-route-shell" data-testid={`library-shell-${name}`}>
      <EmptyState
        icon={icon}
        heading={name}
        body={`Full library UX in ${phase} — search · filter · CRUD · import`}
        size="large"
      />
    </div>
  );
}
