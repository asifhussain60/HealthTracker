/**
 * Stars.test.jsx — AC-P0-C1
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Stars } from '../Stars';

describe('Stars', () => {
  it('renders without crashing (smoke)', () => {
    const { container } = render(<Stars value={2} max={3} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders the correct number of filled stars', () => {
    const { container } = render(<Stars value={2} max={3} />);
    const filled = container.querySelectorAll('[data-filled="true"]');
    expect(filled.length).toBe(2);
  });

  it('renders the correct number of empty stars', () => {
    const { container } = render(<Stars value={1} max={3} />);
    const empty = container.querySelectorAll('[data-filled="false"]');
    expect(empty.length).toBe(2);
  });

  it('renders zero filled stars when value is 0', () => {
    const { container } = render(<Stars value={0} max={3} />);
    const filled = container.querySelectorAll('[data-filled="true"]');
    expect(filled.length).toBe(0);
  });

  it('has aria-label for accessibility', () => {
    render(<Stars value={2} max={3} label="Favorite rating" />);
    expect(screen.getByLabelText('Favorite rating')).toBeInTheDocument();
  });
});
