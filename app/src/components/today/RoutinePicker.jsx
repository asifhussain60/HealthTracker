/**
 * RoutinePicker.jsx — Dropdown/list to pick a workout routine.
 *
 * Renders a list of available routines; calls onSelect(routineId) on selection.
 * AC-P1E-E3
 */

/**
 * @param {object} props
 * @param {Array<{id: string, name: string}>} props.routines
 * @param {function} props.onSelect — called with routineId
 */
export function RoutinePicker({ routines = [], onSelect }) {
  return (
    <div className="routine-picker" data-testid="routine-picker">
      {routines.map((r) => (
        <button
          key={r.id}
          type="button"
          className="routine-picker__item"
          onClick={() => onSelect?.(r.id)}
        >
          {r.name}
        </button>
      ))}
    </div>
  );
}
