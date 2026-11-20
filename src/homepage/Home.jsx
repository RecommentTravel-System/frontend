import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { AppHeader, AppFooter } from "~/shared/components";
import { useTranslation } from "~/providers/i18n-provider";
import { useLoading } from "~/providers/loading-provider";
import { Spinner } from "~/shared/ui/loading";
import { useDelayedLoading } from "~/shared/lib/use-delayed-loading";
import PremiumWeather from "./PremiumWeather.jsx";

/* ------------------------------------------------------------------ */
/* Curated, reliable mock images for Vietnam travel destinations       */
/* ------------------------------------------------------------------ */
const MOCK_IMAGES = {
  // Hot Destinations
  mocchau: "https://images.unsplash.com/photo-1764034372439-cf34b61ea0b9?auto=format&fit=crop&w=800&q=80", // Mộc Châu - Đồi chè xanh mướt
  hagiang: "https://images.unsplash.com/photo-1705428332338-a3b733a79b08?auto=format&fit=crop&w=800&q=80", // Hà Giang - Đèo núi & hẻm vực sông Nho Quế
  hue: "https://images.unsplash.com/photo-1765034841805-8330b54bfdb7?auto=format&fit=crop&w=800&q=80", // Huế - Cố đô & Đại Nội cổ kính
  dalat: "https://images.unsplash.com/photo-1682416552051-8ccbb1719909?auto=format&fit=crop&w=800&q=80", // Đà Lạt - Đồi thông trong sương mù

  // Travel Blog Cities
  hanoi: "https://images.unsplash.com/photo-1689080492397-820b860a8606?auto=format&fit=crop&w=600&q=80", // Hà Nội - Hồ Gươm & Tháp Rùa
  nhatrang: "https://images.unsplash.com/photo-1658992468342-0f02ebd87965?auto=format&fit=crop&w=600&q=80", // Nha Trang - Vịnh biển duyên hải xanh ngát
  dalat2: "https://images.unsplash.com/photo-1577883609870-63ef4caa50e9?auto=format&fit=crop&w=600&q=80", // Đà Lạt - Đồi xanh & đồi chè Cầu Đất
  hcmc: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=600&q=80", // Hồ Chí Minh - Landmark 81 & Bitexco
  cantho: "https://images.unsplash.com/photo-1680711211921-1b5ba9a25fd2?auto=format&fit=crop&w=600&q=80", // Cần Thơ - Chợ nổi Cái Răng & sông nước miền Tây
  vungtau: "https://images.unsplash.com/photo-1627615608004-f6fba8eca2a1?auto=format&fit=crop&w=600&q=80", // Vũng Tàu - Bãi Sau & bờ biển hoàng hôn

  // Reviews
  "review-0": "https://images.unsplash.com/photo-1682416552051-8ccbb1719909?auto=format&fit=crop&w=600&q=80",
  "review-1": "https://images.unsplash.com/photo-1577883609870-63ef4caa50e9?auto=format&fit=crop&w=600&q=80",
  "review-2": "https://images.unsplash.com/photo-1627464683430-71a8ded032ee?auto=format&fit=crop&w=600&q=80",
  "review-3": "https://images.unsplash.com/photo-1652829792640-e13de2991e17?auto=format&fit=crop&w=600&q=80",

  // Explore
  sunsetbeach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  danang: "https://images.unsplash.com/photo-1786759995299-265c4221616e?auto=format&fit=crop&w=600&q=80", // Đà Nẵng - Cầu Vàng Bà Nà Hills
  nhatrang2: "https://images.unsplash.com/photo-1658992468342-0f02ebd87965?auto=format&fit=crop&w=600&q=80",
  phuquoc: "https://images.unsplash.com/photo-1583402955903-68dd58b0d463?auto=format&fit=crop&w=600&q=80" // Phú Quốc
};

const DEFAULT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80";

const img = (seed) => {
  if (seed && MOCK_IMAGES[seed]) {
    return MOCK_IMAGES[seed];
  }
  return DEFAULT_FALLBACK_IMAGE;
};

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */
function Pill({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all whitespace-nowrap cursor-pointer active:scale-95 duration-150 shadow-2xs ${
        active
          ? "bg-[#0b2545] dark:bg-sky-500 text-white border-transparent shadow-sm"
          : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:border-sky-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white"
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

function Field({ label, placeholder, ...inputProps }) {
  return (
    <div className="px-4 py-3 bg-white dark:bg-slate-900 focus-within:bg-sky-50/40 dark:focus-within:bg-slate-800/40 transition-colors">
      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-0.5 uppercase tracking-wider">{label}</p>
      <input
        aria-label={label}
        {...inputProps}
        placeholder={placeholder}
        className="w-full text-xs sm:text-sm font-semibold outline-none placeholder-slate-400 dark:placeholder-slate-500 bg-transparent text-slate-900 dark:text-slate-100"
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
  const { showLoading } = useLoading();
  const [values, setValues] = useState({ destination: '', startDate: '', endDate: '', style: '' });
  const [placeQuery, setPlaceQuery] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigatingAction, setNavigatingAction] = useState(null);

  const { visible: showSearchLoading } = useDelayedLoading(isNavigating && navigatingAction === 'search', { delay: 250 });
  const { visible: showPlannerLoading } = useDelayedLoading(isNavigating && navigatingAction === 'planner', { delay: 250 });

  const fieldProps = name => ({ value: values[name], onChange: event => setValues({ ...values, [name]: event.target.value }) });

  const popularDestinations = ["Đà Nẵng", "Phú Quốc", "Đà Lạt", "Sa Pa", "Hạ Long"];

  const handleCreateTrip = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    setNavigatingAction('planner');
    const done = showLoading(t("hero.loadingTrip", "Đang mở trang tạo lịch trình..."), "hero-planner");

    navigate("/trip/info", {
      state: {
        initialDestination: values.destination.trim(),
        startDate: values.startDate,
        endDate: values.endDate,
        style: values.style.trim(),
      }
    });
    setTimeout(done, 500);
  };

  const handleBrowsePlaces = (event) => {
    event.preventDefault();
    if (isNavigating) return;
    setIsNavigating(true);
    setNavigatingAction('search');

    const queryLabel = placeQuery.trim() || values.destination.trim();
    const done = showLoading(
      queryLabel ? `Đang tìm kiếm "${queryLabel}"...` : "Đang tìm kiếm địa điểm...",
      "hero-search"
    );

    const params = new URLSearchParams({ browse: '1' });
    if (placeQuery.trim()) params.set('q', placeQuery.trim());
    if (values.destination.trim()) params.set('destination', values.destination.trim());
    navigate(`/places?${params}`);
    setTimeout(done, 500);
  };

  return (
    <section className="home-hero-wrap max-w-6xl mx-auto px-4 sm:px-6 pt-2 pb-6">
      <div
        className="home-hero relative rounded-3xl overflow-hidden bg-cover bg-center min-h-[440px] md:min-h-[420px] flex items-center shadow-xl border border-white/20 dark:border-slate-800"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=85)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/45 to-slate-950/25" />
        <div className="relative w-full px-4 sm:px-8 py-8 text-center flex flex-col items-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold mb-4 border border-white/20 shadow-sm animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
            Lên kế hoạch thông minh cùng Wayvee
          </span>

          <h1 className="home-hero-title text-white text-2xl sm:text-3xl md:text-5xl font-black max-w-3xl mx-auto mb-4 tracking-tight drop-shadow-md">
            {t("hero.title", "Tạo lịch trình cho riêng mình ngay bây giờ!")}
          </h1>

          <p className="text-white/85 text-xs sm:text-sm max-w-xl mx-auto mb-6 font-medium drop-shadow-xs">
            Khám phá hàng nghìn điểm đến hấp dẫn, tự động gợi ý hành trình tối ưu và tiết kiệm thời gian nhất.
          </p>

          {/* Quick chips */}
          <div className="hidden sm:flex items-center gap-2 mb-6 flex-wrap justify-center">
            <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">Gợi ý nhanh:</span>
            {popularDestinations.map((dest) => (
              <button
                key={dest}
                type="button"
                onClick={() => setValues((prev) => ({ ...prev, destination: dest }))}
                className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 hover:bg-white/35 text-white backdrop-blur-xs border border-white/25 transition-all cursor-pointer active:scale-95"
              >
                {dest}
              </button>
            ))}
          </div>

          {/* Search Planner Bar */}
          <div className="home-planner bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full mx-auto grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800 overflow-hidden text-left border border-slate-100/80 dark:border-slate-800/80">
            <Field
              label={t("hero.destination", "Địa điểm")}
              {...fieldProps('destination')}
              placeholder={t("hero.destinationPlaceholder", "Bạn đi đâu thế?")}
            />
            <Field
              label={t("hero.departDate", "Ngày đi")}
              type="date" {...fieldProps('startDate')}
              placeholder={t("hero.departPlaceholder", "DD/MM")}
            />
            <Field
              label={t("hero.returnDate", "Ngày về")}
              type="date" min={values.startDate} {...fieldProps('endDate')}
              placeholder={t("hero.returnPlaceholder", "DD/MM")}
            />
            <Field
              label={t("hero.tripType", "Kiểu chuyến đi mong muốn")}
              {...fieldProps('style')}
              placeholder={t("hero.tripTypePlaceholder", "Bạn phù hợp với chuyến đi nào")}
            />
            <button
              type="button"
              onClick={handleCreateTrip}
              disabled={isNavigating}
              aria-busy={isNavigating && navigatingAction === 'planner'}
              className="home-planner-btn col-span-2 md:col-span-1 m-2 rounded-xl bg-[#00a8e8] hover:bg-[#0092ca] text-white text-xs sm:text-sm font-bold px-4 py-3 transition-all duration-200 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:shadow-sky-500/20 active:scale-95"
            >
              {showPlannerLoading && <Spinner size="sm" variant="white" />}
              <span>{t("hero.createButton", "Tạo lịch trình ngay")}</span>
            </button>
          </div>

          {/* Quick Place Search Form */}
          <form className="home-place-search" role="search" aria-label={t('hero.browsePlaces')} onSubmit={handleBrowsePlaces}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m16 16 5 5" />
            </svg>
            <input
              type="search"
              value={placeQuery}
              onChange={event => setPlaceQuery(event.target.value)}
              aria-label={t('hero.placeSearchPlaceholder')}
              placeholder={t('hero.placeSearchPlaceholder', 'Hoặc tìm nhanh địa điểm, nhà hàng, khách sạn...')}
              disabled={isNavigating}
            />
            <button
              type="submit"
              disabled={isNavigating}
              aria-busy={isNavigating && navigatingAction === 'search'}
              className="disabled:opacity-75 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {showSearchLoading && <Spinner size="sm" variant="white" />}
              <span>{t('hero.browsePlaces', 'Tìm kiếm')}</span>
            </button>
          </form>
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
    <section className="home-why max-w-6xl mx-auto px-4 sm:px-6 py-12 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/40 text-[#00a8e8] dark:text-sky-300 text-xs font-semibold mb-3 border border-sky-100 dark:border-sky-800/40">
        Lợi ích vượt trội
      </div>
      <h2 className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-10 tracking-tight">
        {t("why.sectionTitle", "Vì sao nên sử dụng Wayvee?")}
      </h2>
      <div className="home-why-grid">
        {whyItems.map((item, index) => (
          <div key={item.title} className="home-why-group">
            <div className="home-why-item flex flex-col items-center p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200">
              <div className="home-why-icon w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-500 dark:text-sky-400 flex items-center justify-center text-xl mb-4 border border-sky-100 dark:border-sky-800/40 shadow-2xs">
                {index === 0 && <span className="benefit-symbol">$</span>}
                {index === 1 && <span className="benefit-symbol shield-symbol">✓</span>}
                {index === 2 && <span className="benefit-symbol guide-symbol">≣</span>}
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">{item.desc}</p>
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
    { title: t("travelYourWay.costOptimizationTitle", "Tối ưu chi phí"), desc: t("travelYourWay.costOptimizationDesc", "Gợi ý hành trình phù hợp ngân sách, tối ưu không lãng phí.") },
    { title: t("travelYourWay.bestPlacesTitle", "Địa điểm tốt nhất"), desc: t("travelYourWay.bestPlacesDesc", "Tổng hợp các địa điểm nổi bật với trải nghiệm mà bạn mong muốn.") },
    { title: t("travelYourWay.weekendPlanTitle", "Lên kế hoạch nhanh cho cuối tuần"), desc: t("travelYourWay.weekendPlanDesc", "Tạo lịch trình nhanh phù hợp cho các chuyến đi ngắn ngày.") },
    { title: t("travelYourWay.customSuggestionsTitle", "Gợi ý cho bạn"), desc: t("travelYourWay.customSuggestionsDesc", "Mỗi hành trình được chỉnh dựa trên phong cách du lịch của riêng bạn.") }
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{t("travelYourWay.sectionTitle", "Du lịch theo cách của bạn")}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Tùy biến lịch trình hoàn hảo theo gu riêng của từng du khách</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {travelWays.map((item) => (
          <div key={item.title} className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs hover:shadow-md hover:border-sky-300 dark:hover:border-slate-700 transition-all duration-200">
            <p className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">{item.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HotDestinations() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const seasonTabs = [
    { id: "spring", label: t("destinations.spring", "Mùa Xuân") },
    { id: "summer", label: t("destinations.summer", "Mùa Hè") },
    { id: "autumn", label: t("destinations.autumn", "Mùa Thu") },
    { id: "winter", label: t("destinations.winter", "Mùa đông") }
  ];

  const [activeSeason, setActiveSeason] = useState("spring");

  const hotDestinations = [
    { name: "Mộc Châu", tag: "Hoa mận, hoa đào nở khắp lối", seed: "mocchau", destination: "Mộc Châu" },
    { name: "Hà Giang", tag: "Núi đá + hoa anh đào, vẻ đẹp hùng vĩ", seed: "hagiang", destination: "Hà Giang" },
    { name: "Huế", tag: "Thời tiết dễ chịu, cảnh cổ kính rất bình yên", seed: "hue", destination: "Huế" },
    { name: "Đà Lạt", tag: "Mùa mai anh đào, mai đào khoe sắc", seed: "dalat", destination: "Đà Lạt" }
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{t("destinations.sectionTitle", "Điểm đến đang hot")}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Xu hướng khám phá thịnh hành trong mùa này</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {seasonTabs.map((s) => (
            <Pill key={s.id} active={s.id === activeSeason} onClick={() => setActiveSeason(s.id)}>
              {s.label}
            </Pill>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {hotDestinations.map((d) => (
          <div
            key={d.name}
            onClick={() => navigate(`/places?browse=1&destination=${encodeURIComponent(d.destination)}`)}
            className="rounded-2xl overflow-hidden relative h-72 group shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <img
              src={img(d.seed)}
              alt={d.name}
              onError={(e) => { e.currentTarget.src = DEFAULT_FALLBACK_IMAGE; }}
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/30">
                Hot Deal
              </span>
            </div>
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <p className="font-extrabold text-lg drop-shadow-sm group-hover:text-sky-300 transition-colors">{d.name}</p>
              <p className="text-xs text-slate-200 opacity-90 line-clamp-1">{d.tag}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TravelBlog() {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
      <div className="bg-slate-50/80 dark:bg-slate-900/60 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{t("blog.sectionTitle", "Blog du lịch & địa điểm")}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Cẩm nang kinh nghiệm từ cộng đồng xê dịch</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {blogTabs.map((f) => (
              <Pill key={f.id} active={f.id === activeFilter} onClick={() => setActiveFilter(f.id)}>
                {f.label}
              </Pill>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {blogCities.map((c) => (
            <div
              key={c.name}
              onClick={() => navigate(`/places?browse=1&destination=${encodeURIComponent(c.name)}`)}
              className="text-center group cursor-pointer"
            >
              <div className="rounded-2xl overflow-hidden h-24 mb-2.5 border border-slate-200 dark:border-slate-800 group-hover:border-sky-400 group-hover:shadow-md transition-all duration-200">
                <img
                  src={img(c.seed)}
                  alt={c.name}
                  onError={(e) => { e.currentTarget.src = DEFAULT_FALLBACK_IMAGE; }}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                />
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-sky-500 transition-colors">{c.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TripReviews() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const reviews = Array.from({ length: 4 }).map((_, i) => ({
    id: i,
    title: t("tripReviews.dalatTrip", "Chuyến đi Đà Lạt"),
    subtitle: t("tripReviews.dalatSub", "Đà Lạt, 3 ngày, Vui vẻ"),
    rating: "5.0",
    seed: `review-${i}`
  }));

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{t("tripReviews.sectionTitle", "Đánh giá chuyến đi")}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Trải nghiệm thực tế từ các du khách</p>
        </div>
        <button
          onClick={() => navigate("/reviews")}
          className="text-xs font-bold text-[#00a3e0] hover:underline cursor-pointer flex items-center gap-1"
        >
          Xem tất cả ({'>'})
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
            <div className="relative h-44">
              <img
                src={img(r.seed)}
                alt={r.title}
                onError={(e) => { e.currentTarget.src = DEFAULT_FALLBACK_IMAGE; }}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2.5 left-2.5 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-200 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs backdrop-blur-xs">
                <Star /> {r.rating} {t("tripReviews.excellent", "Xuất sắc")}
              </span>
            </div>
            <div className="p-4">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{r.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{r.subtitle}</p>
              <button
                onClick={() => navigate("/reviews")}
                className="text-xs font-bold text-[#00a3e0] hover:underline cursor-pointer"
              >
                {t("tripReviews.viewDetails", "Xem chi tiết →")}
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
  const navigate = useNavigate();

  const exploreSidebar = [
    { name: "Đà Nẵng", rating: 5, seed: "danang" },
    { name: "Nha Trang", rating: 5, seed: "nhatrang2" },
    { name: "Phú Quốc", rating: 5, seed: "phuquoc" }
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{t("exploreSection.sectionTitle", "Khám phá ngay")}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Điểm chạm cho những chuyến phiêu lưu không giới hạn</p>
      </div>
      <div className="grid md:grid-cols-[2fr_1fr] gap-5">
        <div
          className="relative rounded-3xl overflow-hidden h-80 bg-cover bg-center flex items-end p-8 shadow-md border border-slate-100 dark:border-slate-800"
          style={{ backgroundImage: `url(${img("sunsetbeach")})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
          <div className="relative text-white z-10">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/30 mb-2 inline-block">
              Nổi bật tuần này
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold mb-1.5">{t("exploreSection.experienceNow", "Trải nghiệm ngay")}</h3>
            <p className="text-xs sm:text-sm text-slate-200 opacity-90 mb-5">{t("exploreSection.suggestion", "Gợi ý địa điểm du lịch & hành trình độc đáo nhất")}</p>
            <button
              onClick={() => navigate("/places?browse=1")}
              className="bg-[#00a8e8] hover:bg-[#0092ca] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              {t("exploreSection.exploreBtn", "Khám phá ngay →")}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {exploreSidebar.map((s) => (
            <div
              key={s.name}
              onClick={() => navigate(`/places?browse=1&destination=${encodeURIComponent(s.name)}`)}
              className="relative rounded-2xl overflow-hidden h-[92px] shadow-xs group cursor-pointer border border-slate-100 dark:border-slate-800"
            >
              <img
                src={img(s.seed)}
                alt={s.name}
                onError={(e) => { e.currentTarget.src = DEFAULT_FALLBACK_IMAGE; }}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex flex-col justify-center px-5">
                <p className="text-white text-sm font-bold group-hover:text-sky-300 transition-colors">{s.name}</p>
                <div className="flex gap-1 mt-1">
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
        onLogin={() => navigate("/login", { state: { from: "/" } })}
        onRegister={() => navigate("/register", { state: { from: "/" } })}
      />

      <div className="home-version-bar bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 py-2 text-xs">
        <div className="wayvee-container flex items-center justify-between">
          <span>Trải nghiệm giao diện: <strong className="text-slate-900 dark:text-white">{premium ? "Premium Mode" : "Standard Mode"}</strong></span>
          <button type="button" aria-pressed={premium} onClick={toggleVersion} className="text-[#00a8e8] dark:text-sky-400 font-semibold hover:underline cursor-pointer">
            {premium ? "Chuyển sang Standard" : "Kích hoạt giao diện Premium →"}
          </button>
        </div>
      </div>
      {versionNote && <p className="home-version-note text-xs text-amber-600 dark:text-amber-400 py-1 text-center" role="status">{versionNote}</p>}

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
