/**
 * routes.jsx — View registry.
 *
 * AC-P0-C6
 * Describes every view available in the app. App.jsx and nav components
 * consume this registry instead of hard-coded view lists.
 *
 * Shape per route:
 *   id:       string    — unique view identifier (matches uiSlice.activeView)
 *   title:    string    — page title in the header
 *   label:    string    — sidebar nav label
 *   component: React component
 *   icon:     JSX       — SVG icon for nav
 *   navOrder: number    — sort order in nav (negative = hidden from nav)
 *
 * ESLint: react-refresh/only-export-components is intentionally suppressed —
 * this is a registry module that mixes icon components with data exports.
 */
/* eslint-disable react-refresh/only-export-components */

import { TodayView }     from '../views/TodayView';
import { InventoryView } from '../views/InventoryView';
import { HistoryView }   from '../views/HistoryView';
import { ProfileView }   from '../views/ProfileView';
import { MealsView }     from '../views/MealsView';
import { TodosView }     from '../views/TodosView';

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const CannabisIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"/>
    <path d="M12 2v20M3 6l9 4 9-4"/>
  </svg>
);

const HistoryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);

const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const MealsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 11l19-9-9 19-2-8-8-2z"/>
  </svg>
);

const TodosIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 11 12 14 22 4"/>
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
  </svg>
);

/** @type {Array<{id: string, title: string, label: string, component: Function, icon: Function, navOrder: number}>} */
export const ROUTES = [
  {
    id:        'today',
    title:     'Today',
    label:     'Today',
    component: TodayView,
    icon:      CalendarIcon,
    navOrder:  0,
  },
  {
    id:        'cannabis',
    title:     'Cannabis',
    label:     'Cannabis',
    component: InventoryView,
    icon:      CannabisIcon,
    navOrder:  1,
  },
  {
    id:        'meals',
    title:     'Meals',
    label:     'Meals',
    component: MealsView,
    icon:      MealsIcon,
    navOrder:  2,
  },
  {
    id:        'history',
    title:     'History',
    label:     'History',
    component: HistoryView,
    icon:      HistoryIcon,
    navOrder:  3,
  },
  {
    id:        'profile',
    title:     'Profile',
    label:     'Profile',
    component: ProfileView,
    icon:      ProfileIcon,
    navOrder:  4,
  },
  {
    id:        'todos',
    title:     'To-Dos',
    label:     'To-Dos',
    component: TodosView,
    icon:      TodosIcon,
    navOrder:  5,
  },
];

/**
 * Look up a route by id. Returns undefined if not found.
 * @param {string} id
 * @returns {Object|undefined}
 */
export function getRoute(id) {
  return ROUTES.find((r) => r.id === id);
}
