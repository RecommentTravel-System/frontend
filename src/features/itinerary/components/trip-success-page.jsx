import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "~/providers/i18n-provider";
import { AppHeader, AppFooter } from "~/shared/components";
import { LoginCard, RegisterCard } from "~/features/auth";
import "../styles/itinerary-ui.css";

export function TripSuccessPage() {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const [authModal, setAuthModal] = useState(null);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: t("tripSuccess.title"),
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(language === "vi" ? "Đã sao chép liên kết chuyến đi!" : "Trip link copied to clipboard!");
    }
  };

  return (
    <div className="itinerary-step-page trip-success-page bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans min-h-screen flex flex-col antialiased selection:bg-slate-200">
      {/* AppHeader identical to homepage */}
      <AppHeader
        onLogin={() => setAuthModal("login")}
        onRegister={() => setAuthModal("register")}
      />

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center py-20 px-6 text-center space-y-8 max-w-4xl mx-auto w-full">
        {/* Title */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-relaxed max-w-2xl tracking-tight">
          {t("tripSuccess.title")}
        </h1>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-center gap-4 pt-2">
          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="bg-[#002d54] hover:bg-[#001f3b] dark:bg-sky-500 dark:hover:bg-sky-600 dark:text-slate-950 text-white text-xs font-semibold py-3 px-8 rounded-xl shadow-xs transition-all focus:ring-2 focus:ring-[#002d54] focus:ring-offset-2 cursor-pointer min-w-[140px]"
          >
            {t("tripSuccess.share")}
          </button>

          {/* Quay lại Button */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold py-3 px-8 rounded-xl shadow-2xs transition-all cursor-pointer min-w-[140px]"
          >
            {t("tripSuccess.goBack")}
          </button>
        </div>

        {/* Support Section */}
        <div className="pt-6 space-y-1">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {t("tripSuccess.needHelp")}
          </p>
          <a
            href="mailto:support@wayvee.vn"
            className="text-xs text-[#002d54] dark:text-sky-400 font-bold hover:underline block"
          >
            {t("tripSuccess.contactService")}
          </a>
        </div>
      </main>

      {/* Official AppFooter */}
      <AppFooter />

      {/* Auth Modals */}
      {authModal === "login" && (
        <LoginCard
          onClose={() => setAuthModal(null)}
          onSubmit={() => setAuthModal(null)}
          onSignUp={() => setAuthModal("register")}
        />
      )}

      {authModal === "register" && (
        <RegisterCard
          onClose={() => setAuthModal(null)}
          onSubmit={() => setAuthModal(null)}
          onLogin={() => setAuthModal("login")}
        />
      )}
    </div>
  );
}
