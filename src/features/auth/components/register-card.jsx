import { useState, useRef, useEffect } from "react";
import { useAuth } from "~/providers/auth-provider";
import { useTranslation } from "~/providers/i18n-provider";
import { resendOtpApi } from "~/features/auth/services/auth-api";

export function RegisterCard({ onClose, onSubmit, onLogin }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: ""
  });
  const [step, setStep] = useState("register"); // "register" | "otp"
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const otpInputsRef = useRef([]);
  const { signup, verifyEmail } = useAuth();

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError(t("auth.passwordMismatch") || "Mật khẩu xác nhận không khớp.");
      return;
    }

    if (formData.password.length < 6) {
      setError(t("auth.passwordTooShort") || "Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setLoading(true);
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      await signup({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        fullName,
        phone: formData.phone
      });

      setLoading(false);
      setStep("otp");
      setOtp(["", "", "", "", "", ""]);
      setResendCooldown(60);
      setInfoMessage(
        t("auth.otpSentTo", { email: formData.email }) ||
        `Mã OTP kích hoạt đã được gửi tới email ${formData.email}`
      );
    } catch (err) {
      setLoading(false);
      setError(
        err?.response?.message ||
        err?.message ||
        t("auth.registerFailed") ||
        "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin."
      );
    }
  };

  const handleOtpChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, "");
    if (!cleanVal) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    const digit = cleanVal.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (index < 5 && digit) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        otpInputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      otpInputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().replace(/\D/g, "");
    if (!pastedData) return;

    const digits = pastedData.slice(0, 6).split("");
    const newOtp = [...otp];
    digits.forEach((digit, idx) => {
      newOtp[idx] = digit;
    });
    setOtp(newOtp);

    const nextEmptyIndex = newOtp.findIndex((d) => !d);
    if (nextEmptyIndex !== -1) {
      otpInputsRef.current[nextEmptyIndex]?.focus();
    } else {
      otpInputsRef.current[5]?.focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setError("Vui lòng nhập đủ 6 chữ số mã OTP");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await verifyEmail({
        email: formData.email.trim().toLowerCase(),
        otp: otpCode
      });

      setLoading(false);
      setShowSuccessModal(true);
    } catch (err) {
      setLoading(false);
      setError(
        err?.response?.message ||
        err?.message ||
        t("auth.otpInvalid") ||
        "Mã OTP không chính xác hoặc đã hết hạn."
      );
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setError(null);
    try {
      await resendOtpApi(formData.email.trim().toLowerCase());
      setResendCooldown(60);
      setInfoMessage(t("auth.otpResent") || "Đã gửi lại mã OTP tới email của bạn.");
    } catch (err) {
      setError(err?.response?.message || err?.message || t("auth.otpResendFailed") || "Không thể gửi lại mã OTP.");
    }
  };

  const handleSuccessRedirect = () => {
    setShowSuccessModal(false);
    if (onSubmit) {
      onSubmit({ email: formData.email.trim().toLowerCase(), verified: true });
    }
    if (onLogin) {
      onLogin();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#111a2e] text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-gray-200 dark:border-slate-800 my-8 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-3">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {step === "register" ? (t("auth.registerTitle") || "Đăng ký tài khoản") : (t("auth.otpTitle") || "Xác thực Email")}
          </h2>
          <button
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 text-xl cursor-pointer"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="h-0.5 w-full bg-gradient-to-r from-[#002d54] via-[#f43f5e] to-[#00a8e8] rounded-full mb-6" />

        <h1 className="text-xl font-extrabold text-[#002d54] dark:text-white mb-6">
          {step === "register" ? (t("auth.createAccountTitle") || "Tạo tài khoản Wayvee") : (t("auth.enterOtpTitle") || "Nhập mã xác thực OTP")}
        </h1>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {infoMessage && (
          <div className="mb-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium">
            {infoMessage}
          </div>
        )}

        {step === "register" ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">{t("auth.firstNameLabel") || "Tên"}</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs outline-none focus:border-[#002d54]"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">{t("auth.lastNameLabel") || "Họ"}</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs outline-none focus:border-[#002d54]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">{t("auth.emailLabel") || "Địa chỉ Email"}</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs outline-none focus:border-[#002d54]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">{t("auth.phoneLabel") || "Số điện thoại (tùy chọn)"}</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs outline-none focus:border-[#002d54]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">{t("auth.passwordLabel") || "Mật khẩu"}</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder={t("auth.passwordMinLength") || "Tối thiểu 6 ký tự"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs outline-none focus:border-[#002d54]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">{t("auth.confirmPasswordLabel") || "Xác nhận mật khẩu"}</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                placeholder={t("auth.confirmPasswordPlaceholder") || "Nhập lại mật khẩu"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs outline-none focus:border-[#002d54]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 rounded-xl bg-[#002d54] text-white font-semibold text-sm hover:bg-[#001f3b] transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>{t("auth.processing") || "Đang xử lý..."}</span>
                </>
              ) : (
                t("auth.createAccountButton") || "Tạo tài khoản"
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {t("auth.otpDesc", { email: formData.email }) || `Mã xác thực OTP đã được gửi đến email ${formData.email}. Vui lòng nhập mã để kích hoạt tài khoản.`}
            </p>

            <div className="flex justify-center gap-2 my-4" onPaste={handleOtpPaste}>
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
                  className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border transition-all outline-none ${
                    digit
                      ? "border-[#002d54] dark:border-sky-400 bg-slate-50 dark:bg-slate-800"
                      : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  } focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/20`}
                  autoFocus={idx === 0}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otp.join("").length < 6}
              className="w-full py-3 rounded-xl bg-[#002d54] text-white font-semibold text-sm hover:bg-[#001f3b] transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (t("auth.verifying") || "Đang xác thực...") : (t("auth.activateAccountButton") || "Kích hoạt tài khoản")}
            </button>

            <div className="flex flex-col items-center gap-2 pt-2">
              <button
                type="button"
                className="text-xs text-[#002d54] dark:text-sky-400 font-semibold underline cursor-pointer disabled:text-gray-400 disabled:no-underline"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || loading}
              >
                {resendCooldown > 0
                  ? `Gửi lại mã sau ${resendCooldown}s`
                  : t("auth.resendOtp") || "Gửi lại mã OTP"}
              </button>

              <button
                type="button"
                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => {
                  setStep("register");
                  setError(null);
                  setInfoMessage(null);
                }}
              >
                ← Quay lại bước đăng ký
              </button>
            </div>
          </form>
        )}

        <div className="mt-5 text-center text-xs text-gray-500 dark:text-gray-400">
          <span>{t("auth.alreadyHaveAccount") || "Đã có tài khoản?"} </span>
          <button type="button" className="font-bold text-[#002d54] dark:text-sky-400 hover:underline cursor-pointer" onClick={onLogin}>
            {t("auth.logIn") || "Đăng nhập"}
          </button>
        </div>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#111a2e] text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center border border-gray-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50/50 dark:ring-emerald-950/20 text-3xl">
              ✓
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Đăng ký thành công!
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-6">
              Tài khoản của bạn đã được kích hoạt thành công. Vui lòng đăng nhập để bắt đầu sử dụng Wayvee.
            </p>
            <button
              type="button"
              className="w-full py-3 rounded-xl bg-[#002d54] text-white font-semibold text-sm hover:bg-[#001f3b] transition-colors shadow-sm cursor-pointer"
              onClick={handleSuccessRedirect}
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
