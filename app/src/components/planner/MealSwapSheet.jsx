/**
 * MealSwapSheet.jsx — Bottom sheet for swapping a meal in a slot.
 *
 * Lists same-category meals from the library, ranked by favoriteStars.
 *
 * Props:
 *   open      {boolean}   - Whether the sheet is open.
 *   onClose   {Function}  - Close handler.
 *   category  {string}    - Category to filter by.
 *   meals     {Object[]}  - Full meal library.
 *   onSelect  {Function}  - Called with selected mealInventoryId.
 *
 * AC-P1D-D17
 */
import { BottomSheet } from '../primitives/BottomSheet.jsx';

/**
 * @param {Object} props
 */
export function MealSwapSheet({ open, onClose, category, meals, onSelect }) {
  const sameCategoryMeals = (meals ?? [])
    .filter((m) => m.category === category && m.isActive !== false && m.deletedAt == null)
    .slice()
    .sort((a, b) => (b.favoriteStars ?? 0) - (a.favoriteStars ?? 0));

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div data-testid="meal-swap-sheet" data-category={category}>
        <h3>Swap {category}</h3>
        <ul className="meal-swap-sheet__list">
          {sameCategoryMeals.map((m) => (
            <li
              key={m.id}
              className="meal-swap-sheet__item"
              data-category={m.category}
              data-meal-id={m.id}
            >
              <button
                type="button"
                onClick={() => { onSelect(m.id); onClose(); }}
                aria-label={`Select ${m.name}`}
              >
                {m.name}
                {m.favoriteStars > 0 && (
                  <span className="meal-swap-sheet__stars" aria-hidden="true">
                    {'★'.repeat(m.favoriteStars)}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </BottomSheet>
  );
}
