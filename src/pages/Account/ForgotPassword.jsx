
import { useState } from 'react';
import { requestPasswordReset } from '../../AppContext.jsx';
import './ForgotPassword.css';

export default function ForgotPassword({ onBack, onOpenReset }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleResetRequest(event) {
    event.preventDefault();
    setError('');
    setSuccess(false);

    // Check that the email is entered
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }

    // Check email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      await requestPasswordReset(email.trim());
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Unable to request password reset.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="omnia-forgot-page">
      <div className="omnia-forgot-container">

        {/* Back button */}
        <button
          type="button"
          className="omnia-forgot-back"
          onClick={onBack}
        >
          <span aria-hidden="true">‹</span>
          Back
        </button>

        {/* Email icon */}
        <div className="omnia-forgot-icon" aria-hidden="true">
          <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 7 9-7" />
          </svg>
        </div>

        <h1 className="omnia-forgot-title">
          Reset your password
        </h1>

        <p className="omnia-forgot-subtitle">
          Enter the email you signed up with and
          we’ll send you a reset link.
        </p>

        <form onSubmit={handleResetRequest} noValidate>
          <label htmlFor="forgot-email">
            Email address
          </label>

          <input
            id="forgot-email"
            type="email"
            placeholder="elham@gmail.com"
            autoComplete="email"
            value={email}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'forgot-email-error' : undefined}
            onChange={(event) => {
              setEmail(event.target.value);
              setError('');
              setSuccess(false);
            }}
          />

          {error && (
            <p
              id="forgot-email-error"
              className="omnia-forgot-error"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="omnia-forgot-submit"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        {/* Confirmation message */}
        {success && (
          <div
            className="omnia-forgot-success"
            role="status"
          >
            <span className="omnia-forgot-check" aria-hidden="true">
              ✓
            </span>

            <div>
              <strong>Check your email</strong>
              <p>
                If this email is registered, a reset link
                has been sent. The link expires in
                30 minutes.
              </p>
            </div>
          </div>
        )}


{success && (
  <button
    type="button"
    className="omnia-forgot-demo-link"
    onClick={onOpenReset}
  >
    Open reset page (demo)
  </button>
)}

      </div>
    </main>
  );
}
