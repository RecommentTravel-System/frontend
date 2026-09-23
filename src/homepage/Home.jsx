import { useState } from "react";
import './Home.css';
import PremiumWeather from './PremiumWeather.jsx';
import { useNavigate } from 'react-router-dom';
import SearchDialog from '../search/SearchDialog.jsx';
import SiteHeader from '../components/SiteHeader.jsx';
import SiteFooter from '../components/SiteFooter.jsx';

/* ------------------------------------------------------------------ */
/* Placeholder image helper — swap these seeds for real photo URLs    */
/* ------------------------------------------------------------------ */
const img = (seed, w = 600, h = 400) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

/* ------------------------------------------------------------------ */
/* Data                                                                 */
/* ------------------------------------------------------------------ */
const whyUseWayvee = [
  {
    icon: "$",
    title: "Tiết kiệm thời gian",
    desc: "Tạo lịch trình hoàn chỉnh chỉ trong vài giây, không cần mất hàng giờ tìm kiếm và sắp xếp.",
  },
  {
    icon: "✓",
    title: "Cá nhân hóa thông minh",
    desc: "Gợi ý hành trình dựa trên sở thích, ngân sách và phong cách du lịch của bạn.",
  },
  {
    icon: "☰",
    title: "Gợi ý đa dạng",
    desc: "Tích hợp ăn uống, chỗ ở, trải nghiệm và địa điểm hot cùng một hành trình.",
  },
];

const travelYourWay = [
  { title: "Tối ưu chi phí", desc: "Gợi ý hành trình phù hợp ngân sách, thành tối ưu không lãng phí." },
  { title: "Địa điểm tốt nhất", desc: "Tổng hợp các địa điểm nổi bật với trải nghiệm mà bạn mong muốn." },
  { title: "Lên kế hoạch nhanh cho cuối tuần", desc: "Tạo lịch trình nhanh phù hợp cho các chuyến đi ngắn ngày." },
  { title: "Gợi ý cho bạn", desc: "Mỗi hành trình được chỉnh dựa trên phong cách du lịch của riêng bạn." },
];

const seasons = ["Mùa Xuân", "Mùa Hè", "Mùa Thu", "Mùa Đông"];

const hotDestinations = [
  { name: "Mộc Châu", tag: "Hoa mận, hoa đào nở khắp lối", seed: "mocchau" },
  { name: "Hà Giang", tag: "Núi đá + hoa anh đào, vẻ đẹp hùng vĩ", seed: "hagiang" },
  { name: "Huế", tag: "Thời tiết dễ chịu, cảnh cổ kính rất bình yên", seed: "hue" },
  { name: "Đà Lạt", tag: "Mùa mai anh đào, mai đào khoe sắc", seed: "dalat" },
];

const blogFilters = ["Khám phá", "Nổi bật", "Di lịch", "Giải trí", "Món ăn"];

const blogCities = [
  { name: "Hà Nội", seed: "hanoi" },
  { name: "Nha Trang", seed: "nhatrang" },
  { name: "Đà Lạt", seed: "dalat2" },
  { name: "Hồ Chí Minh", seed: "hcmc" },
  { name: "Cần Thơ", seed: "cantho" },
  { name: "Vũng Tàu", seed: "vungtau" },
];

const reviews = Array.from({ length: 4 }).map((_, i) => ({
  id: i,
  title: "Chuyến đi Đà Lạt",
  subtitle: "Đà Lạt, 3 ngày, Vui vẻ",
  rating: "5.0",
  seed: `review-${i}`,
}));

const exploreSidebar = [
  { name: "Đà Nẵng", rating: 5, seed: "danang" },
  { name: "Nha Trang", rating: 5, seed: "nhatrang2" },
  { name: "Phú Quốc", rating: 5, seed: "phuquoc" },
];



/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */
function Pill({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
        active
          ? "bg-slate-900 text-white border-slate-900"
          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
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

/* ------------------------------------------------------------------ */
/* Sections                                                             */
/* ------------------------------------------------------------------ */
function Hero() {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [tourSeed, setTourSeed] = useState({ destination: '', start: '', end: '', style: '' });
  const fieldProps = key => ({ value: tourSeed[key], onChange: event => setTourSeed(previous => ({ ...previous, [key]: event.target.value })) });
  return (
    <section className="home-hero-wrap max-w-6xl mx-auto px-6">
      <div
        className="home-hero relative rounded-3xl overflow-hidden bg-cover bg-center h-[380px] flex items-end md:items-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1400&q=85)' }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative w-full px-8 pb-10 md:pb-0 text-center">
          <h1 className="home-hero-title text-white text-2xl md:text-4xl font-bold max-w-2xl mx-auto mb-8">
            Tạo lịch trình cho riêng mình ngay bây giờ!
          </h1>

          <div className="home-planner bg-white rounded-2xl shadow-lg max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-5 divide-x divide-gray-100 overflow-hidden text-left">
            <Field {...fieldProps("destination")} label="Địa điểm" placeholder="Bạn đi đâu thế?" />
            <Field {...fieldProps("start")} type="date" label="Ngày đi" placeholder="DD/MM" />
            <Field {...fieldProps("end")} type="date" label="Ngày về" placeholder="DD/MM" />
            <Field {...fieldProps("style")} label="Kiểu chuyến đi mong muốn" placeholder="Bạn phù hợp với chuyến đi nào" />
            <button type="button" onClick={() => navigate("/create-tour", { state: { tourSeed } })} className="home-planner-btn col-span-2 md:col-span-1 m-2 rounded-xl bg-slate-900 text-white text-sm font-semibold px-4 py-3">
              Tạo lịch trình ngay
            </button>
          </div>
          <button type="button" className="home-search-entry" onClick={() => setSearchOpen(true)}>⌕ Tìm kiếm địa điểm</button>
        </div>
      </div>
      {searchOpen && <SearchDialog onClose={() => setSearchOpen(false)} onSearch={values => { const params = new URLSearchParams(); for (const [key, value] of Object.entries(values)) if (value !== "") params.set(key, value); navigate(`/search?${params}`); }} />}
    </section>
  );
}

function Field({ label, placeholder, ...inputProps }) {
  return (
    <div className="px-4 py-3">
      <p className="text-[11px] font-semibold text-gray-500 mb-1">{label}</p>
      <input
        {...inputProps}
        aria-label={label}
        placeholder={placeholder}
        className="w-full text-sm outline-none placeholder-gray-400"
      />
    </div>
  );
}

function WhyUseWayvee() {
  return (
    <section className="home-why max-w-6xl mx-auto px-6 py-16 text-center">
      <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-10">
        Vì sao nên sử dụng Wayvee?
      </h2>
      <div className="home-why-grid">
        {whyUseWayvee.map((item, index) => (
          <div key={item.title} className="home-why-group">
            <div className="home-why-item flex flex-col items-center">
              <div className="home-why-icon w-14 h-14 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center text-xl mb-4">
                {index === 0 && <span className="benefit-symbol">$</span>}
                {index === 1 && <span className="benefit-symbol shield-symbol">✓</span>}
                {index === 2 && <span className="benefit-symbol guide-symbol">≣</span>}
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 max-w-xs">{item.desc}</p>
            </div>
            {index < whyUseWayvee.length - 1 && (
              <svg className="home-why-connector" viewBox="0 0 200 82" fill="none" aria-hidden="true" focusable="false">
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
  return (
    <section className="max-w-6xl mx-auto px-6 pb-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4">Du lịch theo cách của bạn</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {travelYourWay.map((item) => (
          <div key={item.title} className="rounded-xl border border-gray-200 p-4">
            <p className="font-semibold text-sm text-slate-900 mb-1">{item.title}</p>
            <p className="text-xs text-gray-500">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HotDestinations() {
  const [season, setSeason] = useState(seasons[0]);
  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <h2 className="text-lg font-bold text-slate-900 mb-4">Điểm đến đang hot</h2>
      <div className="flex gap-2 mb-6">
        {seasons.map((s) => (
          <Pill key={s} active={s === season} onClick={() => setSeason(s)}>
            {s}
          </Pill>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {hotDestinations.map((d) => (
          <div key={d.name} className="rounded-xl overflow-hidden relative h-64 group">
            <img src={img(d.seed, 400, 500)} alt={d.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <p className="font-semibold">{d.name}</p>
              <p className="text-xs opacity-90">{d.tag}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TravelBlog() {
  const [filter, setFilter] = useState(blogFilters[0]);
  return (
    <section className="max-w-6xl mx-auto px-6 py-4">
      <div className="bg-gray-50 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Blog du lịch</h2>
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {blogFilters.map((f) => (
            <Pill key={f} active={f === filter} onClick={() => setFilter(f)}>
              {f}
            </Pill>
          ))}
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {blogCities.map((c) => (
            <div key={c.name} className="text-center">
              <div className="rounded-xl overflow-hidden h-20 mb-2">
                <img src={img(c.seed, 200, 200)} alt={c.name} className="w-full h-full object-cover" />
              </div>
              <p className="text-xs font-medium text-gray-700">{c.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TripReviews() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-900">Đánh giá chuyến đi</h2>
        <div className="flex gap-2">
          <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500">‹</button>
          <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500">›</button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="relative h-40">
              <img src={img(r.seed, 300, 300)} alt={r.title} className="w-full h-full object-cover" />
              <button
                aria-label="Yêu thích"
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-xs"
              >
                ♡
              </button>
              <span className="absolute bottom-2 left-2 bg-white/95 text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                <Star /> {r.rating} Excellent
              </span>
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold text-slate-900">{r.title}</p>
              <p className="text-xs text-gray-500 mb-2">{r.subtitle}</p>
              <button className="text-xs font-semibold text-slate-900 underline">Xem chi tiết</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ExploreNow() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <h2 className="text-lg font-bold text-slate-900 mb-4">Khám phá ngay</h2>
      <div className="grid md:grid-cols-[2fr_1fr] gap-4">
        <div
          className="relative rounded-2xl overflow-hidden h-72 bg-cover bg-center flex items-end p-6"
          style={{ backgroundImage: `url(${img("sunsetbeach", 900, 500)})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="relative text-white">
            <h3 className="text-2xl font-bold mb-1">Trải nghiệm ngay</h3>
            <p className="text-sm opacity-90 mb-4">Gợi ý địa điểm du lịch</p>
            <button className="bg-sky-500 text-white text-sm font-semibold px-4 py-2 rounded-lg">
              Khám phá
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {exploreSidebar.map((s) => (
            <div key={s.name} className="relative rounded-2xl overflow-hidden h-[84px]">
              <img src={img(s.seed, 400, 200)} alt={s.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex flex-col justify-center px-4">
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
/* Page                                                                 */
/* ------------------------------------------------------------------ */
export default function Home() {
  const [premium, setPremium] = useState(() => { try { return localStorage.getItem('wayvee-home-preview') === 'premium'; } catch { return false; } });
  const [versionNote, setVersionNote] = useState('');
  function toggleVersion() {
    const next = !premium; setPremium(next);
    try { localStorage.setItem('wayvee-home-preview', next ? 'premium' : 'free'); setVersionNote(''); }
    catch { setVersionNote('Đã đổi giao diện, nhưng trình duyệt không lưu được lựa chọn.'); }
  }
  return (
    <div className={`home-page bg-white min-h-screen font-sans${premium ? " home-premium" : ""}`}>
      <SiteHeader />
      <div className="home-version-bar"><span>Test giao diện · {premium ? 'Premium' : 'Free'}</span><button type="button" aria-pressed={premium} onClick={toggleVersion}>{premium ? 'Chuyển sang Free' : 'Dùng thử giao diện Premium'}</button></div>
      {versionNote && <p className="home-version-note" role="status">{versionNote}</p>}
      <Hero />
      {premium && <PremiumWeather />}
      <WhyUseWayvee />
      <TravelYourWay />
      <div id="destinations"><HotDestinations /></div>
      <div id="travel-blog"><TravelBlog /></div>
      <div id="trip-reviews"><TripReviews /></div>
      <div id="explore"><ExploreNow /></div>
      <SiteFooter />
    </div>
  );
}
