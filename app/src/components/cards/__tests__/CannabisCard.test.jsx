/**
 * CannabisCard.test.jsx — AC-P0-C2
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CannabisCard } from '../CannabisCard';

const defaultProps = {
  sessions: 1,
  sessionTarget: 3,
  dailyPlan: [],
  cannabisLogs: [],
  inventory: [],
  demoMode: false,
  onLogSession: vi.fn(),
  onAddExtra: vi.fn(),
};

describe('CannabisCard', () => {
  it('renders without crashing (smoke)', () => {
    const { container } = render(<CannabisCard {...defaultProps} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('shows Cannabis Control title', () => {
    render(<CannabisCard {...defaultProps} />);
    expect(screen.getByText('Cannabis Control')).toBeInTheDocument();
  });

  it('shows session count', () => {
    render(<CannabisCard {...defaultProps} sessions={2} sessionTarget={4} />);
    expect(screen.getByText(/2\/4/)).toBeInTheDocument();
  });

  it('shows daily limit alert when over limit', () => {
    render(<CannabisCard {...defaultProps} sessions={3} sessionTarget={3} />);
    expect(screen.getByText(/daily limit reached/i)).toBeInTheDocument();
  });

  it('shows empty state when no plan', () => {
    render(<CannabisCard {...defaultProps} dailyPlan={[]} />);
    expect(screen.getByText(/no eligible products/i)).toBeInTheDocument();
  });
});
