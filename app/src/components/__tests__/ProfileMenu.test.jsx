/**
 * ProfileMenu.test.jsx — AC-P1C-C5
 * Opens on click, closes on outside click, escape closes, focus management.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileMenu } from '../ProfileMenu.jsx';

function renderMenu(props = {}) {
  const defaults = {
    initials: 'AH',
    name: 'Asif Hussain',
    onSettings: vi.fn(),
    onExport: vi.fn(),
    onReset: vi.fn(),
  };
  return render(<ProfileMenu {...defaults} {...props} />);
}

describe('ProfileMenu', () => {
  it('renders avatar with initials', () => {
    renderMenu();
    expect(screen.getByText('AH')).toBeTruthy();
  });

  it('menu is closed by default', () => {
    renderMenu();
    expect(screen.queryByRole('menu')).toBeFalsy();
  });

  it('opens the menu on avatar button click', async () => {
    renderMenu();
    const trigger = screen.getByRole('button', { name: /AH|profile menu|open menu/i });
    fireEvent.click(trigger);
    expect(screen.getByRole('menu')).toBeTruthy();
  });

  it('shows user name in open menu', async () => {
    renderMenu();
    const trigger = screen.getByRole('button', { name: /AH|profile menu|open menu/i });
    fireEvent.click(trigger);
    expect(screen.getByText('Asif Hussain')).toBeTruthy();
  });

  it('shows Settings menu item', () => {
    renderMenu();
    fireEvent.click(screen.getByRole('button', { name: /AH|profile menu|open menu/i }));
    expect(screen.getByRole('menuitem', { name: /settings/i })).toBeTruthy();
  });

  it('shows Export data menu item', () => {
    renderMenu();
    fireEvent.click(screen.getByRole('button', { name: /AH|profile menu|open menu/i }));
    expect(screen.getByRole('menuitem', { name: /export/i })).toBeTruthy();
  });

  it('shows Reset app data menu item', () => {
    renderMenu();
    fireEvent.click(screen.getByRole('button', { name: /AH|profile menu|open menu/i }));
    expect(screen.getByRole('menuitem', { name: /reset/i })).toBeTruthy();
  });

  it('calls onSettings when Settings is clicked', () => {
    const onSettings = vi.fn();
    renderMenu({ onSettings });
    fireEvent.click(screen.getByRole('button', { name: /AH|profile menu|open menu/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /settings/i }));
    expect(onSettings).toHaveBeenCalledTimes(1);
  });

  it('calls onExport when Export data is clicked', () => {
    const onExport = vi.fn();
    renderMenu({ onExport });
    fireEvent.click(screen.getByRole('button', { name: /AH|profile menu|open menu/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /export/i }));
    expect(onExport).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape key', async () => {
    const user = userEvent.setup();
    renderMenu();
    const trigger = screen.getByRole('button', { name: /AH|profile menu|open menu/i });
    await user.click(trigger);
    expect(screen.getByRole('menu')).toBeTruthy();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).toBeFalsy();
  });

  it('closes when clicking outside', async () => {
    const user = userEvent.setup();
    const { container } = renderMenu();
    const trigger = screen.getByRole('button', { name: /AH|profile menu|open menu/i });
    await user.click(trigger);
    expect(screen.getByRole('menu')).toBeTruthy();
    // Click outside
    await user.click(container.parentElement ?? document.body);
    expect(screen.queryByRole('menu')).toBeFalsy();
  });

  it('trigger has aria-expanded=false when closed', () => {
    renderMenu();
    const trigger = screen.getByRole('button', { name: /AH|profile menu|open menu/i });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('trigger has aria-expanded=true when open', () => {
    renderMenu();
    const trigger = screen.getByRole('button', { name: /AH|profile menu|open menu/i });
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });
});
