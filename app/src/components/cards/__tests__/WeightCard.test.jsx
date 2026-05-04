/**
 * WeightCard.test.jsx — AC-P0-C2
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WeightCard } from '../WeightCard';

const defaultProps = {
  currentWeight: 245,
  goalWeight: 180,
  startingWeight: 280,
  onLogWeight: vi.fn(),
};

describe('WeightCard', () => {
  it('renders without crashing (smoke)', () => {
    const { container } = render(<WeightCard {...defaultProps} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('shows Weight Journey heading', () => {
    render(<WeightCard {...defaultProps} />);
    expect(screen.getByText('Weight Journey')).toBeInTheDocument();
  });

  it('shows current weight', () => {
    render(<WeightCard {...defaultProps} currentWeight={245} />);
    // weight appears in hero
    expect(screen.getByText(/245/)).toBeInTheDocument();
  });

  it('shows goal weight', () => {
    render(<WeightCard {...defaultProps} goalWeight={180} />);
    expect(screen.getByText(/180/)).toBeInTheDocument();
  });

  it('shows progress caption when weight lost', () => {
    render(<WeightCard {...defaultProps} currentWeight={245} startingWeight={280} />);
    // 280 - 245 = 35 lbs lost — appears in "35.0 lb lost so far" caption
    expect(screen.getAllByText(/35/).length).toBeGreaterThan(0);
  });
});
