/**
 * FoodPanel.jsx — Today's food + intermittent fasting panel.
 *
 * - FastingBanner state machine
 * - MealSlotRow for each slot in mealPlan.days[today]
 * - Calorie aggregator: refCalories × plateWeight/refWeight for eaten slots
 * - Empty state → "Plan my week" CTA links to /plan
 * - PlateWeightSheet bottom sheet for editing plateWeight
 *
 * NO manual calorie entry. Calories are always derived from plate weight.
 * Reads mealPlanSlice.days[date] via planDay prop.
 *
 * AC-P1E-E5
 */
import { useState, useEffect } from 'react';
import { FastingBanner } from './FastingBanner.jsx';
import { MealSlotRow } from './MealSlotRow.jsx';
import { PlateWeightSheet } from './PlateWeightSheet.jsx';

/**
 * Compute total eaten calories from the planDay slots.
 * Uses refCalories × plateWeight/refWeight (decision #9 simplified formula).
 *
 * @param {Object|null} planDay — { [slotKey]: slot }
 * @param {Object} plateDefaults — profile.plateDefaults (unused in simplified formula)
 * @returns {number}
 */
function computeEatenCalories(planDay, _plateDefaults) {
  if (!planDay) return 0;
  let total = 0;
  for (const slot of Object.values(planDay)) {
    if (!slot?.eaten) continue;
    if (slot.refCalories == null || slot.refWeight == null || slot.plateWeight == null) continue;
    if (slot.refWeight <= 0) continue;
    total += slot.refCalories * slot.plateWeight / slot.refWeight;
  }
  return Math.round(total);
}

/**
 * @param {object} props
 * @param {Object|null} props.planDay — day's slots from mealPlanSlice.days[date]
 * @param {{ state: string, minutesUntilOpen?: number, minutesSinceClose?: number }} props.fastingState
 * @param {object} props.fastingProtocol — profile.fastingProtocol
 * @param {boolean} props.isClosed — read-only if day is closed
 * @param {function} props.onToggleEaten — (slotKey) → void
 * @param {function} props.onEditPlateWeight — (slotKey, newWeight) → void
 * @param {function} props.onCaloriesUpdate — (eatenCalories: number) → void
 * @param {object} props.plateDefaults — profile.plateDefaults
 */
export function FoodPanel({
  planDay,
  fastingState,
  fastingProtocol,
  isClosed = false,
  onToggleEaten,
  onEditPlateWeight,
  onCaloriesUpdate,
  plateDefaults = {},
}) {
  const [sheetSlotKey, setSheetSlotKey] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Compute and report eaten calories whenever planDay changes
  const eatenCal = computeEatenCalories(planDay, plateDefaults);

  useEffect(() => {
    onCaloriesUpdate?.(eatenCal);
  }, [eatenCal]); // eslint-disable-line react-hooks/exhaustive-deps

  // Empty state — no plan for today
  if (!planDay) {
    return (
      <div className="food-panel food-panel--empty" data-testid="food-panel">
        <div className="food-panel__empty" data-testid="food-empty-state">
          <p>No meal plan for today.</p>
          <a href="/plan" className="food-panel__cta">
            Plan my week
          </a>
        </div>
      </div>
    );
  }

  const slots = Object.values(planDay).filter(Boolean);

  function handleEditPlateWeight(slotKey) {
    if (isClosed) return;
    setSheetSlotKey(slotKey);
    setSheetOpen(true);
  }

  function handleSavePlateWeight(slotKey, newWeight) {
    onEditPlateWeight?.(slotKey, newWeight);
    setSheetOpen(false);
    setSheetSlotKey(null);
  }

  const activeSlot = sheetSlotKey ? planDay[sheetSlotKey] : null;

  return (
    <div className="food-panel" data-testid="food-panel">
      {/* FASTING banner */}
      <FastingBanner fastingState={fastingState} protocol={fastingProtocol} />

      {/* Meal slot rows */}
      <div className="food-panel__slots">
        {slots.map((slot) => (
          <MealSlotRow
            key={slot.slotKey}
            slot={slot}
            onToggleEaten={onToggleEaten}
            onEditPlateWeight={handleEditPlateWeight}
            isClosed={isClosed}
          />
        ))}
      </div>

      {/* PlateWeight edit sheet */}
      {activeSlot && (
        <PlateWeightSheet
          open={sheetOpen}
          slotKey={sheetSlotKey}
          currentPlateWeight={activeSlot.plateWeight}
          refWeight={activeSlot.refWeight}
          onSave={handleSavePlateWeight}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </div>
  );
}
