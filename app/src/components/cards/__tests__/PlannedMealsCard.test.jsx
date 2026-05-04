/**
 * PlannedMealsCard.test.jsx — AC-P0-C3
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PlannedMealsCard } from '../PlannedMealsCard';

describe('PlannedMealsCard', () => {
  it('renders without crashing (smoke)', () => {
    const { container } = render(<PlannedMealsCard />);
    expect(container.firstChild).toBeTruthy();
  });

  it('shows Meals heading', () => {
    render(<PlannedMealsCard />);
    expect(screen.getAllByText(/meal/i).length).toBeGreaterThan(0);
  });

  it('shows empty state when no meal inventory', () => {
    render(<PlannedMealsCard mealInventory={[]} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows Phase 1 coming soon text', () => {
    render(<PlannedMealsCard />);
    expect(screen.getByText(/phase 1/i)).toBeInTheDocument();
  });
});
