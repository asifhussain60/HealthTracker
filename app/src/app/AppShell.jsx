/**
 * AppShell.jsx — Adaptive app shell layout
 * AC-P1C-C1 / AC-P1C-C5 (ProfileMenu added)
 *
 * Renders: TopAppBar (with ProfileMenu slot) + NavShell (adaptive nav) + Outlet.
 * Every route uses this as its layout — no duplicate nav/bar code in views.
 */
import { useNavigate, Outlet } from 'react-router-dom';
import { TopAppBar }   from '../components/primitives/TopAppBar.jsx';
import { NavShell }    from './NavShell.jsx';
import { ProfileMenu } from '../components/ProfileMenu.jsx';

export function AppShell() {
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <TopAppBar
        title="HealthTracker"
        actions={
          <ProfileMenu
            initials="AH"
            name="Asif Hussain"
            onSettings={() => navigate('/settings')}
            onExport={() => {/* P1.D */}}
            onReset={() => {/* P1.D */}}
          />
        }
      />
      <div className="app-shell__body">
        <NavShell />
        <main className="app-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
