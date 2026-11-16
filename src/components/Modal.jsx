import { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ open, title, onClose, children }) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    document.body.classList.add('is-locked');
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.classList.remove('is-locked');
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="modal__title">
          {title}
        </h2>
        {children}
      </div>
    </div>,
    document.body,
  );
}
