/**
 * PlannerView.jsx — Full planner route.
 *
 * Layout per master plan § 1 Planner row:
 * 1. Hero CTA ("Plan my week" pill, 96px tall, borderRadius pill, ≥320px wide, fw 600).
 *    Caption: "auto-fires Sundays · tap to manually rebuild".
 *    On click: calls generateWeeklyPlan() → writes to mealPlanSlice + workoutPlanSlice.
 * 2. 7×4 meal grid (7 days × Breakfast/Lunch/Dinner/Snack).
 * 3. Per-day "Lock" pill toggle on each day-row (DayLockPill).
 * 4. Per-slot tap-to-swap bottom sheet (MealSwapSheet) — same-category meals.
 * 5. Workout chip per day below the meal grid.
 * 6. Cannabis session tiles per day (read-only preview).
 * 7. "Build shopping list" secondary button → ShoppingListSheet.
 * 8. Algorithm-transparency footer (AlgorithmFooter).
 *
 * Props (optional):
 *   storeOverride {Object} - For testing; override the Zustand store.
 *
 * AC-P1C-C3 / AC-P1C-C8 (shell) / AC-P1D-D17 (full)
 */
import { useState, useCallback, useMemo } from 'react';
import { useStore } from '../data/store/index.js';
import { generateWeeklyPlan } from '../data/services/WeeklyPlanGenerator.js';
import { MealPlanSlotCard } from '../components/planner/MealPlanSlotCard.jsx';
import { DayLockPill }      from '../components/planner/DayLockPill.jsx';
import { MealSwapSheet }    from '../components/planner/MealSwapSheet.jsx';
import { ShoppingListSheet } from '../components/planner/ShoppingListSheet.jsx';
import { AlgorithmFooter }  from '../components/planner/AlgorithmFooter.jsx';

// ── Day labels ────────────────────────────────────────────────────────────────

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEAL_CATEGORIES = ['breakfast', 'lunch', 'dinner', 'snack'];

// ── Initial seed — constant so React doesn't complain about Math.random in render ──
const INITIAL_SEED = 12345;

// ── PlannerView ────────────────────────────────────────────────────────────────

/**
 * @param {Object} props
 * @param {Object} [props.storeOverride] - Optional store injection for tests.
 */
export function PlannerView({ storeOverride }) {
  // ── Store reads ────────────────────────────────────────────────────────────
  // Always call useStore (rules of hooks: no conditional calls).
  // When storeOverride is provided (tests), we use its data instead.
  const realState = useStore((s) => s);
  const storeState = storeOverride ? storeOverride.getState() : realState;

  const meals   = useMemo(() => storeState.meals ?? [], [storeState.meals]);
  const profile = useMemo(() => storeState.profile ?? {}, [storeState.profile]);
  const routines         = useMemo(() => storeState.workoutRoutines ?? [], [storeState.workoutRoutines]);
  const cannabisProducts = useMemo(() => storeState.inventory ?? [], [storeState.inventory]);

  // ── Local UI state ─────────────────────────────────────────────────────────
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [lockedDates, setLockedDates] = useState([]);
  const [swapSheet, setSwapSheet] = useState(null);   // { date, category } | null
  const [shoppingOpen, setShoppingOpen] = useState(false);
  const [seed, setSeed] = useState(INITIAL_SEED);

  // ── Handlers ───────────────────────────────────────────────────────────────

  /** Generate (or regenerate) the weekly plan. */
  const handleGenerate = useCallback(() => {
    const today = new Date();
    const startDate = today.toISOString().slice(0, 10);

    const plan = generateWeeklyPlan({
      startDate,
      profile,
      libraries: { meals, workoutRoutines: routines, cannabisProducts },
      seed,
      locks: lockedDates,
      existingPlan: weeklyPlan,
    });

    setWeeklyPlan(plan);
    setSeed((s) => s + 1);
  }, [profile, meals, routines, cannabisProducts, seed, lockedDates, weeklyPlan]);

  /** Toggle a day's lock state. */
  const handleLockToggle = useCallback((date, newLocked) => {
    setLockedDates((prev) =>
      newLocked ? [...prev, date] : prev.filter((d) => d !== date)
    );
  }, []);

  /** Open the meal swap sheet for a slot. */
  const handleSlotClick = useCallback((date, category) => {
    setSwapSheet({ date, category });
  }, []);

  /** Swap a meal in the current plan. */
  const handleSwap = useCallback((mealId) => {
    if (!swapSheet || !weeklyPlan) return;
    const { date, category } = swapSheet;
    setWeeklyPlan((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [date]: {
          ...prev.days[date],
          meals: {
            ...prev.days[date].meals,
            [category]: {
              ...prev.days[date].meals[category],
              mealInventoryId: mealId,
            },
          },
        },
      },
    }));
    setSwapSheet(null);
  }, [swapSheet, weeklyPlan]);

  // ── Render ─────────────────────────────────────────────────────────────────

  const dates = weeklyPlan ? Object.keys(weeklyPlan.days).sort() : [];

  return (
    <div className="planner-view" data-testid="planner-view">
      {/* ── Hero CTA ────────────────────────────────────────────────────────── */}
      <div className="planner-view__hero-section">
        <button
          type="button"
          className="planner-view__hero-pill"
          style={{
            height: '96px',
            borderRadius: '9999px',
            minWidth: '320px',
            fontWeight: '600',
          }}
          onClick={handleGenerate}
          aria-label="Plan my week — generate weekly meal and workout plan"
        >
          Plan my week
        </button>
        <p className="planner-view__caption" style={{ textAlign: 'center', marginTop: '8px' }}>
          auto-fires Sundays · tap to manually rebuild
        </p>
      </div>

      {/* ── 7×4 Meal Grid ───────────────────────────────────────────────────── */}
      {weeklyPlan && (
        <section className="planner-view__grid" aria-label="Weekly meal plan">
          {/* Column headers */}
          <div className="planner-view__grid-header">
            <div className="planner-view__col-label planner-view__col-label--day">Day</div>
            {MEAL_CATEGORIES.map((cat) => (
              <div key={cat} className="planner-view__col-label">{cat}</div>
            ))}
            <div className="planner-view__col-label">Lock</div>
            <div className="planner-view__col-label">Workout</div>
          </div>

          {/* Day rows */}
          {dates.map((date, idx) => {
            const day = weeklyPlan.days[date];
            const isLocked = lockedDates.includes(date);
            const dayLabel = DAY_LABELS[idx] ?? date;

            return (
              <div
                key={date}
                className={`planner-view__day-row${isLocked ? ' planner-view__day-row--locked' : ''}`}
                data-testid="planner-day-row"
                data-date={date}
              >
                <span className="planner-view__day-label">{dayLabel}</span>

                {/* 4 meal slots */}
                {MEAL_CATEGORIES.map((cat) => {
                  const slot = day.meals?.[cat];
                  const meal = slot?.mealInventoryId
                    ? meals.find((m) => m.id === slot.mealInventoryId) ?? null
                    : null;

                  return (
                    <MealPlanSlotCard
                      key={cat}
                      slot={slot}
                      category={cat}
                      meal={meal}
                      onClick={() => handleSlotClick(date, cat)}
                    />
                  );
                })}

                {/* Lock pill */}
                <DayLockPill
                  date={date}
                  locked={isLocked}
                  onToggle={handleLockToggle}
                />

                {/* Workout chip */}
                <div
                  className="planner-view__workout-chip"
                  data-testid="workout-chip"
                  aria-label={`Workout: ${day.workout?.type ?? 'rest'}`}
                >
                  {day.workout?.type ?? 'rest'}
                </div>
              </div>
            );
          })}

          {/* Cannabis preview (read-only, below grid) */}
          <div className="planner-view__cannabis-strip" aria-label="Cannabis plan preview">
            {dates.map((date) => {
              const cannabis = weeklyPlan.days[date]?.cannabis;
              return (
                <div key={date} className="planner-view__cannabis-day" data-testid="cannabis-day">
                  <span className="planner-view__cannabis-ceiling">
                    {cannabis?.taperCeilingMg != null
                      ? `${Math.round(cannabis.taperCeilingMg)}mg`
                      : '—'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Build shopping list */}
          <button
            type="button"
            className="planner-view__shopping-btn"
            data-testid="build-shopping-list-btn"
            onClick={() => setShoppingOpen(true)}
          >
            Build shopping list
          </button>

          {/* Algorithm footer */}
          <AlgorithmFooter algorithmConfig={weeklyPlan.algorithmConfig} />
        </section>
      )}

      {/* ── Meal swap sheet ───────────────────────────────────────────────────── */}
      <MealSwapSheet
        open={!!swapSheet}
        onClose={() => setSwapSheet(null)}
        category={swapSheet?.category ?? 'breakfast'}
        meals={meals}
        onSelect={handleSwap}
      />

      {/* ── Shopping list sheet ───────────────────────────────────────────────── */}
      <ShoppingListSheet
        open={shoppingOpen}
        onClose={() => setShoppingOpen(false)}
        plan={weeklyPlan}
        meals={meals}
      />
    </div>
  );
}
