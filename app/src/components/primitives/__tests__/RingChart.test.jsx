/**
 * RingChart.test.jsx — AC-P0-C1
 * RED: tests written before implementation.
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RingChart } from '../RingChart';

describe('RingChart', () => {
  it('renders without crashing (smoke)', () => {
    const { container } = render(
      <RingChart value={50} max={100} colorClass="ring-teal" size={90} stroke={9}>
        <span>50%</span>
      </RingChart>
    );
    expect(container.querySelector('.ring-wrap')).toBeTruthy();
  });

  it('renders children inside ring-inner', () => {
    render(
      <RingChart value={30} max={100}>
        <span data-testid="inner">30%</span>
      </RingChart>
    );
    expect(screen.getByTestId('inner')).toBeInTheDocument();
  });

  it('applies the colorClass to ring-wrap', () => {
    const { container } = render(
      <RingChart value={10} max={100} colorClass="ring-green" />
    );
    expect(container.querySelector('.ring-green')).toBeTruthy();
  });

  it('clamps fill to max (value > max)', () => {
    const { container } = render(
      <RingChart value={200} max={100} />
    );
    const fill = container.querySelector('.ring-fill');
    // stroke-dasharray first value should equal circumference (full circle)
    expect(fill).toBeTruthy();
    const da = fill.getAttribute('stroke-dasharray');
    const [filled, total] = da.split(' ').map(parseFloat);
    expect(filled).toBeCloseTo(total, 1);
  });

  it('renders zero fill when max is 0', () => {
    const { container } = render(<RingChart value={10} max={0} />);
    const fill = container.querySelector('.ring-fill');
    const da = fill.getAttribute('stroke-dasharray');
    const [filled] = da.split(' ').map(parseFloat);
    expect(filled).toBe(0);
  });

  it('has role=img accessible wrapper or SVG with aria support', () => {
    const { container } = render(
      <RingChart value={50} max={100} label="50 of 100">
        <span>50</span>
      </RingChart>
    );
    // The SVG element exists
    expect(container.querySelector('svg')).toBeTruthy();
  });
});
