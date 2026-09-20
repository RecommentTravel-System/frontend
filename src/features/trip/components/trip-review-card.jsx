import { StarRating } from "~/shared/components/star-rating";

const img = (seed, w = 400, h = 300) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

const reviews = [
  { id: 1, title: "Chuyến đi Đà Lạt 3N2Đ", subtitle: "Đà Lạt • 3 ngày • Vui vẻ", rating: "5.0", seed: "review-0" },
  { id: 2, title: "Khám phá Hà Giang", subtitle: "Hà Giang • 4 ngày • Trải nghiệm", rating: "5.0", seed: "review-1" },
  { id: 3, title: "Phú Quốc Chữa Lành", subtitle: "Phú Quốc • 3 ngày • Nghỉ dưỡng", rating: "4.9", seed: "review-2" },
  { id: 4, title: "Foodtour Hà Nội", subtitle: "Hà Nội • 2 ngày • Món ngon", rating: "5.0", seed: "review-3" }
];

export function TripReviews() {
  return (
    <section className="wayvee-container py-8 sm:py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-[#0b2545] dark:text-white">Đánh giá chuyến đi</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Trải nghiệm thực tế từ cộng đồng Wayvee</p>
        </div>
        <div className="flex gap-2">
          <button className="w-8 h-8 rounded-full border border-gray-200 dark:border-slate-800 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 text-sm">
            ‹
          </button>
          <button className="w-8 h-8 rounded-full border border-gray-200 dark:border-slate-800 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 text-sm">
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#111a2e] shadow-xs group hover:shadow-md transition-shadow"
          >
            <div className="relative h-44 overflow-hidden">
              <img
                src={img(r.seed)}
                alt={r.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <button
                type="button"
                aria-label="Yêu thích"
                className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs shadow-xs hover:scale-110 transition-transform"
              >
                ♡
              </button>
              <span className="absolute bottom-2.5 left-2.5 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                <StarRating rating={r.rating} />
              </span>
            </div>
            <div className="p-4">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{r.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{r.subtitle}</p>
              <button type="button" className="text-xs font-bold text-[#00a8e8] hover:underline">
                Xem chi tiết →
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
