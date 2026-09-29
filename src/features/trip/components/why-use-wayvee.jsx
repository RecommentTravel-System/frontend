import { useTranslation } from "~/providers/i18n-provider";

export function WhyUseWayvee() {
  const { t } = useTranslation();

  return (
    <section className="wayvee-container py-12 sm:py-16 text-center">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b2545] dark:text-white mb-12 tracking-tight">
        {t("why.sectionTitle")}
      </h2>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 items-start max-w-5xl mx-auto">
        {/* Item 1 */}
        <div className="flex flex-col items-center text-center z-10">
          <div className="w-20 h-20 rounded-2xl bg-sky-100/80 dark:bg-sky-950/80 text-[#0b2545] dark:text-sky-300 flex items-center justify-center text-2xl font-bold mb-5 shadow-xs">
            $
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg mb-2">
            {t("why.timeSaveTitle")}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
            {t("why.timeSaveDesc")}
          </p>
        </div>

        {/* Item 2 */}
        <div className="flex flex-col items-center text-center z-10">
          <div className="w-20 h-20 rounded-2xl bg-sky-100/80 dark:bg-sky-950/80 text-[#0b2545] dark:text-sky-300 flex items-center justify-center text-2xl font-bold mb-5 shadow-xs">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg mb-2">
            {t("why.personalizedTitle")}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
            {t("why.personalizedDesc")}
          </p>
        </div>

        {/* Item 3 */}
        <div className="flex flex-col items-center text-center z-10">
          <div className="w-20 h-20 rounded-2xl bg-sky-100/80 dark:bg-sky-950/80 text-[#0b2545] dark:text-sky-300 flex items-center justify-center text-2xl font-bold mb-5 shadow-xs">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg mb-2">
            {t("why.diverseTitle")}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
            {t("why.diverseDesc")}
          </p>
        </div>

        {/* Dotted curved connector lines for desktop (Image 3 UX) */}
        <svg
          className="hidden md:block absolute top-10 left-0 w-full h-24 pointer-events-none z-0"
          fill="none"
          viewBox="0 0 900 100"
          preserveAspectRatio="none"
        >
          <path
            d="M 170,40 Q 300,-10 450,40 T 730,40"
            stroke="#00a8e8"
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.5"
          />
          <circle cx="170" cy="40" r="3" fill="#00a8e8" />
          <circle cx="450" cy="40" r="3" fill="#00a8e8" />
          <circle cx="730" cy="40" r="3" fill="#00a8e8" />
        </svg>
      </div>
    </section>
  );
}
