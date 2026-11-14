
import { useState } from 'react';
import { registerUser } from '../../AppContext.jsx';
import './SignUp.css';

export default function SignUp({ onRegistered, onLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function validateForm() {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required.';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (
      password.length < 8 ||
      !/[a-zA-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      newErrors.password =
        'Use at least 8 characters with a letter and a number.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match.";
    }

    return newErrors;
  }

  function clearError(field) {
    setErrors((previous) => ({
      ...previous,
      [field]: ''
    }));
  }

  async function handleSignUp(event) {
    event.preventDefault();
    setMessage('');

    const formErrors = validateForm();
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const user = await registerUser({
        name,
        email,
        password,
        confirmPassword
      });

      setMessage('Account created successfully!');

      // The parent page will handle navigation
      if (onRegistered) {
        onRegistered(user);
      }
    } catch (error) {
      if (error.message.includes('already registered')) {
        setErrors({
          email: 'This email is already registered. Log in instead?'
        });
      } else {
        setMessage(error.message || 'Unable to create account.');
      }

      // Keep name and email, but clear passwords
      setPassword('');
      setConfirmPassword('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="omnia-signup-page">
      <div className="omnia-signup-container">

        <div className="omnia-signup-brand">
          <svg
            width="25"
            height="25"
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
          <span>omnia</span>
        </div>

        <h1 className="omnia-signup-title">
          Create your account
        </h1>

        <p className="omnia-signup-subtitle">
          Make a wishlist and share it in minutes.
        </p>

        <form onSubmit={handleSignUp} noValidate>
          <div className="omnia-signup-field">
            <label htmlFor="signup-name">Full name</label>
            <input
              id="signup-name"
              type="text"
              value={name}
              placeholder="Elham Moafa"
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'signup-name-error' : undefined}
              onChange={(event) => {
                setName(event.target.value);
                clearError('name');
              }}
            />
            {errors.name && (
              <p id="signup-name-error" className="omnia-signup-error">
                {errors.name}
              </p>
            )}
          </div>

          <div className="omnia-signup-field">
            <label htmlFor="signup-email">Email address</label>
            <input
              id="signup-email"
              type="email"
              value={email}
              placeholder="elham@gmail.com"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'signup-email-error' : undefined}
              onChange={(event) => {
                setEmail(event.target.value);
                clearError('email');
              }}
            />
            {errors.email && (
              <p id="signup-email-error" className="omnia-signup-error">
                {errors.email}
              </p>
            )}
          </div>

          <div className="omnia-signup-field">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              value={password}
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby="signup-password-help signup-password-error"
              onChange={(event) => {
                setPassword(event.target.value);
                clearError('password');
              }}
            />

            <p id="signup-password-help" className="omnia-signup-help">
              At least 8 characters, with a letter and a number
            </p>

            {errors.password && (
              <p id="signup-password-error" className="omnia-signup-error">
                {errors.password}
              </p>
            )}
          </div>

          <div className="omnia-signup-field">
            <label htmlFor="signup-confirm">Confirm password</label>
            <input
              id="signup-confirm"
              type="password"
              value={confirmPassword}
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={
                errors.confirmPassword
                  ? 'signup-confirm-error'
                  : undefined
              }
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                clearError('confirmPassword');
              }}
            />

            {errors.confirmPassword && (
              <p id="signup-confirm-error" className="omnia-signup-error">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {message && (
            <p className="omnia-signup-message" role="status">
              {message}
            </p>
          )}

          <button
            type="submit"
            className="omnia-signup-submit"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <button
          type="button"
          className="omnia-signup-login"
          onClick={onLogin}
        >
          Already have an account? Log in
        </button>

      </div>
    </main>
  );
}
