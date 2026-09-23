import { useState } from "react";
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
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);

  const { signup, verifyEmail } = useAuth();

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
        email: formData.email,
        password: formData.password,
        fullName,
        phone: formData.phone
      });

      setLoading(false);
      setStep("otp");
      setInfoMessage(t("auth.otpSentTo", { email: formData.email }) || `Mã OTP kích hoạt đã được gửi tới email ${formData.email}`);
    } catch (err) {
      setLoading(false);
      setError(err.message || t("auth.registerFailed") || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.");
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await verifyEmail({
        email: formData.email,
        otp
      });

      setLoading(false);
      if (onSubmit) {
        onSubmit({ email: formData.email, verified: true });
      }
      if (onLogin) {
        onLogin();
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || t("auth.otpInvalid") || "Mã OTP không chính xác hoặc đã hết hạn.");
    }
  };

  const handleResendOtp = async () => {
    setError(null);
    try {
      await resendOtpApi(formData.email);
      setInfoMessage(t("auth.otpResent") || "Đã gửi lại mã OTP tới email của bạn.");
    } catch (err) {
      setError(err.message || t("auth.otpResendFailed") || "Không thể gửi lại mã OTP.");
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

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">{t("auth.otpLabel") || "Mã OTP"}</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder={t("auth.otpPlaceholder") || "Nhập 6 chữ số OTP"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-center tracking-widest text-lg font-bold outline-none focus:border-[#002d54]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#002d54] text-white font-semibold text-sm hover:bg-[#001f3b] transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (t("auth.verifying") || "Đang xác thực...") : (t("auth.activateAccountButton") || "Kích hoạt tài khoản")}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                className="text-xs text-[#002d54] dark:text-sky-400 font-semibold underline cursor-pointer"
                onClick={handleResendOtp}
              >
                {t("auth.resendOtp") || "Gửi lại mã OTP"}
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
    </div>
  );
}
