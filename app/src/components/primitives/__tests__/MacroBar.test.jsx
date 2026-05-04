/**
 * MacroBar.test.jsx — AC-P0-C1
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MacroBar } from '../MacroBar';

describe('MacroBar', () => {
  it('renders without crashing (smoke)', () => {
    const { container } = render(
      <MacroBar label="Protein" value={80} max={150} colorClass="bar-teal" />
    );
    expect(container.querySelector('.macro-bar')).toBeTruthy();
  });

  it('shows label and value text', () => {
    render(<MacroBar label="Protein" value={80} max={150} />);
    expect(screen.getByText('Protein')).toBeInTheDocument();
    expect(screen.getByText(/80g/)).toBeInTheDocument();
  });

  it('applies colorClass', () => {
    const { container } = render(
      <MacroBar label="Carbs" value={50} max={200} colorClass="bar-yellow" />
    );
    expect(container.querySelector('.bar-yellow')).toBeTruthy();
  });

  it('clamps fill percentage to 100 when over max', () => {
    const { container } = render(
      <MacroBar label="Fat" value={200} max={50} />
    );
    const fill = container.querySelector('.macro-bar-fill');
    // style --fill should be 100%
    expect(fill).toBeTruthy();
  });

  it('renders zero fill when max is 0', () => {
    const { container } = render(
      <MacroBar label="Test" value={10} max={0} />
    );
    expect(container.querySelector('.macro-bar-fill')).toBeTruthy();
  });
});
