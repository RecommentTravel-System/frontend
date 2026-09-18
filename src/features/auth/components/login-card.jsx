import { useState } from "react";
import { useAuth } from "~/providers/auth-provider";

export function LoginCard({ onClose, onSubmit, onGoogle, onApple, onFacebook, onSignUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login({ email, password });
      setLoading(false);
      if (onSubmit) {
        onSubmit(res);
      }
      if (onClose) {
        onClose();
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#111a2e] text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-gray-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-3">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Đăng nhập tài khoản</h2>
          <button
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 text-xl"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Accent rose line specified in DESIGN.md */}
        <div className="h-0.5 w-full bg-gradient-to-r from-[#f43f5e] via-[#00a8e8] to-[#002d54] rounded-full mb-6" />

        <h1 className="text-xl font-extrabold text-[#002d54] dark:text-white mb-6">Chào mừng đến với Wayvee</h1>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              Địa chỉ Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập địa chỉ email của bạn"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-gray-400 text-sm outline-none focus:border-[#002d54]"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-gray-400 text-sm outline-none focus:border-[#002d54]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#002d54] hover:bg-[#001f3b] text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Đang xử lý...</span>
              </>
            ) : (
              "Tiếp tục"
            )}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px bg-gray-200 dark:bg-slate-800 flex-1" />
          <span className="text-xs text-gray-400 font-medium">hoặc</span>
          <div className="h-px bg-gray-200 dark:bg-slate-800 flex-1" />
        </div>

        <div className="space-y-2.5">
          <SocialButton onClick={onGoogle} icon={<GoogleIcon />} label="Tiếp tục với Google" />
          <SocialButton onClick={onApple} icon={<AppleIcon />} label="Tiếp tục với Apple" />
          <SocialButton onClick={onFacebook} icon={<FacebookIcon />} label="Tiếp tục với Facebook" />
        </div>

        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          <span>Chưa có tài khoản? </span>
          <button type="button" className="font-bold text-[#002d54] dark:text-sky-400 hover:underline" onClick={onSignUp}>
            Đăng ký ngay
          </button>
        </div>
      </div>
    </div>
  );
}

function SocialButton({ onClick, icon, label }) {
  return (
    <button
      type="button"
      className="w-full py-2.5 px-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center justify-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.9v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.9A9 9 0 0 0 0 9c0 1.45.35 2.83.9 4.03l3.05-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .9 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
      <path d="M13.2 9.55c-.02-1.88 1.53-2.78 1.6-2.83-.88-1.28-2.24-1.46-2.73-1.48-1.16-.12-2.27.68-2.86.68-.6 0-1.5-.66-2.46-.65-1.27.02-2.44.74-3.09 1.87-1.32 2.28-.34 5.66.94 7.52.63.9 1.37 1.92 2.35 1.88.94-.04 1.3-.6 2.44-.6 1.13 0 1.46.6 2.46.58 1.02-.02 1.66-.92 2.28-1.83a7.6 7.6 0 0 0 1.03-2.1c-.03-.01-1.94-.75-1.96-2.96zM11.4 3.9c.52-.63.87-1.5.77-2.38-.75.03-1.66.5-2.19 1.12-.48.55-.9 1.45-.79 2.3.83.06 1.68-.42 2.21-1.04z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="9" r="9" fill="#1877F2" />
      <path fill="#fff" d="M11.2 9.3h-1.4v5.4H7.7V9.3H6.6V7.5h1.1V6.3c0-1.05.5-2.7 2.7-2.7h1.98v1.75h-1.44c-.24 0-.56.12-.56.63v1h2.02l-.2 1.79z" />
    </svg>
  );
}
