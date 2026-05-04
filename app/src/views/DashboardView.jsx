/**
 * DashboardView.jsx — Today's dashboard with 7 panels in a single-open AccordionGroup.
 *
 * Panels (E1–E7):
 *   1. Profile Banner (E1) — weight delta, calorie ring
 *   2. Spirituality (E2) — prayer chips
 *   3. Workout (E3) — weight sessions, capacity badge
 *   4. Cannabis (E4) — planned sessions, mg cap
 *   5. Food + IF (E5) — fasting banner, meal slots
 *   6. Sweet Tooth (E6) — indulgence counters, streak strip
 *   7. Working From (E7) — location picker, session timer
 *
 * Single-open invariant enforced by AccordionGroup (PF-10).
 * Closed-day guard checked per panel — reads from dayCloseSlice.closures[date].
 *
 * All writes go through repo hooks — no direct store writes in this view.
 *
 * AC-P1E-E7
 */
import { format } from 'date-fns';
import { useStore } from '../data/store';
import { CURRENT_USER_ID } from '../data/auth/currentUser.js';

import { AccordionGroup } from '../components/primitives/AccordionGroup.jsx';
import { AccordionPanel } from '../components/primitives/AccordionPanel.jsx';

import { ProfileBanner } from '../components/today/ProfileBanner.jsx';
import { SpiritualityPanel } from '../components/today/SpiritualityPanel.jsx';
import { WorkoutPanel } from '../components/today/WorkoutPanel.jsx';
import { CannabisPanel } from '../components/today/CannabisPanel.jsx';
import { FoodPanel } from '../components/today/FoodPanel.jsx';
import { SweetToothPanel } from '../components/today/SweetToothPanel.jsx';
import { WorkingFromPanel } from '../components/today/WorkingFromPanel.jsx';

import { selectWeightDeltaWeek, selectTodayCalorieRing, selectCannabisDayPlan } from '../data/selectors/today.js';
import { selectThcCeilingStatus } from '../data/selectors/cannabis.js';
import { currentState as fastingCurrentState } from '../data/calculators/fastingMath.js';

export function DashboardView() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const userId = CURRENT_USER_ID;

  // ── Store reads ───────────────────────────────────────────────────────────
  const state = useStore((s) => s);
  const profile = state.profile ?? {};
  const prayers = state.prayers ?? {};
  const workSessions = (state.workSessions ?? []).filter((s) => s.date === today);
  const workLocations = state.workLocations ?? [];
  const routines = state.workoutRoutines ?? [];
  const dailySlips = state.dailySlips ?? {};
  const closures = state.dayCloseSlice?.closures ?? {};
  const isClosed = !!closures[today];

  // ── Selectors ─────────────────────────────────────────────────────────────
  const weightDelta = selectWeightDeltaWeek(state, userId, today);
  const calorieRing = selectTodayCalorieRing(state, userId, today);
  const cannabisDayPlan = selectCannabisDayPlan(state, userId, today);
  const ceilingStatus = selectThcCeilingStatus(state, userId, today);

  // ── Fasting state ─────────────────────────────────────────────────────────
  const fastingProtocol = profile.fastingProtocol ?? null;
  const fastingState = fastingProtocol?.enabled
    ? fastingCurrentState(new Date().toISOString(), fastingProtocol, null)
    : { state: 'open' };

  // ── Plan day ─────────────────────────────────────────────────────────────
  const mealPlan = state.mealPlan;
  const planDay = mealPlan?.days?.[today] ?? null;

  // ── Sweet tooth streak (14 days) ─────────────────────────────────────────
  const streak = (() => {
    const result = [];
    const endDate = new Date(today);
    for (let i = 13; i >= 0; i--) {
      const d = new Date(endDate);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const daySlips = dailySlips[dateStr] ?? [];
      result.push({ date: dateStr, slipCount: daySlips.length });
    }
    return result;
  })();

  // ── Today's sweet tooth counts ───────────────────────────────────────────
  const todaySlips = dailySlips[today] ?? [];
  const sweetToothCounts = {};
  for (const slip of todaySlips) {
    sweetToothCounts[slip.item] = (sweetToothCounts[slip.item] ?? 0) + 1;
  }

  // ── Active work session ──────────────────────────────────────────────────
  const activeWorkSession = workSessions.find((s) => !s.endedAt) ?? null;

  // ── Store action refs ─────────────────────────────────────────────────────
  const togglePrayer = useStore((s) => s.togglePrayer);
  const addWeightSession = useStore((s) => s.addWeightSession);
  const removeWeightSession = useStore((s) => s.removeWeightSession);
  const addSlip = useStore((s) => s.addSlip);
  const startSession = useStore((s) => s.startSession);
  const endSession = useStore((s) => s.endSession);
  const updateMealPlanSlot = useStore((s) => s.updateMealPlanSlot);

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleTogglePrayer(key) {
    if (isClosed) return;
    togglePrayer?.(today, key);
  }

  function handleAddWeightSession(routineId, routineName) {
    if (isClosed) return;
    try {
      addWeightSession?.({ date: today, routineId, routineName });
    } catch {
      // cap exceeded — UI already shows the lockout
    }
  }

  function handleRemoveWeightSession(id) {
    if (isClosed) return;
    removeWeightSession?.(id);
  }

  function handleToggleEaten(slotKey) {
    if (isClosed) return;
    updateMealPlanSlot?.(today, slotKey, { eaten: !planDay?.[slotKey]?.eaten });
  }

  function handleEditPlateWeight(slotKey, newWeight) {
    if (isClosed) return;
    updateMealPlanSlot?.(today, slotKey, { plateWeight: newWeight });
  }

  function handleAddSlip(item) {
    if (isClosed) return;
    addSlip?.(today, item);
  }

  function handleStartSession(locationId) {
    if (isClosed) return;
    const loc = workLocations.find((l) => l.id === locationId);
    startSession?.({ date: today, locationId, locationName: loc?.name });
  }

  function handleEndSession(sessionId) {
    endSession?.(sessionId);
  }

  return (
    <div className="dashboard-view" data-testid="dashboard-view">
      <AccordionGroup>
        {/* 1 — Profile Banner */}
        <AccordionPanel id="profile" title="Profile">
          <ProfileBanner
            profile={profile}
            weightDeltaLb={weightDelta}
            calorieRing={calorieRing}
          />
        </AccordionPanel>

        {/* 2 — Spirituality */}
        <AccordionPanel id="spirituality" title="Spirituality">
          <SpiritualityPanel
            prayerStatus={prayers[today] ?? {}}
            onToggle={handleTogglePrayer}
            isClosed={isClosed}
          />
        </AccordionPanel>

        {/* 3 — Workout */}
        <AccordionPanel id="workout" title="Workout">
          <WorkoutPanel
            weightSessions={(state.weightSessions ?? []).filter((s) => s.date === today)}
            workoutLogs={(state.workoutLogs ?? []).filter((s) => s.date === today)}
            routines={routines}
            dailyCap={profile?.workoutPlan?.dailyWeightSessionCap ?? 2}
            isClosed={isClosed}
            onAddWeightSession={handleAddWeightSession}
            onRemoveWeightSession={handleRemoveWeightSession}
            onAddWalk={() => {}}
            onAddKickboxing={() => {}}
            date={today}
          />
        </AccordionPanel>

        {/* 4 — Cannabis */}
        <AccordionPanel id="cannabis" title="Cannabis">
          <CannabisPanel
            plan={cannabisDayPlan}
            mgToday={cannabisDayPlan.mgToday}
            ceilingStatus={ceilingStatus}
            isClosed={isClosed}
            onLog={() => {}}
          />
        </AccordionPanel>

        {/* 5 — Food + IF */}
        <AccordionPanel id="food" title="Food">
          <FoodPanel
            planDay={planDay}
            fastingState={fastingState}
            fastingProtocol={fastingProtocol}
            isClosed={isClosed}
            onToggleEaten={handleToggleEaten}
            onEditPlateWeight={handleEditPlateWeight}
            onCaloriesUpdate={() => {}}
            plateDefaults={profile?.plateDefaults ?? {}}
          />
        </AccordionPanel>

        {/* 6 — Sweet Tooth */}
        <AccordionPanel id="sweet-tooth" title="Sweet Tooth">
          <SweetToothPanel
            dailyCounts={sweetToothCounts}
            streak={streak}
            isClosed={isClosed}
            onAddSlip={handleAddSlip}
          />
        </AccordionPanel>

        {/* 7 — Working From */}
        <AccordionPanel id="working-from" title="Working From">
          <WorkingFromPanel
            locations={workLocations}
            sessions={workSessions}
            activeSession={activeWorkSession}
            isClosed={isClosed}
            onStartSession={handleStartSession}
            onEndSession={handleEndSession}
            date={today}
          />
        </AccordionPanel>
      </AccordionGroup>
    </div>
  );
}
