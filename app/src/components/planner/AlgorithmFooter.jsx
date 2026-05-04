/**
 * AlgorithmFooter.jsx — Algorithm-transparency footer for PlannerView.
 *
 * Displays the algorithm config so users understand how the plan was generated.
 *
 * Props:
 *   algorithmConfig {Object} - WeeklyPlan.algorithmConfig
 *
 * AC-P1D-D17
 */

/**
 * @param {Object} props
 * @param {Object} props.algorithmConfig
 */
export function AlgorithmFooter({ algorithmConfig }) {
  if (!algorithmConfig) return null;

  const { meal, workout } = algorithmConfig;

  return (
    <footer className="planner-algorithm-footer" data-testid="algorithm-footer">
      <h4>How your plan was built</h4>
      <ul>
        {meal && (
          <>
            <li>Favorite weight: {meal.favoriteWeight}×</li>
            <li>No repeat within: {meal.repeatGapDays} days</li>
            <li>Category constraint: {meal.categoryConstraint ? 'on' : 'off'}</li>
          </>
        )}
        {workout && (
          <>
            <li>Weights per week: {workout.weightsPerWeek}</li>
            <li>Walk daily: {workout.walkDailyMinutes} min</li>
          </>
        )}
      </ul>
    </footer>
  );
}
