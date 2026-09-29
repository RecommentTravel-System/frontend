import { useState, useEffect } from "react";
import { useTranslation } from "~/providers/i18n-provider";
import {
  CATEGORY_FILTER_CONFIGS,
  DISTANCE_OPTIONS,
  RATING_OPTIONS
} from "../../config/filter-config";
import { getAllCategoriesApi } from "~/features/categories/services/category-api";

/**
 * Reusable Configuration-Driven Filter Panel.
 * Uses two-tier state: updates pendingFilters locally, and triggers API call only when "Áp dụng bộ lọc" (Apply) is clicked.
 */
export function FilterPanel({
  filters,
  pendingFilterCount = 0,
  currentCategoryConfig,
  onSelectCategory,
  onChangeDistance,
  onSelectRating,
  onSelectPrice,
  onTogglePreference,
  onApplyFilters,
  onResetFilters,
  isLoading = false,
  categories: propCategories = []
}) {
  const { t, currentLanguage } = useTranslation();
  const [dbCategories, setDbCategories] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getAllCategoriesApi()
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (list.length > 0) {
          const mapped = list.map((c) => {
            const code = c.code || String(c.categoryId);
            return {
              categoryId: code,
              code: c.code || code,
              name: c.name || c.nameVi || c.nameEn || code,
              nameVi: c.nameVi || c.name || code,
              nameEn: c.nameEn || "",
              defaultLabel: c.name || code
            };
          });
          setDbCategories(mapped);
        }
      })
      .catch((err) => {
        console.error("Failed to load categories from API:", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Local state for smooth distance slider dragging with 500ms debounce
  const [sliderVal, setSliderVal] = useState(filters.distanceKm);

  useEffect(() => {
    setSliderVal(filters.distanceKm);
  }, [filters.distanceKm]);

  const handleSliderChange = (newVal) => {
    setSliderVal(newVal);
  };

  const handleSliderCommit = (newVal) => {
    onChangeDistance(newVal);
  };

  const defaultCategories = Object.values(CATEGORY_FILTER_CONFIGS);
  const rawList = propCategories.length > 0 ? propCategories : dbCategories;
  const categoriesToRender = rawList.length > 0 ? rawList : defaultCategories;
  const preferences = currentCategoryConfig?.preferences || [];

  const getCategoryLabel = (cat) => {
    if (!cat) return "";

    // 1. If cat has explicit language properties from backend/database
    if (currentLanguage === "en" && cat.nameEn) return cat.nameEn;
    if (currentLanguage === "vi" && cat.nameVi) return cat.nameVi;

    // 2. Lookup standard translation by code or name keyword for seamless EN/VI switching
    const codeUpper = (cat.code || cat.categoryId || "").toUpperCase();
    const nameLower = (cat.name || cat.nameVi || "").toLowerCase().trim();

    const codeToKey = {
      RESTAURANT: "restaurant",
      CAFE: "cafe",
      ENTERTAINMENT: "entertainment",
      ATTRACTION: "attraction",
      SHOPPING: "shopping",
      FAST_FOOD: "fastFood",
      FASTFOOD: "fastFood",
      BAR: "bar",
      PUB: "bar",
      HOTEL: "hotel",
      OTHER: "other"
    };

    const nameToKey = {
      "quán ăn": "restaurant",
      "nhà hàng": "restaurant",
      "quán cà phê": "cafe",
      "cà phê": "cafe",
      "khu vui chơi": "entertainment",
      "giải trí": "entertainment",
      "điểm tham quan": "attraction",
      "tham quan": "attraction",
      "mua sắm": "shopping",
      "thức ăn nhanh": "fastFood",
      "quán bar": "bar",
      "quán bar / pub": "bar",
      "khách sạn": "hotel",
      "khác": "other"
    };

    const targetKey = codeToKey[codeUpper] || nameToKey[nameLower];
    if (targetKey) {
      const translated = t(`places.categories.${targetKey}`);
      if (translated && !translated.startsWith("places.categories.")) {
        return translated;
      }
    }

    if (cat.labelKey) {
      const translated = t(cat.labelKey);
      if (translated && translated !== cat.labelKey) return translated;
    }

    if (currentLanguage === "en" && cat.nameEn) return cat.nameEn;
    return cat.name || cat.defaultLabel || cat.code || "";
  };

  return (
    <div
      aria-label={t("places.filter.title") || "Bộ lọc"}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.04)] space-y-5"
    >
      {/* Filter Header: Title & Clear All */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-slate-700 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
            {t("places.filter.title") || "Bộ lọc tìm kiếm"}
          </h3>
        </div>
        <button
          type="button"
          onClick={onResetFilters}
          className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors cursor-pointer"
        >
          {t("places.filter.clearAll") || "Xóa tất cả"}
        </button>
      </div>

      {/* 1. Category Section (Common Filter) */}
      <div className="space-y-2.5">
        <label className="block text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
          {t("places.filter.category") || "Loại địa điểm"}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {categoriesToRender.map((cat) => {
            const catId = cat.code || cat.categoryId || cat.name;
            const isSelected =
              filters.category === catId ||
              String(filters.category).toUpperCase() === String(catId).toUpperCase() ||
              (cat.code && String(filters.category).toUpperCase() === String(cat.code).toUpperCase());
            const label = getCategoryLabel(cat);
            return (
              <button
                key={cat.categoryId || cat.code || cat.name}
                type="button"
                onClick={() => onSelectCategory(cat.code || cat.categoryId || cat.name)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#0b2545] dark:bg-sky-500 text-white dark:text-slate-950 font-semibold shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-slate-100 dark:border-slate-800" />

      {/* 2. Distance Section (Common Filter with Debounced Slider) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
            {t("places.filter.distance") || "Khoảng cách"}
          </label>
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
            ≤ {sliderVal} km
          </span>
        </div>
        <input
          type="range"
          min={DISTANCE_OPTIONS.min}
          max={DISTANCE_OPTIONS.max}
          step={DISTANCE_OPTIONS.step}
          value={sliderVal}
          onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
          onMouseUp={(e) => handleSliderCommit(parseFloat(e.target.value))}
          onTouchEnd={(e) => handleSliderCommit(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0b2545] dark:accent-sky-400"
        />
        <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <span>{DISTANCE_OPTIONS.min} km</span>
          <span>{DISTANCE_OPTIONS.max} km</span>
        </div>
      </div>

      <hr className="border-slate-100 dark:border-slate-800" />

      {/* 3. Rating Section (Common Filter) */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
          {t("places.filter.rating") || "Đánh giá sao"}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {RATING_OPTIONS.map((item) => {
            const isSelected = filters.minRating === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onSelectRating(item.value)}
                className={`flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#0b2545] dark:border-sky-500 bg-[#0b2545]/5 dark:bg-sky-500/10 text-[#0b2545] dark:text-sky-400"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <span className="text-amber-500">★</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-slate-100 dark:border-slate-800" />

      {/* 4. Dynamic Category Preferences */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
            {t("places.filter.preferences") || "Sở thích / Đặc thù"}
          </label>
          <span className="text-[10px] text-slate-400">
            {getCategoryLabel(currentCategoryConfig)}
          </span>
        </div>

        {preferences.length === 0 ? (
          <p className="text-xs text-slate-400 italic">
            {t("places.filter.noPreferences") || "Không có bộ lọc đặc thù"}
          </p>
        ) : (
          <div className="space-y-2">
            {preferences.map((pref) => {
              const isChecked = filters.selectedPreferences?.includes(pref.id);
              const label = (pref.labelKey && t(pref.labelKey) !== pref.labelKey)
                ? t(pref.labelKey)
                : (pref.defaultLabel || pref.id);
              return (
                <label
                  key={pref.id}
                  className="flex items-center space-x-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none hover:text-slate-900 dark:hover:text-white"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onTogglePreference(pref.id)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-[#0b2545] dark:text-sky-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#0b2545] dark:accent-sky-500"
                  />
                  <span className="flex-1 truncate">{label}</span>
                  {pref.isFutureFeature && (
                    <span className="text-[9px] px-1 py-0.2 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded font-medium">
                      {t("places.filter.beta") || "Gợi ý"}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Apply Filters Button (Prominent Action with Badge Counter & Disabled Loading State) */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          disabled={isLoading}
          onClick={onApplyFilters}
          className="w-full py-2.5 px-4 bg-[#0b2545] hover:bg-[#102f58] dark:bg-sky-500 dark:hover:bg-sky-600 text-white dark:text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span>{t("places.filter.searching") || "Đang tìm kiếm..."}</span>
          ) : (
            <>
              <span>{t("places.filter.applyButton") || "Áp dụng bộ lọc"}</span>
              {pendingFilterCount > 0 && (
                <span className="bg-sky-500 dark:bg-slate-950 text-white dark:text-sky-400 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                  {pendingFilterCount}
                </span>
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

