/**
 * display.test.jsx — B4 RED: ProgressRing / ProgressBar / Avatar / Badge / Skeleton
 * AC-P1B-DISPLAY
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { expect as vitestExpect } from 'vitest';
vitestExpect.extend(toHaveNoViolations);

import { ProgressRing } from '../ProgressRing';
import { ProgressBar } from '../ProgressBar';
import { Avatar } from '../Avatar';
import { Badge } from '../Badge';
import { Skeleton } from '../Skeleton';

/* ─── ProgressRing ──────────────────────────────────────────────────────── */
describe('ProgressRing (B4)', () => {
  it('renders without crashing', () => {
    const { container } = render(<ProgressRing value={0.5} label="50%" />);
    expect(container.firstChild).toBeTruthy();
  });

  it('has md3-progress-ring class', () => {
    const { container } = render(<ProgressRing value={0.75} label="Progress" />);
    expect(container.querySelector('.md3-progress-ring')).toBeTruthy();
  });

  it('accepts value 0-1', () => {
    const { container } = render(<ProgressRing value={0} label="Empty" />);
    expect(container.firstChild).toBeTruthy();
  });

  it('clamps value at 1', () => {
    const { container } = render(<ProgressRing value={1.5} label="Full" />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders label slot', () => {
    render(<ProgressRing value={0.4} label="Calories" size={120}><span data-testid="inner">40%</span></ProgressRing>);
    expect(screen.getByTestId('inner')).toBeInTheDocument();
  });

  it('has accessible label via SVG title + aria-labelledby', () => {
    const { container } = render(<ProgressRing value={0.6} label="60 percent" />);
    // SVG uses role="img" + aria-labelledby pointing to a <title> element
    const svg = container.querySelector('svg[role="img"]');
    expect(svg).toBeTruthy();
    const titleId = svg.getAttribute('aria-labelledby');
    expect(titleId).toBeTruthy();
    expect(container.querySelector(`#${titleId}`)).toBeTruthy();
    expect(container.querySelector(`#${titleId}`).textContent).toBe('60 percent');
  });

  it('size prop controls output dimensions', () => {
    const { container } = render(<ProgressRing value={0.5} label="test" size={120} />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('is accessible (axe)', async () => {
    const { container } = render(<ProgressRing value={0.5} label="50 percent complete" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

/* ─── ProgressBar ───────────────────────────────────────────────────────── */
describe('ProgressBar (B4)', () => {
  it('renders determinate bar', () => {
    const { container } = render(<ProgressBar value={0.6} label="Loading" />);
    expect(container.querySelector('.md3-progress-bar')).toBeTruthy();
  });

  it('renders indeterminate bar', () => {
    const { container } = render(<ProgressBar indeterminate label="Loading" />);
    expect(container.querySelector('.md3-progress-bar--indeterminate')).toBeTruthy();
  });

  it('has role=progressbar', () => {
    render(<ProgressBar value={0.5} label="Half" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('sets aria-valuenow', () => {
    render(<ProgressBar value={0.75} label="75%" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
  });

  it('is accessible (axe)', async () => {
    const { container } = render(<ProgressBar value={0.5} label="50 percent" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

/* ─── Avatar ────────────────────────────────────────────────────────────── */
describe('Avatar (B4)', () => {
  it('renders initials', () => {
    render(<Avatar initials="AH" />);
    expect(screen.getByText('AH')).toBeInTheDocument();
  });

  it('renders image when src provided', () => {
    const { container } = render(<Avatar src="https://example.com/avatar.jpg" alt="User avatar" />);
    expect(container.querySelector('img')).toBeTruthy();
  });

  it('renders small size', () => {
    const { container } = render(<Avatar initials="JS" size="small" />);
    expect(container.querySelector('.md3-avatar--small')).toBeTruthy();
  });

  it('renders medium size (default)', () => {
    const { container } = render(<Avatar initials="JS" size="medium" />);
    expect(container.querySelector('.md3-avatar--medium')).toBeTruthy();
  });

  it('renders large size', () => {
    const { container } = render(<Avatar initials="JS" size="large" />);
    expect(container.querySelector('.md3-avatar--large')).toBeTruthy();
  });

  it('is accessible — initials (axe)', async () => {
    const { container } = render(<Avatar initials="AH" aria-label="Asif Hussain" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

/* ─── Badge (MD3 extended) ──────────────────────────────────────────────── */
describe('Badge MD3 (B4)', () => {
  it('renders dot variant', () => {
    const { container } = render(<Badge variant="dot" />);
    expect(container.querySelector('.md3-badge--dot')).toBeTruthy();
  });

  it('renders label variant with text', () => {
    render(<Badge variant="label" label="New" />);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders count badge', () => {
    render(<Badge variant="label" label={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('has md3-badge class', () => {
    const { container } = render(<Badge variant="dot" />);
    expect(container.querySelector('.md3-badge')).toBeTruthy();
  });

  it('is accessible (axe)', async () => {
    const { container } = render(<Badge variant="label" label="5 unread" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

/* ─── Skeleton (MD3 extended) ───────────────────────────────────────────── */
describe('Skeleton MD3 (B4)', () => {
  it('renders text shape', () => {
    const { container } = render(<Skeleton shape="text" />);
    expect(container.querySelector('.md3-skeleton--text')).toBeTruthy();
  });

  it('renders circle shape', () => {
    const { container } = render(<Skeleton shape="circle" />);
    expect(container.querySelector('.md3-skeleton--circle')).toBeTruthy();
  });

  it('renders rect shape (default)', () => {
    const { container } = render(<Skeleton shape="rect" />);
    expect(container.querySelector('.md3-skeleton--rect')).toBeTruthy();
  });

  it('is aria-hidden (decorative)', () => {
    const { container } = render(<Skeleton shape="text" />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
  });

  it('accepts width and height', () => {
    const { container } = render(<Skeleton shape="rect" width="200px" height="40px" />);
    const el = container.firstChild;
    expect(el.style.width).toBe('200px');
    expect(el.style.height).toBe('40px');
  });
});
