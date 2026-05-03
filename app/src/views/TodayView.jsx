import { useState } from 'react';
import { useStore } from '../data/store';
import { Accordion } from '../components/Accordion';
import { QuickAddModal } from '../components/QuickAddModal';
import { format } from 'date-fns';

function RiskBadge({ level }) {
  return <span className={`risk-badge risk-${(level || '').replace(/-/g, '')}`}>{level}</span>;
}

export function TodayView() {
  const profile = useStore((s) => s.profile);
  const foodLogs = useStore((s) => s.getTodayFoodLogs());
  const cannabisLogs = useStore((s) => s.getTodayCannabisLogs());
  const workoutLog = useStore((s) => s.getTodayWorkoutLog());
  const calories = useStore((s) => s.getTodayCalories());
  const protein = useStore((s) => s.getTodayProtein());
  const sessions = useStore((s) => s.getTodaySessions());
  const inventory = useStore((s) => s.inventory);
  const deleteFoodLog = useStore((s) => s.deleteFoodLog);
  const deleteCannabisLog = useStore((s) => s.deleteCannabisLog);

  const [quickAdd, setQuickAdd] = useState(null); // null | 'picker' | type string

  const startingWeight = profile.startingWeight;
  const currentWeight = profile.currentWeight;
  const goalWeight = profile.goalWeight;
  const lostSoFar = Math.max(0, startingWeight - currentWeight);
  const totalToLose = startingWeight - goalWeight;
  const progressPct = Math.min(100, (lostSoFar / totalToLose) * 100);

  const calorieTarget = profile.nutritionTargets.caloriesRest;
  const proteinTarget = profile.nutritionTargets.protein;
  const stepTarget = profile.nutritionTargets.stepsStart;
  const steps = workoutLog?.steps || 0;
  const sessionTarget = profile.cannabisTargets.dailySessions;

  const calPct = Math.min(100, (calories / calorieTarget) * 100);
  const proteinPct = Math.min(100, (protein / proteinTarget) * 100);
  const stepsPct = Math.min(100, (steps / stepTarget) * 100);
  const sessionPct = Math.min(100, (sessions / sessionTarget) * 100);

  return (
    <div className="view-container">
      {/* Progress Hero */}
      <div className="hero-card" style={{ marginBottom: 14 }}>
        <div className="hero-headline">{lostSoFar === 0 ? 'Starting today' : `${lostSoFar.toFixed(1)} lb lost`}</div>
        <div className="hero-sub">
          {currentWeight} lb current · {goalWeight} lb goal · {(currentWeight - goalWeight).toFixed(1)} lb remaining
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="hero-stats">
          <div className="hero-stat"><strong>{calories}</strong> / {calorieTarget} kcal</div>
          <div className="hero-stat"><strong>{protein}g</strong> / {proteinTarget}g protein</div>
          <div className="hero-stat"><strong>{sessions}</strong> / {sessionTarget} sessions</div>
          <div className="hero-stat"><strong>{steps.toLocaleString()}</strong> / {stepTarget.toLocaleString()} steps</div>
        </div>
      </div>

      {/* Metric Tiles */}
      <div className="tiles-grid">
        <div className="tile" onClick={() => setQuickAdd('weight')}>
          <div className="tile-label">Weight</div>
          <div className="tile-value">{currentWeight}</div>
          <div className="tile-sub">lbs · tap to log</div>
        </div>
        <div className="tile" onClick={() => setQuickAdd('food')}>
          <div className="tile-label">Calories</div>
          <div className="tile-value">{calories}</div>
          <div className="tile-sub">/ {calorieTarget} kcal</div>
          <div className="tile-bar"><div className="tile-bar-fill" style={{ width: `${calPct}%` }} /></div>
        </div>
        <div className="tile" onClick={() => setQuickAdd('cannabis')}>
          <div className="tile-label">Cannabis</div>
          <div className="tile-value">{sessions}</div>
          <div className="tile-sub">/ {sessionTarget} sessions</div>
          <div className="tile-bar">
            <div className="tile-bar-fill" style={{ width: `${sessionPct}%`, background: sessions >= sessionTarget ? 'var(--orange)' : 'var(--teal)' }} />
          </div>
        </div>
        <div className="tile" onClick={() => setQuickAdd('steps')}>
          <div className="tile-label">Steps</div>
          <div className="tile-value">{steps.toLocaleString()}</div>
          <div className="tile-sub">/ {stepTarget.toLocaleString()}</div>
          <div className="tile-bar"><div className="tile-bar-fill" style={{ width: `${stepsPct}%` }} /></div>
        </div>
      </div>

      {/* Food Accordion */}
      <Accordion
        title="🍽 Food, Snacks & Munchies"
        badge={foodLogs.length ? ` · ${foodLogs.length} entries · ${calories} kcal · ${protein}g protein` : ''}
        defaultOpen={true}
      >
        <div style={{ paddingTop: 10 }}>
          {foodLogs.length === 0 && (
            <div className="empty-state">No food logged yet today.</div>
          )}
          {foodLogs.map((entry) => (
            <div key={entry.id} className="food-entry">
              <div className="food-meta">
                <div className="food-label">{entry.label} · {entry.time}</div>
                <div className="food-name">{entry.name}</div>
                <div className="food-macros">
                  {entry.calories} kcal · {entry.protein}g protein
                  {entry.carbs ? ` · ${entry.carbs}g carbs` : ''}
                  {entry.fat ? ` · ${entry.fat}g fat` : ''}
                </div>
                <div className="food-badges">
                  {entry.cannabisTriggered && <span className="badge badge-cannabis">cannabis-triggered</span>}
                  {entry.munchiesRelated && <span className="badge badge-munchies">munchies</span>}
                  {entry.source === 'Template' && <span className="badge" style={{ background: 'var(--teal-bg)', color: 'var(--teal)' }}>template</span>}
                </div>
                {entry.notes && <div style={{ fontSize: 11, color: 'var(--text-dimmer)', marginTop: 3 }}>{entry.notes}</div>}
              </div>
              <button className="btn-icon" style={{ color: 'var(--red)', opacity: 0.6 }} onClick={() => deleteFoodLog(entry.id)}>✕</button>
            </div>
          ))}
          <div style={{ marginTop: 10 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setQuickAdd('food')}>+ Add Food</button>
          </div>
        </div>
      </Accordion>

      {/* Cannabis Accordion */}
      <Accordion
        title="🌿 Cannabis Daily Control"
        badge={` · ${sessions}/${sessionTarget} sessions`}
        defaultOpen={false}
      >
        <div style={{ paddingTop: 10 }}>
          {sessions >= sessionTarget && (
            <div className="medical-warning">
              ⚠ Daily target of {sessionTarget} sessions reached.
            </div>
          )}
          {cannabisLogs.length === 0 && (
            <div className="empty-state">No sessions logged today.</div>
          )}
          {cannabisLogs.map((log, i) => {
            const product = inventory.find((p) => p.id === log.productId);
            return (
              <div key={log.id} className="cannabis-session">
                <div className="session-num">{i + 1}</div>
                <div className="session-meta">
                  <div className="session-product">{product?.name || 'Unknown product'}</div>
                  <div className="session-detail">
                    {log.time} · {log.amount} {log.unit}
                    {log.thcMg ? ` · ~${log.thcMg}mg THC` : ''}
                    · {log.reason} · Effect: {log.effect}
                  </div>
                  {log.munchiesTriggered && <span className="badge badge-munchies" style={{ marginTop: 4 }}>munchies triggered</span>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  {product && <RiskBadge level={product.riskLevel} />}
                  <button className="btn-icon" style={{ color: 'var(--red)', opacity: 0.6 }} onClick={() => deleteCannabisLog(log.id)}>✕</button>
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 10 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setQuickAdd('cannabis')}>+ Log Session</button>
          </div>
        </div>
      </Accordion>

      {/* Workout Accordion */}
      <Accordion
        title="🏃 Workout, Walks & Recovery"
        badge={workoutLog ? ` · ${workoutLog.type} · ${workoutLog.steps?.toLocaleString() || 0} steps` : ''}
        defaultOpen={false}
      >
        <div style={{ paddingTop: 10 }}>
          {!profile.medicalFlags.medicalClearance && (
            <div className="medical-warning">
              ⚠ Chest pain & shortness of breath reported. Hard workouts are locked until medical clearance is confirmed in Profile.
            </div>
          )}
          {!workoutLog && <div className="empty-state">No activity logged today.</div>}
          {workoutLog && (
            <div style={{ fontSize: 13 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{workoutLog.type}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 12 }}>
                Intensity: {workoutLog.intensity} · Duration: {workoutLog.walkDuration || 0} min
                · Steps: {(workoutLog.steps || 0).toLocaleString()}
                · {workoutLog.completed ? '✓ Completed' : 'In progress'}
              </div>
              {(workoutLog.chestPain || workoutLog.sob) && (
                <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 4 }}>
                  ⚠ {workoutLog.chestPain ? 'Chest pain reported · ' : ''}{workoutLog.sob ? 'Shortness of breath reported' : ''}
                </div>
              )}
              {workoutLog.notes && <div style={{ color: 'var(--text-dimmer)', fontSize: 11, marginTop: 4 }}>{workoutLog.notes}</div>}
            </div>
          )}
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setQuickAdd('workout')}>
              {workoutLog ? 'Edit Activity' : '+ Log Activity'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setQuickAdd('steps')}>
              {workoutLog?.steps ? 'Edit Steps' : '+ Log Steps'}
            </button>
          </div>
        </div>
      </Accordion>

      {/* Modals */}
      {quickAdd && (
        <QuickAddModal
          onClose={() => setQuickAdd(null)}
          defaultType={quickAdd === 'picker' ? null : quickAdd}
        />
      )}
    </div>
  );
}
