import { useState } from 'react';
import { useStore } from '../data/store';
import { DEMO_FOOD_LOGS, DEMO_CANNABIS_LOGS, DEMO_WORKOUT_LOG } from '../data/seed';
import { QuickAddModal } from '../components/QuickAddModal';
import { format } from 'date-fns';

// ── SVG Ring / Donut Chart ─────────────────────────────────────
function RingChart({ value, max, color = 'var(--teal)', size = 90, stroke = 9, children }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, max > 0 ? value / max : 0);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface3)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 1 }}>
        {children}
      </div>
    </div>
  );
}

// ── Horizontal Macro Bar ───────────────────────────────────────
function MacroBar({ label, value, max, color }) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 11, marginBottom: 4 }}>
        <span style={{ color: 'var(--text-dim)', fontWeight: 500 }}>{label}</span>
        <span style={{ color, fontWeight: 700 }}>{value}g <span style={{ color: 'var(--text-dimmer)', fontWeight: 400, fontSize: 15 }}>/ {max}g</span></span>
      </div>
      <div style={{ height: 6, background: 'var(--surface3)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
}

const MEAL_ICONS = { Breakfast: '🌅', Lunch: '☀️', Dinner: '🌙', Snack: '🍎', Munchies: '🍿' };

const INTENSITY_COLOR = { light: 'var(--green)', moderate: 'var(--yellow)', hard: 'var(--orange)', 'very hard': 'var(--red)' };

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

  const sessionColor = sessions >= sessionTarget ? 'var(--red)' : 'var(--teal)';

  return (
    <div className="view-container">

      {/* ── Hero: Weight Journey ── */}
      <div className="v2-hero">
        <div className="v2-hero-left">
          <div className="v2-hero-eyebrow">Weight Journey</div>
          <div className="v2-hero-weight">{currentWeight} <span>lb</span></div>
          <div className="v2-hero-goal">
            Goal <strong>{goalWeight} lb</strong> · <span style={{ color: 'var(--teal)' }}>{(currentWeight - goalWeight).toFixed(1)} lb to go</span>
          </div>
          <div className="v2-progress-track">
            <div className="v2-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="v2-hero-caption">
            {lostSoFar > 0 ? `🔥 ${lostSoFar.toFixed(1)} lb lost so far` : '🚀 Starting today — every step counts'}
          </div>
        </div>
        <RingChart value={lostSoFar} max={totalToLose} color="var(--green)" size={148} stroke={13}>
          <div style={{ fontSize: 44, fontWeight: 900, color: 'var(--green)', lineHeight: 1 }}>{progressPct.toFixed(0)}%</div>
          <div style={{ fontSize: 16, color: 'var(--text-dimmer)' }}>of goal</div>
        </RingChart>
      </div>

      {/* ── Stat Tiles ── */}
      <div className="v2-tiles">

        <div className="v2-tile" onClick={() => setQuickAdd('weight')}>
          <RingChart value={lostSoFar} max={totalToLose} color="var(--green)" size={96} stroke={9}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{currentWeight}</div>
            <div style={{ fontSize: 14, color: 'var(--text-dimmer)' }}>lbs</div>
          </RingChart>
          <div className="v2-tile-name">Weight</div>
          <div className="v2-tile-hint">tap to log</div>
        </div>

        <div className="v2-tile" onClick={() => setQuickAdd('food')}>
          <RingChart value={calories} max={calTarget} color="var(--orange)" size={96} stroke={9}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--orange)', lineHeight: 1 }}>{calories}</div>
            <div style={{ fontSize: 14, color: 'var(--text-dimmer)' }}>kcal</div>
          </RingChart>
          <div className="v2-tile-name">Calories</div>
          <div className="v2-tile-hint">of {calTarget}</div>
        </div>

        <div className="v2-tile" onClick={() => setQuickAdd('cannabis')}>
          <RingChart value={sessions} max={sessionTarget} color={sessionColor} size={96} stroke={9}>
            <div style={{ fontSize: 28, fontWeight: 900, color: sessionColor, lineHeight: 1 }}>{sessions}</div>
            <div style={{ fontSize: 14, color: 'var(--text-dimmer)' }}>/ {sessionTarget}</div>
          </RingChart>
          <div className="v2-tile-name">Cannabis</div>
          <div className="v2-tile-hint">sessions</div>
        </div>

        <div className="v2-tile" onClick={() => setQuickAdd('steps')}>
          <RingChart value={steps} max={stepTarget} color="var(--teal)" size={96} stroke={9}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--teal)', lineHeight: 1 }}>{steps.toLocaleString()}</div>
            <div style={{ fontSize: 14, color: 'var(--text-dimmer)' }}>steps</div>
          </RingChart>
          <div className="v2-tile-name">Steps</div>
          <div className="v2-tile-hint">of {stepTarget.toLocaleString()}</div>
        </div>

      </div>

      {/* ── Food Card ── */}
      <div className="v2-card">
        <div className="v2-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="v2-card-icon" style={{ background: 'rgba(249,115,22,0.14)' }}>🍽️</div>
            <div>
              <div className="v2-card-title">Food & Nutrition</div>
              <div className="v2-card-sub">{foodLogs.length} entries · {calories} kcal · {protein}g protein</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setQuickAdd('food')}>+ Add</button>
        </div>

        {/* Charts row */}
        <div className="v2-food-charts">
          <RingChart value={calories} max={calTarget} color="var(--orange)" size={155} stroke={14}>
            <div style={{ fontSize: 38, fontWeight: 900, color: 'var(--orange)', lineHeight: 1 }}>{calories}</div>
            <div style={{ fontSize: 16, color: 'var(--text-dimmer)' }}>/ {calTarget}</div>
            <div style={{ fontSize: 14, color: 'var(--text-dimmer)' }}>kcal</div>
          </RingChart>
          <div className="v2-macro-bars">
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-dimmer)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Macros</div>
            <MacroBar label="Protein" value={protein} max={proteinTarget} color="var(--teal)" />
            <MacroBar label="Carbs"   value={carbs}   max={carbTarget}    color="var(--yellow)" />
            <MacroBar label="Fat"     value={fat}     max={fatTarget}     color="var(--orange)" />
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
                    <span style={{ color: 'var(--orange)', fontWeight: 600 }}>{entry.calories}</span>
                    <span style={{ color: 'var(--text-dimmer)' }}>kcal</span>
                    <span style={{ color: 'var(--text-dimmer)' }}>·</span>
                    <span style={{ color: 'var(--teal)', fontWeight: 600 }}>{entry.protein}g</span>
                    <span style={{ color: 'var(--text-dimmer)' }}>P</span>
                    {entry.carbs ? <><span style={{ color: 'var(--text-dimmer)' }}>·</span><span style={{ color: 'var(--yellow)', fontWeight: 600 }}>{entry.carbs}g</span><span style={{ color: 'var(--text-dimmer)' }}>C</span></> : null}
                    {entry.fat   ? <><span style={{ color: 'var(--text-dimmer)' }}>·</span><span style={{ color: 'var(--text-dim)',   fontWeight: 600 }}>{entry.fat}g</span>  <span style={{ color: 'var(--text-dimmer)' }}>F</span></> : null}
                  </div>
                  {(entry.cannabisTriggered || entry.munchiesRelated || entry.source === 'Template') && (
                    <div className="v2-meal-badges">
                      {entry.cannabisTriggered && <span className="badge badge-cannabis">🌿 triggered</span>}
                      {entry.munchiesRelated    && <span className="badge badge-munchies">🍿 munchies</span>}
                      {entry.source === 'Template' && <span className="badge" style={{ background: 'var(--teal-bg)', color: 'var(--teal)' }}>template</span>}
                    </div>
                  )}
                  {entry.notes && <div style={{ fontSize: 15, color: 'var(--text-dimmer)', marginTop: 3 }}>{entry.notes}</div>}
                </div>
                {!demoMode && (
                  <button className="btn-icon" style={{ color: 'var(--red)', opacity: 0.5, alignSelf: 'flex-start' }} onClick={() => deleteFoodLog(entry.id)}>✕</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Bottom Row: Cannabis + Workout ── */}
      <div className="v2-bottom-row">

        {/* Cannabis Card */}
        <div className="v2-card" style={{ marginBottom: 0 }}>
          <div className="v2-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="v2-card-icon" style={{ background: 'rgba(20,184,166,0.14)' }}>🌿</div>
              <div>
                <div className="v2-card-title">Cannabis Control</div>
                <div className="v2-card-sub">{sessions}/{sessionTarget} daily sessions</div>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setQuickAdd('cannabis')}>+ Log</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <RingChart value={sessions} max={sessionTarget} color={sessionColor} size={150} stroke={14}>
              <div style={{ fontSize: 56, fontWeight: 900, color: sessionColor, lineHeight: 1 }}>{sessions}</div>
              <div style={{ fontSize: 18, color: 'var(--text-dimmer)' }}>of {sessionTarget}</div>
            </RingChart>
          </div>

          {sessions >= sessionTarget && (
            <div style={{ margin: '0 0 12px', padding: '8px 16px', background: 'var(--red-bg)', color: 'var(--red)', borderRadius: 20, fontSize: 18, fontWeight: 600, textAlign: 'center' }}>
              ⚠ Daily limit reached
            </div>
          )}

          {cannabisLogs.length === 0 ? (
            <div className="empty-state" style={{ padding: '8px 0' }}>No sessions today.</div>
          ) : (
            cannabisLogs.map((log, i) => {
              const product = inventory.find((p) => p.id === log.productId);
              const rc = { high: 'var(--red)', medium: 'var(--yellow)', low: 'var(--green)' }[product?.riskLevel] || 'var(--text-dim)';
              return (
                <div key={log.id} className="v2-session-card">
                  <div className="v2-session-num" style={{ background: `${rc}22`, color: rc }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 18 }}>{product?.name || 'Unknown product'}</div>
                    <div style={{ fontSize: 16, color: 'var(--text-dimmer)', marginTop: 2 }}>
                      {log.time} · {log.amount}{log.unit} · ~{log.thcMg}mg THC · {log.method}
                    </div>
                    <div style={{ fontSize: 16, color: 'var(--text-dim)', marginTop: 1 }}>
                      {log.reason} · Effect: <span style={{ color: 'var(--teal)' }}>{log.effect}</span>
                    </div>
                    {log.munchiesTriggered && <span className="badge badge-munchies" style={{ marginTop: 5, display: 'inline-block' }}>🍿 munchies triggered</span>}
                    {log.notes && <div style={{ fontSize: 15, color: 'var(--text-dimmer)', marginTop: 4 }}>{log.notes}</div>}
                  </div>
                  {product && (
                    <div style={{ fontSize: 15, padding: '3px 10px', borderRadius: 20, background: `${rc}22`, color: rc, fontWeight: 700, flexShrink: 0 }}>
                      {product.riskLevel}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Workout Card */}
        <div className="v2-card" style={{ marginBottom: 0 }}>
          <div className="v2-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="v2-card-icon" style={{ background: 'rgba(34,197,94,0.14)' }}>🏃</div>
              <div>
                <div className="v2-card-title">Activity & Steps</div>
                <div className="v2-card-sub">{workoutLog ? workoutLog.type : 'No activity logged'}</div>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setQuickAdd('workout')}>
              {workoutLog ? 'Edit' : '+ Log'}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <RingChart value={steps} max={stepTarget} color="var(--green)" size={150} stroke={14}>
              <div style={{ fontSize: 34, fontWeight: 900, color: 'var(--green)', lineHeight: 1 }}>{steps.toLocaleString()}</div>
              <div style={{ fontSize: 16, color: 'var(--text-dimmer)', marginTop: 2 }}>steps</div>
              <div style={{ fontSize: 14, color: 'var(--text-dimmer)' }}>of {stepTarget.toLocaleString()}</div>
            </RingChart>
          </div>

          {workoutLog ? (
            <>
              <div className="v2-workout-stats">
                <div className="v2-workout-stat">
                  <div className="v2-workout-stat-icon">⏱</div>
                  <div className="v2-workout-stat-val">{workoutLog.walkDuration || 0}<span style={{ fontSize: 16, fontWeight: 400 }}> min</span></div>
                  <div className="v2-workout-stat-label">Duration</div>
                </div>
                <div className="v2-workout-stat">
                  <div className="v2-workout-stat-icon">⚡</div>
                  <div className="v2-workout-stat-val" style={{ color: INTENSITY_COLOR[workoutLog.intensity] || 'var(--text)', textTransform: 'capitalize' }}>{workoutLog.intensity}</div>
                  <div className="v2-workout-stat-label">Intensity</div>
                </div>
                <div className="v2-workout-stat">
                  <div className="v2-workout-stat-icon">{workoutLog.completed ? '✅' : '🔄'}</div>
                  <div className="v2-workout-stat-val">{workoutLog.completed ? 'Done' : 'Active'}</div>
                  <div className="v2-workout-stat-label">Status</div>
                </div>
              </div>
              {workoutLog.notes && (
                <div style={{ marginTop: 12, fontSize: 18, color: 'var(--text-dimmer)', background: 'var(--surface2)', borderRadius: 8, padding: '10px 14px' }}>
                  {workoutLog.notes}
                </div>
              )}
            </>
          ) : (
            <div className="empty-state" style={{ padding: '8px 0' }}>No activity logged today.</div>
          )}


        </div>

      </div>

      {quickAdd && (
        <QuickAddModal onClose={() => setQuickAdd(null)} defaultType={quickAdd === 'picker' ? null : quickAdd} />
      )}
    </div>
  );
}

