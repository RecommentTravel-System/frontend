import { StarRating } from "~/shared/components/star-rating";
import { useTranslation } from "~/providers/i18n-provider";

const img = (seed, w = 900, h = 500) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

const exploreSidebar = [
  { name: "Đà Nẵng", rating: "5.0", category: "Điểm đến biển", seed: "danang" },
  { name: "Nha Trang", rating: "5.0", category: "Nghỉ dưỡng & Lặn biển", seed: "nhatrang2" },
  { name: "Phú Quốc", rating: "5.0", category: "Đảo ngọc & Resort", seed: "phuquoc" }
];

export function RecommendationGrid() {
  const { t } = useTranslation();

  return (
    <section className="wayvee-container py-10">
      <h2 className="text-xl font-extrabold text-[#0b2545] dark:text-white mb-4">
        {t("recommendation.sectionTitle")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
        {/* Main Banner */}
        <div
          className="relative rounded-3xl overflow-hidden h-72 sm:h-80 bg-cover bg-center flex items-end p-6 shadow-sm group cursor-pointer"
          style={{ backgroundImage: `url(${img("sunsetbeach")})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:bg-black/40 transition-colors" />
          <div className="relative text-white">
            <span className="bg-[#00a8e8] text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full mb-2 inline-block">
              {t("recommendation.badge")}
            </span>
            <h3 className="text-2xl font-extrabold mb-1">{t("recommendation.natureTitle")}</h3>
            <p className="text-xs sm:text-sm text-slate-200 opacity-90 mb-4 max-w-md">
              {t("recommendation.natureDesc")}
            </p>
            <button
              type="button"
              className="bg-[#00a8e8] hover:bg-sky-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              {t("recommendation.exploreNow")}
            </button>
          </div>
        </div>

        {/* Sidebar recommendations */}
        <div className="flex flex-col gap-3">
          {exploreSidebar.map((s) => (
            <div
              key={s.name}
              className="relative rounded-2xl overflow-hidden h-[88px] border border-gray-200 dark:border-slate-800 shadow-xs group cursor-pointer"
            >
              <img
                src={img(s.seed, 400, 200)}
                alt={s.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-4">
                <p className="text-white text-sm font-bold">{s.name}</p>
                <p className="text-[11px] text-slate-300 mb-1">{s.category}</p>
                <StarRating rating={s.rating} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
