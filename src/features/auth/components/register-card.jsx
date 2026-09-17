import { useState } from "react";

export function RegisterCard({ onClose, onSubmit, onGoogle, onApple, onFacebook, onLogin }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#111a2e] text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-gray-200 dark:border-slate-800 my-8 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-3">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Sign up account</h2>
          <button
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 text-xl"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="h-0.5 w-full bg-gradient-to-r from-[#00a8e8] via-[#f43f5e] to-[#0b2545] rounded-full mb-6" />

        <h1 className="text-xl font-extrabold text-[#0b2545] dark:text-white mb-6">Create Wayvee Account</h1>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                placeholder="John"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs outline-none focus:border-[#00a8e8]"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                placeholder="Doe"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs outline-none focus:border-[#00a8e8]"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="john.doe@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs outline-none focus:border-[#00a8e8]"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder="At least 8 characters"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs outline-none focus:border-[#00a8e8]"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Confirm Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              placeholder="Repeat your password"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs outline-none focus:border-[#00a8e8]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-2 rounded-xl bg-[#00a8e8] text-white font-semibold text-sm hover:bg-sky-600 transition-colors shadow-sm"
          >
            Create Account
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-gray-500 dark:text-gray-400">
          <span>Already have an account? </span>
          <button type="button" className="font-bold text-[#00a8e8] hover:underline" onClick={onLogin}>
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}
