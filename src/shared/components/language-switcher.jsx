import { useTranslation } from "~/providers/i18n-provider";

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  return (
    <button
      type="button"
      onClick={() => setLanguage(language === "vi" ? "en" : "vi")}
      title="Đổi ngôn ngữ"
      className="px-2.5 py-1 rounded-full border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
    >
      {language === "vi" ? "🇻🇳 VI" : "🇺🇸 EN"}
    </button>
  );
}
