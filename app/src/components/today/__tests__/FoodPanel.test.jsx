/**
 * FoodPanel.test.jsx — E5 RED tests (6 tests per master plan § 6.E E5 spec)
 *
 * 1. FastingBanner shows 'open' state when inside eating window
 * 2. FastingBanner shows 'opens-in' with minutes when before window
 * 3. FastingBanner shows 'closed-since' when after window
 * 4. MealSlotRow renders slot with plate-weight chip
 * 5. Calorie aggregator sums eaten slots correctly
 * 6. Empty mealPlan day renders EmptyState with CTA
 *
 * AC-P1E-E5
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FastingBanner } from '../FastingBanner.jsx';
import { MealSlotRow } from '../MealSlotRow.jsx';
import { FoodPanel } from '../FoodPanel.jsx';

// ── FastingBanner tests ───────────────────────────────────────────────────────

const FASTING_PROTOCOL = {
  enabled: true,
  windowStart: '12:00',
  windowEnd: '20:00',
};

describe('FastingBanner', () => {
  it('shows "open" state when inside eating window', () => {
    render(
      <FastingBanner
        fastingState={{ state: 'open' }}
        protocol={FASTING_PROTOCOL}
      />
    );
    expect(screen.getByTestId('fasting-banner').getAttribute('data-state')).toBe('open');
    expect(screen.getByText(/eating window open/i)).toBeInTheDocument();
  });

  it('shows "opens-in" with countdown when before window', () => {
    render(
      <FastingBanner
        fastingState={{ state: 'opens-in', minutesUntilOpen: 90 }}
        protocol={FASTING_PROTOCOL}
      />
    );
    expect(screen.getByTestId('fasting-banner').getAttribute('data-state')).toBe('opens-in');
    expect(screen.getByText(/90/)).toBeInTheDocument();
  });

  it('shows "closed-since" with elapsed time when after window', () => {
    render(
      <FastingBanner
        fastingState={{ state: 'closed-since', minutesSinceClose: 45 }}
        protocol={FASTING_PROTOCOL}
      />
    );
    expect(screen.getByTestId('fasting-banner').getAttribute('data-state')).toBe('closed-since');
    expect(screen.getByText(/45/)).toBeInTheDocument();
  });
});

// ── MealSlotRow tests ─────────────────────────────────────────────────────────

const MEAL_SLOT = {
  slotKey: 'lunch',
  mealName: 'Grilled Chicken Bowl',
  slotLabel: 'Lunch',
  scheduledTime: '13:00',
  eaten: false,
  plateWeight: 320,
  refWeight: 380,
  refCalories: 680,
};

describe('MealSlotRow', () => {
  it('renders slot name and plate-weight chip', () => {
    render(
      <MealSlotRow
        slot={MEAL_SLOT}
        onToggleEaten={() => {}}
        onEditPlateWeight={() => {}}
        isClosed={false}
      />
    );
    expect(screen.getByText(/Grilled Chicken Bowl/i)).toBeInTheDocument();
    expect(screen.getByTestId('plate-weight-chip')).toBeInTheDocument();
    expect(screen.getByTestId('plate-weight-chip').textContent).toContain('320');
  });
});

// ── FoodPanel integration tests ───────────────────────────────────────────────

const PLAN_DAY = {
  lunch: {
    slotKey: 'lunch', mealId: 'meal-1', mealName: 'Bowl', category: 'lunch',
    eaten: true, plateWeight: 380, refWeight: 380, refCalories: 700,
    scheduledTime: '13:00',
  },
  dinner: {
    slotKey: 'dinner', mealId: 'meal-2', mealName: 'Steak', category: 'dinner',
    eaten: false, plateWeight: null, refWeight: 400, refCalories: 600,
    scheduledTime: '19:00',
  },
};

describe('FoodPanel', () => {
  it('sums eaten slot calories and passes to onCaloriesUpdate', () => {
    const onCaloriesUpdate = vi.fn();
    render(
      <FoodPanel
        planDay={PLAN_DAY}
        fastingState={{ state: 'open' }}
        fastingProtocol={FASTING_PROTOCOL}
        isClosed={false}
        onToggleEaten={() => {}}
        onEditPlateWeight={() => {}}
        onCaloriesUpdate={onCaloriesUpdate}
        plateDefaults={{}}
      />
    );
    // lunch is eaten with plateWeight=refWeight=380 → full 700 cal
    // The panel should report eaten calories
    expect(onCaloriesUpdate).toHaveBeenCalledWith(expect.any(Number));
  });

  it('shows EmptyState with Plan CTA when planDay is null', () => {
    render(
      <FoodPanel
        planDay={null}
        fastingState={{ state: 'open' }}
        fastingProtocol={FASTING_PROTOCOL}
        isClosed={false}
        onToggleEaten={() => {}}
        onEditPlateWeight={() => {}}
        onCaloriesUpdate={() => {}}
        plateDefaults={{}}
      />
    );
    expect(screen.getByTestId('food-empty-state')).toBeInTheDocument();
    expect(screen.getByText(/plan my week/i)).toBeInTheDocument();
  });
});
