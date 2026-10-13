import { useState, useRef, useEffect } from 'react';
import './Register.css';
import BrandLogo from '../components/BrandLogo.jsx';
import { signupApi, verifyEmailApi, resendOtpApi } from '~/features/auth/services/auth-api';
import { getLocalizedErrorMessage } from '~/shared/lib/error-codes';
import { useTranslation } from '~/providers/i18n-provider';

export default function Register({
  onClose,
  onSubmit,
  onGoogle,
  onLogin,
}) {
  const { t } = useTranslation();
  const [step, setStep] = useState('register'); // 'register' | 'otp'
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [pending, setPending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const otpInputsRef = useRef([]);

  // Cooldown countdown timer for Resend OTP
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Focus first OTP input when transitioning to OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  const validateRegister = () => {
    const nextErrors = {};
    const trimmedEmail = email.trim();

    if (!firstName.trim()) {
      nextErrors.firstName = t('auth.firstNameRequired', 'Vui lòng nhập tên');
    }

    if (!lastName.trim()) {
      nextErrors.lastName = t('auth.lastNameRequired', 'Vui lòng nhập họ');
    }

    if (!trimmedEmail) {
      nextErrors.email = t('auth.emailRequired', 'Vui lòng nhập địa chỉ email');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = t('auth.emailInvalid', 'Địa chỉ email không đúng định dạng');
    }

    if (!password) {
      nextErrors.password = t('auth.passwordRequired', 'Vui lòng nhập mật khẩu');
    } else if (password.length < 6) {
      nextErrors.password = t('auth.passwordTooShort', 'Mật khẩu phải có ít nhất 6 ký tự');
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = t('auth.confirmPasswordRequired', 'Vui lòng xác nhận mật khẩu');
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = t('auth.passwordMismatch', 'Mật khẩu xác nhận không khớp');
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    if (pending) return;
    if (!validateRegister()) return;

    setError('');
    setInfoMessage('');
    setPending(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      await signupApi({
        email: normalizedEmail,
        password,
        fullName,
        phone: phone.trim(),
      });

      setStep('otp');
      setOtp(['', '', '', '', '', '']);
      setResendCooldown(60);
      setInfoMessage(
        t('auth.otpSentTo', { email: normalizedEmail }) ||
        `Mã xác thực 6 chữ số đã được gửi tới ${normalizedEmail}`
      );
    } catch (err) {
      setError(
        getLocalizedErrorMessage(err) ||
        err?.response?.message ||
        err?.message
      );
    } finally {
      setPending(false);
    }
  };

  const handleOtpChange = (index, value) => {
    // Only accept numeric digits
    const cleanVal = value.replace(/\D/g, '');
    if (!cleanVal) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    const digit = cleanVal.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input box
    if (index < 5 && digit) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        otpInputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      otpInputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (!pastedData) return;

    const digits = pastedData.slice(0, 6).split('');
    const newOtp = [...otp];
    digits.forEach((digit, idx) => {
      newOtp[idx] = digit;
    });
    setOtp(newOtp);

    // Focus the next empty box or the last box
    const nextEmptyIndex = newOtp.findIndex((d) => !d);
    if (nextEmptyIndex !== -1) {
      otpInputsRef.current[nextEmptyIndex]?.focus();
    } else {
      otpInputsRef.current[5]?.focus();
    }
  };

  const handleOtpSubmit = async (event) => {
    event.preventDefault();
    if (pending) return;

    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setError('Vui lòng nhập đủ 6 chữ số mã OTP');
      return;
    }

    setError('');
    setInfoMessage('');
    setPending(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      await verifyEmailApi({
        email: normalizedEmail,
        otp: otpCode,
      });

      setShowSuccessModal(true);
    } catch (err) {
      setError(
        getLocalizedErrorMessage(err) ||
        err?.response?.message ||
        err?.message
      );
    } finally {
      setPending(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || pending) return;

    setError('');
    setInfoMessage('');
    setPending(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      await resendOtpApi(normalizedEmail);
      setResendCooldown(60);
      setInfoMessage(`Đã gửi lại mã xác thực tới ${normalizedEmail}`);
    } catch (err) {
      setError(
        getLocalizedErrorMessage(err) ||
        err?.response?.message ||
        err?.message
      );
    } finally {
      setPending(false);
    }
  };

  const handleSuccessRedirect = () => {
    setShowSuccessModal(false);
    if (onSubmit) {
      onSubmit({ email: email.trim().toLowerCase(), verified: true });
    } else if (onLogin) {
      onLogin();
    }
  };

  return (
    <div className="login-page">
      <div className="login-card register-card">
        <div className="login-header">
          <h2>{t('auth.registerTitle', 'Đăng ký tài khoản')}</h2>
          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="login-divider-accent" />
        <div className="auth-brand">
          <BrandLogo />
        </div>

        {step === 'register' ? (
          <>
            <h1>{t('auth.createAccountTitle', 'Tạo tài khoản Wayvee')}</h1>
            <p className="auth-note">
              {t('auth.registerNote', 'Đăng ký tài khoản để bắt đầu trải nghiệm và lên lịch trình du lịch cùng Wayvee.')}
            </p>

            {error && <p role="alert" className="auth-feedback auth-error">{error}</p>}

            <form onSubmit={handleRegisterSubmit} className="login-form" noValidate>
              <div className="field-group-row">
                <div className="field-group">
                  <label htmlFor="register-first-name">{t('auth.firstNameLabel', 'Tên')}</label>
                  <input
                    id="register-first-name"
                    autoComplete="given-name"
                    type="text"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder={t('auth.firstNamePlaceholder', 'Nhập tên')}
                    aria-invalid={Boolean(errors.firstName)}
                    aria-describedby={errors.firstName ? 'register-first-name-error' : undefined}
                  />
                  {errors.firstName && (
                    <span id="register-first-name-error" className="field-error">
                      {errors.firstName}
                    </span>
                  )}
                </div>
                <div className="field-group">
                  <label htmlFor="register-last-name">{t('auth.lastNameLabel', 'Họ')}</label>
                  <input
                    id="register-last-name"
                    autoComplete="family-name"
                    type="text"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    placeholder={t('auth.lastNamePlaceholder', 'Nhập họ')}
                    aria-invalid={Boolean(errors.lastName)}
                    aria-describedby={errors.lastName ? 'register-last-name-error' : undefined}
                  />
                  {errors.lastName && (
                    <span id="register-last-name-error" className="field-error">
                      {errors.lastName}
                    </span>
                  )}
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="register-email">{t('auth.emailLabel', 'Địa chỉ Email')}</label>
                <input
                  id="register-email"
                  autoComplete="username"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t('auth.emailPlaceholder', 'Nhập địa chỉ email của bạn')}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'register-email-error' : undefined}
                />
                {errors.email && (
                  <span id="register-email-error" className="field-error">
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="register-phone">{t('auth.phoneLabel', 'Số điện thoại (tùy chọn)')}</label>
                <input
                  id="register-phone"
                  autoComplete="tel"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder={t('auth.phonePlaceholder', 'Nhập số điện thoại')}
                />
              </div>

              <div className="field-group">
                <label htmlFor="register-password">{t('auth.passwordLabel', 'Mật khẩu')}</label>
                <div className="password-input-wrapper">
                  <input
                    id="register-password"
                    autoComplete="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={t('auth.passwordMinLength', 'Tối thiểu 6 ký tự')}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? 'register-password-error' : undefined}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    tabIndex="-1"
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                        <line x1="3" y1="3" x2="21" y2="21" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <span id="register-password-error" className="field-error">
                    {errors.password}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="register-confirm-password">{t('auth.confirmPasswordLabel', 'Xác nhận mật khẩu')}</label>
                <div className="password-input-wrapper">
                  <input
                    id="register-confirm-password"
                    autoComplete="new-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder={t('auth.confirmPasswordPlaceholder', 'Nhập lại mật khẩu')}
                    aria-invalid={Boolean(errors.confirmPassword)}
                    aria-describedby={errors.confirmPassword ? 'register-confirm-password-error' : undefined}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                        <line x1="3" y1="3" x2="21" y2="21" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span id="register-confirm-password-error" className="field-error">
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="primary-btn"
                disabled={pending}
              >
                {pending ? (
                  <span className="btn-loading-content">
                    <span className="spinner" />
                    {t('auth.processing', 'Đang xử lý...')}
                  </span>
                ) : (
                  t('auth.createAccountButton', 'Tạo tài khoản')
                )}
              </button>
            </form>

            <div className="social-divider">
              <span className="line" />
              <span className="text">{t('auth.or', 'hoặc')}</span>
              <span className="line" />
            </div>

            <div className="social-list">
              <SocialButton
                onClick={() => {
                  if (onGoogle) onGoogle();
                }}
                icon={<GoogleIcon />}
                label={t('auth.continueWithGoogle', 'Tiếp tục với Google')}
              />
            </div>

            <p className="signup-text">{t('auth.alreadyHaveAccount', 'Đã có tài khoản?')}</p>
            <button type="button" className="link-btn" onClick={onLogin}>
              {t('auth.logIn', 'Đăng nhập')}
            </button>
          </>
        ) : (
          <>
            <h1>Nhập mã xác thực OTP</h1>
            <p className="auth-note">
              Mã xác thực gồm 6 chữ số đã được gửi đến email <strong>{email}</strong>. Vui lòng nhập mã để hoàn tất đăng ký.
            </p>

            {error && <p role="alert" className="auth-feedback auth-error">{error}</p>}
            {infoMessage && <p role="status" className="auth-feedback auth-info">{infoMessage}</p>}

            <form onSubmit={handleOtpSubmit} className="login-form otp-form" noValidate>
              <div className="otp-container">
                <div className="otp-boxes-row" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputsRef.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className={`otp-digit-box ${digit ? 'is-filled' : ''}`}
                      aria-label={`Digit ${idx + 1}`}
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="primary-btn"
                disabled={pending || otp.join('').length < 6}
              >
                {pending ? (
                  <span className="btn-loading-content">
                    <span className="spinner" />
                    Đang xác thực…
                  </span>
                ) : (
                  'Xác nhận & Kích hoạt'
                )}
              </button>

              <div className="otp-actions">
                <button
                  type="button"
                  className="resend-otp-btn"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || pending}
                >
                  {resendCooldown > 0
                    ? `Gửi lại mã sau ${resendCooldown}s`
                    : 'Không nhận được mã? Gửi lại OTP'}
                </button>

                <button
                  type="button"
                  className="back-btn"
                  onClick={() => {
                    setStep('register');
                    setError('');
                    setInfoMessage('');
                  }}
                >
                  ← Đổi email khác
                </button>
              </div>
            </form>

            <p className="signup-text">{t('auth.alreadyHaveAccount', 'Đã có tài khoản?')}</p>
            <button type="button" className="link-btn" onClick={onLogin}>
              {t('auth.logIn', 'Đăng nhập')}
            </button>
          </>
        )}
      </div>

      {/* Success Popup Modal */}
      {showSuccessModal && (
        <div className="auth-modal-backdrop animate-fade-in">
          <div className="auth-success-modal animate-scale-up" role="dialog" aria-modal="true">
            <div className="success-icon-wrapper">
              <svg className="success-checkmark" viewBox="0 0 52 52">
                <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>

            <h2>Đăng ký thành công!</h2>
            <p>
              Tài khoản của bạn đã được kích hoạt thành công. Vui lòng đăng nhập để bắt đầu trải nghiệm các tính năng tuyệt vời của Wayvee.
            </p>

            <button
              type="button"
              className="primary-btn success-btn"
              onClick={handleSuccessRedirect}
              autoFocus
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>
      )}
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
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
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
