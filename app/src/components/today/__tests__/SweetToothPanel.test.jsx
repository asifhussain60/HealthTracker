/**
 * SweetToothPanel.test.jsx — E6 RED tests
 *
 * 1. Renders 4 indulgence counters
 * 2. Friction-confirm modal fires on + click
 * 3. Confirming adds a slip
 * 4. 14-day streak strip renders
 * 5. Deletes are blocked (no delete button present)
 *
 * AC-P1E-E6
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SweetToothPanel } from '../SweetToothPanel.jsx';

const ITEMS = ['Chocolate', 'Candy', 'Mints', 'Cookies'];

const STREAK = Array.from({ length: 14 }, (_, i) => ({
  date: `2026-04-${String(21 + i).padStart(2, '0')}`,
  slipCount: i === 2 ? 1 : 0,
}));

const DAILY_COUNTS = {
  chocolate: 0,
  candy: 0,
  mints: 0,
  cookies: 0,
};

describe('SweetToothPanel', () => {
  it('renders 4 indulgence counters', () => {
    render(
      <SweetToothPanel
        dailyCounts={DAILY_COUNTS}
        streak={STREAK}
        isClosed={false}
        onAddSlip={() => {}}
      />
    );
    for (const item of ITEMS) {
      expect(screen.getByText(new RegExp(item, 'i'))).toBeInTheDocument();
    }
  });

  it('shows friction-confirm modal when + is clicked', () => {
    render(
      <SweetToothPanel
        dailyCounts={DAILY_COUNTS}
        streak={STREAK}
        isClosed={false}
        onAddSlip={() => {}}
      />
    );
    const plusBtns = screen.getAllByLabelText(/add/i);
    fireEvent.click(plusBtns[0]);
    expect(screen.getByTestId('friction-confirm')).toBeInTheDocument();
  });

  it('calls onAddSlip with item key when confirmed', () => {
    const onAddSlip = vi.fn();
    render(
      <SweetToothPanel
        dailyCounts={DAILY_COUNTS}
        streak={STREAK}
        isClosed={false}
        onAddSlip={onAddSlip}
      />
    );
    const plusBtns = screen.getAllByLabelText(/add/i);
    fireEvent.click(plusBtns[0]);
    const confirmBtn = screen.getByTestId('friction-confirm-ok');
    fireEvent.click(confirmBtn);
    expect(onAddSlip).toHaveBeenCalledWith(expect.any(String));
  });

  it('renders 14-day streak strip', () => {
    render(
      <SweetToothPanel
        dailyCounts={DAILY_COUNTS}
        streak={STREAK}
        isClosed={false}
        onAddSlip={() => {}}
      />
    );
    const stripItems = screen.getAllByTestId('streak-day');
    expect(stripItems).toHaveLength(14);
  });

  it('has no delete button (append-only)', () => {
    render(
      <SweetToothPanel
        dailyCounts={DAILY_COUNTS}
        streak={STREAK}
        isClosed={false}
        onAddSlip={() => {}}
      />
    );
    const deleteBtns = screen.queryAllByLabelText(/delete|remove/i);
    expect(deleteBtns).toHaveLength(0);
  });
});
