import { useState } from 'react';
import { useStore } from '../data/store';
import { DEMO_FOOD_LOGS, DEMO_CANNABIS_LOGS, DEMO_WORKOUT_LOG } from '../data/seed';
import { QuickAddModal } from '../components/QuickAddModal';
import { format } from 'date-fns';

// ── SVG Ring / Donut Chart ─────────────────────────────────────
// colorClass controls stroke colour via CSS (e.g. ring-green, ring-orange, ring-teal, ring-red)
function RingChart({ value, max, colorClass = 'ring-teal', size = 90, stroke = 9, children }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, max > 0 ? value / max : 0);
  return (
    <div className={`ring-wrap ${colorClass}`}>
      <svg className="ring-svg" width={size} height={size}>
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />
        <circle className="ring-fill" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke}
          strokeDasharray={`${pct * circ} ${circ}`} />
      </svg>
      <div className="ring-inner">{children}</div>
    </div>
  );
}

// ── Horizontal Macro Bar ───────────────────────────────────────
// colorClass: bar-teal | bar-yellow | bar-orange
function MacroBar({ label, value, max, colorClass = 'bar-teal' }) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0);
  return (
    <div className={`macro-bar ${colorClass}`} style={{ '--fill': `${pct}%` }}>
      <div className="macro-bar-row">
        <span className="macro-bar-name">{label}</span>
        <span className="macro-bar-value">{value}g <span className="macro-bar-max">/ {max}g</span></span>
      </div>
      <div className="macro-bar-track">
        <div className="macro-bar-fill" />
      </div>
    </div>
  );
}

const MEAL_ICONS = { Breakfast: '🌅', Lunch: '☀️', Dinner: '🌙', Snack: '🍎', Munchies: '🍿' };

const RISK_CLASS = { high: 'risk-high', medium: 'risk-medium', low: 'risk-low' };

// ── Main View ──────────────────────────────────────────────────
export function TodayView() {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const demoMode = useStore((s) => s.demoMode);
  const profile = useStore((s) => s.profile);
  const allFoodLogs = useStore((s) => s.foodLogs);
  const allCannabisLogs = useStore((s) => s.cannabisLogs);
  const allWorkoutLogs = useStore((s) => s.workoutLogs);
  const inventory = useStore((s) => s.inventory);
  const deleteFoodLog = useStore((s) => s.deleteFoodLog);

  const foodLogs = demoMode
    ? DEMO_FOOD_LOGS.map((e) => ({ ...e, date: todayStr }))
    : allFoodLogs.filter((e) => e.date === todayStr);

  const cannabisLogs = demoMode
    ? DEMO_CANNABIS_LOGS.map((e) => ({ ...e, date: todayStr }))
    : allCannabisLogs.filter((e) => e.date === todayStr);

  const workoutLog = demoMode
    ? { ...DEMO_WORKOUT_LOG, date: todayStr }
    : (allWorkoutLogs.find((e) => e.date === todayStr) || null);

  const calories = foodLogs.reduce((sum, e) => sum + (Number(e.calories) || 0), 0);
  const protein  = foodLogs.reduce((sum, e) => sum + (Number(e.protein)  || 0), 0);
  const carbs    = foodLogs.reduce((sum, e) => sum + (Number(e.carbs)    || 0), 0);
  const fat      = foodLogs.reduce((sum, e) => sum + (Number(e.fat)      || 0), 0);
  const sessions = cannabisLogs.length;
  const steps    = workoutLog?.steps || 0;

  const [quickAdd, setQuickAdd] = useState(null);

  const { startingWeight, currentWeight, goalWeight, nutritionTargets, cannabisTargets } = profile;
  const lostSoFar   = Math.max(0, startingWeight - currentWeight);
  const totalToLose = Math.max(1, startingWeight - goalWeight);
  const progressPct = Math.min(100, (lostSoFar / totalToLose) * 100);

  const { caloriesRest: calTarget, protein: proteinTarget, stepsStart: stepTarget } = nutritionTargets;
  const { dailySessions: sessionTarget } = cannabisTargets;
  const carbTarget = Math.round((calTarget * 0.40) / 4);
  const fatTarget  = Math.round((calTarget * 0.30) / 9);

  // Derive CSS class names from data — no dynamic color values in JSX
  const overLimit        = sessions >= sessionTarget;
  const sessionRingClass = overLimit ? 'ring-red'      : 'ring-teal';
  const sessionNumClass  = overLimit ? 'ring-num-sessions ring-num-sessions--over' : 'ring-num-sessions';

  return (
    <div className="view-container">

      {/* ── Hero: Weight Journey ── */}
      <div className="v2-hero">
        <div className="v2-hero-left">
          <div className="v2-hero-eyebrow">Weight Journey</div>
          <div className="v2-hero-weight">{currentWeight} <span>lb</span></div>
          <div className="v2-hero-goal">
            Goal <strong>{goalWeight} lb</strong> · <span className="text-teal">{(currentWeight - goalWeight).toFixed(1)} lb to go</span>
          </div>
          <div className="v2-progress-track">
            <div className="v2-progress-fill" style={{ '--fill': `${progressPct}%` }} />
          </div>
          <div className="v2-hero-caption">
            {lostSoFar > 0 ? `🔥 ${lostSoFar.toFixed(1)} lb lost so far` : '🚀 Starting today — every step counts'}
          </div>
        </div>
        <RingChart value={lostSoFar} max={totalToLose} colorClass="ring-green" size={148} stroke={13}>
          <div className="ring-num-hero">{progressPct.toFixed(0)}%</div>
          <div className="ring-num-sub">of goal</div>
        </RingChart>
      </div>

      {/* ── Stat Tiles ── */}
      <div className="v2-tiles">

        <div className="v2-tile v2-tile--weight" onClick={() => setQuickAdd('weight')}>
          <RingChart value={lostSoFar} max={totalToLose} colorClass="ring-green" size={108} stroke={10}>
            <div className="ring-num-weight">{currentWeight}</div>
            <div className="ring-num-unit">lbs</div>
          </RingChart>
          <div className="v2-tile-name">Weight</div>
          <div className="v2-tile-hint">tap to log</div>
        </div>

        <div className="v2-tile v2-tile--cal" onClick={() => setQuickAdd('food')}>
          <RingChart value={calories} max={calTarget} colorClass="ring-orange" size={108} stroke={10}>
            <div className="ring-num-cal">{calories}</div>
            <div className="ring-num-unit">kcal</div>
          </RingChart>
          <div className="v2-tile-name">Calories</div>
          <div className="v2-tile-hint">of {calTarget}</div>
        </div>

        <div className="v2-tile v2-tile--cannabis" onClick={() => setQuickAdd('cannabis')}>
          <RingChart value={sessions} max={sessionTarget} colorClass={sessionRingClass} size={108} stroke={10}>
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

      {/* ── Food Card ── */}
      <div className="v2-card v2-card--food">
        <div className="v2-card-header">
          <div className="v2-card-header-left">
            <div className="v2-card-icon v2-card-icon--food">🍽️</div>
            <div>
              <div className="v2-card-title">Food & Nutrition</div>
              <div className="v2-card-sub">{foodLogs.length} entries · {calories} kcal · {protein}g protein</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setQuickAdd('food')}>+ Add</button>
        </div>

        {/* Charts row */}
        <div className="v2-food-charts">
          <RingChart value={calories} max={calTarget} colorClass="ring-orange" size={155} stroke={14}>
            <div className="ring-num-food">{calories}</div>
            <div className="ring-num-sub">/ {calTarget}</div>
            <div className="ring-num-sub-sm">kcal</div>
          </RingChart>
          <div className="v2-macro-bars">
            <div className="v2-macros-title">Macros</div>
            <MacroBar label="Protein" value={protein} max={proteinTarget} colorClass="bar-teal" />
            <MacroBar label="Carbs"   value={carbs}   max={carbTarget}    colorClass="bar-yellow" />
            <MacroBar label="Fat"     value={fat}     max={fatTarget}     colorClass="bar-orange" />
          </div>
        </div>

        {/* Meal cards grid */}
        {foodLogs.length === 0 ? (
          <div className="empty-state">No food logged yet today.</div>
        ) : (
          <div className="v2-meals-grid">
            {foodLogs.map((entry) => (
              <div key={entry.id} className="v2-meal-card">
                <div className="v2-meal-icon">{MEAL_ICONS[entry.label] || '🍴'}</div>
                <div className="v2-meal-info">
                  <div className="v2-meal-label">{entry.label}<span className="v2-meal-time"> · {entry.time}</span></div>
                  <div className="v2-meal-name">{entry.name}</div>
                  <div className="v2-meal-macros">
                    <span className="macro-cal">{entry.calories}</span>
                    <span className="text-dimmer">kcal</span>
                    <span className="text-dimmer">·</span>
                    <span className="macro-protein">{entry.protein}g</span>
                    <span className="text-dimmer">P</span>
                    {entry.carbs ? <><span className="text-dimmer">·</span><span className="macro-carbs">{entry.carbs}g</span><span className="text-dimmer">C</span></> : null}
                    {entry.fat   ? <><span className="text-dimmer">·</span><span className="macro-fat">{entry.fat}g</span><span className="text-dimmer">F</span></> : null}
                  </div>
                  {(entry.cannabisTriggered || entry.munchiesRelated || entry.source === 'Template') && (
                    <div className="v2-meal-badges">
                      {entry.cannabisTriggered && <span className="badge badge-cannabis">🌿 triggered</span>}
                      {entry.munchiesRelated    && <span className="badge badge-munchies">🍿 munchies</span>}
                      {entry.source === 'Template' && <span className="badge badge-template">template</span>}
                    </div>
                  )}
                  {entry.notes && <div className="v2-meal-notes">{entry.notes}</div>}
                </div>
                {!demoMode && (
                  <button className="btn-icon btn-icon--delete" onClick={() => deleteFoodLog(entry.id)}>✕</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Bottom Row: Cannabis + Workout ── */}
      <div className="v2-bottom-row">

        {/* Cannabis Card */}
        <div className="v2-card v2-card--cannabis v2-card--flush">
          <div className="v2-card-header">
            <div className="v2-card-header-left">
              <div className="v2-card-icon v2-card-icon--cannabis">🌿</div>
              <div>
                <div className="v2-card-title">Cannabis Control</div>
                <div className="v2-card-sub">{sessions}/{sessionTarget} daily sessions</div>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setQuickAdd('cannabis')}>+ Log</button>
          </div>

          <div className="v2-ring-center">
            <RingChart value={sessions} max={sessionTarget} colorClass={sessionRingClass} size={150} stroke={14}>
              <div className={sessionNumClass + ' ring-num-cannabis'}>{sessions}</div>
              <div className="ring-num-sub">of {sessionTarget}</div>
            </RingChart>
          </div>

          {overLimit && (
            <div className="v2-limit-alert">⚠ Daily limit reached</div>
          )}

          {cannabisLogs.length === 0 ? (
            <div className="empty-state empty-state--compact">No sessions today.</div>
          ) : (
            cannabisLogs.map((log, i) => {
              const product   = inventory.find((p) => p.id === log.productId);
              const riskClass = RISK_CLASS[product?.riskLevel] || 'risk-unknown';
              return (
                <div key={log.id} className="v2-session-card">
                  <div className={`v2-session-num ${riskClass}`}>{i + 1}</div>
                  <div className="v2-session-body">
                    <div className="v2-session-product">{product?.name || 'Unknown product'}</div>
                    <div className="v2-session-detail">{log.time} · {log.amount}{log.unit} · ~{log.thcMg}mg THC · {log.method}</div>
                    <div className="v2-session-reason">{log.reason} · Effect: <span className="text-teal">{log.effect}</span></div>
                    {log.munchiesTriggered && <span className="badge badge-munchies badge-inline">🍿 munchies triggered</span>}
                    {log.notes && <div className="v2-session-notes">{log.notes}</div>}
                  </div>
                  {product && (
                    <div className={`v2-risk-tag ${riskClass}`}>{product.riskLevel}</div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Workout Card */}
        <div className="v2-card v2-card--workout v2-card--flush">
          <div className="v2-card-header">
            <div className="v2-card-header-left">
              <div className="v2-card-icon v2-card-icon--workout">🏃</div>
              <div>
                <div className="v2-card-title">Activity & Steps</div>
                <div className="v2-card-sub">{workoutLog ? workoutLog.type : 'No activity logged'}</div>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setQuickAdd('workout')}>
              {workoutLog ? 'Edit' : '+ Log'}
            </button>
          </div>

          <div className="v2-ring-center">
            <RingChart value={steps} max={stepTarget} colorClass="ring-green" size={150} stroke={14}>
              <div className="ring-num-workout">{steps.toLocaleString()}</div>
              <div className="ring-num-sub">steps</div>
              <div className="ring-num-sub-sm">of {stepTarget.toLocaleString()}</div>
            </RingChart>
          </div>

          {workoutLog ? (
            <>
              <div className="v2-workout-stats">
                <div className="v2-workout-stat">
                  <div className="v2-workout-stat-icon">⏱</div>
                  <div className="v2-workout-stat-val">
                    {workoutLog.walkDuration || 0}<span className="v2-workout-stat-unit"> min</span>
                  </div>
                  <div className="v2-workout-stat-label">Duration</div>
                </div>
                <div className="v2-workout-stat">
                  <div className="v2-workout-stat-icon">⚡</div>
                  <div className={`v2-workout-stat-val intensity-${(workoutLog.intensity || '').replace(' ', '-')}`}>
                    {workoutLog.intensity}
                  </div>
                  <div className="v2-workout-stat-label">Intensity</div>
                </div>
                <div className="v2-workout-stat">
                  <div className="v2-workout-stat-icon">{workoutLog.completed ? '✅' : '🔄'}</div>
                  <div className="v2-workout-stat-val">{workoutLog.completed ? 'Done' : 'Active'}</div>
                  <div className="v2-workout-stat-label">Status</div>
                </div>
              </div>
              {workoutLog.notes && (
                <div className="v2-workout-notes">{workoutLog.notes}</div>
              )}
            </>
          ) : (
            <div className="empty-state empty-state--compact">No activity logged today.</div>
          )}

        </div>

      </div>

      {quickAdd && (
        <QuickAddModal onClose={() => setQuickAdd(null)} defaultType={quickAdd === 'picker' ? null : quickAdd} />
      )}
    </div>
  );
}

