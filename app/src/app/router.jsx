/**
 * router.jsx — 16-route browser router
 * AC-P1C-C3
 *
 * Route map:
 *  1  /                          Dashboard (TodayView — full redesign in P1.E)
 *  2  /profile                   Profile editor shell (full UX P1.D)
 *  3  /settings                  Settings shell (full UX P1.D)
 *  4  /food                      redirects → /food/library
 *  5  /workouts                  redirects → /workouts/programs
 *  6  /cannabis                  redirects → /cannabis/products
 *  7  /food/library              Meal library
 *  8  /workouts/programs         Workout programs library
 *  9  /workouts/routines         Workout routines library
 * 10  /workouts/exercises        Exercises library
 * 11  /cannabis/products         Cannabis products library
 * 12  /cannabis/devices          Cannabis devices library
 * 13  /profile/work-locations    Work locations library
 * 14  /profile/fasting-safe      Fasting-safe items library
 * 15  /profile/sweet-tooth       Sweet-tooth items library
 * 16  /plan                      Planner (full UX P1.D)
 */
import { Navigate } from 'react-router-dom';
import { AppShell } from './AppShell.jsx';
import { TodayView }        from '../views/TodayView.jsx';
import { ProfileView }      from '../views/ProfileView.jsx';
import { SettingsView }     from '../views/SettingsView.jsx';
import { PlannerView }      from '../views/PlannerView.jsx';
import { LibraryRouteShell } from '../views/LibraryRouteShell.jsx';

/* ── Library route helpers ────────────────────────────────── */
const MealLibrary         = () => <LibraryRouteShell name="Food Library"       icon="🥘" />;
const WorkoutPrograms     = () => <LibraryRouteShell name="Programs"           icon="💪" />;
const WorkoutRoutines     = () => <LibraryRouteShell name="Routines"           icon="🔄" />;
const WorkoutExercises    = () => <LibraryRouteShell name="Exercises"          icon="🏋️" />;
const CannabisProducts    = () => <LibraryRouteShell name="Cannabis Products"  icon="🌿" />;
const CannabisDevices     = () => <LibraryRouteShell name="Cannabis Devices"   icon="🔧" />;
const WorkLocations       = () => <LibraryRouteShell name="Work Locations"     icon="🏢" />;
const FastingSafeItems    = () => <LibraryRouteShell name="Fasting-Safe Items" icon="🥦" />;
const SweetToothItems     = () => <LibraryRouteShell name="Sweet Tooth Items"  icon="🍬" />;

/**
 * routerConfig — array consumed by createBrowserRouter / createMemoryRouter.
 * Exported for testing (allows createMemoryRouter in unit tests).
 */
export const routerConfig = [
  {
    element: <AppShell />,
    children: [
      // Route 1 — Dashboard
      { index: true, element: <TodayView /> },

      // Route 2 — Profile editor shell
      { path: 'profile', element: <ProfileView /> },

      // Route 3 — Settings shell
      { path: 'settings', element: <SettingsView /> },

      // Route 4 — Food parent → redirect
      {
        path: 'food',
        children: [
          { index: true, element: <Navigate to="/food/library" replace /> },
          // Route 7 — Meal library
          { path: 'library', element: <MealLibrary /> },
        ],
      },

      // Route 5 — Workouts parent → redirect
      {
        path: 'workouts',
        children: [
          { index: true, element: <Navigate to="/workouts/programs" replace /> },
          // Routes 8-10
          { path: 'programs',  element: <WorkoutPrograms /> },
          { path: 'routines',  element: <WorkoutRoutines /> },
          { path: 'exercises', element: <WorkoutExercises /> },
        ],
      },

      // Route 6 — Cannabis parent → redirect
      {
        path: 'cannabis',
        children: [
          { index: true, element: <Navigate to="/cannabis/products" replace /> },
          // Routes 11-12
          { path: 'products', element: <CannabisProducts /> },
          { path: 'devices',  element: <CannabisDevices /> },
        ],
      },

      // Profile sub-routes (Routes 13-15) — nested under /profile
      // Note: profile index is already declared above; we extend with children
      // Instead we declare them as siblings at the top level to avoid
      // overriding the profile index
      { path: 'profile/work-locations', element: <WorkLocations /> },
      { path: 'profile/fasting-safe',   element: <FastingSafeItems /> },
      { path: 'profile/sweet-tooth',    element: <SweetToothItems /> },

      // Route 16 — Planner
      { path: 'plan', element: <PlannerView /> },
    ],
  },
];
