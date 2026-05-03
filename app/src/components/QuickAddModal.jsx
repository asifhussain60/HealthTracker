import { useState } from 'react';
import { Modal } from './Modal';
import { FoodEntryModal } from './FoodEntryModal';
import { CannabisSessionModal } from './CannabisSessionModal';
import { StepsModal, WorkoutModal } from './ActivityModals';
import { WeightModal } from './WeightModal';

const OPTIONS = [
  { key: 'food', label: 'Food / Meal', icon: '🍽' },
  { key: 'cannabis', label: 'Cannabis Session', icon: '🌿' },
  { key: 'steps', label: 'Steps / Walk', icon: '👟' },
  { key: 'weight', label: 'Weight', icon: '⚖️' },
  { key: 'workout', label: 'Workout', icon: '🏃' },
];

export function QuickAddModal({ onClose, defaultType = null }) {
  const [selected, setSelected] = useState(defaultType);

  if (selected === 'food') return <FoodEntryModal onClose={onClose} />;
  if (selected === 'cannabis') return <CannabisSessionModal onClose={onClose} />;
  if (selected === 'steps') return <StepsModal onClose={onClose} />;
  if (selected === 'weight') return <WeightModal onClose={onClose} />;
  if (selected === 'workout') return <WorkoutModal onClose={onClose} />;

  return (
    <Modal title="Quick Add" onClose={onClose}>
      <div className="quick-add-grid">
        {OPTIONS.map((o) => (
          <div key={o.key} className="quick-add-option" onClick={() => setSelected(o.key)}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{o.icon}</div>
            <span>{o.label}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}
