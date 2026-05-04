/**
 * ProfileView.test.jsx — AC-P1D-D2
 * Updated for real ProfileEditor (replaced shell from AC-P1C-C6).
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

describe('ProfileView (real editor)', () => {
  it('renders without crashing', () => {
    renderProfile();
    expect(document.body.textContent).toBeTruthy();
  });

  it('has data-testid="profile-view"', () => {
    renderProfile();
    expect(document.querySelector('[data-testid="profile-view"]')).toBeTruthy();
  });

  it('renders Identity section heading', () => {
    renderProfile();
    expect(screen.getByText(/identity/i)).toBeTruthy();
  });

  it('renders Save button', () => {
    renderProfile();
    expect(screen.getByRole('button', { name: /save/i })).toBeTruthy();
  });

  it('renders Manage Fasting-Safe Items deep-link button', () => {
    renderProfile();
    expect(screen.getByRole('button', { name: /fasting.safe/i })).toBeTruthy();
  });
});
