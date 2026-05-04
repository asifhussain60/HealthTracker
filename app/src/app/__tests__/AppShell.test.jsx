/**
 * AppShell.test.jsx — AC-P1C-C1
 * RED: AppShell renders and Outlet renders children.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from '../AppShell.jsx';

describe('AppShell', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<div>child content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('child content')).toBeTruthy();
  });

  it('renders a top-app-bar', () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<div>child</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    expect(document.querySelector('.md3-top-app-bar')).toBeTruthy();
  });

  it('renders a nav element for navigation', () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<div>child</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    expect(document.querySelector('nav')).toBeTruthy();
  });

  it('outlet renders children when nested route matches', () => {
    render(
      <MemoryRouter initialEntries={['/child']}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/child" element={<span data-testid="outlet-child">outlet works</span>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByTestId('outlet-child')).toBeTruthy();
    expect(screen.getByText('outlet works')).toBeTruthy();
  });
});
