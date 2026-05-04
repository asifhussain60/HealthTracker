/**
 * router.jsx — 16-route browser router
 * AC-P1D-D8 (updated from AC-P1C-C3)
 *
 * Route map:
 *  1  /                          Dashboard (TodayView — full redesign in P1.E)
 *  2  /profile                   Profile editor (real editor since AC-P1D-D2)
 *  3  /settings                  Settings (real view since AC-P1D-D3)
 *  4  /food                      redirects → /food/library
 *  5  /workouts                  redirects → /workouts/programs
 *  6  /cannabis                  redirects → /cannabis/products
 *  7  /food/library              Meal library (LibraryView + mealsSchema)
 *  8  /workouts/programs         Workout programs library
 *  9  /workouts/routines         Workout routines library
 * 10  /workouts/exercises        Exercises library
 * 11  /cannabis/products         Cannabis products library
 * 12  /cannabis/devices          Cannabis devices library
 * 13  /profile/work-locations    Work locations library
 * 14  /profile/fasting-safe      Fasting-safe items library
 * 15  /profile/sweet-tooth       Sweet-tooth items library
 * 16  /plan                      Planner
 *
 * ESLint: react-refresh/only-export-components suppressed — this module
 * intentionally exports both `routerConfig` data and inline route wrapper components.
 */
/* eslint-disable react-refresh/only-export-components */
import { Navigate } from 'react-router-dom';
import { AppShell } from './AppShell.jsx';
import { TodayView }     from '../views/TodayView.jsx';
import { ProfileView }   from '../views/ProfileView.jsx';
import { SettingsView }  from '../views/SettingsView.jsx';
import { PlannerView }   from '../views/PlannerView.jsx';
import { LibraryView }   from '../components/library/LibraryView.jsx';

// ── LibrarySchema imports ──────────────────────────────────────────────────────
import { mealsSchema }              from '../data/library/schemas/meals.js';
import { workoutProgramsSchema }    from '../data/library/schemas/workoutPrograms.js';
import { workoutRoutinesSchema }    from '../data/library/schemas/workoutRoutines.js';
import { exercisesSchema }          from '../data/library/schemas/exercises.js';
import { cannabisProductsSchema }   from '../data/library/schemas/cannabisProducts.js';
import { cannabisDevicesSchema }    from '../data/library/schemas/cannabisDevices.js';
import { workLocationsSchema }      from '../data/library/schemas/workLocations.js';
import { fastingSafeItemsSchema }   from '../data/library/schemas/fastingSafeItems.js';
import { sweetToothItemsSchema }    from '../data/library/schemas/sweetToothItems.js';

/* ── Library route wrappers ──────────────────────────────────── */
// Each wraps <LibraryView> with its schema. No store prop = uses real Zustand store.
const MealLibrary         = () => <LibraryView schema={mealsSchema} />;
const WorkoutPrograms     = () => <LibraryView schema={workoutProgramsSchema} />;
const WorkoutRoutines     = () => <LibraryView schema={workoutRoutinesSchema} />;
const WorkoutExercises    = () => <LibraryView schema={exercisesSchema} />;
const CannabisProducts    = () => <LibraryView schema={cannabisProductsSchema} />;
const CannabisDevices     = () => <LibraryView schema={cannabisDevicesSchema} />;
const WorkLocations       = () => <LibraryView schema={workLocationsSchema} />;
const FastingSafeItems    = () => <LibraryView schema={fastingSafeItemsSchema} />;
const SweetToothItems     = () => <LibraryView schema={sweetToothItemsSchema} />;

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

      // Route 2 — Profile editor
      { path: 'profile', element: <ProfileView /> },

      // Route 3 — Settings
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

      // Profile sub-routes (Routes 13-15) — siblings at top level
      { path: 'profile/work-locations', element: <WorkLocations /> },
      { path: 'profile/fasting-safe',   element: <FastingSafeItems /> },
      { path: 'profile/sweet-tooth',    element: <SweetToothItems /> },

      // Route 16 — Planner
      { path: 'plan', element: <PlannerView /> },
    ],
  },
];
