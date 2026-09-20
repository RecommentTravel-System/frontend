import { useState } from 'react';
import './Register.css';
import BrandLogo from '../components/BrandLogo.jsx';

export default function Register({
  onClose,
  onSubmit,
  onGoogle,
  onApple,
  onFacebook,
  onLogin,
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const runAction = async (action) => {
    if (pending) return;
    setError('');
    setPending(true);
    try { await action(); }
    catch (failure) { setError(failure.message || 'Không thể đăng ký. Vui lòng thử lại.'); }
    finally { setPending(false); }
  };

  const validate = () => {
    const nextErrors = {};

    if (!email.trim()) {
      nextErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (!password) {
      nextErrors.password = 'Password is required';
    } else if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validate()) {
      runAction(() => onSubmit({ email, password, confirmPassword }));
    }
  };

  return (
    <div className="login-page">
      <div className="login-card register-card">
        <div className="login-header">
          <h2>Log in or sign up</h2>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="login-divider-accent" />
        <div className="auth-brand"><BrandLogo /></div>
        <h1>Create your account</h1>
        <p className="auth-demo-note">Tạo tài khoản demo để trải nghiệm trên trình duyệt này.</p>
        <p role="alert" className="auth-feedback">{error}</p>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="field-group">
            <label htmlFor="register-email">Email address</label>
            <input
              id="register-email"
              autoComplete="username"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email address"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'register-email-error' : undefined}
            />
            {errors.email && <span id="register-email-error" className="field-error">{errors.email}</span>}
          </div>

          <div className="field-group">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              autoComplete="new-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'register-password-error' : undefined}
            />
            {errors.password && <span id="register-password-error" className="field-error">{errors.password}</span>}
          </div>

          <div className="field-group">
            <label htmlFor="register-confirm-password">Confirm password</label>
            <input
              id="register-confirm-password"
              autoComplete="new-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter your password"
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={errors.confirmPassword ? 'register-confirm-password-error' : undefined}
            />
            {errors.confirmPassword && (
              <span id="register-confirm-password-error" className="field-error">{errors.confirmPassword}</span>
            )}
          </div>

          <button type="submit" className="primary-btn" disabled={pending}>{pending ? 'Đang tạo tài khoản…' : 'Create account'}</button>
        </form>

        <div className="social-divider">
          <span className="line" />
          <span className="text">or sign up with</span>
          <span className="line" />
        </div>

        <div className="social-list">
          <SocialButton onClick={() => runAction(onGoogle)} icon={<GoogleIcon />} label="Continue with Google" />
          <SocialButton onClick={() => runAction(onApple)} icon={<AppleIcon />} label="Continue with Apple" />
          <SocialButton onClick={() => runAction(onFacebook)} icon={<FacebookIcon />} label="Continue with Facebook" />
        </div>

        <p className="signup-text">Already have an account?</p>
        <button type="button" className="link-btn" onClick={onLogin}>Log in</button>
      </div>
    </div>
  );
}

function SocialButton({ onClick, icon, label }) {
  return <button type="button" className="social-btn" onClick={onClick}>{icon}{label}</button>;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.9v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.9A9 9 0 0 0 0 9c0 1.45.35 2.83.9 4.03l3.05-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .9 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z" />
    </svg>
  );
}

function AppleIcon() {
  return <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden="true"><path fill="currentColor" d="M13.2 9.55c-.02-1.88 1.53-2.78 1.6-2.83-.88-1.28-2.24-1.46-2.73-1.48-1.16-.12-2.27.68-2.86.68-.6 0-1.5-.66-2.46-.65-1.27.02-2.44.74-3.09 1.87-1.32 2.28-.34 5.66.94 7.52.63.9 1.37 1.92 2.35 1.88.94-.04 1.3-.6 2.44-.6 1.13 0 1.46.6 2.46.58 1.02-.02 1.66-.92 2.28-1.83a7.6 7.6 0 0 0 1.03-2.1c-.03-.01-1.94-.75-1.96-2.96zM11.4 3.9c.52-.63.87-1.5.77-2.38-.75.03-1.66.5-2.19 1.12-.48.55-.9 1.45-.79 2.3.83.06 1.68-.42 2.21-1.04z" /></svg>;
}

function FacebookIcon() {
  return <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="9" fill="#1877F2" /><path fill="#fff" d="M11.2 9.3h-1.4v5.4H7.7V9.3H6.6V7.5h1.1V6.3c0-1.05.5-2.7 2.7-2.7h1.98v1.75h-1.44c-.24 0-.56.12-.56.63v1h2.02l-.2 1.79z" /></svg>;
}
