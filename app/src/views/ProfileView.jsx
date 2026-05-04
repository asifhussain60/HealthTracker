/**
 * ProfileView.jsx — Real profile editor view
 * AC-P1D-D2
 *
 * Wraps <ProfileEditor> with page layout.
 */
import { ProfileEditor } from '../components/profile/ProfileEditor.jsx';

export function ProfileView() {
  return (
    <div className="profile-view" data-testid="profile-view">
      <ProfileEditor />
    </div>
  );
}
