/**
 * TodosCard.test.jsx — AC-P0-C2
 * TodosCard is a placeholder shell — TODOs view is Phase 3.
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TodosCard } from '../TodosCard';

describe('TodosCard', () => {
  it('renders without crashing (smoke)', () => {
    const { container } = render(<TodosCard />);
    expect(container.firstChild).toBeTruthy();
  });

  it('shows a TODOs heading or placeholder', () => {
    render(<TodosCard />);
    expect(screen.getAllByText(/to.?do/i).length).toBeGreaterThan(0);
  });

  it('shows Phase 3 placeholder text', () => {
    render(<TodosCard />);
    expect(screen.getAllByText(/phase 3/i).length).toBeGreaterThan(0);
  });
});
