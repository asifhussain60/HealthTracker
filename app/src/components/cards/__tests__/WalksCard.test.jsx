/**
 * WalksCard.test.jsx — AC-P0-C3
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WalksCard } from '../WalksCard';

describe('WalksCard', () => {
  it('renders without crashing (smoke)', () => {
    const { container } = render(<WalksCard walkLog={[]} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('shows Walks heading', () => {
    render(<WalksCard walkLog={[]} />);
    expect(screen.getAllByText(/walk/i).length).toBeGreaterThan(0);
  });

  it('shows empty state when no walk logs', () => {
    render(<WalksCard walkLog={[]} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows Phase 1 coming soon text', () => {
    render(<WalksCard walkLog={[]} />);
    expect(screen.getByText(/phase 1/i)).toBeInTheDocument();
  });
});
