/**
 * Card.test.jsx — AC-P0-C1
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card } from '../Card';

describe('Card', () => {
  it('renders without crashing (smoke)', () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders children', () => {
    render(<Card><span data-testid="child">Hello</span></Card>);
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders header slot when provided', () => {
    render(<Card header={<div>My Header</div>}>Body</Card>);
    expect(screen.getByText('My Header')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('applies card class', () => {
    const { container } = render(<Card>Test</Card>);
    expect(container.querySelector('.v2-card')).toBeTruthy();
  });

  it('applies variant class when provided', () => {
    const { container } = render(<Card variant="cannabis">Test</Card>);
    expect(container.querySelector('.v2-card--cannabis')).toBeTruthy();
  });
});
