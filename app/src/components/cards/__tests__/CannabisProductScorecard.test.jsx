/**
 * CannabisProductScorecard.test.jsx — AC-P0-C8
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CannabisProductScorecard } from '../CannabisProductScorecard';

const mockInventory = [
  {
    id: 'prod-1', name: 'Test Flower', brand: 'Test Brand',
    userId: 'me', deletedAt: null,
  },
  {
    id: 'prod-2', name: 'Test Oil', brand: 'Other Brand',
    userId: 'me', deletedAt: null,
  },
];

const mockLogs = [
  { id: 'log-1', productId: 'prod-1', medicalBenefit: 8, munchiesLevel: 2, productivityScore: 9, wouldUseAgain: 'Yes', userId: 'me', deletedAt: null },
  { id: 'log-2', productId: 'prod-1', medicalBenefit: 7, munchiesLevel: 3, productivityScore: 8, wouldUseAgain: 'Yes', userId: 'me', deletedAt: null },
  { id: 'log-3', productId: 'prod-1', medicalBenefit: 9, munchiesLevel: 2, productivityScore: 9, wouldUseAgain: 'Yes', userId: 'me', deletedAt: null },
];

describe('CannabisProductScorecard', () => {
  it('renders without crashing (smoke)', () => {
    const { container } = render(
      <CannabisProductScorecard inventory={mockInventory} cannabisLogs={[]} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('shows Product Scorecard heading', () => {
    render(<CannabisProductScorecard inventory={mockInventory} cannabisLogs={[]} />);
    expect(screen.getByText(/product scorecard/i)).toBeInTheDocument();
  });

  it('renders product names from inventory', () => {
    render(<CannabisProductScorecard inventory={mockInventory} cannabisLogs={[]} />);
    expect(screen.getByText('Test Flower')).toBeInTheDocument();
    expect(screen.getByText('Test Oil')).toBeInTheDocument();
  });

  it('shows verdict Keep for a well-rated product (≥3 sessions)', () => {
    render(
      <CannabisProductScorecard inventory={mockInventory} cannabisLogs={mockLogs} />
    );
    // Keep = medical benefit ≥7 AND productivity ≥7 AND munchies ≤4
    expect(screen.getByText(/✓ Keep/)).toBeInTheDocument();
  });

  it('shows No data verdict when no logs for a product', () => {
    render(
      <CannabisProductScorecard inventory={mockInventory} cannabisLogs={[]} />
    );
    // Both products have no data
    const noCells = screen.getAllByText('No data');
    expect(noCells.length).toBeGreaterThan(0);
  });

  it('accepts inventory and cannabisLogs as props (no store reads)', () => {
    // Render with empty props — should not throw
    expect(() => {
      render(<CannabisProductScorecard inventory={[]} cannabisLogs={[]} />);
    }).not.toThrow();
  });
});
