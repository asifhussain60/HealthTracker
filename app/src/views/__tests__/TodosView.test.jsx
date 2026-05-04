/**
 * TodosView.test.jsx — AC-P0-C7
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TodosView } from '../TodosView';

describe('TodosView', () => {
  it('renders without crashing (smoke)', () => {
    const { container } = render(<TodosView />);
    expect(container.firstChild).toBeTruthy();
  });

  it('shows Phase 3 placeholder text', () => {
    render(<TodosView />);
    expect(screen.getAllByText(/phase 3/i).length).toBeGreaterThan(0);
  });

  it('shows TODOs-related heading', () => {
    render(<TodosView />);
    expect(screen.getAllByText(/to.?do/i).length).toBeGreaterThan(0);
  });

  it('has empty-state role=status', () => {
    render(<TodosView />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
