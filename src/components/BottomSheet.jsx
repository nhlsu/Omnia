
import { useEffect, useId, useRef } from 'react';
import './BottomSheet.css';

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  footer
}) {
  const dialogRef = useRef(null);
  const titleId = useId();

  // Open or close the sheet
  useEffect(() => {
    const dialog = dialogRef.current;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Close when clicking outside the sheet
  function handleBackdropClick(event) {
    if (event.target !== dialogRef.current) return;

    const rect = dialogRef.current.getBoundingClientRect();

    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      onClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="omnia-bottom-sheet"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={handleBackdropClick}
    >
      <div className="omnia-bottom-sheet__header">
        <h2 id={titleId}>{title}</h2>

        <button
          type="button"
          className="omnia-bottom-sheet__close"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
      </div>

      <div className="omnia-bottom-sheet__content">
        {children}
      </div>

      {footer && (
        <div className="omnia-bottom-sheet__footer">
          {footer}
        </div>
      )}
    </dialog>
  );
}
