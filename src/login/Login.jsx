import { useState } from 'react';
import './Login.css';
import FormCard from '../components/FormCard.jsx';
import BrandLogo from '../components/BrandLogo.jsx';

export default function Login({
  onClose,
  onSubmit,
  onGoogle,
  onSignUp,
  message,
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const runAction = async (action) => {
    if (pending) return;
    setError('');
    setPending(true);
    try {
      await action();
    } catch (failure) {
      setError(
        failure?.response?.message ||
        failure?.message ||
        'Không thể đăng nhập. Vui lòng kiểm tra lại thông tin.'
      );
    } finally {
      setPending(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }
    runAction(() => onSubmit({ email: email.trim().toLowerCase(), password }));
  };

  return (
    <div className="login-page">
      <FormCard title="Log in or sign up" onClose={onClose}>
        <div className="auth-brand">
          <BrandLogo />
        </div>
        <h1>Welcome to Wayvee</h1>
        <p className="auth-note">
          Đăng nhập để khám phá các địa điểm và quản lý lịch trình của bạn.
        </p>

        {message && (
          <p role="status" className="auth-feedback auth-info">
            {message}
          </p>
        )}
        {error && (
          <p role="alert" className="auth-feedback auth-error">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="field-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="primary-btn" disabled={pending}>
            {pending ? (
              <span className="btn-loading-content">
                <span className="spinner" />
                Đang đăng nhập…
              </span>
            ) : (
              'Continue'
            )}
          </button>
        </form>

        <div className="social-divider">
          <span className="line" />
          <span className="text">or</span>
          <span className="line" />
        </div>

        <div className="social-list">
          <SocialButton
            onClick={() => {
              if (onGoogle) runAction(onGoogle);
            }}
            icon={<GoogleIcon />}
            label="Continue with Google"
          />
        </div>

        <p className="signup-text">Don't have account yet</p>
        <button type="button" className="link-btn" onClick={onSignUp}>
          Sign up
        </button>
      </FormCard>
    </div>
  );
}

function SocialButton({ onClick, icon, label }) {
  return (
    <button type="button" className="social-btn" onClick={onClick}>
      {icon}
      {label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.9v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.9A9 9 0 0 0 0 9c0 1.45.35 2.83.9 4.03l3.05-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .9 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z"
      />
    </svg>
  );
}
