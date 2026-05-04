/**
 * nav.test.jsx — B6 RED: NavRail / BottomNav / SideDrawer / TopAppBar / FAB / Tabs
 * AC-P1B-NAV
 *
 * Responsive breakpoint tests mock window.matchMedia.
 * Adaptive nav: BottomNav <600 / NavRail 600-904 / SideDrawer ≥905.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { expect as vitestExpect } from 'vitest';
vitestExpect.extend(toHaveNoViolations);

import { NavRail } from '../NavRail';
import { BottomNav } from '../BottomNav';
import { SideDrawer } from '../SideDrawer';
import { TopAppBar } from '../TopAppBar';
import { FAB } from '../FAB';
import { Tabs } from '../Tabs';

const NAV_ITEMS = [
  { id: 'today', label: 'Today', icon: '📅' },
  { id: 'plan', label: 'Plan', icon: '📋' },
  { id: 'food', label: 'Food', icon: '🍽' },
  { id: 'workouts', label: 'Workouts', icon: '💪' },
  { id: 'cannabis', label: 'Cannabis', icon: '🌿' },
];

/* ─── NavRail ───────────────────────────────────────────────────────────── */
describe('NavRail (B6)', () => {
  it('renders with nav role', () => {
    render(<NavRail items={NAV_ITEMS} activeId="today" onNavigate={() => {}} />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders all nav items', () => {
    render(<NavRail items={NAV_ITEMS} activeId="today" onNavigate={() => {}} />);
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Plan')).toBeInTheDocument();
  });

  it('marks active item with aria-current', () => {
    render(<NavRail items={NAV_ITEMS} activeId="plan" onNavigate={() => {}} />);
    const activeBtn = screen.getByRole('button', { name: /plan/i });
    expect(activeBtn).toHaveAttribute('aria-current', 'page');
  });

  it('calls onNavigate with item id when clicked', () => {
    const onNavigate = vi.fn();
    render(<NavRail items={NAV_ITEMS} activeId="today" onNavigate={onNavigate} />);
    fireEvent.click(screen.getByRole('button', { name: /food/i }));
    expect(onNavigate).toHaveBeenCalledWith('food');
  });

  it('is accessible (axe)', async () => {
    const { container } = render(
      <NavRail items={NAV_ITEMS} activeId="today" onNavigate={() => {}} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

/* ─── BottomNav ─────────────────────────────────────────────────────────── */
describe('BottomNav (B6)', () => {
  it('renders with nav role', () => {
    render(<BottomNav items={NAV_ITEMS} activeId="today" onNavigate={() => {}} />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders all items', () => {
    render(<BottomNav items={NAV_ITEMS} activeId="today" onNavigate={() => {}} />);
    NAV_ITEMS.forEach(({ label }) => expect(screen.getByText(label)).toBeInTheDocument());
  });

  it('marks active item with aria-current', () => {
    render(<BottomNav items={NAV_ITEMS} activeId="food" onNavigate={() => {}} />);
    expect(screen.getByRole('button', { name: /food/i })).toHaveAttribute('aria-current', 'page');
  });

  it('calls onNavigate on click', () => {
    const onNavigate = vi.fn();
    render(<BottomNav items={NAV_ITEMS} activeId="today" onNavigate={onNavigate} />);
    fireEvent.click(screen.getByRole('button', { name: /cannabis/i }));
    expect(onNavigate).toHaveBeenCalledWith('cannabis');
  });

  it('is accessible (axe)', async () => {
    const { container } = render(
      <BottomNav items={NAV_ITEMS} activeId="today" onNavigate={() => {}} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

/* ─── SideDrawer ────────────────────────────────────────────────────────── */
describe('SideDrawer (B6)', () => {
  it('renders when open=true', () => {
    const { container } = render(
      <SideDrawer open items={NAV_ITEMS} activeId="today" onNavigate={() => {}} onClose={() => {}} />
    );
    expect(container.querySelector('.md3-side-drawer--open')).toBeTruthy();
  });

  it('hides when open=false', () => {
    const { container } = render(
      <SideDrawer open={false} items={NAV_ITEMS} activeId="today" onNavigate={() => {}} onClose={() => {}} />
    );
    expect(container.querySelector('.md3-side-drawer--open')).toBeNull();
  });

  it('renders all items', () => {
    render(
      <SideDrawer open items={NAV_ITEMS} activeId="today" onNavigate={() => {}} onClose={() => {}} />
    );
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Plan')).toBeInTheDocument();
  });

  it('calls onNavigate on click', () => {
    const onNavigate = vi.fn();
    render(
      <SideDrawer open items={NAV_ITEMS} activeId="today" onNavigate={onNavigate} onClose={() => {}} />
    );
    fireEvent.click(screen.getByRole('button', { name: /workouts/i }));
    expect(onNavigate).toHaveBeenCalledWith('workouts');
  });

  it('is accessible (axe)', async () => {
    const { container } = render(
      <SideDrawer open items={NAV_ITEMS} activeId="today" onNavigate={() => {}} onClose={() => {}} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

/* ─── TopAppBar ─────────────────────────────────────────────────────────── */
describe('TopAppBar (B6)', () => {
  it('renders with banner/header role', () => {
    render(<TopAppBar title="HealthTracker" />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders title', () => {
    render(<TopAppBar title="My App" />);
    expect(screen.getByText('My App')).toBeInTheDocument();
  });

  it('renders action slot', () => {
    render(
      <TopAppBar title="App"
        actions={<button type="button" data-testid="action-btn">Settings</button>}
      />
    );
    expect(screen.getByTestId('action-btn')).toBeInTheDocument();
  });

  it('is accessible (axe)', async () => {
    const { container } = render(<TopAppBar title="HealthTracker" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

/* ─── FAB ───────────────────────────────────────────────────────────────── */
describe('FAB (B6)', () => {
  it('renders regular FAB', () => {
    const { container } = render(<FAB icon="+" label="Add" onClick={() => {}} />);
    expect(container.querySelector('.md3-fab')).toBeTruthy();
  });

  it('renders extended FAB with label', () => {
    const { container } = render(
      <FAB icon="+" label="Add item" extended onClick={() => {}} />
    );
    expect(container.querySelector('.md3-fab--extended')).toBeTruthy();
    expect(screen.getByText('Add item')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<FAB icon="+" label="Add" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is accessible (axe)', async () => {
    const { container } = render(<FAB icon="+" label="Add new item" onClick={() => {}} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

/* ─── Tabs ──────────────────────────────────────────────────────────────── */
describe('Tabs (B6)', () => {
  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'history', label: 'History' },
    { id: 'settings', label: 'Settings' },
  ];

  it('renders primary variant', () => {
    const { container } = render(
      <Tabs variant="primary" tabs={TABS} activeId="overview" onChange={() => {}} />
    );
    expect(container.querySelector('.md3-tabs--primary')).toBeTruthy();
  });

  it('renders secondary variant', () => {
    const { container } = render(
      <Tabs variant="secondary" tabs={TABS} activeId="overview" onChange={() => {}} />
    );
    expect(container.querySelector('.md3-tabs--secondary')).toBeTruthy();
  });

  it('renders all tab labels', () => {
    render(<Tabs variant="primary" tabs={TABS} activeId="overview" onChange={() => {}} />);
    TABS.forEach(({ label }) => expect(screen.getByText(label)).toBeInTheDocument());
  });

  it('active tab has aria-selected=true', () => {
    render(<Tabs variant="primary" tabs={TABS} activeId="history" onChange={() => {}} />);
    expect(screen.getByRole('tab', { name: 'History' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onChange with tab id on click', () => {
    const onChange = vi.fn();
    render(<Tabs variant="primary" tabs={TABS} activeId="overview" onChange={onChange} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Settings' }));
    expect(onChange).toHaveBeenCalledWith('settings');
  });

  it('is accessible (axe)', async () => {
    const { container } = render(
      <Tabs variant="primary" tabs={TABS} activeId="overview" onChange={() => {}} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
