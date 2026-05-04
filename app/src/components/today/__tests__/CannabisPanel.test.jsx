/**
 * CannabisPanel.test.jsx — E4 RED tests
 *
 * 1. Renders 2 session tiles
 * 2. Shows mg-today / mg-cap display
 * 3. Tapping Log button calls onLog
 * 4. Ceiling status 'over' is displayed
 * 5. Shows correct ceiling formula result
 *
 * AC-P1E-E4
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CannabisPanel } from '../CannabisPanel.jsx';

const PLAN = {
  sessions: [
    { sessionNumber: 1, timeLabel: 'Afternoon', plannedTime: '15:00', reason: 'Mood' },
    { sessionNumber: 2, timeLabel: 'Evening',   plannedTime: '19:30', reason: 'Pain' },
  ],
  taperCeilingMg: 60,
};

describe('CannabisPanel', () => {
  it('renders 2 session tiles', () => {
    render(
      <CannabisPanel
        plan={PLAN}
        mgToday={0}
        ceilingStatus="under"
        isClosed={false}
        onLog={() => {}}
      />
    );
    const tiles = screen.getAllByTestId('cannabis-session-tile');
    expect(tiles).toHaveLength(2);
  });

  it('shows mg-today and mg-cap', () => {
    render(
      <CannabisPanel
        plan={PLAN}
        mgToday={25}
        ceilingStatus="under"
        isClosed={false}
        onLog={() => {}}
      />
    );
    expect(screen.getByTestId('mg-today').textContent).toContain('25');
    expect(screen.getByTestId('mg-cap').textContent).toContain('60');
  });

  it('tapping Log button calls onLog with session number', () => {
    const onLog = vi.fn();
    render(
      <CannabisPanel
        plan={PLAN}
        mgToday={0}
        ceilingStatus="under"
        isClosed={false}
        onLog={onLog}
      />
    );
    const logBtns = screen.getAllByText(/Log/i);
    fireEvent.click(logBtns[0]);
    expect(onLog).toHaveBeenCalledWith(PLAN.sessions[0]);
  });

  it('shows ceiling status over visually', () => {
    render(
      <CannabisPanel
        plan={PLAN}
        mgToday={65}
        ceilingStatus="over"
        isClosed={false}
        onLog={() => {}}
      />
    );
    const status = screen.getByTestId('ceiling-status');
    expect(status.getAttribute('data-status')).toBe('over');
  });

  it('shows correct ceiling formula result for taper day 3', () => {
    // ceiling(3) = 80 - 55*3/56 ≈ 77.05
    const plan = { ...PLAN, taperCeilingMg: 77.05 };
    render(
      <CannabisPanel
        plan={plan}
        mgToday={10}
        ceilingStatus="under"
        isClosed={false}
        onLog={() => {}}
      />
    );
    expect(screen.getByTestId('mg-cap').textContent).toContain('77');
  });
});
