/**
 * DateSelector.test.jsx — AC-P1C-C4
 * Navigation, boundary clamping, "Today" pill behavior.
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateSelector } from '../DateSelector.jsx';

// Anchor: Wednesday 2026-05-06
const TODAY = new Date(2026, 4, 6); // May 6, 2026

function renderSelector(props = {}) {
  const defaults = {
    today: TODAY,
    value: TODAY,
    onChange: () => {},
  };
  return render(<DateSelector {...defaults} {...props} />);
}

describe('DateSelector', () => {
  it('renders without crashing', () => {
    renderSelector();
    expect(document.body.textContent).toBeTruthy();
  });

  it('displays the current date', () => {
    renderSelector();
    // Should show some recognizable date string
    expect(document.body.textContent).toMatch(/May.*2026|2026.*May|Wed.*May/i);
  });

  it('renders a previous (‹) navigation button', () => {
    renderSelector();
    expect(screen.getByLabelText(/previous/i)).toBeTruthy();
  });

  it('renders a next (›) navigation button', () => {
    renderSelector();
    expect(screen.getByLabelText(/next/i)).toBeTruthy();
  });

  it('renders a Today pill button', () => {
    renderSelector();
    expect(screen.getByRole('button', { name: /today/i })).toBeTruthy();
  });

  it('clicking previous calls onChange with the previous day', () => {
    let called;
    const onChange = (d) => { called = d; };
    renderSelector({ onChange });
    fireEvent.click(screen.getByLabelText(/previous/i));
    // Should be 2026-05-05
    expect(called.toISOString().slice(0, 10)).toBe('2026-05-05');
  });

  it('clicking next calls onChange with the next day', () => {
    let called;
    const onChange = (d) => { called = d; };
    renderSelector({ onChange });
    fireEvent.click(screen.getByLabelText(/next/i));
    // Should be 2026-05-07
    expect(called.toISOString().slice(0, 10)).toBe('2026-05-07');
  });

  it('clicking Today calls onChange with today', () => {
    // Start on a different day
    const otherDay = new Date(2026, 4, 4); // Monday
    let called;
    const onChange = (d) => { called = d; };
    renderSelector({ value: otherDay, onChange });
    fireEvent.click(screen.getByRole('button', { name: /today/i }));
    expect(called.toISOString().slice(0, 10)).toBe('2026-05-06');
  });

  describe('boundary clamping', () => {
    it('next button is disabled at the end of the boundary (this Saturday)', () => {
      // End boundary = 2026-05-09 (Saturday of current week)
      const saturday = new Date(2026, 4, 9);
      renderSelector({ value: saturday });
      const nextBtn = screen.getByLabelText(/next/i);
      expect(nextBtn.disabled || nextBtn.getAttribute('aria-disabled') === 'true').toBe(true);
    });

    it('previous button is disabled at the start of the boundary (Sun-7)', () => {
      // Start boundary = 2026-04-26 (Sunday of previous week)
      const startBoundary = new Date(2026, 3, 26);
      renderSelector({ value: startBoundary });
      const prevBtn = screen.getByLabelText(/previous/i);
      expect(prevBtn.disabled || prevBtn.getAttribute('aria-disabled') === 'true').toBe(true);
    });

    it('date outside boundary is marked readOnly via prop', () => {
      // A date outside the boundary
      const farPast = new Date(2026, 3, 1); // April 1
      const { container } = renderSelector({ value: farPast });
      // Component should indicate read-only (class or attribute)
      const el = container.querySelector('[data-readonly="true"], .date-selector--readonly');
      // We accept either approach
      expect(el !== null || container.textContent.toLowerCase().includes('history')).toBe(true);
    });
  });

  describe('readOnly prop', () => {
    it('does not call onChange when readOnly and prev clicked', () => {
      let called = false;
      const onChange = () => { called = true; };
      renderSelector({ readOnly: true, onChange });
      const prevBtn = screen.queryByLabelText(/previous/i);
      if (prevBtn) fireEvent.click(prevBtn);
      expect(called).toBe(false);
    });
  });
});
