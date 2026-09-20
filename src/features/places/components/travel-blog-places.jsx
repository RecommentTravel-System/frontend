import { useState } from "react";
import { Pill } from "~/shared/ui/pill";
import { useTranslation } from "~/providers/i18n-provider";

const img = (seed, w = 200, h = 200) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

const blogCities = [
  { name: "Hà Nội", seed: "hanoi" },
  { name: "Nha Trang", seed: "nhatrang" },
  { name: "Đà Lạt", seed: "dalat2" },
  { name: "Hồ Chí Minh", seed: "hcmc" },
  { name: "Cần Thơ", seed: "cantho" },
  { name: "Vũng Tàu", seed: "vungtau" }
];

export function TravelBlogPlaces() {
  const { t } = useTranslation();
  const blogFilters = [
    t("blog.explore"),
    t("blog.featured"),
    t("blog.travel"),
    t("blog.entertainment"),
    t("blog.food")
  ];

  const [filter, setFilter] = useState(blogFilters[0]);

  return (
    <section className="wayvee-container py-4">
      <div className="bg-slate-50 dark:bg-[#111a2e] rounded-3xl p-6 border border-gray-200/80 dark:border-slate-800">
        <h2 className="text-xl font-extrabold text-[#0b2545] dark:text-white mb-4">{t("blog.sectionTitle")}</h2>
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {blogFilters.map((f) => (
            <Pill key={f} active={f === filter} onClick={() => setFilter(f)}>
              {f}
            </Pill>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {blogCities.map((c) => (
            <div key={c.name} className="text-center group cursor-pointer">
              <div className="rounded-2xl overflow-hidden h-24 mb-2 border border-gray-200 dark:border-slate-800">
                <img
                  src={img(c.seed)}
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#00a8e8]">
                {c.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
