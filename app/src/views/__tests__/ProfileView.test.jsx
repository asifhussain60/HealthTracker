/**
 * ProfileView.test.jsx — AC-P1C-C6
 * Profile shell smoke tests.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProfileView } from '../ProfileView.jsx';

function renderProfile() {
  return render(
    <MemoryRouter initialEntries={['/profile']}>
      <Routes>
        <Route path="/profile" element={<ProfileView />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProfileView (shell)', () => {
  it('renders without crashing', () => {
    renderProfile();
    expect(document.body.textContent).toBeTruthy();
  });

  it('has data-testid="profile-view"', () => {
    renderProfile();
    expect(document.querySelector('[data-testid="profile-view"]')).toBeTruthy();
  });

  it('shows "Profile editor" heading', () => {
    renderProfile();
    expect(screen.getByText(/profile editor/i)).toBeTruthy();
  });

  it('mentions P1.D as the full-UX phase', () => {
    renderProfile();
    expect(document.body.textContent).toMatch(/P1\.D/);
  });

  it('does NOT crash with no store context', () => {
    // Profile shell should not access the store
    expect(() => renderProfile()).not.toThrow();
  });
});
