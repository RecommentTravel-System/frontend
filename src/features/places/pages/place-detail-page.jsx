import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { AppHeader, AppFooter } from "~/shared/components";
import { LoginCard, RegisterCard } from "~/features/auth";
import { useAuth } from "~/providers/auth-provider";
import { checkFavorite, addFavorite, removeFavoriteByOsmId } from "~/shared/services/favorite-api";
import { getPlaceById } from "../services/places-api";

export function PlaceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialPlace = location.state?.place || null;
  const { isAuthenticated } = useAuth();

  const [place, setPlace] = useState(
    initialPlace || {
      id,
      osmId: id,
      name: `Địa điểm #${id}`,
      address: "Khu vực du lịch",
      categoryCode: "ATTRACTION",
      description: "Địa điểm tham quan, trải nghiệm du lịch và ẩm thực hấp dẫn dành cho du khách trên hệ thống WAYVEE.",
      amenities: ["Wifi miễn phí", "Chỗ để xe", "Thanh toán thẻ", "Điều hòa", "Chụp ảnh check-in", "Thân thiện gia đình"]
    }
  );
  const [loading, setLoading] = useState(!initialPlace);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showFullAmenities, setShowFullAmenities] = useState(false);
  const [authModal, setAuthModal] = useState(null);

  const placeOsmId = place?.osmId || place?.id || id;

  useEffect(() => {
    if (!isAuthenticated || !placeOsmId) {
      setIsFavorite(false);
      return;
    }
    let cancelled = false;
    checkFavorite(placeOsmId)
      .then((res) => {
        if (!cancelled) {
          setIsFavorite(res?.data === true || res === true);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, placeOsmId]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      setAuthModal("login");
      return;
    }
    if (favLoading || !placeOsmId) return;
    setFavLoading(true);
    try {
      if (isFavorite) {
        await removeFavoriteByOsmId(placeOsmId);
        setIsFavorite(false);
      } else {
        await addFavorite({
          osmId: Number(placeOsmId) || placeOsmId,
          placeName: place?.name || `Địa điểm #${placeOsmId}`,
          latitude: Number(place?.latitude || place?.lat) || 0,
          longitude: Number(place?.longitude || place?.lng || place?.lon) || 0
        });
        setIsFavorite(true);
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    } finally {
      setFavLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!initialPlace) setLoading(true);
      try {
        const data = await getPlaceById(id);
        if (isMounted) {
          if (data) {
            setPlace((prev) => ({ ...(prev || {}), ...data }));
          }
        }
      } catch (err) {
        console.warn("Could not load place details from API:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [id, initialPlace]);

  if (loading && !place) {
    return (
      <div className="bg-[#f8fafc] dark:bg-slate-950 min-h-screen flex flex-col">
        <AppHeader
          onLogin={() => setAuthModal("login")}
          onRegister={() => setAuthModal("register")}
        />
        <div className="max-w-6xl mx-auto px-4 py-16 flex-grow flex items-center justify-center">
          <div className="animate-pulse space-y-4 w-full max-w-2xl">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full" />
          </div>
        </div>
        <AppFooter />
      </div>
    );
  }

  const safeLat = Number(place.latitude || place.lat) || 16.4637;
  const safeLng = Number(place.longitude || place.lng || place.lon) || 107.5909;
  const mainImage = place.imageUrl || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80";

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
              onClick={handleToggleFavorite}
              disabled={favLoading}
              className={`w-10 h-10 rounded-full border flex items-center justify-center cursor-pointer shadow-2xs transition-all hover:scale-110 active:scale-95 ${
                isFavorite
                  ? "border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-500"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:border-rose-200"
              }`}
              title={isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
              aria-label={isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
            >
              {isFavorite ? (
                <svg className="w-5 h-5 fill-rose-500 text-rose-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
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
            {(showFullAmenities
              ? (Array.isArray(place.amenities) ? place.amenities : ["Wifi miễn phí", "Chỗ để xe", "Thanh toán thẻ", "Điều hòa", "Chụp ảnh check-in"])
              : (Array.isArray(place.amenities) ? place.amenities : ["Wifi miễn phí", "Chỗ để xe", "Thanh toán thẻ", "Điều hòa", "Chụp ảnh check-in"]).slice(0, 6)
            ).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          {(Array.isArray(place.amenities) && place.amenities.length > 6) && (
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
            <iframe
              title="Bản đồ địa điểm"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight="0"
              marginWidth="0"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${(safeLng - 0.01).toFixed(6)}%2C${(safeLat - 0.01).toFixed(6)}%2C${(safeLng + 0.01).toFixed(6)}%2C${(safeLat + 0.01).toFixed(6)}&layer=mapnik&marker=${safeLat}%2C${safeLng}`}
            />
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
