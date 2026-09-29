import { useState } from "react";
import { useAuth } from "~/providers/auth-provider";
import { useTranslation } from "~/providers/i18n-provider";

export function LoginCard({ onClose, onSubmit, onSignUp, onRegister }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();

  const handleRegisterClick = () => {
    if (onSignUp) onSignUp();
    else if (onRegister) onRegister();
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await login({
        email: formData.email,
        password: formData.password
      });

      setLoading(false);
      if (onSubmit) {
        onSubmit(response);
      }
      if (onClose) {
        onClose();
      }
    } catch (err) {
      setLoading(false);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        t("auth.loginFailed") ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#111a2e] text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-gray-200 dark:border-slate-800 my-8 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-3">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {t("auth.loginTitle") || "Đăng nhập tài khoản"}
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

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              {t("auth.emailLabel") || "Địa chỉ Email"}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs outline-none focus:border-[#002d54]"
              required
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                {t("auth.passwordLabel") || "Mật khẩu"}
              </label>
            </div>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder="••••••••"
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
                <span>{t("auth.loggingIn") || "Đang đăng nhập..."}</span>
              </>
            ) : (
              t("auth.loginButton") || "Đăng nhập"
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-gray-500 dark:text-gray-400">
          <span>{t("auth.dontHaveAccount") || "Chưa có tài khoản?"} </span>
          <button
            type="button"
            className="font-bold text-[#002d54] dark:text-sky-400 hover:underline cursor-pointer"
            onClick={handleRegisterClick}
          >
            {t("auth.signUpNow") || "Đăng ký ngay"}
          </button>
        </div>
      </div>
    </div>
  );
}
