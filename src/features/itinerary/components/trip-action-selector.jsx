import { useTranslation } from "~/providers/i18n-provider";

export function TripActionSelector({ selectedAction, onSelectAction }) {
  const { t } = useTranslation();

  return (
    <section
      aria-labelledby="action-choice-heading"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-4"
    >
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3
          id="action-choice-heading"
          className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"
        >
          <span>🤔</span>
          <span>{t("tripCreate.actionSelector.title")}</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {t("tripCreate.actionSelector.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Option 1: ✨ Tạo lịch trình */}
        <button
          type="button"
          onClick={() => onSelectAction("itinerary")}
          className={`text-left p-4 sm:p-5 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
            selectedAction === "itinerary"
              ? "border-[#002d54] dark:border-sky-500 bg-sky-50/50 dark:bg-sky-950/40 ring-4 ring-[#002d54]/10 dark:ring-sky-500/20"
              : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60"
          }`}
        >
          {selectedAction === "itinerary" && (
            <span className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full bg-[#002d54] dark:bg-sky-500 text-white dark:text-slate-950 flex items-center justify-center text-xs font-bold shadow-xs">
              ✓
            </span>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {t("tripCreate.actionSelector.option1Title")}
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              {t("tripCreate.actionSelector.option1Desc")}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-bold text-[#002d54] dark:text-sky-400">
            <span>Mở trình sắp xếp lịch trình</span>
            <span className="ml-1">→</span>
          </div>
        </button>

        {/* Option 2: 📍 Chỉ lưu địa điểm */}
        <button
          type="button"
          onClick={() => onSelectAction("saved_only")}
          className={`text-left p-4 sm:p-5 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
            selectedAction === "saved_only"
              ? "border-[#002d54] dark:border-sky-500 bg-sky-50/50 dark:bg-sky-950/40 ring-4 ring-[#002d54]/10 dark:ring-sky-500/20"
              : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60"
          }`}
        >
          {selectedAction === "saved_only" && (
            <span className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full bg-[#002d54] dark:bg-sky-500 text-white dark:text-slate-950 flex items-center justify-center text-xs font-bold shadow-xs">
              ✓
            </span>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📍</span>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {t("tripCreate.actionSelector.option2Title")}
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              {t("tripCreate.actionSelector.option2Desc")}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-bold text-slate-600 dark:text-slate-300">
            <span>Lưu danh sách và tiếp tục</span>
            <span className="ml-1">→</span>
          </div>
        </button>
      </div>
    </section>
  );
}
