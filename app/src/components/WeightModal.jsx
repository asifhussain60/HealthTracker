import { useState } from 'react';
import { Modal } from './Modal';
import { useStore } from '../data/store';
import { format } from 'date-fns';

export function WeightModal({ onClose }) {
  const addWeightEntry = useStore((s) => s.addWeightEntry);
  const currentWeight = useStore((s) => s.profile.currentWeight);
  const [weight, setWeight] = useState(currentWeight || '');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleSubmit = () => {
    if (!weight) return;
    addWeightEntry(Number(weight), date);
    onClose();
  };

  return (
    <Modal title="Log Weight" onClose={onClose}>
      <div className="form-group">
        <label className="form-label">Weight (lbs)</label>
        <input
          className="form-input"
          type="number"
          step="0.1"
          placeholder="241.8"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          autoFocus
        />
      </div>
      <div className="form-group">
        <label className="form-label">Date</label>
        <input className="form-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={!weight}>Save Weight</button>
      </div>
    </Modal>
  );
}
