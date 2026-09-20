import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "~/providers/i18n-provider";
import { AppHeader } from "~/shared/components";
import { AppFooter } from "~/shared/components";
import { FilterPanel } from "../components/filters/filter-panel";
import { PlaceCard } from "../components/listing/place-card";
import { usePlacesFilter } from "../hooks/use-places-filter";
import {
  searchNearbyPlaces,
  resolveCoordinates
} from "../services/places-api";

export function PlacesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const tripState = location.state || {};

  // Destination context
  const destination = tripState.destination || "Huế";
  const coordinates = useMemo(() => resolveCoordinates(destination), [destination]);

  // View mode: 'list' (Image 1) or 'grid' (Image 2)
  const [viewMode, setViewMode] = useState("list");

  // Sort option: 'popular', 'rating', 'distance'
  const [sortBy, setSortBy] = useState("popular");

  // Filter hook
  const {
    pendingFilters,
    appliedFilters,
    pendingFilterCount,
    currentCategoryConfig,
    setCategory,
    setDistanceKm,
    setMinRating,
    setPriceLevel,
    togglePreference,
    setKeyword,
    applyFilters,
    resetFilters,
    toBackendPayload
  } = usePlacesFilter();

  // Data fetching state
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMapModal, setShowMapModal] = useState(false);

  // Selected places to add to trip itinerary
  const [selectedPlaceIds, setSelectedPlaceIds] = useState(() => {
    const existing = tripState.placesList || [];
    return new Set(existing.map((p) => p.osmId || p.id));
  });
  const [addedPlacesMap, setAddedPlacesMap] = useState(() => {
    const map = new Map();
    (tripState.placesList || []).forEach((p) => map.set(p.osmId || p.id, p));
    return map;
  });

  // Fetch real data when appliedFilters changes
  useEffect(() => {
    let isMounted = true;

    async function loadPlaces() {
      setLoading(true);
      try {
        const payload = toBackendPayload(coordinates);
        const data = await searchNearbyPlaces(payload);
        if (isMounted) {
          setPlaces(data || []);
        }
      } catch (err) {
        console.error("Error fetching places:", err);
        if (isMounted) {
          setPlaces([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPlaces();

    return () => {
      isMounted = false;
    };
  }, [toBackendPayload, coordinates]);

  // Client-side sorting and rating filtering if needed
  const filteredPlaces = useMemo(() => {
    let result = [...places];

    if (appliedFilters.minRating) {
      result = result.filter((p) => (p.rating || 4.5) >= appliedFilters.minRating);
    }

    if (appliedFilters.priceLevel) {
      result = result.filter((p) => (p.priceLevel || "$$") === appliedFilters.priceLevel);
    }

    if (sortBy === "rating") {
      result.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
    } else if (sortBy === "distance") {
      result.sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0));
    } else {
      result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    }

    return result;
  }, [places, appliedFilters.minRating, appliedFilters.priceLevel, sortBy]);

  // Handle adding place to trip
  const handleToggleAddPlace = (place) => {
    const placeId = place.osmId || place.id;
    const newSelected = new Set(selectedPlaceIds);
    const newMap = new Map(addedPlacesMap);

    if (newSelected.has(placeId)) {
      newSelected.delete(placeId);
      newMap.delete(placeId);
    } else {
      newSelected.add(placeId);
      newMap.set(placeId, {
        id: placeId,
        osmId: place.osmId,
        name: place.name,
        location: place.address || `${destination}`,
        rating: Math.round(place.rating || 5),
        score: (place.rating || 4.8).toFixed(1),
        reviewCount: `${place.reviewCount || 350}`,
        image: place.imageUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80"
      });
    }

    setSelectedPlaceIds(newSelected);
    setAddedPlacesMap(newMap);
  };

  // Return to trip creation
  const handleCompleteSelection = () => {
    const updatedList = Array.from(addedPlacesMap.values());
    navigate("/trip/create", {
      state: {
        ...tripState,
        placesList: updatedList
      }
    });
  };

  return (
    <div className="bg-[#f8fafc] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans min-h-screen flex flex-col antialiased">
      {/* App Header */}
      <AppHeader />

      {/* Main Container */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Destination Header & Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-sky-600 dark:text-sky-400 mb-1">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="hover:underline flex items-center gap-1 cursor-pointer"
              >
                ← {t("places.header.backToTrip") || "Quay lại chuyến đi"}
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b2545] dark:text-white tracking-tight">
              {t("places.header.title", { destination }) || `Khám phá địa điểm "${destination}"`}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {filteredPlaces.length}+ {t("places.header.countFound") || "địa điểm được tìm thấy phù hợp"}
            </p>
          </div>

          {/* Search, Sort & View Switcher */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <input
                type="text"
                placeholder={t("places.header.searchPlaceholder") || "Tìm theo tên, món ăn..."}
                value={pendingFilters.keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#0b2545] dark:focus:border-sky-500 transition-colors"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-2 px-3 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <option value="popular">{t("places.sort.popular") || "Phổ biến nhất"}</option>
              <option value="rating">{t("places.sort.rating") || "Đánh giá cao nhất"}</option>
              <option value="distance">{t("places.sort.distance") || "Gần trung tâm nhất"}</option>
            </select>

            {/* View Switcher (List vs Grid) matching Screenshots 1 & 2 */}
            <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              {/* List View Icon Button */}
              <button
                type="button"
                onClick={() => setViewMode("list")}
                title={t("places.view.list") || "Chế độ danh sách"}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white dark:bg-slate-900 text-[#0b2545] dark:text-sky-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Grid View Icon Button */}
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title={t("places.view.grid") || "Chế độ lưới"}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-slate-900 text-[#0b2545] dark:text-sky-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Layout: Sidebar (Filter & Map) + Main Places Listing */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar (4 columns) */}
          <aside className="lg:col-span-4 space-y-5">
            {/* Map Preview Widget (Matching Screenshots) */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs h-36 bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80"
                alt="Bản đồ địa điểm"
                className="w-full h-full object-cover opacity-70"
              />
              <button
                type="button"
                onClick={() => setShowMapModal(true)}
                className="absolute px-4 py-2 bg-white/90 dark:bg-slate-900/90 text-[#0b2545] dark:text-sky-400 rounded-xl text-xs font-bold shadow-md hover:bg-white dark:hover:bg-slate-900 transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
              >
                <svg className="w-4 h-4 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span>{t("places.map.viewOnMap") || "Xem trên bản đồ"}</span>
              </button>
            </div>

            {/* Reusable Configuration-Driven Filter Panel */}
            <FilterPanel
              filters={pendingFilters}
              pendingFilterCount={pendingFilterCount}
              currentCategoryConfig={currentCategoryConfig}
              onSelectCategory={setCategory}
              onChangeDistance={setDistanceKm}
              onSelectRating={setMinRating}
              onSelectPrice={setPriceLevel}
              onTogglePreference={togglePreference}
              onApplyFilters={applyFilters}
              onResetFilters={resetFilters}
              isLoading={loading}
            />
          </aside>

          {/* Right Area: Places Listing (8 columns) */}
          <section aria-label="Danh sách địa điểm" className="lg:col-span-8 space-y-6">
            {/* Loading Skeletons */}
            {loading && (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-36 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 animate-pulse flex gap-4">
                    <div className="w-44 bg-slate-200 dark:bg-slate-800 rounded-xl h-full" />
                    <div className="flex-1 space-y-3 py-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredPlaces.length === 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 mx-auto flex items-center justify-center text-xl font-bold">
                  📍
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                  {t("places.empty.title") || "Không tìm thấy địa điểm phù hợp"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  {t("places.empty.desc") || "Hãy thử mở rộng bán kính khoảng cách hoặc xóa bớt tiêu chí lọc để khám phá thêm nhiều địa điểm thú vị nhé."}
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-2 bg-[#0b2545] text-white text-xs font-semibold rounded-xl hover:bg-[#102f58] transition-colors cursor-pointer mt-2"
                >
                  {t("places.filter.clearAll") || "Đặt lại bộ lọc"}
                </button>
              </div>
            )}

            {/* Places Render in List or Grid Mode */}
            {!loading && filteredPlaces.length > 0 && (
              <>
                {viewMode === "list" ? (
                  <div className="space-y-4">
                    {filteredPlaces.map((place) => {
                      const placeId = place.osmId || place.id;
                      const isAdded = selectedPlaceIds.has(placeId);
                      return (
                        <PlaceCard
                          key={placeId}
                          place={place}
                          variant="list"
                          isAdded={isAdded}
                          onToggleAdd={handleToggleAddPlace}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredPlaces.map((place) => {
                      const placeId = place.osmId || place.id;
                      const isAdded = selectedPlaceIds.has(placeId);
                      return (
                        <PlaceCard
                          key={placeId}
                          place={place}
                          variant="grid"
                          isAdded={isAdded}
                          onToggleAdd={handleToggleAddPlace}
                        />
                      );
                    })}
                  </div>
                )}

                {/* Pagination Matching Screenshots */}
                <div className="flex justify-center items-center space-x-1.5 pt-6 pb-2">
                  <button
                    type="button"
                    className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    ‹
                  </button>
                  {[1, 2, 3, 4, 5].map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                        page === 1
                          ? "bg-[#0b2545] dark:bg-sky-500 text-white dark:text-slate-950 font-bold"
                          : "border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    ›
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {/* Floating Bottom Bar: Complete Selection and Return to Itinerary */}
      <aside aria-label="Thao tác chọn địa điểm" className="sticky bottom-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-3.5 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
              {addedPlacesMap.size}
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
              {addedPlacesMap.size} {t("places.footer.placesSelected") || "địa điểm đã được chọn vào lịch trình"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCompleteSelection}
            className="bg-[#0b2545] hover:bg-[#102f58] dark:bg-sky-500 dark:hover:bg-sky-600 text-white dark:text-slate-950 text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <span>{t("places.footer.finishButton") || "Hoàn tất & Quay lại"}</span>
            <span>→</span>
          </button>
        </div>
      </aside>

      {/* Map Modal Dialog */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#0b2545] dark:text-white">
                  {t("places.map.modalTitle", { destination }) || `Bản đồ địa điểm tại ${destination}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Embedded interactive map iframe with OSM */}
            <div className="w-full h-96 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <iframe
                title="Bản đồ địa điểm"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lng - 0.04}%2C${coordinates.lat - 0.04}%2C${coordinates.lng + 0.04}%2C${coordinates.lat + 0.04}&layer=mapnik&marker=${coordinates.lat}%2C${coordinates.lng}`}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                className="px-5 py-2 bg-[#0b2545] dark:bg-sky-500 text-white dark:text-slate-950 font-bold text-xs rounded-xl"
              >
                {t("places.map.close") || "Đóng bản đồ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <AppFooter />
    </div>
  );
}
