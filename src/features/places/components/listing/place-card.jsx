import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "~/providers/i18n-provider";
import { useAuth } from "~/providers/auth-provider";
import { checkFavorite, addFavorite, removeFavoriteByOsmId } from "~/shared/services/favorite-api";

/**
 * Category icon + gradient config — mỗi category dùng chung 1 icon + màu gradient,
 * không cần ảnh riêng từng địa điểm.
 */
const CATEGORY_ICON_MAP = {
  RESTAURANT: { icon: "🍜", gradient: "from-orange-400 to-red-500", bg: "bg-orange-50 dark:bg-orange-950/40" },
  CAFE:       { icon: "☕", gradient: "from-amber-400 to-yellow-600", bg: "bg-amber-50 dark:bg-amber-950/40" },
  FAST_FOOD:  { icon: "🍔", gradient: "from-yellow-400 to-orange-500", bg: "bg-yellow-50 dark:bg-yellow-950/40" },
  BAR:        { icon: "🍸", gradient: "from-purple-400 to-indigo-600", bg: "bg-purple-50 dark:bg-purple-950/40" },
  HOTEL:      { icon: "🏨", gradient: "from-blue-400 to-cyan-500", bg: "bg-blue-50 dark:bg-blue-950/40" },
  ATTRACTION: { icon: "🏛️", gradient: "from-emerald-400 to-teal-600", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  SHOPPING:   { icon: "🛍️", gradient: "from-pink-400 to-rose-500", bg: "bg-pink-50 dark:bg-pink-950/40" },
  ENTERTAINMENT: { icon: "🎭", gradient: "from-violet-400 to-fuchsia-500", bg: "bg-violet-50 dark:bg-violet-950/40" },
  OTHER:      { icon: "📍", gradient: "from-slate-400 to-slate-600", bg: "bg-slate-50 dark:bg-slate-800/60" }
};

function getCategoryVisual(categoryCode) {
  const key = (categoryCode || "").toUpperCase();
  return CATEGORY_ICON_MAP[key] || CATEGORY_ICON_MAP.OTHER;
}

/**
 * Reusable PlaceCard supporting both 'list' (horizontal) and 'grid' (vertical) modes.
 * Ảnh riêng từng địa điểm đã được bỏ — thay bằng icon theo category.
 */
export function PlaceCard({
  place,
  variant = "list",
  isAdded = false,
  onToggleAdd,
  onNavigateDetail
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const placeOsmId = place.osmId || place.id;

  useEffect(() => {
    if (!isAuthenticated || !placeOsmId) return;
    let cancelled = false;
    checkFavorite(placeOsmId)
      .then(res => { if (!cancelled) setIsFavorite(!!res.data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isAuthenticated, placeOsmId]);

  const handleToggleFavorite = useCallback(async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent("wayvee:prompt-login"));
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
          placeName: place.name,
          latitude: place.latitude || place.lat || 0,
          longitude: place.longitude || place.lng || place.lon || 0
        });
        setIsFavorite(true);
      }
    } catch (err) {
      console.error("Favorite toggle failed:", err);
    } finally {
      setFavLoading(false);
    }
  }, [isAuthenticated, favLoading, isFavorite, placeOsmId, place]);

  const placeId = place.osmId || place.id;
  const handleNavigateDetail = () => {
    if (onNavigateDetail) {
      onNavigateDetail(place);
    } else {
      navigate(`/places/${placeId}`, {
        state: {
          place,
          returnUrl: `${location.pathname}${location.search}`
        }
      });
    }
  };

  // Category visual — icon + gradient chung cho cả category
  const catVisual = getCategoryVisual(place.categoryCode);

  // Rating & score
  const ratingVal = place.rating;
  const reviewCount = place.reviewCount;
  const distanceKm = place.distanceMeters ? (place.distanceMeters / 1000).toFixed(1) : "0.5";
  const priceIndicator = place.priceLevel || "$$";

  // Category label
  const categoryCodeUpper = (place.categoryCode || "").toUpperCase();
  const categoryMap = {
    RESTAURANT: t("places.categories.restaurant") || "Quán ăn",
    CAFE: t("places.categories.cafe") || "Quán cà phê",
    FAST_FOOD: t("places.categories.fastFood") || "Thức ăn nhanh",
    BAR: t("places.categories.bar") || "Quán bar / Pub",
    HOTEL: t("places.categories.hotel") || "Khách sạn / Lưu trú",
    ATTRACTION: t("places.categories.attraction") || "Điểm tham quan",
    SHOPPING: t("places.categories.shopping") || "Mua sắm",
    ENTERTAINMENT: t("places.categories.entertainment") || "Khu vui chơi",
    OTHER: t("places.categories.other") || "Địa điểm khác"
  };
  const categoryLabel = categoryMap[categoryCodeUpper] || place.categoryCode || t("places.categories.other", "Địa điểm");

  // LIST VIEW: Horizontal layout — icon category thay ảnh
  if (variant === "list") {
    return (
      <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Category Icon Thumbnail — thay thế ảnh riêng */}
        <div
          className={`w-full sm:w-48 h-36 rounded-xl overflow-hidden relative flex-shrink-0 border border-slate-100 dark:border-slate-800 cursor-pointer bg-gradient-to-br ${catVisual.gradient} flex items-center justify-center`}
          onClick={handleNavigateDetail}
        >
          <span className="text-5xl drop-shadow-lg select-none">{catVisual.icon}</span>
          {/* Favorite button */}
          <button
            type="button"
            onClick={handleToggleFavorite}
            disabled={favLoading}
            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full backdrop-blur-xs flex items-center justify-center cursor-pointer shadow-xs transition-all hover:scale-110 active:scale-90 ${
              isFavorite
                ? "bg-white/95 dark:bg-slate-900/95 text-rose-500 ring-1 ring-rose-200 dark:ring-rose-900/40"
                : "bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:text-rose-500"
            }`}
            aria-label={isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
            title={isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
          >
            {isFavorite ? (
              <svg className="w-4.5 h-4.5 fill-rose-500 text-rose-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            )}
          </button>
          {/* Category Pill */}
          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/40 text-white backdrop-blur-xs">
            {categoryLabel}
          </span>
        </div>

        {/* Content Body */}
        <div className="flex-grow min-w-0 space-y-1.5 w-full">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:text-sky-600 dark:hover:text-sky-400 transition-colors" onClick={handleNavigateDetail}>
                {place.name}
              </h4>
              {/* Rating */}
              <div className="flex items-center space-x-1.5 mt-0.5">
                <div className="flex text-amber-400 text-xs">
                  {ratingVal ? `${ratingVal} ★` : "Chưa có đánh giá"}
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {ratingVal ?? "-"}
                </span>
                <span className="text-[11px] text-slate-400">
                  {reviewCount ? `(${reviewCount} ${t("places.card.reviews") || "đánh giá"})` : ""}
                </span>
              </div>
            </div>

            {/* Price Level */}
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md">
              {priceIndicator}
            </span>
          </div>

          {/* Address & Distance */}
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 line-clamp-1">
            <svg className="w-3.5 h-3.5 flex-shrink-0 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{distanceKm} km từ trung tâm • {place.address || "Địa điểm trung tâm thành phố"}</span>
          </p>

          {/* Opening hours & info */}
          {place.openingHours && (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              🕒 {place.openingHours}
            </p>
          )}

          {/* Action button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => onToggleAdd && onToggleAdd(place)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                isAdded
                  ? "bg-emerald-600 text-white shadow-xs hover:bg-emerald-700"
                  : "bg-[#0b2545] hover:bg-[#102f58] dark:bg-sky-500 dark:hover:bg-sky-600 text-white dark:text-slate-950 shadow-xs"
              }`}
            >
              {isAdded ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{t("places.card.added") || "Đã thêm"}</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>{t("places.card.addToTrip") || "Thêm vào lịch trình"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </article>
    );
  }

  // GRID VIEW: Vertical layout — icon category thay ảnh
  return (
    <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all flex flex-col justify-between group">
      {/* Category Icon Header — thay thế ảnh */}
      <div
        className={`w-full h-44 relative overflow-hidden cursor-pointer bg-gradient-to-br ${catVisual.gradient} flex items-center justify-center`}
        onClick={handleNavigateDetail}
      >
        <span className="text-6xl drop-shadow-lg select-none group-hover:scale-110 transition-transform duration-500">{catVisual.icon}</span>
        {/* Favorite button */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          disabled={favLoading}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full backdrop-blur-xs flex items-center justify-center cursor-pointer shadow-xs transition-all hover:scale-110 active:scale-90 ${
            isFavorite
              ? "bg-white/95 dark:bg-slate-900/95 text-rose-500 ring-1 ring-rose-200 dark:ring-rose-900/40"
              : "bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:text-rose-500"
          }`}
          aria-label={isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
          title={isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
        >
          {isFavorite ? (
            <svg className="w-4.5 h-4.5 fill-rose-500 text-rose-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </button>
        {/* Category Pill */}
        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/40 text-white backdrop-blur-xs">
          {categoryLabel}
        </span>
        {/* Price tag */}
        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200">
          {priceIndicator}
        </span>
      </div>

      {/* Body Content */}
      <div className="p-4 space-y-2 flex-grow flex flex-col justify-between">
        <div className="space-y-1.5">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 cursor-pointer hover:text-sky-600 dark:hover:text-sky-400 transition-colors" onClick={handleNavigateDetail}>
            {place.name}
          </h4>

          {/* Rating */}
          <div className="flex items-center space-x-1">
            {ratingVal && <span className="text-amber-500 text-xs">★</span>}
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {ratingVal ?? "-"}
            </span>
            <span className="text-[11px] text-slate-400">
              {reviewCount ? `(${reviewCount})` : ""}
            </span>
          </div>

          {/* Distance & Address */}
          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
            📍 {distanceKm} km • {place.address || "Địa điểm trung tâm"}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-3">
          <button
            type="button"
            onClick={() => onToggleAdd && onToggleAdd(place)}
            className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              isAdded
                ? "bg-emerald-600 text-white shadow-xs hover:bg-emerald-700"
                : "bg-[#0b2545] hover:bg-[#102f58] dark:bg-sky-500 dark:hover:bg-sky-600 text-white dark:text-slate-950 shadow-xs"
            }`}
          >
            {isAdded ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>{t("places.card.added") || "Đã thêm"}</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span>{t("places.card.addToTrip") || "Thêm vào lịch trình"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
