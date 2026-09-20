import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppHeader, AppFooter } from "~/shared/components";
import { LoginCard, RegisterCard } from "~/features/auth";
import { getPlaceById } from "../services/places-api";

export function PlaceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showFullAmenities, setShowFullAmenities] = useState(false);
  const [authModal, setAuthModal] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      const data = await getPlaceById(id);
      if (isMounted) {
        setPlace(data);
        setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="bg-[#f8fafc] dark:bg-slate-950 min-h-screen flex flex-col">
        <AppHeader
          onLogin={() => setAuthModal("login")}
          onRegister={() => setAuthModal("register")}
        />
        <div className="max-w-6xl mx-auto px-4 py-16 flex-grow flex items-center justify-center">
          <div className="animate-pulse space-y-4 w-full">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full" />
          </div>
        </div>
        <AppFooter />
      </div>
    );
  }

  if (!place) {
    return (
      <div className="bg-[#f8fafc] dark:bg-slate-950 min-h-screen flex flex-col">
        <AppHeader
          onLogin={() => setAuthModal("login")}
          onRegister={() => setAuthModal("register")}
        />
        <div className="max-w-6xl mx-auto px-4 py-16 flex-grow text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Không tìm thấy địa điểm</h2>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-[#0b2545] text-white text-xs font-bold rounded-xl"
          >
            Quay lại
          </button>
        </div>
        <AppFooter />
      </div>
    );
  }

  const mainImage = place.imageUrl || null;

  return (
    <div className="bg-[#f8fafc] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans min-h-screen flex flex-col antialiased">
      {/* App Header */}
      <AppHeader
        onLogin={() => setAuthModal("login")}
        onRegister={() => setAuthModal("register")}
      />

      {/* Main Container */}
      <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        
        {/* Top Header Row: Name, Rating, Address & Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b2545] dark:text-white tracking-tight">
                {place.name}
              </h1>
              {/* Star Rating */}
              {place.rating && <span className="text-sm text-amber-500">★ {place.rating}</span>}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {place.address}
            </p>
          </div>

          {/* Action Buttons: Favorite, Share, Add to Trip */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-rose-500 cursor-pointer shadow-2xs transition-transform hover:scale-105"
              title="Yêu thích"
            >
              <span className={`text-base ${isFavorite ? "text-rose-500" : ""}`}>♥</span>
            </button>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(window.location.href)}
              className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-sky-500 cursor-pointer shadow-2xs transition-transform hover:scale-105"
              title="Chia sẻ"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-5.967 3 3 0 000 5.967z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setIsAdded(!isAdded)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
                isAdded
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-[#0b2545] hover:bg-[#102f58] dark:bg-sky-500 dark:hover:bg-sky-600 text-white dark:text-slate-950"
              }`}
            >
              <span>{isAdded ? "Đã thêm ✓" : "Thêm +"}</span>
            </button>
          </div>
        </div>

        {/* Image Gallery Layout (1 Big Main Image on Left + 4 Grid Thumbnails on Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-80 sm:h-96 rounded-3xl overflow-hidden shadow-md">
          {/* Main Left Image */}
          <div className="relative w-full h-full bg-slate-200 dark:bg-slate-800">
            {mainImage ? (
                <img src={mainImage} alt={place.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-5xl">📍</div>
              )}
          </div>

          <div className="hidden md:block rounded-3xl bg-slate-100 dark:bg-slate-800" />
        </div>

        {/* Section 1: Description */}
        {place.description && <section aria-label="Mô tả địa điểm" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Description
          </h2>
          {place.estimatedCost && (
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              <strong className="text-slate-900 dark:text-white">Dự tính:</strong> {place.estimatedCost}
            </p>
          )}
          <p className={`text-xs text-slate-600 dark:text-slate-300 leading-relaxed ${showFullDesc ? "" : "line-clamp-3"}`}>
            {place.description}
          </p>
          <button
            type="button"
            onClick={() => setShowFullDesc(!showFullDesc)}
            className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            {showFullDesc ? "Show Less" : "Show More"}
          </button>
        </section>}

        {/* Section 2: Amenities */}
        <section aria-label="Tiện ích địa điểm" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Amenities
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6">
            {(showFullAmenities ? place.amenities : (place.amenities || []).slice(0, 6)).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          {place.amenities?.length > 6 && (
            <button
              type="button"
              onClick={() => setShowFullAmenities(!showFullAmenities)}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              {showFullAmenities ? "Show Less" : "Show all"}
            </button>
          )}
        </section>

        {/* Section 3: Location Map */}
        <section aria-label="Vị trí bản đồ" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Location
          </h2>
          <div className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            {place.latitude != null && place.longitude != null && <iframe
              title="Bản đồ địa điểm"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight="0"
              marginWidth="0"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${place.longitude - 0.01}%2C${place.latitude - 0.01}%2C${place.longitude + 0.01}%2C${place.latitude + 0.01}&layer=mapnik&marker=${place.latitude}%2C${place.longitude}`}
            />}
          </div>
        </section>

        {place.phone || place.website || place.openingHours ? (
          <section aria-label="Thông tin liên hệ" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Thông tin địa điểm</h2>
            {place.openingHours && <p className="text-sm text-slate-600 dark:text-slate-300">Giờ mở cửa: {place.openingHours}</p>}
            {place.phone && <p className="text-sm text-slate-600 dark:text-slate-300">Điện thoại: {place.phone}</p>}
            {place.website && <p className="text-sm text-slate-600 dark:text-slate-300 break-all">Website: {place.website}</p>}
          </section>
        ) : null}

      </main>

      {/* Footer */}
      <AppFooter />

      {/* Auth Modals */}
      {authModal === "login" && (
        <LoginCard
          onClose={() => setAuthModal(null)}
          onSubmit={() => setAuthModal(null)}
          onSignUp={() => setAuthModal("register")}
        />
      )}

      {authModal === "register" && (
        <RegisterCard
          onClose={() => setAuthModal(null)}
          onSubmit={() => setAuthModal(null)}
          onLogin={() => setAuthModal("login")}
        />
      )}
    </div>
  );
}
