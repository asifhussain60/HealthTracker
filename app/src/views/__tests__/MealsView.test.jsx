/**
 * MealsView.test.jsx — AC-P0-C7
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MealsView } from '../MealsView';

describe('MealsView', () => {
  it('renders without crashing (smoke)', () => {
    const { container } = render(<MealsView />);
    expect(container.firstChild).toBeTruthy();
  });

  it('shows Phase 1 placeholder text', () => {
    render(<MealsView />);
    expect(screen.getAllByText(/phase 1/i).length).toBeGreaterThan(0);
  });

  it('shows meals-related heading', () => {
    render(<MealsView />);
    expect(screen.getAllByText(/meal/i).length).toBeGreaterThan(0);
  });

  it('has empty-state role=status', () => {
    render(<MealsView />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
