export function Modal({ title, onClose, children, className = '' }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${className}`}>
        <button className="modal-close" onClick={onClose}>×</button>
        {title && <div className="modal-title">{title}</div>}
        {children}
      </div>
    </div>
  );
}

export function ConfirmModal({ title, message, warning, onConfirm, onCancel, confirmLabel = 'Confirm', confirmClass = 'btn btn-danger' }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal confirm-modal">
        <button className="modal-close" onClick={onCancel}>×</button>
        <div className="modal-title">{title}</div>
        {warning && <div className="confirm-warning">⚠ {warning}</div>}
        <div className="confirm-message">{message}</div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className={confirmClass} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
