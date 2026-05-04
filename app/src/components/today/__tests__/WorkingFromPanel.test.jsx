/**
 * WorkingFromPanel.test.jsx — E7 RED tests
 *
 * 1. Renders location picker with available locations
 * 2. Start session button is present when no active session
 * 3. Stop session button appears when session is active
 * 4. Session tiles displayed for today's sessions
 * 5. Closed day disables Start button
 *
 * AC-P1E-E7
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorkingFromPanel } from '../WorkingFromPanel.jsx';

const LOCATIONS = [
  { id: 'home', name: 'Home' },
  { id: 'office', name: 'Office' },
  { id: 'cafe', name: 'Café' },
];

const defaultProps = {
  locations: LOCATIONS,
  sessions: [],
  activeSession: null,
  isClosed: false,
  onStartSession: () => {},
  onEndSession: () => {},
  date: '2026-05-04',
};

describe('WorkingFromPanel', () => {
  it('renders location picker with available locations', () => {
    render(<WorkingFromPanel {...defaultProps} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Office')).toBeInTheDocument();
  });

  it('shows Start session button when no active session', () => {
    render(<WorkingFromPanel {...defaultProps} />);
    expect(screen.getByTestId('start-session-btn')).toBeInTheDocument();
  });

  it('shows Stop session button when there is an active session', () => {
    const active = {
      id: 's1', date: '2026-05-04', locationId: 'home', startedAt: new Date().toISOString(), endedAt: null,
    };
    render(<WorkingFromPanel {...defaultProps} activeSession={active} />);
    expect(screen.getByTestId('stop-session-btn')).toBeInTheDocument();
  });

  it('renders session tiles for today', () => {
    const sessions = [
      { id: 's1', date: '2026-05-04', locationId: 'home', startedAt: '2026-05-04T09:00:00', endedAt: '2026-05-04T12:00:00', durationMinutes: 180 },
    ];
    render(<WorkingFromPanel {...defaultProps} sessions={sessions} />);
    expect(screen.getByTestId('work-session-tile')).toBeInTheDocument();
  });

  it('start button is disabled on closed day', () => {
    render(<WorkingFromPanel {...defaultProps} isClosed={true} />);
    expect(screen.getByTestId('start-session-btn').disabled).toBe(true);
  });
});
