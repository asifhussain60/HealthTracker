/**
 * SpiritualityPanel.test.jsx — E2 RED tests
 *
 * 1. Renders 5 prayer chips
 * 2. Tapping a chip toggles its done state
 * 3. Closed day makes chips read-only
 * 4. Chip labels are correct (Fajr, Zohr, Asr, Maghrib, Isha)
 *
 * AC-P1E-E2
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SpiritualityPanel } from '../SpiritualityPanel.jsx';

const PRAYERS = ['Fajr', 'Zohr', 'Asr', 'Maghrib', 'Isha'];

const defaultStatus = {
  fajr: { done: false },
  zohr: { done: false },
  asr: { done: false },
  maghrib: { done: false },
  isha: { done: false },
};

describe('SpiritualityPanel', () => {
  it('renders 5 prayer chips', () => {
    render(
      <SpiritualityPanel
        prayerStatus={defaultStatus}
        onToggle={() => {}}
        isClosed={false}
      />
    );
    for (const p of PRAYERS) {
      expect(screen.getByText(p)).toBeInTheDocument();
    }
  });

  it('tapping a chip calls onToggle with prayer key', () => {
    const onToggle = vi.fn();
    render(
      <SpiritualityPanel
        prayerStatus={defaultStatus}
        onToggle={onToggle}
        isClosed={false}
      />
    );
    fireEvent.click(screen.getByText('Fajr'));
    expect(onToggle).toHaveBeenCalledWith('fajr');
  });

  it('chips show done state visually when done=true', () => {
    const status = { ...defaultStatus, fajr: { done: true } };
    render(
      <SpiritualityPanel
        prayerStatus={status}
        onToggle={() => {}}
        isClosed={false}
      />
    );
    const fajrEl = screen.getByText('Fajr').closest('[data-prayer]');
    expect(fajrEl.getAttribute('data-done')).toBe('true');
  });

  it('chips are disabled (read-only) on a closed day', () => {
    const onToggle = vi.fn();
    render(
      <SpiritualityPanel
        prayerStatus={defaultStatus}
        onToggle={onToggle}
        isClosed={true}
      />
    );
    fireEvent.click(screen.getByText('Fajr'));
    expect(onToggle).not.toHaveBeenCalled();
  });
});
