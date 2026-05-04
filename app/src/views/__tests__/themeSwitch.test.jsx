/**
 * themeSwitch.test.jsx — AC-P1D-D13 RED
 *
 * End-to-end theme toggle:
 *   - Toggle in /settings → updates uiSlice.theme
 *   - main.jsx applies class on html element on mount
 *   - Theme persists via store (mocked localStorage)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SettingsView } from '../SettingsView.jsx';
import { useStore } from '../../data/store/index.js';

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock');
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

describe('theme toggle — store integration', () => {
  beforeEach(() => {
    // Reset theme to light before each test
    useStore.setState({ theme: 'light' });
  });

  it('initial theme is light', () => {
    expect(useStore.getState().theme).toBe('light');
  });

  it('toggle checkbox changes store.theme to dark', () => {
    renderSettings();
    const toggle = screen.getByRole('checkbox', { name: /dark mode/i });
    expect(toggle.checked).toBe(false);
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(true);
    // Store should be updated (setTheme action wired in SettingsView)
    expect(useStore.getState().theme).toBe('dark');
  });

  it('toggle back to light updates store.theme', () => {
    useStore.setState({ theme: 'dark' });
    renderSettings();
    const toggle = screen.getByRole('checkbox', { name: /dark mode/i });
    expect(toggle.checked).toBe(true);
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(false);
    expect(useStore.getState().theme).toBe('light');
  });
});

describe('theme toggle — CSS class application', () => {
  it('applyTheme adds dark-mode class to document.documentElement when theme is dark', () => {
    // Import and call applyTheme
    const { applyTheme } = require('../../lib/applyTheme.js');
    applyTheme('dark');
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
    // Clean up
    document.documentElement.classList.remove('dark-mode');
  });

  it('applyTheme removes dark-mode class when theme is light', () => {
    const { applyTheme } = require('../../lib/applyTheme.js');
    document.documentElement.classList.add('dark-mode');
    applyTheme('light');
    expect(document.documentElement.classList.contains('dark-mode')).toBe(false);
  });
});

describe('feature flag URL override display in settings', () => {
  it('settings shows "No feature flags active" when featureFlags is empty', () => {
    useStore.setState({ featureFlags: {} });
    renderSettings();
    expect(screen.getByText(/no feature flags active/i)).toBeTruthy();
  });

  it('settings shows flag key when featureFlags has an entry', () => {
    useStore.setState({ featureFlags: { newPlanner: true } });
    renderSettings();
    expect(screen.getByText(/newPlanner/)).toBeTruthy();
  });
});
