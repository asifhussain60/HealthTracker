/**
 * NavShell.test.jsx — AC-P1C-C2
 * Breakpoint dispatcher: BottomNav <600 / NavRail 600-904 / SideDrawer ≥905
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NavShell, NAV_ITEMS } from '../NavShell.jsx';

/**
 * Mock window.matchMedia to simulate a given viewport width.
 * Returns true/false for each query based on the fakeWidth.
 */
function mockMatchMedia(fakeWidth) {
  const impl = (query) => {
    // Parse simple (max-width: Xpx), (min-width: Xpx), and compound queries
    let matches = false;

    // compound: (min-width: Apx) and (max-width: Bpx)
    const compound = query.match(/\(min-width:\s*(\d+)px\)\s+and\s+\(max-width:\s*(\d+)px\)/);
    if (compound) {
      const min = parseInt(compound[1], 10);
      const max = parseInt(compound[2], 10);
      matches = fakeWidth >= min && fakeWidth <= max;
    } else {
      const maxMatch = query.match(/\(max-width:\s*(\d+)px\)/);
      const minMatch = query.match(/\(min-width:\s*(\d+)px\)/);
      if (maxMatch) matches = fakeWidth <= parseInt(maxMatch[1], 10);
      else if (minMatch) matches = fakeWidth >= parseInt(minMatch[1], 10);
    }

    return {
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  };
  Object.defineProperty(window, 'matchMedia', { writable: true, value: vi.fn(impl) });
}

function renderNav(width) {
  mockMatchMedia(width);
  return render(
    <MemoryRouter>
      <NavShell />
    </MemoryRouter>
  );
}

describe('NavShell adaptive dispatcher', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('narrow viewport (599px) → BottomNav', () => {
    it('renders BottomNav (.md3-bottom-nav)', () => {
      renderNav(599);
      expect(document.querySelector('.md3-bottom-nav')).toBeTruthy();
    });

    it('does NOT render NavRail or SideDrawer', () => {
      renderNav(599);
      expect(document.querySelector('.md3-nav-rail')).toBeFalsy();
      expect(document.querySelector('.md3-side-drawer')).toBeFalsy();
    });

    it('shows all 6 nav items', () => {
      renderNav(599);
      NAV_ITEMS.forEach((item) => {
        expect(screen.getByText(item.label)).toBeTruthy();
      });
    });
  });

  describe('medium viewport (700px) → NavRail', () => {
    it('renders NavRail (.md3-nav-rail)', () => {
      renderNav(700);
      expect(document.querySelector('.md3-nav-rail')).toBeTruthy();
    });

    it('does NOT render BottomNav or SideDrawer', () => {
      renderNav(700);
      expect(document.querySelector('.md3-bottom-nav')).toBeFalsy();
      expect(document.querySelector('.md3-side-drawer')).toBeFalsy();
    });

    it('shows all 6 nav items', () => {
      renderNav(700);
      NAV_ITEMS.forEach((item) => {
        expect(screen.getByText(item.label)).toBeTruthy();
      });
    });
  });

  describe('wide viewport (1000px) → SideDrawer', () => {
    it('renders SideDrawer (.md3-side-drawer)', () => {
      renderNav(1000);
      expect(document.querySelector('.md3-side-drawer')).toBeTruthy();
    });

    it('does NOT render BottomNav or NavRail', () => {
      renderNav(1000);
      expect(document.querySelector('.md3-bottom-nav')).toBeFalsy();
      expect(document.querySelector('.md3-nav-rail')).toBeFalsy();
    });

    it('shows all 6 nav items', () => {
      renderNav(1000);
      NAV_ITEMS.forEach((item) => {
        expect(screen.getByText(item.label)).toBeTruthy();
      });
    });
  });

  describe('NAV_ITEMS config', () => {
    it('has exactly 6 items', () => {
      expect(NAV_ITEMS).toHaveLength(6);
    });

    it('includes Dashboard at /', () => {
      expect(NAV_ITEMS.find((i) => i.id === 'dashboard' && i.path === '/')).toBeTruthy();
    });

    it('includes Plan at /plan', () => {
      expect(NAV_ITEMS.find((i) => i.id === 'plan' && i.path === '/plan')).toBeTruthy();
    });

    it('includes Food at /food', () => {
      expect(NAV_ITEMS.find((i) => i.id === 'food' && i.path === '/food')).toBeTruthy();
    });

    it('Settings is NOT a primary nav item', () => {
      expect(NAV_ITEMS.find((i) => i.id === 'settings')).toBeFalsy();
    });
  });
});
