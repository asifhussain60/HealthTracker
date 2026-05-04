/**
 * chrome.test.jsx — B2 RED: Card / Chip / Button / IconButton MD3 primitives
 * AC-P1B-CHROME
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { expect as vitestExpect } from 'vitest';
vitestExpect.extend(toHaveNoViolations);

import { Card } from '../Card';
import { Chip } from '../Chip';
import { Button } from '../Button';
import { IconButton } from '../IconButton';

/* ─── Card ─────────────────────────────────────────────────────────────── */
describe('Card — MD3 variants (B2)', () => {
  it('renders filled variant', () => {
    const { container } = render(<Card variant="filled">Body</Card>);
    expect(container.querySelector('.md3-card--filled')).toBeTruthy();
  });

  it('renders outlined variant', () => {
    const { container } = render(<Card variant="outlined">Body</Card>);
    expect(container.querySelector('.md3-card--outlined')).toBeTruthy();
  });

  it('renders elevated variant', () => {
    const { container } = render(<Card variant="elevated">Body</Card>);
    expect(container.querySelector('.md3-card--elevated')).toBeTruthy();
  });

  it('renders children', () => {
    render(<Card variant="filled"><span data-testid="child">Hello</span></Card>);
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders header slot', () => {
    render(<Card variant="filled" header={<span>Header</span>}>Body</Card>);
    expect(screen.getByText('Header')).toBeInTheDocument();
  });

  it('is accessible (axe)', async () => {
    const { container } = render(<Card variant="filled"><p>Content</p></Card>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

/* ─── Chip ─────────────────────────────────────────────────────────────── */
describe('Chip — MD3 variants (B2)', () => {
  it('renders assist chip', () => {
    const { container } = render(<Chip variant="assist" label="Help" />);
    expect(container.querySelector('.md3-chip--assist')).toBeTruthy();
  });

  it('renders filter chip', () => {
    const { container } = render(<Chip variant="filter" label="Filter" />);
    expect(container.querySelector('.md3-chip--filter')).toBeTruthy();
  });

  it('renders input chip', () => {
    const { container } = render(<Chip variant="input" label="Input" />);
    expect(container.querySelector('.md3-chip--input')).toBeTruthy();
  });

  it('renders suggestion chip', () => {
    const { container } = render(<Chip variant="suggestion" label="Suggestion" />);
    expect(container.querySelector('.md3-chip--suggestion')).toBeTruthy();
  });

  it('shows selected state', () => {
    const { container } = render(<Chip variant="filter" label="Selected" selected />);
    expect(container.querySelector('.md3-chip--selected')).toBeTruthy();
  });

  it('renders leading icon slot', () => {
    render(<Chip variant="assist" label="Icon" leadingIcon={<span data-testid="lead">✓</span>} />);
    expect(screen.getByTestId('lead')).toBeInTheDocument();
  });

  it('renders trailing icon slot', () => {
    render(<Chip variant="input" label="Close" trailingIcon={<span data-testid="trail">×</span>} />);
    expect(screen.getByTestId('trail')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Chip variant="filter" label="Click" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is accessible (axe)', async () => {
    const { container } = render(<Chip variant="filter" label="Accessible Chip" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

/* ─── Button ────────────────────────────────────────────────────────────── */
describe('Button — MD3 variants (B2)', () => {
  it('renders filled variant', () => {
    const { container } = render(<Button variant="filled">Save</Button>);
    expect(container.querySelector('.md3-btn--filled')).toBeTruthy();
  });

  it('renders tonal variant', () => {
    const { container } = render(<Button variant="tonal">Tonal</Button>);
    expect(container.querySelector('.md3-btn--tonal')).toBeTruthy();
  });

  it('renders outlined variant', () => {
    const { container } = render(<Button variant="outlined">Outlined</Button>);
    expect(container.querySelector('.md3-btn--outlined')).toBeTruthy();
  });

  it('renders text variant', () => {
    const { container } = render(<Button variant="text">Cancel</Button>);
    expect(container.querySelector('.md3-btn--text')).toBeTruthy();
  });

  it('renders icon variant', () => {
    const { container } = render(<Button variant="icon" aria-label="Icon action">✓</Button>);
    expect(container.querySelector('.md3-btn--icon')).toBeTruthy();
  });

  it('is disabled when disabled prop set', () => {
    render(<Button variant="filled" disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows loading state', () => {
    const { container } = render(<Button variant="filled" loading>Save</Button>);
    expect(container.querySelector('.md3-btn--loading')).toBeTruthy();
  });

  it('renders leading icon slot', () => {
    render(
      <Button variant="filled" leadingIcon={<span data-testid="licon">+</span>}>Add</Button>
    );
    expect(screen.getByTestId('licon')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button variant="filled" onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(<Button variant="filled" disabled onClick={onClick}>Disabled</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('is accessible — filled (axe)', async () => {
    const { container } = render(<Button variant="filled">Accessible Button</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('is accessible — outlined (axe)', async () => {
    const { container } = render(<Button variant="outlined">Cancel</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

/* ─── IconButton ────────────────────────────────────────────────────────── */
describe('IconButton — MD3 variants (B2)', () => {
  it('renders round shape', () => {
    const { container } = render(<IconButton shape="round" aria-label="Add">+</IconButton>);
    expect(container.querySelector('.md3-icon-btn--round')).toBeTruthy();
  });

  it('renders square shape', () => {
    const { container } = render(<IconButton shape="square" aria-label="Add">+</IconButton>);
    expect(container.querySelector('.md3-icon-btn--square')).toBeTruthy();
  });

  it('renders small size', () => {
    const { container } = render(<IconButton size="small" aria-label="Small">+</IconButton>);
    expect(container.querySelector('.md3-icon-btn--small')).toBeTruthy();
  });

  it('renders medium size (default)', () => {
    const { container } = render(<IconButton size="medium" aria-label="Medium">+</IconButton>);
    expect(container.querySelector('.md3-icon-btn--medium')).toBeTruthy();
  });

  it('renders large size', () => {
    const { container } = render(<IconButton size="large" aria-label="Large">+</IconButton>);
    expect(container.querySelector('.md3-icon-btn--large')).toBeTruthy();
  });

  it('shows selected state with aria-pressed', () => {
    const { container } = render(<IconButton selected aria-label="Selected">★</IconButton>);
    expect(container.querySelector('.md3-icon-btn--selected')).toBeTruthy();
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows deselected state with aria-pressed false', () => {
    render(<IconButton selected={false} aria-label="Deselected">☆</IconButton>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<IconButton aria-label="Click me" onClick={onClick}>+</IconButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('has visible focus ring (aria accessible)', async () => {
    const { container } = render(<IconButton aria-label="Focus test">✓</IconButton>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
