/**
 * Skeleton.test.jsx — AC-P0-C1
 */
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Skeleton } from '../Skeleton';

describe('Skeleton', () => {
  it('renders without crashing (smoke)', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeTruthy();
  });

  it('applies skeleton class', () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelector('.skeleton')).toBeTruthy();
  });

  it('applies animate class when animate prop is true', () => {
    const { container } = render(<Skeleton animate />);
    expect(container.querySelector('.skeleton--animate')).toBeTruthy();
  });

  it('applies custom width and height via style', () => {
    const { container } = render(<Skeleton width="200px" height="20px" />);
    const el = container.querySelector('.skeleton');
    expect(el.style.width).toBe('200px');
    expect(el.style.height).toBe('20px');
  });

  it('has aria-hidden for accessibility (decorative)', () => {
    const { container } = render(<Skeleton />);
    const el = container.querySelector('.skeleton');
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });
});
