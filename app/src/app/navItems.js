/**
 * navItems.js — Primary nav item config (metadata only, no JSX)
 * AC-P1C-C2
 *
 * The 6 canonical parent nav destinations.
 * Settings is a profile-menu item, not a primary nav item.
 * Icons are injected as JSX by NavShell.jsx.
 */

export const NAV_ITEM_DEFS = [
  { id: 'dashboard', label: 'Dashboard', path: '/' },
  { id: 'plan',      label: 'Plan',      path: '/plan' },
  { id: 'profile',   label: 'Profile',   path: '/profile' },
  { id: 'food',      label: 'Food',      path: '/food' },
  { id: 'workouts',  label: 'Workouts',  path: '/workouts' },
  { id: 'cannabis',  label: 'Cannabis',  path: '/cannabis' },
];
