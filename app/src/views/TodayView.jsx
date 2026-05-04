/**
 * TodayView.jsx — Today's summary view.
 *
 * AC-P0-C2: Decomposed into card components.
 * Reads state via repo hooks (not direct useStore imports) per P1 audit requirement.
 *
 * Store reads replaced:
 *   - cannabisLogs, inventory, getDailyCannabisPlan → useCannabisRepo()
 *   - workoutLogs                                   → useWorkoutRepo()
 *   - profile                                       → useProfileRepo()
 *   - demoMode, toggleDemoMode                      → useStore (ui slice — no repo abstraction yet)
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { useStore } from '../data/store';
import { useCannabisRepo } from '../data/repositories/useCannabisRepo';
import { useWorkoutRepo } from '../data/repositories/useWorkoutRepo';
import { useProfileRepo } from '../data/repositories/useProfileRepo';
import { DEMO_CANNABIS_LOGS, DEMO_WORKOUT_LOG } from '../data/seed';

import { RingChart } from '../components/primitives/RingChart';
import { WeightCard } from '../components/cards/WeightCard';
import { CannabisCard } from '../components/cards/CannabisCard';
import { WorkoutCard } from '../components/cards/WorkoutCard';
import { QuickAddModal } from '../components/QuickAddModal';
import { CannabisSessionModal } from '../components/CannabisSessionModal';

export function TodayView() {
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // UI state (no repo abstraction needed for these)
  const demoMode = useStore((s) => s.demoMode);

  // Domain data via repo hooks
  const cannabisRepo = useCannabisRepo();
  const workoutRepo  = useWorkoutRepo();
  const profileRepo  = useProfileRepo();
  const profile      = profileRepo.getProfile();

  // Demo-mode overrides
  const allCannabisLogs = cannabisRepo.listSessions();
  const allWorkoutLogs  = workoutRepo.listWorkoutLogs();
  const inventory       = cannabisRepo.listProducts();

  const cannabisLogs = demoMode
    ? DEMO_CANNABIS_LOGS.map((e) => ({ ...e, date: todayStr }))
    : allCannabisLogs.filter((e) => e.date === todayStr);

  const workoutLog = demoMode
    ? { ...DEMO_WORKOUT_LOG, date: todayStr }
    : (allWorkoutLogs.find((e) => e.date === todayStr) || null);

  const dailyPlan = cannabisRepo.getDailyCannabisPlan();
  const sessions  = cannabisLogs.length;

  // Profile data
  const { startingWeight, currentWeight, goalWeight, nutritionTargets, cannabisTargets } = profile;
  const { stepsStart: stepTarget } = nutritionTargets;
  const { dailySessions: sessionTarget } = cannabisTargets;
  const steps = workoutLog?.steps || 0;

  // Tile ring classes
  const overLimit        = sessions >= sessionTarget;
  const sessionRingClass = overLimit ? 'ring-red' : 'ring-teal';
  const sessionNumClass  = overLimit
    ? 'ring-num-sessions ring-num-sessions--over'
    : 'ring-num-sessions';

  // Modal state
  const [quickAdd, setQuickAdd] = useState(null);
  const [cannabisModal, setCannabisModal] = useState({
    open: false, planSession: null, isExtra: false,
  });

  return (
    <div className="view-container">

      {/* ── Weight Hero ── */}
      <WeightCard
        currentWeight={currentWeight}
        goalWeight={goalWeight}
        startingWeight={startingWeight}
        onLogWeight={() => setQuickAdd('weight')}
      />

      {/* ── Stat Tiles ── */}
      <div className="v2-tiles">
        <div className="v2-tile v2-tile--weight" onClick={() => setQuickAdd('weight')}>
          <RingChart
            value={Math.max(0, startingWeight - currentWeight)}
            max={Math.max(1, startingWeight - goalWeight)}
            colorClass="ring-green" size={108} stroke={10}
          >
            <div className="ring-num-weight">{currentWeight}</div>
            <div className="ring-num-unit">lbs</div>
          </RingChart>
          <div className="v2-tile-name">Weight</div>
          <div className="v2-tile-hint">tap to log</div>
        </div>

        <div className="v2-tile v2-tile--cannabis"
          onClick={() => setCannabisModal({ open: true, planSession: null, isExtra: false })}>
          <RingChart
            value={sessions} max={sessionTarget}
            colorClass={sessionRingClass} size={108} stroke={10}
          >
            <div className={sessionNumClass}>{sessions}</div>
            <div className="ring-num-unit">/ {sessionTarget}</div>
          </RingChart>
          <div className="v2-tile-name">Cannabis</div>
          <div className="v2-tile-hint">sessions</div>
        </div>

        <div className="v2-tile v2-tile--steps" onClick={() => setQuickAdd('steps')}>
          <RingChart value={steps} max={stepTarget} colorClass="ring-teal" size={108} stroke={10}>
            <div className="ring-num-steps">{steps.toLocaleString()}</div>
            <div className="ring-num-unit">steps</div>
          </RingChart>
          <div className="v2-tile-name">Steps</div>
          <div className="v2-tile-hint">of {stepTarget.toLocaleString()}</div>
        </div>
      </div>

      {/* ── Bottom Row: Cannabis + Workout ── */}
      <div className="v2-bottom-row">
        <CannabisCard
          sessions={sessions}
          sessionTarget={sessionTarget}
          dailyPlan={dailyPlan}
          cannabisLogs={cannabisLogs}
          inventory={inventory}
          demoMode={demoMode}
          onLogSession={(ps) => setCannabisModal({ open: true, planSession: ps, isExtra: false })}
          onAddExtra={() => setCannabisModal({ open: true, planSession: null, isExtra: true })}
        />

        <WorkoutCard
          steps={steps}
          stepTarget={stepTarget}
          workoutLog={workoutLog}
          onLog={() => setQuickAdd('workout')}
        />
      </div>

      {quickAdd && (
        <QuickAddModal
          onClose={() => setQuickAdd(null)}
          defaultType={quickAdd === 'picker' ? null : quickAdd}
        />
      )}
      {cannabisModal.open && (
        <CannabisSessionModal
          onClose={() => setCannabisModal({ open: false, planSession: null, isExtra: false })}
          planSession={cannabisModal.planSession}
          isExtra={cannabisModal.isExtra}
        />
      )}
    </div>
  );
}
