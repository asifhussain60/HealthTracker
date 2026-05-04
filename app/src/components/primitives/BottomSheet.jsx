/**
 * BottomSheet.jsx — MD3 BottomSheet primitive
 * AC-P1B-CONTAINERS
 *
 * Props: open, onClose, children
 * Features: handle bar, backdrop click closes, slide-from-bottom
 *
 * All colours via CSS variables — no hex in JSX.
 */
import { useEffect, useRef } from 'react';

export function BottomSheet({ open, onClose, children, className = '' }) {
  const sheetRef = useRef(null);

  // Escape key closes
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const classes = [
    'md3-bottom-sheet',
    open ? 'md3-bottom-sheet--open' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} aria-hidden={!open}>
      {/* Backdrop */}
      <div
        className="md3-bottom-sheet__backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Sheet panel */}
      <div
        ref={sheetRef}
        className="md3-bottom-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Bottom sheet"
      >
        <div className="md3-bottom-sheet__handle" aria-hidden="true" />
        <div className="md3-bottom-sheet__content">{children}</div>
      </div>
    </div>
  );
}
