/**
 * ProfileBanner.test.jsx — E1 RED tests
 *
 * 1. Renders user initials avatar
 * 2. Renders current weight in tabular-nums
 * 3. Weight delta vs last week shows correct arrow + value
 * 4. Calorie ring fill is accurate to %
 * 5. Calories today/target/remaining display correctly
 *
 * AC-P1E-E1
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileBanner } from '../ProfileBanner.jsx';

const BASE_PROFILE = {
  name: 'Asif Hussein',
  height: { ft: 5, in: 10 },
  currentWeight: 238.5,
  goalWeight: 200,
  dailyCalorieTarget: 2000,
  fastingProtocol: { enabled: false, windowStart: '12:00', windowEnd: '20:00' },
};

describe('ProfileBanner', () => {
  it('renders user initials from profile.name', () => {
    render(
      <ProfileBanner
        profile={BASE_PROFILE}
        weightDeltaLb={0}
        calorieRing={{ eaten: 0, target: 2000, remaining: 2000 }}
      />
    );
    // initials = 'AH' from 'Asif Hussein'
    expect(screen.getByText('AH')).toBeInTheDocument();
  });

  it('renders current weight with tabular-nums class', () => {
    render(
      <ProfileBanner
        profile={BASE_PROFILE}
        weightDeltaLb={0}
        calorieRing={{ eaten: 0, target: 2000, remaining: 2000 }}
      />
    );
    const weightEl = screen.getByTestId('current-weight');
    expect(weightEl.textContent).toContain('238.5');
    expect(weightEl.className).toMatch(/tabular-nums/);
  });

  it('shows down arrow and loss when weightDeltaLb < 0', () => {
    render(
      <ProfileBanner
        profile={BASE_PROFILE}
        weightDeltaLb={-2.3}
        calorieRing={{ eaten: 0, target: 2000, remaining: 2000 }}
      />
    );
    const delta = screen.getByTestId('weight-delta');
    expect(delta.textContent).toContain('▼');
    expect(delta.textContent).toContain('2.3');
  });

  it('shows up arrow when weightDeltaLb > 0', () => {
    render(
      <ProfileBanner
        profile={BASE_PROFILE}
        weightDeltaLb={1.5}
        calorieRing={{ eaten: 0, target: 2000, remaining: 2000 }}
      />
    );
    const delta = screen.getByTestId('weight-delta');
    expect(delta.textContent).toContain('▲');
    expect(delta.textContent).toContain('1.5');
  });

  it('calorie ring style reflects eaten/target ratio', () => {
    render(
      <ProfileBanner
        profile={BASE_PROFILE}
        weightDeltaLb={0}
        calorieRing={{ eaten: 1000, target: 2000, remaining: 1000 }}
      />
    );
    const ring = screen.getByTestId('calorie-ring');
    // 50% fill — style should contain 50
    expect(ring.getAttribute('style') ?? ring.textContent).toMatch(/50/);
  });

  it('shows calories today, target, and remaining', () => {
    render(
      <ProfileBanner
        profile={BASE_PROFILE}
        weightDeltaLb={0}
        calorieRing={{ eaten: 800, target: 2000, remaining: 1200 }}
      />
    );
    expect(screen.getByTestId('cal-eaten').textContent).toContain('800');
    expect(screen.getByTestId('cal-target').textContent).toContain('2000');
    expect(screen.getByTestId('cal-remaining').textContent).toContain('1200');
  });
});
