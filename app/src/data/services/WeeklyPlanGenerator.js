/**
 * WeeklyPlanGenerator.js — Cross-domain weekly plan orchestrator.
 *
 * generateWeeklyPlan({ startDate, profile, libraries, seed?, locks?, existingPlan? })
 *   → WeeklyPlan
 *
 * Pure function. No useStore, no Date.now(). Caller injects all inputs.
 * Caller is responsible for writing the result to mealPlanSlice + workoutPlanSlice.
 *
 * Invariants enforced:
 *   PF-12: any MealPlanSlot with eaten===true is NEVER overwritten.
 *   Category constraint: each slot receives only meals of the matching category.
 *   No-repeat within repeatGapDays (default 3) same category.
 *   Determinism: same inputs + seed → byte-identical output.
 *   Lock survival: dates in locks[] keep their existing slot assignments.
 *
 * AC-P1D-D16
 */

import { mulberry32 }         from '../calculators/_internal/seededRng.js';
import { selectMeal }          from '../calculators/strategies/mealStrategy.js';
import { planWorkoutWeek }     from '../calculators/strategies/workoutStrategy.js';
import { planCannabisWeek }    from '../calculators/strategies/cannabisStrategy.js';

// ── Date utilities ────────────────────────────────────────────────────────────

/**
 * Add N days to an ISO date string.
 * @param {string} isoDate - 'YYYY-MM-DD'
 * @param {number} n
 * @returns {string}
 */
function addDays(isoDate, n) {
  const d = new Date(isoDate + 'T00:00:00.000Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/**
 * Generate an ordered list of 7 ISO dates starting from startDate.
 * @param {string} startDate
 * @returns {string[]}
 */
function weekDates(startDate) {
  return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
}

// ── Empty slot factory ────────────────────────────────────────────────────────

function emptySlot() {
  return {
    mealInventoryId: null,
    eaten: false,
    eatenAt: null,
    plateWeight: null,
    notes: '',
  };
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Generate a full weekly plan.
 *
 * @param {Object} options
 * @param {string}   options.startDate     - ISO date (YYYY-MM-DD); week start.
 * @param {Object}   options.profile       - ProfileFields.
 * @param {Object}   options.libraries     - { meals, workoutRoutines, cannabisProducts }.
 * @param {number}   [options.seed=0]      - Deterministic RNG seed.
 * @param {string[]} [options.locks=[]]    - ISO dates whose slots must not change.
 * @param {Object}   [options.existingPlan] - Existing WeeklyPlan to preserve eaten slots.
 * @returns {WeeklyPlan}
 */
export function generateWeeklyPlan({
  startDate,
  profile,
  libraries,
  seed = 0,
  locks = [],
  existingPlan = null,
}) {
  const rng = mulberry32(seed);

  const dates = weekDates(startDate);
  const meals = libraries?.meals ?? [];
  const routines = libraries?.workoutRoutines ?? [];
  const cannabisProducts = libraries?.cannabisProducts ?? [];

  // Algorithm config defaults
  const favoriteWeight = 1.5;
  const repeatGapDays = 3;
  const categoryConstraint = true;

  // ── Plan workout week ─────────────────────────────────────────────────────
  const workoutDays = planWorkoutWeek({
    dates,
    profile,
    routines,
    rng,
    lockedDates: locks,
    existingPlan,
  });

  // ── Plan cannabis week ────────────────────────────────────────────────────
  const cannabisDays = planCannabisWeek({
    dates,
    profile,
    productLib: cannabisProducts,
  });

  // ── Plan meal week ────────────────────────────────────────────────────────
  const MEAL_CATEGORIES = ['breakfast', 'lunch', 'dinner', 'snack'];

  // Track recently used per category (sliding window of repeatGapDays)
  const recentlyUsed = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
    shake: [],
  };

  const mealDays = {};

  for (const date of dates) {
    const existingDay = existingPlan?.days?.[date];
    const isLocked = locks.includes(date);

    const dayMeals = {};

    for (const cat of MEAL_CATEGORIES) {
      const existingSlot = existingDay?.meals?.[cat];

      // PF-12: eaten slots are NEVER overwritten (regardless of locks[])
      if (existingSlot?.eaten === true) {
        dayMeals[cat] = { ...existingSlot };
        // Add to recently-used to avoid repeat constraint violations
        if (existingSlot.mealInventoryId) {
          recentlyUsed[cat].push(existingSlot.mealInventoryId);
          if (recentlyUsed[cat].length > repeatGapDays) {
            recentlyUsed[cat].shift();
          }
        }
        continue;
      }

      // Lock survival: locked day keeps existing slot (non-eaten)
      if (isLocked && existingSlot) {
        dayMeals[cat] = { ...existingSlot };
        if (existingSlot.mealInventoryId) {
          recentlyUsed[cat].push(existingSlot.mealInventoryId);
          if (recentlyUsed[cat].length > repeatGapDays) {
            recentlyUsed[cat].shift();
          }
        }
        continue;
      }

      // Select a new meal
      void categoryConstraint; // always enforced in selectMeal
      const mealId = selectMeal({
        meals,
        category: cat,
        recentlyUsed: [...recentlyUsed[cat]],
        favoriteWeight,
        rng,
      });

      dayMeals[cat] = {
        ...emptySlot(),
        mealInventoryId: mealId,
      };

      if (mealId) {
        recentlyUsed[cat].push(mealId);
        if (recentlyUsed[cat].length > repeatGapDays) {
          recentlyUsed[cat].shift();
        }
      }
    }

    // Shakes: take the existing shake(s) if eaten, otherwise empty array
    const existingShakes = existingDay?.meals?.shakes ?? [];
    const eatenShakes = existingShakes.filter((s) => s.eaten === true);
    dayMeals.shakes = eatenShakes.length > 0 ? eatenShakes : [];

    mealDays[date] = { ...dayMeals, locked: isLocked };
  }

  // ── Compose WeeklyPlan ────────────────────────────────────────────────────
  const days = {};
  for (const date of dates) {
    days[date] = {
      meals: mealDays[date],
      workout: workoutDays[date],
      cannabis: cannabisDays[date],
    };
  }

  return {
    startDate,
    days,
    locks,
    algorithmConfig: {
      meal: { favoriteWeight, repeatGapDays, categoryConstraint },
      workout: {
        walkDailyMinutes:  profile?.workoutPlan?.walkDailyMinutes ?? 30,
        kickboxingPerWeek: profile?.workoutPlan?.kickboxingPerWeek ?? 5,
        weightsPerWeek:    profile?.workoutPlan?.weightsPerWeek ?? 3,
      },
      cannabis: {
        startCeiling:     profile?.cannabisTaperSchedule?.startCeiling ?? 80,
        endCeiling:       profile?.cannabisTaperSchedule?.endCeiling ?? 25,
        taperStartDate:   profile?.cannabisTaperSchedule?.startDate ?? null,
      },
    },
  };
}
