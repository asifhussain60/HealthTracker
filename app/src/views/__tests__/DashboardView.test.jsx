/**
 * DashboardView.test.jsx — E7 RED tests for single-open accordion invariant
 *
 * 1. All 7 panel titles visible in collapsed state
 * 2. Expanding panel A collapses any other previously open panel
 * 3. Clicking the same panel again collapses it (toggle)
 *
 * AC-P1E-E7
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../data/store/index.js', () => ({
  useStore: (selector) => {
    const state = {
      profile: { name: 'Asif', currentWeight: 238, goalWeight: 200, dailyCalorieTarget: 2000 },
      weightHistory: [],
      prayers: {},
      weightSessions: [],
      cannabisLogs: [],
      inventory: [],
      mealPlan: null,
      dailySlips: {},
      workSessions: [],
      workLocations: [],
      fastingIntake: {},
      dayCloseSlice: { closures: {} },
    };
    return typeof selector === 'function' ? selector(state) : state;
  },
}));

import { DashboardView } from '../DashboardView.jsx';

const PANEL_TITLES = [
  /profile/i,
  /spirituality/i,
  /workout/i,
  /cannabis/i,
  /food/i,
  /sweet tooth/i,
  /working from/i,
];

describe('DashboardView — single-open accordion invariant', () => {
  function renderDash() {
    return render(
      <MemoryRouter>
        <DashboardView />
      </MemoryRouter>
    );
  }

  it('renders all 7 panel titles', () => {
    renderDash();
    for (const title of PANEL_TITLES) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
  });

  it('opening one panel closes others (single-open invariant)', () => {
    renderDash();
    // All accordion trigger buttons have aria-expanded attribute
    const buttons = screen.getAllByRole('button').filter(
      (b) => b.hasAttribute('aria-expanded')
    );
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    // Open first panel
    fireEvent.click(buttons[0]);
    expect(buttons[0].getAttribute('aria-expanded')).toBe('true');
    // Open second panel — first should close
    fireEvent.click(buttons[1]);
    expect(buttons[0].getAttribute('aria-expanded')).toBe('false');
    expect(buttons[1].getAttribute('aria-expanded')).toBe('true');
  });

  it('clicking same panel again collapses it', () => {
    renderDash();
    const buttons = screen.getAllByRole('button').filter(
      (b) => b.hasAttribute('aria-expanded')
    );
    fireEvent.click(buttons[0]);
    expect(buttons[0].getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(buttons[0]);
    expect(buttons[0].getAttribute('aria-expanded')).toBe('false');
  });
});
