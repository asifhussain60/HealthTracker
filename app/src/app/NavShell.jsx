/**
 * NavShell.jsx — Adaptive nav dispatcher
 * AC-P1C-C2
 *
 * Picks BottomNav (<600px) | NavRail (600–904px) | SideDrawer (≥905px)
 * based on viewport width via useMediaQuery.
 *
 * The 6 canonical parent nav items:
 *   Dashboard /  · Plan /plan · Profile /profile ·
 *   Food /food   · Workouts /workouts · Cannabis /cannabis
 *
 * Settings is a profile-menu item (not a primary nav item).
 */
import { useNavigate, useLocation } from 'react-router-dom';
import { useMediaQuery } from './useMediaQuery.js';
import { BottomNav }  from '../components/primitives/BottomNav.jsx';
import { NavRail }    from '../components/primitives/NavRail.jsx';
import { SideDrawer } from '../components/primitives/SideDrawer.jsx';

/* ── SVG icon helpers ─────────────────────────────────────── */
const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="3" y="3" width="7" height="9"/>
    <rect x="14" y="3" width="7" height="5"/>
    <rect x="14" y="12" width="7" height="9"/>
    <rect x="3" y="16" width="7" height="5"/>
  </svg>
);

const PlanIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const FoodIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M18 8h1a4 4 0 010 8h-1"/>
    <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>
    <line x1="6" y1="1" x2="6" y2="4"/>
    <line x1="10" y1="1" x2="10" y2="4"/>
    <line x1="14" y1="1" x2="14" y2="4"/>
  </svg>
);

const WorkoutsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M6.5 6.5h11M6.5 17.5h11M4 12h16M2 8.5l2-2M20 8.5l2-2M2 15.5l2 2M20 15.5l2 2"/>
  </svg>
);

const CannabisIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M12 2c0 0-6 4-6 10a6 6 0 0012 0c0-6-6-10-6-10z"/>
    <line x1="12" y1="22" x2="12" y2="12"/>
  </svg>
);

/* ── Nav items config ─────────────────────────────────────── */
export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', path: '/',         icon: <DashboardIcon /> },
  { id: 'plan',      label: 'Plan',      path: '/plan',      icon: <PlanIcon /> },
  { id: 'profile',   label: 'Profile',   path: '/profile',   icon: <ProfileIcon /> },
  { id: 'food',      label: 'Food',      path: '/food',      icon: <FoodIcon /> },
  { id: 'workouts',  label: 'Workouts',  path: '/workouts',  icon: <WorkoutsIcon /> },
  { id: 'cannabis',  label: 'Cannabis',  path: '/cannabis',  icon: <CannabisIcon /> },
];

/** Derive activeId from current pathname */
function useActiveNavId() {
  const { pathname } = useLocation();
  // Match most-specific item first (longer paths before shorter)
  const sorted = [...NAV_ITEMS].sort((a, b) => b.path.length - a.path.length);
  const match = sorted.find((item) =>
    item.path === '/' ? pathname === '/' : pathname.startsWith(item.path)
  );
  return match?.id ?? 'dashboard';
}

export function NavShell({ open: controlledOpen, onClose }) {
  const navigate = useNavigate();
  const activeId = useActiveNavId();

  const isNarrow  = useMediaQuery('(max-width: 599px)');
  const isMedium  = useMediaQuery('(min-width: 600px) and (max-width: 904px)');
  const isWide    = useMediaQuery('(min-width: 905px)');

  const handleNavigate = (id) => {
    const item = NAV_ITEMS.find((i) => i.id === id);
    if (item) navigate(item.path);
    onClose?.();
  };

  if (isNarrow) {
    return (
      <BottomNav
        items={NAV_ITEMS}
        activeId={activeId}
        onNavigate={handleNavigate}
      />
    );
  }

  if (isMedium) {
    return (
      <NavRail
        items={NAV_ITEMS}
        activeId={activeId}
        onNavigate={handleNavigate}
      />
    );
  }

  if (isWide) {
    return (
      <SideDrawer
        open={controlledOpen ?? true}
        items={NAV_ITEMS}
        activeId={activeId}
        onNavigate={handleNavigate}
        onClose={onClose}
      />
    );
  }

  // Fallback (SSR / no matchMedia): render NavRail
  return (
    <NavRail
      items={NAV_ITEMS}
      activeId={activeId}
      onNavigate={handleNavigate}
    />
  );
}
