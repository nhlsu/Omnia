
import { useState } from 'react';
import { resetPassword } from '../../AppContext.jsx';
import './ResetPassword.css';

export default function ResetPassword({
  token,
  onBack,
  onLogin,
  onRequestNewLink
}) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [expired, setExpired] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setErrors({});
    setMessage('');

    const newErrors = {};

    if (!password) {
      newErrors.password = 'New password is required.';
    } else if (
      password.length < 8 ||
      !/[a-zA-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      newErrors.password =
        'Use at least 8 characters, with a letter and a number.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Use a URL token when available.
    // For the front-end demo, use the locally saved token.
    const resetToken =
      token ||
      new URLSearchParams(window.location.search).get('token') ||
      sessionStorage.getItem('omnia_demo_reset_token');

    if (!resetToken) {
      setExpired(true);
      return;
    }

    setLoading(true);

    try {
      await resetPassword(resetToken, password);
      setSuccess(true);
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      if (error.message?.includes('expired')) {
        setExpired(true);
      } else {
        setMessage(error.message || 'Unable to reset password.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="omnia-reset-page">
      <div className="omnia-reset-container">

        <button
          type="button"
          className="omnia-reset-back"
          onClick={onBack}
        >
          <span aria-hidden="true">‹</span>
          Back
        </button>

        {success ? (
          <section className="omnia-reset-result" role="status">
            <div className="omnia-reset-success-icon" aria-hidden="true">
              ✓
            </div>

            <h1>Password updated!</h1>
            <p>
              Your password has been reset successfully.
              You can now log in with your new password.
            </p>

            <button
              type="button"
              className="omnia-reset-submit"
              onClick={onLogin}
            >
              Back to Log in
            </button>
          </section>
        ) : expired ? (
          <section className="omnia-reset-result">
            <h1>Set a new password</h1>

            <div className="omnia-reset-expired" role="alert">
              <span className="omnia-reset-alert-icon" aria-hidden="true">
                !
              </span>

              <div>
                <strong>This link has expired</strong>
                <p>
                  Reset links last 30 minutes and work once.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="omnia-reset-outline"
              onClick={onRequestNewLink}
            >
              Request a new link
            </button>
          </section>
        ) : (
          <>
            <h1 className="omnia-reset-title">
              Set a new password
            </h1>

            <p className="omnia-reset-subtitle">
              Choose a password you haven't used before.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="omnia-reset-field">
                <label htmlFor="reset-password">
                  New password
                </label>

                <input
                  id="reset-password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={password}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby="reset-password-help reset-password-error"
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                />

                <p
                  id="reset-password-help"
                  className="omnia-reset-help"
                >
                  At least 8 characters, with a letter and a number
                </p>

                {errors.password && (
                  <p
                    id="reset-password-error"
                    className="omnia-reset-error"
                    role="alert"
                  >
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="omnia-reset-field">
                <label htmlFor="reset-confirm">
                  Confirm new password
                </label>

                <input
                  id="reset-confirm"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={confirmPassword}
                  aria-invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={
                    errors.confirmPassword
                      ? 'reset-confirm-error'
                      : undefined
                  }
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      confirmPassword: ''
                    }));
                  }}
                />

                {errors.confirmPassword && (
                  <p
                    id="reset-confirm-error"
                    className="omnia-reset-error"
                    role="alert"
                  >
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {message && (
                <p className="omnia-reset-error" role="alert">
                  {message}
                </p>
              )}

              <button
                type="submit"
                className="omnia-reset-submit"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save password'}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
