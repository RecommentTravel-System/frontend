import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { AppHeader, AppFooter } from "~/shared/components";
import { useTranslation } from "~/providers/i18n-provider";
import PremiumWeather from "./PremiumWeather.jsx";

/* ------------------------------------------------------------------ */
/* Placeholder image helper                                           */
/* ------------------------------------------------------------------ */
const img = (seed, w = 600, h = 400) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */
function Pill({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap cursor-pointer ${
        active
          ? "bg-slate-900 dark:bg-sky-500 text-white border-slate-900 dark:border-sky-500 shadow-xs"
          : "bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

function Star() {
  return (
    <svg width="12" height="12" viewBox="0 0 20 20" fill="#F5A623">
      <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6L1.3 7.7l6.1-.6z" />
    </svg>
  );
}

function Field({ label, placeholder }) {
  return (
    <div className="px-4 py-3 bg-white dark:bg-slate-900">
      <p className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 mb-1">{label}</p>
      <input
        placeholder={placeholder}
        className="w-full text-sm outline-none placeholder-gray-400 dark:placeholder-slate-500 bg-transparent text-slate-900 dark:text-slate-100"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sections                                                             */
/* ------------------------------------------------------------------ */
function Hero() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="home-hero-wrap max-w-6xl mx-auto px-6">
      <div
        className="home-hero relative rounded-3xl overflow-hidden bg-cover bg-center h-[380px] flex items-end md:items-center shadow-lg"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1400&q=85)" }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative w-full px-8 pb-10 md:pb-0 text-center">
          <h1 className="home-hero-title text-white text-2xl md:text-4xl font-bold max-w-2xl mx-auto mb-8 drop-shadow-md">
            {t("hero.title", "Tạo lịch trình cho riêng mình ngay bây giờ!")}
          </h1>

          <div className="home-planner bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-slate-800 overflow-hidden text-left border border-slate-100 dark:border-slate-800">
            <Field
              label={t("hero.destination", "Địa điểm")}
              placeholder={t("hero.destinationPlaceholder", "Bạn đi đâu thế?")}
            />
            <Field
              label={t("hero.departDate", "Ngày đi")}
              placeholder={t("hero.departPlaceholder", "DD/MM")}
            />
            <Field
              label={t("hero.returnDate", "Ngày về")}
              placeholder={t("hero.returnPlaceholder", "DD/MM")}
            />
            <Field
              label={t("hero.tripType", "Kiểu chuyến đi mong muốn")}
              placeholder={t("hero.tripTypePlaceholder", "Bạn phù hợp với chuyến đi nào")}
            />
            <button
              type="button"
              onClick={() => navigate("/trip/info")}
              className="home-planner-btn col-span-2 md:col-span-1 m-2 rounded-xl bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-500 text-white text-sm font-semibold px-4 py-3 transition-colors cursor-pointer"
            >
              {t("hero.createButton", "Tạo lịch trình ngay")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyUseWayvee() {
  const { t } = useTranslation();

  const whyItems = [
    {
      title: t("why.timeSaveTitle", "Tiết kiệm thời gian"),
      desc: t("why.timeSaveDesc", "Tạo lịch trình hoàn chỉnh chỉ trong vài giây, không cần mất hàng giờ tìm kiếm và sắp xếp.")
    },
    {
      title: t("why.personalizedTitle", "Cá nhân hóa thông minh"),
      desc: t("why.personalizedDesc", "Gợi ý hành trình dựa trên sở thích, ngân sách và phong cách du lịch của bạn.")
    },
    {
      title: t("why.diverseTitle", "Gợi ý đa dạng"),
      desc: t("why.diverseDesc", "Tích hợp ăn uống, chỗ ở, trải nghiệm và địa điểm hot cùng một hành trình.")
    }
  ];

  return (
    <section className="home-why max-w-6xl mx-auto px-6 py-16 text-center">
      <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-10">
        {t("why.sectionTitle", "Vì sao nên sử dụng Wayvee?")}
      </h2>
      <div className="home-why-grid">
        {whyItems.map((item, index) => (
          <div key={item.title} className="home-why-group">
            <div className="home-why-item flex flex-col items-center">
              <div className="home-why-icon w-14 h-14 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-500 dark:text-sky-400 flex items-center justify-center text-xl mb-4 border border-sky-100/60 dark:border-sky-800/40">
                {index === 0 && <span className="benefit-symbol">$</span>}
                {index === 1 && <span className="benefit-symbol shield-symbol">✓</span>}
                {index === 2 && <span className="benefit-symbol guide-symbol">≣</span>}
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 max-w-xs leading-relaxed">{item.desc}</p>
            </div>
            {index < whyItems.length - 1 && (
              <svg className="home-why-connector text-slate-300 dark:text-slate-700" viewBox="0 0 200 82" fill="none" aria-hidden="true" focusable="false">
                <path d="M3 72C85 92 92-12 197 8" stroke="currentColor" strokeWidth="1.2" strokeDasharray="0.1 3" strokeLinecap="round" />
                <circle cx="3" cy="72" r="2" fill="currentColor" />
                <circle cx="197" cy="8" r="2" fill="currentColor" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function TravelYourWay() {
  const { t } = useTranslation();

  const travelWays = [
    { title: t("travelYourWay.costOptimizationTitle", "Tối ưu chi phí"), desc: t("travelYourWay.costOptimizationDesc", "Gợi ý hành trình phù hợp ngân sách, thành tối ưu không lãng phí.") },
    { title: t("travelYourWay.bestPlacesTitle", "Địa điểm tốt nhất"), desc: t("travelYourWay.bestPlacesDesc", "Tổng hợp các địa điểm nổi bật với trải nghiệm mà bạn mong muốn.") },
    { title: t("travelYourWay.weekendPlanTitle", "Lên kế hoạch nhanh cho cuối tuần"), desc: t("travelYourWay.weekendPlanDesc", "Tạo lịch trình nhanh phù hợp cho các chuyến đi ngắn ngày.") },
    { title: t("travelYourWay.customSuggestionsTitle", "Gợi ý cho bạn"), desc: t("travelYourWay.customSuggestionsDesc", "Mỗi hành trình được chỉnh dựa trên phong cách du lịch của riêng bạn.") }
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 pb-6">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t("travelYourWay.sectionTitle", "Du lịch theo cách của bạn")}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {travelWays.map((item) => (
          <div key={item.title} className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 transition-colors">
            <p className="font-semibold text-sm text-slate-900 dark:text-white mb-1">{item.title}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HotDestinations() {
  const { t } = useTranslation();

  const seasonTabs = [
    { id: "spring", label: t("destinations.spring", "Mùa Xuân") },
    { id: "summer", label: t("destinations.summer", "Mùa Hè") },
    { id: "autumn", label: t("destinations.autumn", "Mùa Thu") },
    { id: "winter", label: t("destinations.winter", "Mùa Đông") }
  ];

  const [activeSeason, setActiveSeason] = useState("spring");

  const hotDestinations = [
    { name: "Mộc Châu", tag: "Hoa mận, hoa đào nở khắp lối", seed: "mocchau" },
    { name: "Hà Giang", tag: "Núi đá + hoa anh đào, vẻ đẹp hùng vĩ", seed: "hagiang" },
    { name: "Huế", tag: "Thời tiết dễ chịu, cảnh cổ kính rất bình yên", seed: "hue" },
    { name: "Đà Lạt", tag: "Mùa mai anh đào, mai đào khoe sắc", seed: "dalat" }
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t("destinations.sectionTitle", "Điểm đến đang hot")}</h2>
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {seasonTabs.map((s) => (
          <Pill key={s.id} active={s.id === activeSeason} onClick={() => setActiveSeason(s.id)}>
            {s.label}
          </Pill>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {hotDestinations.map((d) => (
          <div key={d.name} className="rounded-xl overflow-hidden relative h-64 group shadow-xs">
            <img src={img(d.seed, 400, 500)} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <p className="font-semibold text-base">{d.name}</p>
              <p className="text-xs opacity-90">{d.tag}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TravelBlog() {
  const { t } = useTranslation();

  const blogTabs = [
    { id: "explore", label: t("blog.explore", "Khám phá") },
    { id: "featured", label: t("blog.featured", "Nổi bật") },
    { id: "travel", label: t("blog.travel", "Du lịch") },
    { id: "entertainment", label: t("blog.entertainment", "Giải trí") },
    { id: "food", label: t("blog.food", "Món ăn") }
  ];

  const [activeFilter, setActiveFilter] = useState("explore");

  const blogCities = [
    { name: "Hà Nội", seed: "hanoi" },
    { name: "Nha Trang", seed: "nhatrang" },
    { name: "Đà Lạt", seed: "dalat2" },
    { name: "Hồ Chí Minh", seed: "hcmc" },
    { name: "Cần Thơ", seed: "cantho" },
    { name: "Vũng Tàu", seed: "vungtau" }
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-4">
      <div className="bg-gray-50 dark:bg-slate-900/60 rounded-2xl p-6 border border-gray-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t("blog.sectionTitle", "Blog du lịch & Địa điểm")}</h2>
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {blogTabs.map((f) => (
            <Pill key={f.id} active={f.id === activeFilter} onClick={() => setActiveFilter(f.id)}>
              {f.label}
            </Pill>
          ))}
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {blogCities.map((c) => (
            <div key={c.name} className="text-center group cursor-pointer">
              <div className="rounded-xl overflow-hidden h-20 mb-2 border border-gray-200 dark:border-slate-800 group-hover:border-sky-400 transition-colors">
                <img src={img(c.seed, 200, 200)} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <p className="text-xs font-medium text-gray-700 dark:text-slate-300">{c.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TripReviews() {
  const { t } = useTranslation();

  const reviews = Array.from({ length: 4 }).map((_, i) => ({
    id: i,
    title: t("tripReviews.dalatTrip", "Chuyến đi Đà Lạt"),
    subtitle: t("tripReviews.dalatSub", "Đà Lạt, 3 ngày, Vui vẻ"),
    rating: "5.0",
    seed: `review-${i}`
  }));

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t("tripReviews.sectionTitle", "Đánh giá chuyến đi")}</h2>
        <div className="flex gap-2">
          <button className="w-8 h-8 rounded-full border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">‹</button>
          <button className="w-8 h-8 rounded-full border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">›</button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-xl overflow-hidden border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="relative h-40">
              <img src={img(r.seed, 300, 300)} alt={r.title} className="w-full h-full object-cover" />
              <button
                aria-label={t("tripReviews.favorite", "Yêu thích")}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs shadow-xs cursor-pointer"
              >
                ♡
              </button>
              <span className="absolute bottom-2 left-2 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-200 text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                <Star /> {r.rating} {t("tripReviews.excellent", "Xuất sắc")}
              </span>
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{r.title}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">{r.subtitle}</p>
              <button className="text-xs font-semibold text-slate-900 dark:text-sky-400 underline hover:no-underline cursor-pointer">
                {t("tripReviews.viewDetails", "Xem chi tiết")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ExploreNow() {
  const { t } = useTranslation();

  const exploreSidebar = [
    { name: "Đà Nẵng", rating: 5, seed: "danang" },
    { name: "Nha Trang", rating: 5, seed: "nhatrang2" },
    { name: "Phú Quốc", rating: 5, seed: "phuquoc" }
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t("exploreSection.sectionTitle", "Khám phá ngay")}</h2>
      <div className="grid md:grid-cols-[2fr_1fr] gap-4">
        <div
          className="relative rounded-2xl overflow-hidden h-72 bg-cover bg-center flex items-end p-6 shadow-md"
          style={{ backgroundImage: `url(${img("sunsetbeach", 900, 500)})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="relative text-white">
            <h3 className="text-2xl font-bold mb-1">{t("exploreSection.experienceNow", "Trải nghiệm ngay")}</h3>
            <p className="text-sm opacity-90 mb-4">{t("exploreSection.suggestion", "Gợi ý địa điểm du lịch")}</p>
            <button className="bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer">
              {t("exploreSection.exploreBtn", "Khám phá")}
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {exploreSidebar.map((s) => (
            <div key={s.name} className="relative rounded-2xl overflow-hidden h-[84px] shadow-xs">
              <img src={img(s.seed, 400, 200)} alt={s.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex flex-col justify-center px-4">
                <p className="text-white text-sm font-semibold">{s.name}</p>
                <div className="flex gap-0.5">
                  {Array.from({ length: s.rating }).map((_, i) => (
                    <Star key={i} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Main Home Page Component                                           */
/* ------------------------------------------------------------------ */
export default function Home() {
  const navigate = useNavigate();
  const [premium, setPremium] = useState(() => {
    try { return localStorage.getItem("wayvee-home-preview") === "premium"; }
    catch { return false; }
  });
  const [versionNote, setVersionNote] = useState("");

  function toggleVersion() {
    const next = !premium;
    setPremium(next);
    try {
      localStorage.setItem("wayvee-home-preview", next ? "premium" : "free");
      setVersionNote("");
    } catch {
      setVersionNote("Đã đổi giao diện, nhưng trình duyệt không lưu được lựa chọn.");
    }
  }

  return (
    <div className={`home-page bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen font-sans transition-colors duration-200${premium ? " home-premium" : ""}`}>
      <AppHeader
        onLogin={() => navigate("/login")}
        onRegister={() => navigate("/register")}
      />

      <div className="home-version-bar bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
        <span>Test giao diện · {premium ? "Premium" : "Free"}</span>
        <button type="button" aria-pressed={premium} onClick={toggleVersion} className="dark:text-sky-400">
          {premium ? "Chuyển sang Free" : "Dùng thử giao diện Premium"}
        </button>
      </div>
      {versionNote && <p className="home-version-note" role="status">{versionNote}</p>}

      <Hero />
      {premium && <PremiumWeather />}
      <WhyUseWayvee />
      <TravelYourWay />
      <div id="destinations"><HotDestinations /></div>
      <div id="travel-blog"><TravelBlog /></div>
      <div id="trip-reviews"><TripReviews /></div>
      <div id="explore"><ExploreNow /></div>
      <AppFooter />
    </div>
  );
}
