import { useState } from "react";
import { Pill } from "~/shared/ui/pill";
import { useTranslation } from "~/providers/i18n-provider";

const MOCK_IMAGES = {
  mocchau: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  hagiang: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80",
  hue: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=800&q=80",
  dalat: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80"
};

const DEFAULT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80";

const img = (seed) => MOCK_IMAGES[seed] || DEFAULT_FALLBACK_IMAGE;

const hotDestinations = [
  { name: "Mộc Châu", tag: "Hoa mận, hoa đào nở khắp lối", seed: "mocchau" },
  { name: "Hà Giang", tag: "Núi đá + hoa anh đào, vẻ đẹp hùng vĩ", seed: "hagiang" },
  { name: "Huế", tag: "Thời tiết dễ chịu, cảnh cổ kính rất bình yên", seed: "hue" },
  { name: "Đà Lạt", tag: "Mùa mai anh đào khoe sắc rực rỡ", seed: "dalat" }
];

export function HotDestinations() {
  const { t } = useTranslation();
  const seasons = [
    t("destinations.spring"),
    t("destinations.summer"),
    t("destinations.autumn"),
    t("destinations.winter")
  ];

  const [selectedSeason, setSelectedSeason] = useState(seasons[0]);

  return (
    <section className="wayvee-container py-8 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-[#0b2545] dark:text-white">{t("destinations.sectionTitle")}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t("destinations.subtitle")}</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          {seasons.map((s) => (
            <Pill key={s} active={s === selectedSeason} onClick={() => setSelectedSeason(s)}>
              {s}
            </Pill>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {hotDestinations.map((d) => (
          <div
            key={d.name}
            className="rounded-2xl overflow-hidden relative h-64 sm:h-72 group cursor-pointer shadow-xs hover:shadow-lg transition-all duration-300"
          >
            <img
              src={img(d.seed)}
              alt={d.name}
              onError={(e) => { e.currentTarget.src = DEFAULT_FALLBACK_IMAGE; }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <p className="font-extrabold text-lg drop-shadow-xs">{d.name}</p>
              <p className="text-xs text-slate-200 opacity-90 line-clamp-2">{d.tag}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
