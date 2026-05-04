/**
 * EmptyState.test.jsx — AC-P0-C1
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('renders heading', () => {
    render(<EmptyState heading="No data yet" />);
    expect(screen.getByText('No data yet')).toBeInTheDocument();
  });

  it('renders body text when provided', () => {
    render(<EmptyState heading="No data" body="Add some entries to get started." />);
    expect(screen.getByText('Add some entries to get started.')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(<EmptyState heading="Empty" icon="📭" />);
    expect(screen.getByText('📭')).toBeInTheDocument();
  });

  it('renders CTA when provided', () => {
    render(<EmptyState heading="Empty" cta={<button>Add Entry</button>} />);
    expect(screen.getByRole('button', { name: 'Add Entry' })).toBeInTheDocument();
  });

  it('applies empty-state class', () => {
    const { container } = render(<EmptyState heading="Empty" />);
    expect(container.querySelector('.empty-state')).toBeTruthy();
  });

  it('has role=status for accessibility', () => {
    render(<EmptyState heading="No entries" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
