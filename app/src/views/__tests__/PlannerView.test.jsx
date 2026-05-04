/**
 * PlannerView.test.jsx — AC-P1C-C8
 * Planner shell smoke tests + hero pill 96px height spec.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { PlannerView } from '../PlannerView.jsx';

function renderPlanner() {
  return render(
    <MemoryRouter initialEntries={['/plan']}>
      <Routes>
        <Route path="/plan" element={<PlannerView />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PlannerView (shell)', () => {
  it('renders without crashing', () => {
    renderPlanner();
    expect(document.body.textContent).toBeTruthy();
  });

  it('has data-testid="planner-view"', () => {
    renderPlanner();
    expect(document.querySelector('[data-testid="planner-view"]')).toBeTruthy();
  });

  it('shows "Plan my week" heading', () => {
    renderPlanner();
    expect(screen.getAllByText(/plan my week/i).length).toBeGreaterThan(0);
  });

  it('mentions P1.D as the full-UX phase', () => {
    renderPlanner();
    expect(document.body.textContent).toMatch(/P1\.D/);
  });

  it('hero pill button is present with correct height (96px)', () => {
    renderPlanner();
    const heroPill = document.querySelector('.planner-view__hero-pill');
    expect(heroPill).toBeTruthy();
    // Inline style sets height: 96px
    expect(heroPill.style.height).toBe('96px');
  });

  it('hero pill has minWidth ≥ 320px', () => {
    renderPlanner();
    const heroPill = document.querySelector('.planner-view__hero-pill');
    expect(heroPill).toBeTruthy();
    // minWidth: 320px from inline style
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

  it('does NOT access store (no provider needed)', () => {
    expect(() => renderPlanner()).not.toThrow();
  });
});
