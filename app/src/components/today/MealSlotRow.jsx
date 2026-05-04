/**
 * MealSlotRow.jsx — Single meal slot row in the Food panel.
 *
 * Layout: [36px icon][1fr name+slot+time][110px plate-weight chip][32px check]
 *
 * The plate-weight chip shows "320g of 380g ref · 680 cal".
 * Tapping the chip opens PlateWeightSheet (bottom sheet) to edit plateWeight.
 * No inline numeric calorie entry (decision #9).
 *
 * AC-P1E-E5
 */

/**
 * @param {object} props
 * @param {object} props.slot — MealPlanSlot-like: { slotKey, mealName, slotLabel,
 *   scheduledTime, eaten, plateWeight, refWeight, refCalories }
 * @param {function} props.onToggleEaten — called with slotKey
 * @param {function} props.onEditPlateWeight — called with slotKey (opens bottom sheet)
 * @param {boolean} props.isClosed — read-only if true
 */
export function MealSlotRow({ slot, onToggleEaten, onEditPlateWeight, isClosed = false }) {
  const {
    slotKey,
    mealName,
    slotLabel,
    scheduledTime,
    eaten,
    plateWeight,
    refWeight,
    refCalories,
  } = slot;

  // Derived calories via refCalories × plateWeight/refWeight
  const derivedCal = (refWeight && refCalories && plateWeight)
    ? Math.round(refCalories * plateWeight / refWeight)
    : null;

  const chipText = plateWeight != null
    ? `${plateWeight}g of ${refWeight ?? '?'}g ref${derivedCal != null ? ` · ${derivedCal} cal` : ''}`
    : 'Set weight';

  function handleToggle() {
    if (isClosed) return;
    onToggleEaten?.(slotKey);
  }

  function handleChipClick() {
    if (isClosed) return;
    onEditPlateWeight?.(slotKey);
  }

  return (
    <div
      className={['meal-slot-row', eaten ? 'meal-slot-row--eaten' : ''].filter(Boolean).join(' ')}
      data-testid="meal-slot-row"
      data-slot={slotKey}
    >
      {/* Icon (36px) */}
      <div className="meal-slot-row__icon" aria-hidden="true">
        {slotLabel?.[0] ?? '🍽'}
      </div>

      {/* Name + slot + time (1fr) */}
      <div className="meal-slot-row__info">
        <div className="meal-slot-row__name">{mealName}</div>
        <div className="meal-slot-row__meta">
          {slotLabel} · {scheduledTime}
        </div>
      </div>

      {/* Plate-weight chip (110px) */}
      <button
        type="button"
        className="meal-slot-row__plate-chip"
        data-testid="plate-weight-chip"
        onClick={handleChipClick}
        disabled={isClosed}
        aria-label={`Plate weight: ${chipText}`}
      >
        {chipText}
      </button>

      {/* Check (32px) */}
      <button
        type="button"
        className={['meal-slot-row__check', eaten ? 'meal-slot-row__check--done' : ''].filter(Boolean).join(' ')}
        onClick={handleToggle}
        disabled={isClosed}
        aria-pressed={eaten}
        aria-label={eaten ? 'Mark as not eaten' : 'Mark as eaten'}
      >
        {eaten ? '✓' : '○'}
      </button>
    </div>
  );
}
