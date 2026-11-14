
import { useState } from 'react';
import { loginUser } from '../../AppContext.jsx';
import './Login.css';

function GiftIcon({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M5 12v9h14v-9M12 8v13" />
      <path d="M12 8H8a3 3 0 1 1 3-3l1 3Z" />
      <path d="M12 8h4a3 3 0 1 0-3-3l-1 3Z" />
    </svg>
  );
}

export default function Login({
  onLoggedIn,
  onForgotPassword,
  onCreateAccount
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errorField, setErrorField] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setError('');
    setErrorField('');
    setSuccess('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      setErrorField(!email.trim() ? 'email' : 'password');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      setErrorField('email');
      return;
    }

    setLoading(true);

    try {
      const user = await loginUser(email.trim(), password);

      setSuccess('Logged in successfully!');
      if (onLoggedIn) onLoggedIn(user);
    } catch (err) {
      setError(err.message || 'Unable to log in.');
      setErrorField('password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="omnia-login-page">
      <div className="omnia-login-container">

        <div className="omnia-login-brand">
          <GiftIcon size={24} />
          <span>omnia</span>
        </div>

        <section className="omnia-login-banner">
          <div className="omnia-login-banner-top">
            <h1>A little wish.<br />A lot of joy.</h1>
            <GiftIcon size={30} />
          </div>
          <p>Good gifts begin with you.</p>
        </section>

        <section className="omnia-login-content">
          <h2>Welcome back</h2>
          <p className="omnia-login-subtitle">
            Log in to collect and share your wishes.
          </p>

          {error && (
            <div className="omnia-login-alert" role="alert">
              <span className="omnia-login-alert-icon">!</span>
              <div>
                <strong>{error}</strong>
                <p>
                  {error.includes('locked')
                    ? 'Please try again after 15 minutes.'
                    : error.includes('suspended')
                      ? 'Please contact support.'
                      : 'Check your details and try again.'}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} noValidate>
            <label htmlFor="login-email">
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              placeholder="elham@gmail.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              aria-invalid={errorField === 'email'}
              required
            />

            <label htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              aria-invalid={errorField === 'password'}
              required
            />

            <button
              type="button"
              className="omnia-login-forgot"
              onClick={onForgotPassword}
            >
              Forgot password?
            </button>

            {success && (
              <p className="omnia-login-success" role="status">
                {success}
              </p>
            )}

            <button
              type="submit"
              className="omnia-login-submit"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <button
            type="button"
            className="omnia-login-signup"
            onClick={onCreateAccount}
          >
            New here? Create an account
          </button>
        </section>
      </div>
    </main>
  );
}
