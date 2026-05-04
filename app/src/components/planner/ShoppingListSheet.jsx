/**
 * ShoppingListSheet.jsx — Bottom sheet aggregating ingredients for the week.
 *
 * Props:
 *   open    {boolean}  - Whether the sheet is open.
 *   onClose {Function} - Close handler.
 *   plan    {Object}   - WeeklyPlan.
 *   meals   {Object[]} - Full meal library (for ingredient lookup).
 *
 * AC-P1D-D17
 */
import { BottomSheet } from '../primitives/BottomSheet.jsx';

/**
 * @param {Object} props
 */
export function ShoppingListSheet({ open, onClose, plan, meals }) {
  // Aggregate ingredients across all 7×4 slots
  const ingredients = [];
  const CATEGORIES = ['breakfast', 'lunch', 'dinner', 'snack'];

  if (plan?.days) {
    for (const day of Object.values(plan.days)) {
      for (const cat of CATEGORIES) {
        const slot = day.meals?.[cat];
        if (slot?.mealInventoryId) {
          const meal = meals?.find((m) => m.id === slot.mealInventoryId);
          if (meal?.ingredients) {
            ingredients.push({ mealName: meal.name, ingredient: meal.ingredients });
          }
        }
      }
      // Shakes
      for (const shake of day.meals?.shakes ?? []) {
        if (shake?.mealInventoryId) {
          const meal = meals?.find((m) => m.id === shake.mealInventoryId);
          if (meal?.ingredients) {
            ingredients.push({ mealName: meal.name, ingredient: meal.ingredients });
          }
        }
      }
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div data-testid="shopping-list-sheet">
        <h3>Shopping List</h3>
        {ingredients.length === 0 ? (
          <p>No ingredients to show. Generate a plan first.</p>
        ) : (
          <ul className="shopping-list-sheet__list">
            {ingredients.map(({ mealName, ingredient }, idx) => (
              <li key={idx} className="shopping-list-sheet__item">
                <strong>{mealName}:</strong> {ingredient}
              </li>
            ))}
          </ul>
        )}
      </div>
    </BottomSheet>
  );
}
