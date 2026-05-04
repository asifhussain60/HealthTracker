/**
 * WorkoutCard.jsx — Activity & Steps card.
 *
 * AC-P0-C2
 * Extracted from TodayView.jsx. Consumes props — no store reads.
 * All colours via CSS variables.
 *
 * @param {object}      props
 * @param {number}      props.steps
 * @param {number}      props.stepTarget
 * @param {Object|null} props.workoutLog
 * @param {Function}    props.onLog
 */
import { RingChart } from '../primitives/RingChart';

export function WorkoutCard({ steps, stepTarget, workoutLog, onLog }) {
  return (
    <div className="v2-card v2-card--workout v2-card--flush">
      <div className="v2-card-header">
        <div className="v2-card-header-left">
          <div className="v2-card-icon v2-card-icon--workout">🏃</div>
          <div>
            <div className="v2-card-title">Activity & Steps</div>
            <div className="v2-card-sub">{workoutLog ? workoutLog.type : 'No activity logged'}</div>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onLog}>
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
  );
}
