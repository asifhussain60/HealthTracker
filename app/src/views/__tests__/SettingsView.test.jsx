/**
 * SettingsView.test.jsx — AC-P1C-C7
 * Settings shell smoke tests.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SettingsView } from '../SettingsView.jsx';

function renderSettings() {
  return render(
    <MemoryRouter initialEntries={['/settings']}>
      <Routes>
        <Route path="/settings" element={<SettingsView />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('SettingsView (shell)', () => {
  it('renders without crashing', () => {
    renderSettings();
    expect(document.body.textContent).toBeTruthy();
  });

  it('has data-testid="settings-view"', () => {
    renderSettings();
    expect(document.querySelector('[data-testid="settings-view"]')).toBeTruthy();
  });

  it('shows "Settings" heading', () => {
    renderSettings();
    expect(screen.getByText(/settings/i)).toBeTruthy();
  });

  it('mentions theme toggle in description', () => {
    renderSettings();
    expect(document.body.textContent.toLowerCase()).toMatch(/theme/);
  });

  it('mentions export in description', () => {
    renderSettings();
    expect(document.body.textContent.toLowerCase()).toMatch(/export/);
  });

  it('mentions P1.D as the full-UX phase', () => {
    renderSettings();
    expect(document.body.textContent).toMatch(/P1\.D/);
  });

  it('does NOT access store (no provider needed)', () => {
    expect(() => renderSettings()).not.toThrow();
  });
});
