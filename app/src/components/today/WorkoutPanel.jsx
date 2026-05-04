/**
 * WorkoutPanel.jsx — Today's workout panel.
 *
 * Walk / Kickboxing / Weights filter chips
 * Weights routine picker (from routines prop)
 * Session tiles (≤2 sessions/day) with − remove
 * Capacity badge ("0 of 2 today")
 * Cap-reached lockout when daily cap is reached
 * Closed day → all writes disabled
 *
 * AC-P1E-E3
 */
import { useState } from 'react';
import { SessionTile } from './SessionTile.jsx';
import { RoutinePicker } from './RoutinePicker.jsx';

const ACTIVITY_TYPES = ['Walk', 'Kickboxing', 'Weights'];

/**
 * @param {object} props
 * @param {Array}    props.weightSessions — WeightSession[] for today
 * @param {Array}    props.workoutLogs    — WorkoutLog[] for today (walk/kickboxing)
 * @param {Array}    props.routines       — WorkoutRoutine[] available
 * @param {number}   props.dailyCap       — max weight sessions/day (default 2)
 * @param {boolean}  props.isClosed       — read-only if true
 * @param {function} props.onAddWeightSession — called with routineId
 * @param {function} props.onRemoveWeightSession — called with sessionId
 * @param {function} props.onAddWalk
 * @param {function} props.onAddKickboxing
 * @param {string}   props.date           — YYYY-MM-DD
 */
export function WorkoutPanel({
  weightSessions = [],
  workoutLogs = [],
  routines = [],
  dailyCap = 2,
  isClosed = false,
  onAddWeightSession,
  onRemoveWeightSession,
  onAddWalk,
  onAddKickboxing,
  date,
}) {
  const [activeFilter, setActiveFilter] = useState(null);
  const [showRoutinePicker, setShowRoutinePicker] = useState(false);

  const todayWeightSessions = weightSessions.filter((s) => s.date === date);
  const atCap = todayWeightSessions.length >= dailyCap;

  function handleFilterClick(type) {
    if (isClosed) return;
    setActiveFilter((prev) => (prev === type ? null : type));
    if (type === 'Weights' && !atCap) {
      setShowRoutinePicker((prev) => !prev);
    }
    if (type === 'Walk') onAddWalk?.();
    if (type === 'Kickboxing') onAddKickboxing?.();
  }

  function handleRoutineSelect(routineId) {
    const routine = routines.find((r) => r.id === routineId);
    onAddWeightSession?.(routineId, routine?.name);
    setShowRoutinePicker(false);
  }

  function handleRemoveSession(sessionId) {
    if (isClosed) return;
    onRemoveWeightSession?.(sessionId);
  }

  return (
    <div className="workout-panel" data-testid="workout-panel">
      {/* Filter chips */}
      <div className="workout-panel__filters">
        {ACTIVITY_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            className={[
              'workout-panel__chip',
              activeFilter === type ? 'workout-panel__chip--active' : '',
            ].filter(Boolean).join(' ')}
            data-add-action="true"
            onClick={() => handleFilterClick(type)}
            disabled={isClosed}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Weights capacity badge */}
      <div className="workout-panel__capacity" data-testid="weights-capacity">
        {todayWeightSessions.length} of {dailyCap} today
      </div>

      {/* Cap-reached lockout */}
      {atCap && (
        <div className="workout-panel__cap-notice" data-testid="cap-notice">
          Daily weight session cap reached
        </div>
      )}

      {/* Add button (not shown when at cap or closed) */}
      {!atCap && !isClosed && (
        <button
          type="button"
          className="workout-panel__add"
          data-testid="add-weight-session"
          data-add-action="true"
          disabled={false}
          onClick={() => setShowRoutinePicker((p) => !p)}
        >
          + Weights
        </button>
      )}

      {/* Routine picker */}
      {showRoutinePicker && !isClosed && (
        <RoutinePicker routines={routines} onSelect={handleRoutineSelect} />
      )}

      {/* Session tiles */}
      <div className="workout-panel__sessions">
        {todayWeightSessions.map((session) => (
          <SessionTile
            key={session.id}
            name={session.routineName ?? session.routineId}
            status={session.completed ? 'completed' : 'planned'}
            isClosed={isClosed}
            onRemove={() => handleRemoveSession(session.id)}
          />
        ))}
      </div>

      {/* Strength Gains placeholder (decision 7g2 — points at MyNetDiary) */}
      <div className="workout-panel__strength-gains-placeholder" data-testid="strength-gains-placeholder">
        Strength Gains — see MyNetDiary
      </div>
    </div>
  );
}
