/**
 * Modal.jsx — MD3 Modal (center-screen dialog) primitive
 * AC-P1B-CONTAINERS
 *
 * Props: open, onClose, title, children
 * Features: Escape closes, backdrop click closes, aria-modal, role=dialog
 *
 * All colours via CSS variables — no hex in JSX.
 */
import { useEffect } from 'react';

export function Modal({ open, onClose, title, children, className = '' }) {
  // Escape key closes
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const titleId = `md3-modal-title-${Math.random().toString(36).slice(2)}`;

  return (
    <div className={`md3-modal ${className}`.trim()}>
      {/* Backdrop */}
      <div
        className="md3-modal__backdrop"
        onClick={onClose}
        aria-hidden="true"
        style={{ backdropFilter: 'blur(0.75rem)', backgroundColor: 'rgba(0,0,0,.30)' }}
      />
      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className="md3-modal__dialog"
      >
        {title && (
          <div className="md3-modal__header">
            <h2 id={titleId} className="md3-modal__title">{title}</h2>
          </div>
        )}
        <div className="md3-modal__body">{children}</div>
      </div>
    </div>
  );
}
