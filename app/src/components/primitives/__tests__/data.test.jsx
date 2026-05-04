/**
 * data.test.jsx — B7 RED: List / EmptyState / DatePicker / TimePicker
 * AC-P1B-DATA
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { expect as vitestExpect } from 'vitest';
vitestExpect.extend(toHaveNoViolations);

import { List, ListItem } from '../List';
import { EmptyState } from '../EmptyState';
import { DatePicker } from '../DatePicker';
import { TimePicker } from '../TimePicker';

/* ─── List ──────────────────────────────────────────────────────────────── */
describe('List (B7)', () => {
  it('renders a list', () => {
    render(
      <List>
        <ListItem label="Item 1" />
        <ListItem label="Item 2" />
      </List>
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('renders leading slot', () => {
    render(
      <List>
        <ListItem label="Item" leading={<span data-testid="lead">★</span>} />
      </List>
    );
    expect(screen.getByTestId('lead')).toBeInTheDocument();
  });

  it('renders trailing slot', () => {
    render(
      <List>
        <ListItem label="Item" trailing={<span data-testid="trail">›</span>} />
      </List>
    );
    expect(screen.getByTestId('trail')).toBeInTheDocument();
  });

  it('renders divider when divider prop set', () => {
    const { container } = render(
      <List>
        <ListItem label="A" divider />
        <ListItem label="B" />
      </List>
    );
    expect(container.querySelector('.md3-list-item--divider')).toBeTruthy();
  });

  it('applies density variant (compact)', () => {
    const { container } = render(
      <List density="compact">
        <ListItem label="Dense item" />
      </List>
    );
    expect(container.querySelector('.md3-list--compact')).toBeTruthy();
  });

  it('calls onClick on ListItem click', () => {
    const onClick = vi.fn();
    render(
      <List>
        <ListItem label="Clickable" onClick={onClick} />
      </List>
    );
    fireEvent.click(screen.getByText('Clickable'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is accessible (axe)', async () => {
    const { container } = render(
      <List>
        <ListItem label="One" />
        <ListItem label="Two" />
      </List>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

/* ─── EmptyState (MD3 extended) ────────────────────────────────────────── */
describe('EmptyState MD3 (B7)', () => {
  it('renders small size', () => {
    const { container } = render(<EmptyState heading="Empty" size="small" />);
    expect(container.querySelector('.empty-state--small')).toBeTruthy();
  });

  it('renders large size', () => {
    const { container } = render(<EmptyState heading="Empty" size="large" />);
    expect(container.querySelector('.empty-state--large')).toBeTruthy();
  });

  it('still renders icon + heading + body + cta (backward compat)', () => {
    render(
      <EmptyState
        icon="📭"
        heading="Nothing here"
        body="Add something to get started"
        cta={<button>Add</button>}
      />
    );
    expect(screen.getByText('📭')).toBeInTheDocument();
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.getByText('Add something to get started')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('is accessible (axe)', async () => {
    const { container } = render(
      <EmptyState icon="🗂" heading="No items" body="Create your first item" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

/* ─── DatePicker ────────────────────────────────────────────────────────── */
describe('DatePicker (B7)', () => {
  it('renders a calendar grid', () => {
    const { container } = render(
      <DatePicker value="2026-05-04" onChange={() => {}} />
    );
    expect(container.querySelector('.md3-date-picker')).toBeTruthy();
  });

  it('renders month title', () => {
    render(<DatePicker value="2026-05-04" onChange={() => {}} />);
    expect(screen.getByText(/May 2026/i)).toBeInTheDocument();
  });

  it('renders prev/next navigation buttons', () => {
    render(<DatePicker value="2026-05-04" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('renders day cells', () => {
    const { container } = render(<DatePicker value="2026-05-04" onChange={() => {}} />);
    // Day buttons have data-date attributes for May 2026
    expect(container.querySelector('[data-date="2026-05-01"]')).toBeTruthy();
  });

  it('calls onChange with ISO date string when day clicked', () => {
    const onChange = vi.fn();
    const { container } = render(<DatePicker value="2026-05-04" onChange={onChange} />);
    // Click day 10 via data-date attribute
    const dayBtn = container.querySelector('[data-date="2026-05-10"]');
    fireEvent.click(dayBtn);
    expect(onChange).toHaveBeenCalledWith('2026-05-10');
  });

  it('is accessible (axe)', async () => {
    const { container } = render(
      <DatePicker value="2026-05-04" onChange={() => {}} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

/* ─── TimePicker ────────────────────────────────────────────────────────── */
describe('TimePicker (B7)', () => {
  it('renders time input', () => {
    render(<TimePicker value="08:00" onChange={() => {}} label="Bedtime" id="bedtime" />);
    expect(screen.getByLabelText('Bedtime')).toBeInTheDocument();
  });

  it('renders current value', () => {
    render(<TimePicker value="20:00" onChange={() => {}} label="Bedtime" id="bt" />);
    const input = screen.getByLabelText('Bedtime');
    expect(input.value).toBe('20:00');
  });

  it('fires onChange', () => {
    const onChange = vi.fn();
    render(<TimePicker value="08:00" onChange={onChange} label="Wake" id="wake" />);
    fireEvent.change(screen.getByLabelText('Wake'), { target: { value: '04:30' } });
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('is accessible (axe)', async () => {
    const { container } = render(
      <TimePicker value="08:00" onChange={() => {}} label="Time" id="tp-axe" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
