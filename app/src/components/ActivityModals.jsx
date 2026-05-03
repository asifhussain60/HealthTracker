import { useState } from 'react';
import { Modal } from './Modal';
import { useStore } from '../data/store';
import { format } from 'date-fns';
import { WORKOUT_TYPES } from '../data/seed';

export function StepsModal({ onClose }) {
  const addWorkoutLog = useStore((s) => s.addWorkoutLog);
  const getTodayWorkoutLog = useStore((s) => s.getTodayWorkoutLog);
  const deleteWorkoutLog = useStore((s) => s.deleteWorkoutLog);
  const existing = getTodayWorkoutLog();

  const [steps, setSteps] = useState(existing?.steps || '');
  const [walkDuration, setWalkDuration] = useState(existing?.walkDuration || '');
  const [notes, setNotes] = useState(existing?.notes || '');

  const handleSubmit = () => {
    if (existing) deleteWorkoutLog(existing.id);
    addWorkoutLog({
      steps: Number(steps) || 0,
      walkDuration: Number(walkDuration) || 0,
      type: existing?.type || '',
      completed: existing?.completed || false,
      intensity: existing?.intensity || '',
      chestPain: existing?.chestPain || false,
      sob: existing?.sob || false,
      notes,
    });
    onClose();
  };

  return (
    <Modal title="Log Steps & Walk" onClose={onClose}>
      <div className="form-group">
        <label className="form-label">Steps Today</label>
        <input className="form-input" type="number" placeholder="0" value={steps} onChange={(e) => setSteps(e.target.value)} />
        <div className="form-hint">Target: 6,000 steps/day</div>
      </div>
      <div className="form-group">
        <label className="form-label">Walk Duration (minutes)</label>
        <input className="form-input" type="number" placeholder="0" value={walkDuration} onChange={(e) => setWalkDuration(e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Notes</label>
        <textarea className="form-textarea" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit}>Save Steps</button>
      </div>
    </Modal>
  );
}

export function WorkoutModal({ onClose }) {
  const addWorkoutLog = useStore((s) => s.addWorkoutLog);
  const getTodayWorkoutLog = useStore((s) => s.getTodayWorkoutLog);
  const deleteWorkoutLog = useStore((s) => s.deleteWorkoutLog);
  const medicalClearance = useStore((s) => s.profile.medicalFlags.medicalClearance);
  const existing = getTodayWorkoutLog();

  const [form, setForm] = useState({
    type: existing?.type || '',
    intensity: existing?.intensity || 'Easy',
    completed: existing?.completed || false,
    chestPain: existing?.chestPain || false,
    sob: existing?.sob || false,
    steps: existing?.steps || '',
    walkDuration: existing?.walkDuration || '',
    notes: existing?.notes || '',
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const isLocked = (type) => !medicalClearance && WORKOUT_TYPES.locked.includes(type);

  const handleSubmit = () => {
    if (!form.type) return;
    if (existing) deleteWorkoutLog(existing.id);
    addWorkoutLog({ ...form, steps: Number(form.steps) || 0, walkDuration: Number(form.walkDuration) || 0 });
    onClose();
  };

  return (
    <Modal title="Log Workout / Activity" onClose={onClose}>
      {!medicalClearance && (
        <div className="medical-warning" style={{ marginBottom: 12 }}>
          ⚠ Chest pain reported. Hard workouts are locked until medical clearance is confirmed in Profile.
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Activity Type</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 11, color: 'var(--text-dimmer)', marginBottom: 2 }}>ALLOWED</div>
          {WORKOUT_TYPES.allowed.map((t) => (
            <label key={t} className="form-checkbox">
              <input type="radio" name="wtype" checked={form.type === t} onChange={() => set('type', t)} />
              {t}
            </label>
          ))}
          <div style={{ fontSize: 11, color: 'var(--text-dimmer)', marginTop: 6, marginBottom: 2 }}>
            LOCKED {medicalClearance ? '(UNLOCKED — clearance confirmed)' : '(pending medical clearance)'}
          </div>
          {WORKOUT_TYPES.locked.map((t) => (
            <label key={t} className="form-checkbox" style={{ opacity: isLocked(t) ? 0.4 : 1 }}>
              <input type="radio" name="wtype" disabled={isLocked(t)} checked={form.type === t} onChange={() => set('type', t)} />
              {t}
              {isLocked(t) && <span className="locked-badge" style={{ marginLeft: 6, fontSize: 10 }}>🔒 Locked</span>}
            </label>
          ))}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Intensity</label>
          <select className="form-select" value={form.intensity} onChange={(e) => set('intensity', e.target.value)}>
            {['Easy', 'Moderate', 'Hard'].map((i) => <option key={i}>{i}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Walk Duration (min)</label>
          <input className="form-input" type="number" placeholder="0" value={form.walkDuration} onChange={(e) => set('walkDuration', e.target.value)} />
        </div>
      </div>

      <div className="form-group" style={{ display: 'flex', gap: 16 }}>
        <label className="form-checkbox">
          <input type="checkbox" checked={form.completed} onChange={(e) => set('completed', e.target.checked)} />
          Completed
        </label>
        <label className="form-checkbox">
          <input type="checkbox" checked={form.chestPain} onChange={(e) => set('chestPain', e.target.checked)} />
          Chest pain?
        </label>
        <label className="form-checkbox">
          <input type="checkbox" checked={form.sob} onChange={(e) => set('sob', e.target.checked)} />
          Shortness of breath?
        </label>
      </div>

      <div className="form-group">
        <label className="form-label">Notes</label>
        <textarea className="form-textarea" rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
      </div>

      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={!form.type}>Log Activity</button>
      </div>
    </Modal>
  );
}
