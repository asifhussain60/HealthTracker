/**
 * Badge.test.jsx — AC-P0-C1
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from '../Badge';

describe('Badge', () => {
  it('renders label text', () => {
    render(<Badge label="Cannabis" />);
    expect(screen.getByText('Cannabis')).toBeInTheDocument();
  });

  it('applies variant class', () => {
    const { container } = render(<Badge label="Munchies" variant="munchies" />);
    expect(container.querySelector('.badge-munchies')).toBeTruthy();
  });

  it('applies default badge class', () => {
    const { container } = render(<Badge label="Test" />);
    expect(container.querySelector('.badge')).toBeTruthy();
  });

  it('renders different variants', () => {
    const variants = ['cannabis', 'munchies', 'template'];
    variants.forEach((variant) => {
      const { container } = render(<Badge label={variant} variant={variant} />);
      expect(container.querySelector(`.badge-${variant}`)).toBeTruthy();
    });
  });
});
