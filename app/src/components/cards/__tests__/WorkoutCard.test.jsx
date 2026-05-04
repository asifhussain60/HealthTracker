/**
 * WorkoutCard.test.jsx — AC-P0-C2
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WorkoutCard } from '../WorkoutCard';

const defaultProps = {
  steps: 0,
  stepTarget: 10000,
  workoutLog: null,
  onLog: vi.fn(),
};

describe('WorkoutCard', () => {
  it('renders without crashing (smoke)', () => {
    const { container } = render(<WorkoutCard {...defaultProps} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('shows Activity & Steps title', () => {
    render(<WorkoutCard {...defaultProps} />);
    expect(screen.getByText('Activity & Steps')).toBeInTheDocument();
  });

  it('shows empty state when no workout logged', () => {
    render(<WorkoutCard {...defaultProps} workoutLog={null} />);
    expect(screen.getByText(/no activity logged today/i)).toBeInTheDocument();
  });

  it('shows workout stats when a log exists', () => {
    const log = { type: 'Walk', steps: 5000, walkDuration: 45, intensity: 'moderate', completed: true };
    render(<WorkoutCard {...defaultProps} steps={5000} workoutLog={log} />);
    expect(screen.getByText(/45/)).toBeInTheDocument();
  });

  it('renders log button when no workout', () => {
    render(<WorkoutCard {...defaultProps} workoutLog={null} />);
    expect(screen.getByRole('button', { name: /\+ Log/i })).toBeInTheDocument();
  });
});
