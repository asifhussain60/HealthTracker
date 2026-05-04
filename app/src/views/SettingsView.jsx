/**
 * SettingsView.jsx — Real settings view.
 *
 * Features:
 *   - Theme toggle (dark/light), persisted to uiSlice.theme
 *   - Data export button (downloads JSON blob)
 *   - Feature flags list (read-only from uiSlice.featureFlags)
 *
 * AC-P1D-D3
 */
import { useState } from 'react';
import { useStore } from '../data/store/index.js';
import { applyTheme } from '../lib/applyTheme.js';

export function SettingsView() {
  const featureFlags = useStore((s) => s.featureFlags ?? {});
  const theme = useStore((s) => s.theme ?? 'light');
  const setTheme = useStore((s) => s.setTheme);

  // Local theme state when setTheme action not yet wired
  const [localTheme, setLocalTheme] = useState(theme);
  const isDark = localTheme === 'dark';

  function handleThemeToggle(e) {
    const next = e.target.checked ? 'dark' : 'light';
    setLocalTheme(next);
    if (typeof setTheme === 'function') {
      setTheme(next);
    }
    applyTheme(next);
  }

  function handleExport() {
    const state = useStore.getState();
    const data = {
      profile: state.profile,
      inventory: state.inventory,
      cannabisLogs: state.cannabisLogs,
      workoutLogs: state.workoutLogs,
      weightHistory: state.weightHistory,
      mealTemplates: state.mealTemplates,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    a.download = `healthtracker-export-${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const flagEntries = Object.entries(featureFlags);

  return (
    <div className="settings-view" data-testid="settings-view">
      <h1>Settings</h1>

      {/* Theme toggle */}
      <section className="settings-section">
        <h2>Appearance</h2>
        <div className="settings-theme-toggle">
          <label htmlFor="theme-toggle-input">Dark mode</label>
          <input
            id="theme-toggle-input"
            type="checkbox"
            checked={isDark}
            onChange={handleThemeToggle}
          />
        </div>
      </section>

      {/* Data export */}
      <section className="settings-section">
        <h2>Data</h2>
        <button
          type="button"
          aria-label="Export data"
          onClick={handleExport}
        >
          Export data
        </button>
        <p className="settings-export-note">
          Downloads a full JSON backup of your profile, logs, and library.
        </p>
      </section>

      {/* Feature flags */}
      <section className="settings-section" data-testid="settings-feature-flags">
        <h2>Feature Flags</h2>
        {flagEntries.length === 0 ? (
          <p>No feature flags active.</p>
        ) : (
          <ul>
            {flagEntries.map(([key, val]) => (
              <li key={key}>
                <code>{key}</code>: {String(val)}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
