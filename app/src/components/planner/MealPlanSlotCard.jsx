/**
 * MealPlanSlotCard.jsx — Single meal slot card in the 7×4 planner grid.
 *
 * Props:
 *   slot      {Object}  - MealPlanSlot { mealInventoryId, eaten, eatenAt, plateWeight, notes }
 *   category  {string}  - 'breakfast' | 'lunch' | 'dinner' | 'snack'
 *   meal      {Object|null} - MealInventoryItem for the selected meal
 *   onClick   {Function} - Called when card is tapped (opens swap sheet)
 *
 * AC-P1D-D17
 */

/**
 * @param {Object} props
 * @param {Object} props.slot
 * @param {string} props.category
 * @param {Object|null} props.meal
 * @param {Function} [props.onClick]
 */
export function MealPlanSlotCard({ slot, category, meal, onClick }) {
  const hasEaten = slot?.eaten === true;

  return (
    <div
      className={`meal-plan-slot-card meal-plan-slot-card--${category}${hasEaten ? ' meal-plan-slot-card--eaten' : ''}`}
      data-testid="meal-plan-slot-card"
      data-category={category}
      data-meal-id={slot?.mealInventoryId ?? ''}
      onClick={hasEaten ? undefined : onClick}
      role={hasEaten ? undefined : 'button'}
      tabIndex={hasEaten ? undefined : 0}
      aria-label={meal ? `${category}: ${meal.name}` : `${category}: empty`}
    >
      {meal ? (
        <>
          <span className="meal-plan-slot-card__name">{meal.name}</span>
          {meal.refCalories && (
            <span className="meal-plan-slot-card__cal">{meal.refCalories} cal</span>
          )}
          {hasEaten && (
            <span className="meal-plan-slot-card__eaten-badge">Eaten</span>
          )}
        </>
      ) : (
        <span className="meal-plan-slot-card__empty">+ Add {category}</span>
      )}
    </div>
  );
}
