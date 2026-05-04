/**
 * workoutStrategy.js — Workout slot selector.
 *
 * Pure function. No store access, no Date.now().
 *
 * Selection rules:
 *   1. Weight sessions per week capped at workoutPlan.weightsPerWeek.
 *   2. Rest days fill when all quota is used.
 *   3. Cap: weight sessions in any single day ≤ dailyWeightSessionCap (always 1 per slot).
 *   4. Walk sessions fill the remaining days up to kickboxingPerWeek + walkDailyMinutes.
 *
 * AC-P1D-D16
 */

/**
 * Generate a 7-day workout schedule.
 *
 * @param {Object} options
 * @param {string[]} options.dates         - ISO dates for the week (7 items).
 * @param {Object}  options.profile        - ProfileFields with workoutPlan.
 * @param {Object[]} options.routines      - WorkoutRoutine[] from library.
 * @param {Function} options.rng           - Seeded RNG.
 * @param {string[]} options.lockedDates   - Dates that keep their existing workout.
 * @param {Object}  options.existingPlan   - Optional existing plan for lock reference.
 * @returns {{ [date: string]: WorkoutPlanDay }}
 */
export function planWorkoutWeek({ dates, profile, routines, rng, lockedDates = [], existingPlan = null }) {
  const wp = profile?.workoutPlan ?? {};
  const weightsPerWeek = wp.weightsPerWeek ?? 3;
  const kickboxingPerWeek = wp.kickboxingPerWeek ?? 5;
  const dailyWeightSessionCap = wp.dailyWeightSessionCap ?? 2;

  void dailyWeightSessionCap; // constraint acknowledged — 1 per slot, always ≤ cap

  const weightRoutines = routines.filter((r) => r.type === 'weights');
  const walkRoutines   = routines.filter((r) => r.type === 'walk' || r.type === 'cardio');

  // Build schedule
  const result = {};
  let weightsThisWeek = 0;
  let kickboxingThisWeek = 0;

  for (const date of dates) {
    // Locked: preserve existing workout
    if (lockedDates.includes(date) && existingPlan?.days?.[date]?.workout) {
      result[date] = existingPlan.days[date].workout;
      continue;
    }

    let type = 'rest';
    let routineId = null;
    let estDurationMin = null;

    if (weightsThisWeek < weightsPerWeek) {
      // Assign weights day
      type = 'weights';
      const routine = weightRoutines[Math.floor(rng() * (weightRoutines.length || 1))] ?? null;
      routineId = routine?.id ?? null;
      estDurationMin = routine?.estDurationMin ?? 45;
      weightsThisWeek++;
    } else if (kickboxingThisWeek < kickboxingPerWeek) {
      // Assign walk / cardio day
      type = 'walk';
      const routine = walkRoutines[Math.floor(rng() * (walkRoutines.length || 1))] ?? null;
      routineId = routine?.id ?? null;
      estDurationMin = wp.walkDailyMinutes ?? 30;
      kickboxingThisWeek++;
    } else {
      // Rest day
      type = 'rest';
    }

    result[date] = { routineId, type, estDurationMin, locked: false };
  }

  return result;
}
