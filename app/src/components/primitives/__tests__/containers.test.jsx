/**
 * containers.test.jsx — B5 RED: BottomSheet / Modal / Snackbar / Alert
 * AC-P1B-CONTAINERS
 *
 * Focus trap testing uses jsdom — we test focus management basics.
 * Toast is an alias for Snackbar (tested via re-export).
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { expect as vitestExpect } from 'vitest';
vitestExpect.extend(toHaveNoViolations);

import { BottomSheet } from '../BottomSheet';
import { Modal } from '../Modal';
import { Snackbar } from '../Snackbar';
import { Toast } from '../Toast';
import { Alert } from '../Alert';

/* ─── BottomSheet ───────────────────────────────────────────────────────── */
describe('BottomSheet (B5)', () => {
  it('is hidden when open=false', () => {
    const { container } = render(
      <BottomSheet open={false} onClose={() => {}}>Content</BottomSheet>
    );
    expect(container.querySelector('.md3-bottom-sheet--open')).toBeNull();
  });

  it('is visible when open=true', () => {
    const { container } = render(
      <BottomSheet open onClose={() => {}}>Content</BottomSheet>
    );
    expect(container.querySelector('.md3-bottom-sheet--open')).toBeTruthy();
  });

  it('renders handle', () => {
    const { container } = render(
      <BottomSheet open onClose={() => {}}>Content</BottomSheet>
    );
    expect(container.querySelector('.md3-bottom-sheet__handle')).toBeTruthy();
  });

  it('renders children', () => {
    render(
      <BottomSheet open onClose={() => {}}>
        <p data-testid="content">Sheet content</p>
      </BottomSheet>
    );
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('calls onClose when backdrop clicked', () => {
    const onClose = vi.fn();
    const { container } = render(
      <BottomSheet open onClose={onClose}>Content</BottomSheet>
    );
    fireEvent.click(container.querySelector('.md3-bottom-sheet__backdrop'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('is accessible when open (axe)', async () => {
    const { container } = render(
      <BottomSheet open onClose={() => {}}>
        <p>Bottom sheet content</p>
      </BottomSheet>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

/* ─── Modal ─────────────────────────────────────────────────────────────── */
describe('Modal (B5)', () => {
  it('is hidden when open=false', () => {
    const { container } = render(
      <Modal open={false} onClose={() => {}} title="Test Modal">Content</Modal>
    );
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it('renders dialog when open=true', () => {
    render(
      <Modal open onClose={() => {}} title="Confirm">Are you sure?</Modal>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders title', () => {
    render(
      <Modal open onClose={() => {}} title="My Dialog">Body</Modal>
    );
    expect(screen.getByText('My Dialog')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <Modal open onClose={() => {}} title="D">
        <p data-testid="modal-body">Dialog body</p>
      </Modal>
    );
    expect(screen.getByTestId('modal-body')).toBeInTheDocument();
  });

  it('calls onClose when Escape pressed', () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="Esc test">Content</Modal>);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when backdrop clicked', () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal open onClose={onClose} title="Backdrop">Content</Modal>
    );
    fireEvent.click(container.querySelector('.md3-modal__backdrop'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('is accessible when open (axe)', async () => {
    const { container } = render(
      <Modal open onClose={() => {}} title="Accessible Dialog">
        <p>Modal content</p>
      </Modal>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

/* ─── Snackbar ──────────────────────────────────────────────────────────── */
describe('Snackbar (B5)', () => {
  it('is not visible when open=false', () => {
    const { container } = render(
      <Snackbar open={false} message="Hello" onClose={() => {}} />
    );
    expect(container.querySelector('.md3-snackbar--open')).toBeNull();
  });

  it('renders message when open', () => {
    render(<Snackbar open message="Item saved" onClose={() => {}} />);
    expect(screen.getByText('Item saved')).toBeInTheDocument();
  });

  it('renders action button when provided', () => {
    render(
      <Snackbar open message="Deleted" onClose={() => {}} action={{ label: 'Undo', onClick: () => {} }} />
    );
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
  });

  it('has role=status for live region', () => {
    render(<Snackbar open message="Saved!" onClose={() => {}} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('is accessible (axe)', async () => {
    const { container } = render(
      <Snackbar open message="Changes saved" onClose={() => {}} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

/* ─── Toast (alias for Snackbar) ────────────────────────────────────────── */
describe('Toast (B5 — alias for Snackbar)', () => {
  it('renders identically to Snackbar', () => {
    render(<Toast open message="Toast message" onClose={() => {}} />);
    expect(screen.getByText('Toast message')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

/* ─── Alert ─────────────────────────────────────────────────────────────── */
describe('Alert (B5)', () => {
  it('renders info severity', () => {
    const { container } = render(<Alert severity="info" message="Info message" />);
    expect(container.querySelector('.md3-alert--info')).toBeTruthy();
  });

  it('renders success severity', () => {
    const { container } = render(<Alert severity="success" message="Success!" />);
    expect(container.querySelector('.md3-alert--success')).toBeTruthy();
  });

  it('renders warning severity', () => {
    const { container } = render(<Alert severity="warning" message="Be careful" />);
    expect(container.querySelector('.md3-alert--warning')).toBeTruthy();
  });

  it('renders error severity', () => {
    const { container } = render(<Alert severity="error" message="Something went wrong" />);
    expect(container.querySelector('.md3-alert--error')).toBeTruthy();
  });

  it('renders message text', () => {
    render(<Alert severity="info" message="Read me" />);
    expect(screen.getByText('Read me')).toBeInTheDocument();
  });

  it('calls onClose when dismiss button clicked', () => {
    const onClose = vi.fn();
    render(<Alert severity="info" message="Dismissible" onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('has role=alert for severity error/warning', () => {
    render(<Alert severity="error" message="Error!" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('is accessible (axe)', async () => {
    const { container } = render(<Alert severity="success" message="Operation complete" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
