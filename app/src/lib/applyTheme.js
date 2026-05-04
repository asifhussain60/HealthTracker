/**
 * applyTheme.js — Applies a theme class to document.documentElement.
 *
 * Called by:
 *   - main.jsx on app mount (reads persisted uiSlice.theme)
 *   - SettingsView when the user toggles the theme switch
 *
 * Contract:
 *   'dark'  → adds 'dark-mode' class to <html>
 *   'light' → removes 'dark-mode' class from <html>
 *
 * AC-P1D-D13
 */

/**
 * @param {'light' | 'dark'} theme
 */
export function applyTheme(theme) {
  if (typeof document === 'undefined') return;
  if (theme === 'dark') {
    document.documentElement.classList.add('dark-mode');
  } else {
    document.documentElement.classList.remove('dark-mode');
  }
}
