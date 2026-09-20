import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "~/providers/i18n-provider";

/**
 * Reusable PlaceCard supporting both 'list' (horizontal) and 'grid' (vertical) modes
 */
export function PlaceCard({
  place,
  variant = "list",
  isAdded = false,
  onToggleAdd
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  const placeId = place.osmId || place.id;
  const handleNavigateDetail = () => navigate(`/places/${placeId}`);

  const displayImage = place.imageUrl && !place.imageUrl.includes("No_image_available")
    ? place.imageUrl
    : null;

  // Rating & score
  const ratingVal = place.rating;
  const reviewCount = place.reviewCount;
  const distanceKm = place.distanceMeters ? (place.distanceMeters / 1000).toFixed(1) : "0.5";
  const priceIndicator = place.priceLevel || "$$";

  // Category label
  const categoryMap = {
    RESTAURANT: t("places.categories.restaurant") || "Quán ăn",
    CAFE: t("places.categories.cafe") || "Quán cà phê",
    FAST_FOOD: t("places.categories.fastFood") || "Thức ăn nhanh",
    BAR: t("places.categories.bar") || "Quán bar / Pub",
    ATTRACTION: t("places.categories.attraction") || "Điểm tham quan",
    SHOPPING: t("places.categories.shopping") || "Mua sắm",
    OTHER: t("places.categories.other") || "Địa điểm khác"
  };
  const categoryLabel = categoryMap[place.categoryCode] || place.categoryCode || "Địa điểm";

  // LIST VIEW: Horizontal layout matching Screenshot 1
  if (variant === "list") {
    return (
      <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Thumbnail Image */}
        <div className="w-full sm:w-48 h-36 rounded-xl overflow-hidden relative flex-shrink-0 border border-slate-100 dark:border-slate-800 cursor-pointer" onClick={handleNavigateDetail}>
            {displayImage ? (
              <img
                src={displayImage}
                alt={place.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-3xl">📍</div>
            )}
          {/* Favorite button */}
          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-rose-500 cursor-pointer shadow-xs"
            aria-label="Yêu thích"
          >
            <span className={isFavorite ? "text-rose-500" : ""}>♥</span>
          </button>
          {/* Category Pill on Image */}
          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#0b2545]/85 text-white backdrop-blur-xs">
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

  // GRID VIEW: Vertical 3-column layout matching Screenshot 2
  return (
    <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all flex flex-col justify-between group">
      {/* Top Image */}
      <div className="w-full h-44 relative overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer" onClick={handleNavigateDetail}>
        {displayImage ? (
          <img
            src={displayImage}
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-3xl">📍</div>
        )}
        {/* Favorite button */}
        <button
          type="button"
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-rose-500 cursor-pointer shadow-xs"
          aria-label="Yêu thích"
        >
          <span className={isFavorite ? "text-rose-500" : ""}>♥</span>
        </button>
        {/* Category Pill */}
        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#0b2545]/85 text-white backdrop-blur-xs">
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
