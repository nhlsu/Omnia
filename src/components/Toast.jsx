
import { useEffect } from 'react';
import './Toast.css';

export default function Toast({
  message,
  variant = 'success',
  onClose,
  duration = 4000
}) {
  // Close the notification after a few seconds
  useEffect(() => {
    if (!message || !onClose || duration <= 0) return;

    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  if (!message) return null;

  return (
    <div
      className={`omnia-toast omnia-toast--${variant}`}
      role={variant === 'danger' ? 'alert' : 'status'}
    >
      <span>{message}</span>

      {onClose && (
        <button
          type="button"
          className="omnia-toast__close"
          onClick={onClose}
          aria-label="Close notification"
        >
          &times;
        </button>
      )}
    </div>
  );
}
