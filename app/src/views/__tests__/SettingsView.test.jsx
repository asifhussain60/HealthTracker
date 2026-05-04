/**
 * SettingsView.test.jsx — AC-P1D-D3
 * Updated for real SettingsView (replaced shell from AC-P1C-C7).
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SettingsView } from '../SettingsView.jsx';

// Mock URL.createObjectURL since jsdom doesn't support it
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

function renderSettings() {
  return render(
    <MemoryRouter initialEntries={['/settings']}>
      <Routes>
        <Route path="/settings" element={<SettingsView />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('SettingsView (real)', () => {
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
    expect(screen.getByRole('heading', { name: /settings/i })).toBeTruthy();
  });

  it('renders theme toggle switch', () => {
    renderSettings();
    expect(screen.getByRole('checkbox', { name: /dark mode/i })).toBeTruthy();
  });

  it('theme toggle changes label when clicked', () => {
    renderSettings();
    const toggle = screen.getByRole('checkbox', { name: /dark mode/i });
    const isInitiallyChecked = toggle.checked;
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(!isInitiallyChecked);
  });

  it('renders export data button', () => {
    renderSettings();
    expect(screen.getByRole('button', { name: /export/i })).toBeTruthy();
  });

  it('renders feature flags section', () => {
    renderSettings();
    expect(document.querySelector('[data-testid="settings-feature-flags"]')).toBeTruthy();
  });

  it('export button triggers download (blob created)', () => {
    renderSettings();
    const exportBtn = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportBtn);
    expect(URL.createObjectURL).toHaveBeenCalled();
  });
});
