/**
 * WorkoutPanel.test.jsx — E3 RED tests
 *
 * 1. Renders Walk, Kickboxing, Weights filter chips
 * 2. Shows capacity badge "0 of 2 today" for weights
 * 3. After adding 2 weight sessions, cap-reached lockout triggers
 * 4. Closed day makes add buttons disabled
 * 5. Renders session tiles for existing sessions
 *
 * AC-P1E-E3
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorkoutPanel } from '../WorkoutPanel.jsx';

const defaultProps = {
  weightSessions: [],
  workoutLogs: [],
  routines: [
    { id: 'r1', name: 'Upper Body', category: 'strength' },
    { id: 'r2', name: 'Lower Body', category: 'strength' },
  ],
  dailyCap: 2,
  isClosed: false,
  onAddWeightSession: () => {},
  onRemoveWeightSession: () => {},
  onAddWalk: () => {},
  onAddKickboxing: () => {},
  date: '2026-05-04',
};

describe('WorkoutPanel', () => {
  it('renders Walk, Kickboxing, Weights filter chips', () => {
    render(<WorkoutPanel {...defaultProps} />);
    expect(screen.getAllByText(/Walk/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Kickboxing/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Weights/i).length).toBeGreaterThanOrEqual(1);
    // All 3 chip types are present in the filter row
    const chips = screen.getAllByRole('button', { name: /Walk|Kickboxing|Weights/i });
    const chipTexts = chips.map((c) => c.textContent);
    expect(chipTexts.some((t) => /Walk/i.test(t))).toBe(true);
    expect(chipTexts.some((t) => /Kickboxing/i.test(t))).toBe(true);
    expect(chipTexts.some((t) => /Weights/i.test(t))).toBe(true);
  });

  it('shows capacity badge "0 of 2 today"', () => {
    render(<WorkoutPanel {...defaultProps} />);
    expect(screen.getByTestId('weights-capacity').textContent).toContain('0 of 2');
  });

  it('shows cap-reached message when 2 sessions are logged', () => {
    const sessions = [
      { id: 's1', date: '2026-05-04', routineId: 'r1', routineName: 'Upper Body' },
      { id: 's2', date: '2026-05-04', routineId: 'r2', routineName: 'Lower Body' },
    ];
    render(<WorkoutPanel {...defaultProps} weightSessions={sessions} />);
    expect(screen.getByTestId('weights-capacity').textContent).toContain('2 of 2');
    // Add button should be disabled/not present
    const addBtn = screen.queryByTestId('add-weight-session');
    expect(addBtn === null || addBtn.disabled).toBe(true);
  });

  it('add buttons disabled on closed day', () => {
    render(<WorkoutPanel {...defaultProps} isClosed={true} />);
    const allButtons = screen.getAllByRole('button');
    // All action buttons should be disabled
    const addBtns = allButtons.filter(b => b.getAttribute('data-add-action'));
    addBtns.forEach(btn => expect(btn.disabled).toBe(true));
  });

  it('renders session tiles for existing weight sessions', () => {
    const sessions = [
      { id: 's1', date: '2026-05-04', routineId: 'r1', routineName: 'Upper Body' },
    ];
    render(<WorkoutPanel {...defaultProps} weightSessions={sessions} />);
    expect(screen.getByText('Upper Body')).toBeInTheDocument();
  });
});
