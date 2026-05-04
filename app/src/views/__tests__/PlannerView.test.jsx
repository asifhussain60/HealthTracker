/**
 * PlannerView.test.jsx — D17 tests for full PlannerView.
 *
 * 5 RED tests per spec + existing shell tests (kept for regression):
 * 1. /plan resolves and renders hero pill at 96px height, min-width 320px.
 * 2. Clicking "Plan my week" generates 28 MealPlanSlotCard instances (7×4).
 * 3. Toggling a day Lock pill then reclicking "Plan my week" keeps that day unchanged.
 * 4. Tapping a slot opens a bottom sheet listing only same-category meals.
 * 5. "Build shopping list" aggregates ingredient list when at least one slot is filled.
 *
 * AC-P1D-D17
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// ── Mock useStore before imports ──────────────────────────────────────────────
// We mock the store module with a factory function to avoid hoisting issues.
// The actual test data is generated inline within the mock factory.
vi.mock('../../data/store/index.js', () => {
  return {
    useStore: (selector) => {
      const state = {
        meals: [],
        profile: {},
        inventory: [],
        workoutRoutines: [],
        mealPlanSlice: { weeklyPlan: null, weeklyPlanHistory: [] },
        workoutPlanSlice: { weeklyPlan: null, weeklyPlanHistory: [] },
      };
      if (typeof selector === 'function') return selector(state);
      return state;
    },
  };
});

import { PlannerView } from '../PlannerView.jsx';
import { MEAL_SEED_30 } from '../../data/library/seed/MEAL_SEED_30.js';
import { stampNewRecord } from '../../data/repositories/_internal/auditFields.js';

// ── Store stub ────────────────────────────────────────────────────────────────

function buildSeedMeals() {
  return MEAL_SEED_30.map((m, i) => ({
    ...stampNewRecord(m),
    id: `meal-${i + 1}`,
    ingredients: `Ingredient for ${m.name}`,
  }));
}

const MOCK_PROFILE = {
  dailyCalorieTarget: 2000,
  cannabisTargets: { dailySessions: 2, dailyThcMgCeiling: 50 },
  cannabisTaperSchedule: {
    startDate: '2026-05-01',
    weeks: 8,
    startCeiling: 80,
    endCeiling: 25,
    curve: 'linear',
  },
  workoutPlan: {
    walkDailyMinutes: 30,
    kickboxingPerWeek: 5,
    weightsPerWeek: 3,
    dailyWeightSessionCap: 2,
  },
};

function makeStore(overrides = {}) {
  const seedMeals = buildSeedMeals();
  let state = {
    meals: seedMeals,
    profile: MOCK_PROFILE,
    inventory: [],
    workoutRoutines: [],
    mealPlanSlice: { weeklyPlan: null, weeklyPlanHistory: [] },
    workoutPlanSlice: { weeklyPlan: null, weeklyPlanHistory: [] },
    ...overrides,
  };
  return {
    getState: () => state,
    setState: (patch) => {
      state = typeof patch === 'function' ? patch(state) : { ...state, ...patch };
    },
    subscribe: () => () => {},
  };
}

function renderPlanner(storeOverrides = {}) {
  return render(
    <MemoryRouter initialEntries={['/plan']}>
      <Routes>
        <Route path="/plan" element={<PlannerView storeOverride={makeStore(storeOverrides)} />} />
      </Routes>
    </MemoryRouter>
  );
}

// ── Legacy shell tests (regression) ──────────────────────────────────────────

describe('PlannerView (shell — regression)', () => {
  it('renders without crashing', () => {
    renderPlanner();
    expect(document.body.textContent).toBeTruthy();
  });

  it('has data-testid="planner-view"', () => {
    renderPlanner();
    expect(document.querySelector('[data-testid="planner-view"]')).toBeTruthy();
  });

  it('shows "Plan my week" text', () => {
    renderPlanner();
    expect(screen.getAllByText(/plan my week/i).length).toBeGreaterThan(0);
  });

  it('hero pill button is present with correct height (96px)', () => {
    renderPlanner();
    const heroPill = document.querySelector('.planner-view__hero-pill');
    expect(heroPill).toBeTruthy();
    expect(heroPill.style.height).toBe('96px');
  });

  it('hero pill has minWidth ≥ 320px', () => {
    renderPlanner();
    const heroPill = document.querySelector('.planner-view__hero-pill');
    expect(heroPill).toBeTruthy();
    expect(heroPill.style.minWidth).toBe('320px');
  });

  it('hero pill is a button element', () => {
    renderPlanner();
    const heroPill = document.querySelector('.planner-view__hero-pill');
    expect(heroPill.tagName.toLowerCase()).toBe('button');
  });

  it('shows caption about auto-fire on Sundays', () => {
    renderPlanner();
    expect(document.body.textContent.toLowerCase()).toMatch(/sunday/i);
  });

  it('does NOT throw without a provider (store injected)', () => {
    expect(() => renderPlanner()).not.toThrow();
  });
});

// ── D17 new tests ─────────────────────────────────────────────────────────────

describe('PlannerView (D17) — test 1: hero pill dimensions', () => {
  it('hero pill is exactly 96px tall', () => {
    renderPlanner();
    const heroPill = document.querySelector('.planner-view__hero-pill');
    expect(heroPill.style.height).toBe('96px');
  });

  it('hero pill has min-width of 320px', () => {
    renderPlanner();
    const heroPill = document.querySelector('.planner-view__hero-pill');
    expect(heroPill.style.minWidth).toBe('320px');
  });

  it('hero pill has font-weight 600', () => {
    renderPlanner();
    const heroPill = document.querySelector('.planner-view__hero-pill');
    expect(heroPill.style.fontWeight).toBe('600');
  });

  it('hero pill is not disabled in full D17 view', () => {
    renderPlanner();
    const heroPill = document.querySelector('.planner-view__hero-pill');
    expect(heroPill.disabled).toBe(false);
  });

  it('hero pill has border-radius (pill shape)', () => {
    renderPlanner();
    const heroPill = document.querySelector('.planner-view__hero-pill');
    expect(heroPill.style.borderRadius).toBeTruthy();
  });
});

describe('PlannerView (D17) — test 2: clicking Plan my week generates 28 slot cards', () => {
  it('clicking "Plan my week" renders 28 MealPlanSlotCard instances', async () => {
    renderPlanner();
    const heroPill = document.querySelector('.planner-view__hero-pill');
    fireEvent.click(heroPill);

    await waitFor(() => {
      const cards = document.querySelectorAll('[data-testid="meal-plan-slot-card"]');
      expect(cards.length).toBe(28);
    });
  });

  it('the meal grid has 7 day-rows', async () => {
    renderPlanner();
    const heroPill = document.querySelector('.planner-view__hero-pill');
    fireEvent.click(heroPill);

    await waitFor(() => {
      const dayRows = document.querySelectorAll('[data-testid="planner-day-row"]');
      expect(dayRows.length).toBe(7);
    });
  });
});

describe('PlannerView (D17) — test 3: day lock toggle', () => {
  it('Lock pills are present after generating plan', async () => {
    renderPlanner();
    const heroPill = document.querySelector('.planner-view__hero-pill');
    fireEvent.click(heroPill);

    await waitFor(() => {
      const lockPills = document.querySelectorAll('[data-testid="day-lock-pill"]');
      expect(lockPills.length).toBe(7);
    });
  });

  it('toggling a day Lock pill changes its aria-pressed state', async () => {
    renderPlanner();
    const heroPill = document.querySelector('.planner-view__hero-pill');
    fireEvent.click(heroPill);

    await waitFor(() => {
      expect(document.querySelectorAll('[data-testid="day-lock-pill"]').length).toBe(7);
    });

    const firstLock = document.querySelector('[data-testid="day-lock-pill"]');
    expect(firstLock.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(firstLock);
    expect(firstLock.getAttribute('aria-pressed')).toBe('true');
  });

  it('locked day slots survive re-generation', async () => {
    renderPlanner();
    const heroPill = document.querySelector('.planner-view__hero-pill');
    fireEvent.click(heroPill);

    await waitFor(() => {
      expect(document.querySelectorAll('[data-testid="meal-plan-slot-card"]').length).toBe(28);
    });

    // Get original meal IDs from first day-row
    const firstDayRow = document.querySelector('[data-testid="planner-day-row"]');
    const originalIds = [...firstDayRow.querySelectorAll('[data-testid="meal-plan-slot-card"]')]
      .map((c) => c.getAttribute('data-meal-id'));

    // Lock the first day
    const firstLock = document.querySelector('[data-testid="day-lock-pill"]');
    fireEvent.click(firstLock);

    // Re-generate
    fireEvent.click(heroPill);

    await waitFor(() => {
      const newFirstDayRow = document.querySelector('[data-testid="planner-day-row"]');
      const newIds = [...newFirstDayRow.querySelectorAll('[data-testid="meal-plan-slot-card"]')]
        .map((c) => c.getAttribute('data-meal-id'));
      expect(newIds).toEqual(originalIds);
    });
  });
});

describe('PlannerView (D17) — test 4: slot tap opens category-filtered swap sheet', () => {
  it('tapping a breakfast slot opens a swap sheet', async () => {
    renderPlanner();
    const heroPill = document.querySelector('.planner-view__hero-pill');
    fireEvent.click(heroPill);

    await waitFor(() => {
      expect(document.querySelectorAll('[data-testid="meal-plan-slot-card"]').length).toBe(28);
    });

    // Find a breakfast slot card and click it
    const breakfastSlot = document.querySelector('[data-testid="meal-plan-slot-card"][data-category="breakfast"]');
    expect(breakfastSlot).toBeTruthy();
    fireEvent.click(breakfastSlot);

    await waitFor(() => {
      const swapSheet = document.querySelector('[data-testid="meal-swap-sheet"]');
      expect(swapSheet).toBeTruthy();
    });
  });

  it('swap sheet only lists same-category meals', async () => {
    renderPlanner();
    const heroPill = document.querySelector('.planner-view__hero-pill');
    fireEvent.click(heroPill);

    await waitFor(() => {
      expect(document.querySelectorAll('[data-testid="meal-plan-slot-card"]').length).toBe(28);
    });

    const breakfastSlot = document.querySelector('[data-testid="meal-plan-slot-card"][data-category="breakfast"]');
    fireEvent.click(breakfastSlot);

    await waitFor(() => {
      const swapSheet = document.querySelector('[data-testid="meal-swap-sheet"]');
      expect(swapSheet).toBeTruthy();
      // Swap sheet is scoped to breakfast category
      expect(swapSheet.getAttribute('data-category')).toBe('breakfast');
      // All items should be breakfast
      const items = swapSheet.querySelectorAll('[data-category]');
      for (const item of items) {
        expect(item.getAttribute('data-category')).toBe('breakfast');
      }
    });
  });
});

describe('PlannerView (D17) — test 5: Build shopping list', () => {
  it('"Build shopping list" button is present after generating plan', async () => {
    renderPlanner();
    const heroPill = document.querySelector('.planner-view__hero-pill');
    fireEvent.click(heroPill);

    await waitFor(() => {
      expect(document.querySelectorAll('[data-testid="meal-plan-slot-card"]').length).toBe(28);
    });

    const shoppingBtn = document.querySelector('[data-testid="build-shopping-list-btn"]');
    expect(shoppingBtn).toBeTruthy();
  });

  it('"Build shopping list" opens a sheet', async () => {
    renderPlanner();
    const heroPill = document.querySelector('.planner-view__hero-pill');
    fireEvent.click(heroPill);

    await waitFor(() => {
      expect(document.querySelectorAll('[data-testid="meal-plan-slot-card"]').length).toBe(28);
    });

    const shoppingBtn = document.querySelector('[data-testid="build-shopping-list-btn"]');
    fireEvent.click(shoppingBtn);

    await waitFor(() => {
      const sheet = document.querySelector('[data-testid="shopping-list-sheet"]');
      expect(sheet).toBeTruthy();
    });
  });

  it('shopping list sheet has non-empty content when slots are filled', async () => {
    renderPlanner();
    const heroPill = document.querySelector('.planner-view__hero-pill');
    fireEvent.click(heroPill);

    await waitFor(() => {
      expect(document.querySelectorAll('[data-testid="meal-plan-slot-card"]').length).toBe(28);
    });

    const shoppingBtn = document.querySelector('[data-testid="build-shopping-list-btn"]');
    fireEvent.click(shoppingBtn);

    await waitFor(() => {
      const sheet = document.querySelector('[data-testid="shopping-list-sheet"]');
      expect(sheet).toBeTruthy();
      expect(sheet.textContent.trim().length).toBeGreaterThan(0);
    });
  });
});
