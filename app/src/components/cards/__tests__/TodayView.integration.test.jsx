/**
 * TodayView.integration.test.jsx — AC-P0-C2
 * Verifies TodayView still renders after card decomposition.
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TodayView } from '../../../views/TodayView';

describe('TodayView integration (C2)', () => {
  it('renders without crashing', () => {
    const { container } = render(<TodayView />);
    expect(container.firstChild).toBeTruthy();
  });

  it('shows Weight Journey section', () => {
    render(<TodayView />);
    expect(screen.getByText('Weight Journey')).toBeInTheDocument();
  });

  it('shows Cannabis Control section', () => {
    render(<TodayView />);
    expect(screen.getByText('Cannabis Control')).toBeInTheDocument();
  });

  it('shows Activity & Steps section', () => {
    render(<TodayView />);
    expect(screen.getByText('Activity & Steps')).toBeInTheDocument();
  });
});
