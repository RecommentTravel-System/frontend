import { useTranslation } from "~/providers/i18n-provider";

export function TravelYourWay() {
  const { t } = useTranslation();

  const cards = [
    {
      title: t("travelYourWay.costOptimizationTitle"),
      desc: t("travelYourWay.costOptimizationDesc")
    },
    {
      title: t("travelYourWay.bestPlacesTitle"),
      desc: t("travelYourWay.bestPlacesDesc")
    },
    {
      title: t("travelYourWay.weekendPlanTitle"),
      desc: t("travelYourWay.weekendPlanDesc")
    },
    {
      title: t("travelYourWay.customSuggestionsTitle"),
      desc: t("travelYourWay.customSuggestionsDesc")
    }
  ];

  return (
    <section className="wayvee-container py-6">
      <h2 className="text-2xl font-extrabold text-[#0b2545] dark:text-white mb-6 tracking-tight">
        {t("travelYourWay.sectionTitle")}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((item, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-[#0b2545]/20 dark:border-slate-800 bg-white dark:bg-[#111a2e] p-5 hover:shadow-md transition-shadow"
          >
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 mb-2">{item.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
