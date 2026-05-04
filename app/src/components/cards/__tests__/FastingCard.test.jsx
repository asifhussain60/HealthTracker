/**
 * FastingCard.test.jsx — AC-P0-C3
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FastingCard } from '../FastingCard';

const disabledProtocol = { enabled: false, windowStart: '14:00', windowEnd: '18:00' };
const enabledProtocol  = { enabled: true,  windowStart: '14:00', windowEnd: '18:00' };

describe('FastingCard', () => {
  it('renders without crashing (smoke)', () => {
    const { container } = render(
      <FastingCard fastingProtocol={disabledProtocol} now="2026-05-04T10:00:00" />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('shows Fasting window heading', () => {
    render(<FastingCard fastingProtocol={disabledProtocol} now="2026-05-04T10:00:00" />);
    expect(screen.getByText(/fasting/i)).toBeInTheDocument();
  });

  it('shows open state when inside window', () => {
    // 15:00 is inside 14:00–18:00 window
    render(<FastingCard fastingProtocol={enabledProtocol} now="2026-05-04T15:00:00" />);
    expect(screen.getByText(/open/i)).toBeInTheDocument();
  });

  it('shows opens-in state when before window', () => {
    // 10:00 is before 14:00 window
    render(<FastingCard fastingProtocol={enabledProtocol} now="2026-05-04T10:00:00" />);
    expect(screen.getByText(/opens in/i)).toBeInTheDocument();
  });

  it('shows closed-since state when after window', () => {
    // 20:00 is after 18:00 window close
    render(<FastingCard fastingProtocol={enabledProtocol} now="2026-05-04T20:00:00" />);
    expect(screen.getByText(/closed/i)).toBeInTheDocument();
  });

  it('shows window times', () => {
    render(<FastingCard fastingProtocol={enabledProtocol} now="2026-05-04T15:00:00" />);
    expect(screen.getAllByText(/14:00/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/18:00/).length).toBeGreaterThan(0);
  });
});
