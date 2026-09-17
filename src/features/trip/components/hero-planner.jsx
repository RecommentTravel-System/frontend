import { useTranslation } from "~/providers/i18n-provider";

export function HeroPlanner({ onPlannerSubmit }) {
  const { t } = useTranslation();

  return (
    <section className="wayvee-container py-4 sm:py-6">
      <div
        className="relative rounded-3xl overflow-hidden bg-cover bg-center h-[380px] sm:h-[420px] flex items-end sm:items-center shadow-md"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1400&q=85)"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        <div className="relative w-full px-4 sm:px-8 pb-8 sm:pb-0 text-center">
          <h1 className="text-white text-2xl sm:text-4xl font-extrabold max-w-2xl mx-auto mb-6 sm:mb-8 leading-tight tracking-tight drop-shadow-md">
            {t("hero.title")}
          </h1>

          <div className="bg-white dark:bg-[#111a2e] rounded-2xl shadow-xl max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-slate-800 text-left overflow-hidden border border-white/20">
            <PlannerField label={t("hero.destination")} placeholder={t("hero.destinationPlaceholder")} />
            <PlannerField label={t("hero.departDate")} placeholder={t("hero.departPlaceholder")} />
            <PlannerField label={t("hero.returnDate")} placeholder={t("hero.returnPlaceholder")} />
            <PlannerField label={t("hero.tripType")} placeholder={t("hero.tripTypePlaceholder")} />
            <div className="p-2 sm:col-span-2 lg:col-span-1 flex items-center">
              <button
                type="button"
                onClick={onPlannerSubmit}
                className="w-full h-full min-h-[46px] rounded-xl bg-[#0b2545] dark:bg-sky-500 text-white dark:text-slate-950 font-bold text-sm px-4 py-3 hover:bg-[#102f58] dark:hover:bg-sky-600 transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{t("hero.createButton")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlannerField({ label, placeholder }) {
  return (
    <div className="px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
        {label}
      </p>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full text-sm font-medium text-slate-900 dark:text-slate-100 bg-transparent outline-none placeholder-gray-400 dark:placeholder-slate-500"
      />
    </div>
  );
}
