/**
 * PlateWeightSheet.jsx — Bottom sheet to edit plateWeight for a meal slot.
 *
 * Triggered by tapping the plate-weight chip in MealSlotRow.
 * Saves via onSave(slotKey, newPlateWeight).
 *
 * AC-P1E-E5
 */
import { useState } from 'react';
import { BottomSheet } from '../primitives/BottomSheet.jsx';

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {string}  props.slotKey
 * @param {number|null} props.currentPlateWeight
 * @param {number|null} props.refWeight
 * @param {function}    props.onSave — called with (slotKey, newWeight)
 * @param {function}    props.onClose
 */
export function PlateWeightSheet({ open, slotKey, currentPlateWeight, refWeight, onSave, onClose }) {
  const [value, setValue] = useState(currentPlateWeight ?? refWeight ?? 0);

  function handleSave() {
    const parsed = Number(value);
    if (isNaN(parsed) || parsed < 0) return;
    onSave?.(slotKey, parsed);
    onClose?.();
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Edit plate weight">
      <div className="plate-weight-sheet" data-testid="plate-weight-sheet">
        <label className="plate-weight-sheet__label" htmlFor="plate-weight-input">
          Plate weight (grams)
          {refWeight && (
            <span className="plate-weight-sheet__ref"> (ref: {refWeight}g)</span>
          )}
        </label>
        <input
          id="plate-weight-input"
          type="number"
          min="0"
          step="10"
          className="plate-weight-sheet__input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          data-testid="plate-weight-input"
        />
        <div className="plate-weight-sheet__actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="button" onClick={handleSave}>Save</button>
        </div>
      </div>
    </BottomSheet>
  );
}
