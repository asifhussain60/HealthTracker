/**
 * AppShell.jsx — Adaptive app shell layout
 * AC-P1C-C1
 *
 * Renders: TopAppBar (with ProfileMenu slot) + NavShell (adaptive nav) + Outlet.
 * Every route uses this as its layout — no duplicate nav/bar code in views.
 */
import { Outlet } from 'react-router-dom';
import { TopAppBar } from '../components/primitives/TopAppBar.jsx';
import { NavShell } from './NavShell.jsx';

export function AppShell() {
  return (
    <div className="app-shell">
      <TopAppBar title="HealthTracker" />
      <div className="app-shell__body">
        <NavShell />
        <main className="app-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
