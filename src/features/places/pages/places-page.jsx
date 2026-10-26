import { useState, useEffect, useMemo, useRef } from "react";
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
import { placesCache, getPaginationItems } from "../services/places-cache";
import { getAllCategoriesApi } from "~/features/categories/services/category-api";
import WayveeTravelLoader from "~/payment/WayveeTravelLoader.jsx";

export function PlacesPage({ initialMode = "all" }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const tripState = location.state || {};
  const navState = location.state || {};

  const activeMode = useMemo(() => {
    if (location.pathname.endsWith("/filters")) return "filters";
    if (location.pathname.endsWith("/results")) return "results";
    return initialMode || "all";
  }, [initialMode, location.pathname]);
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const destination = searchParams.get('destination') || tripState.destination || "Huế";
  const coordinates = useMemo(() => resolveCoordinates(destination), [destination]);

  // View mode for results cards: 'list' or 'grid'
  const [cardLayout, setCardLayout] = useState(() => navState.cardLayout || placesCache.get().cardLayout || "list");

  // Sort option: 'popular', 'rating', 'distance'
  const [sortBy, setSortBy] = useState(() => navState.sortBy || placesCache.get().sortBy || "popular");

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
  } = usePlacesFilter(
    navState.appliedFilters || placesCache.get().appliedFilters || { keyword: searchParams.get('q') || '' }
  );

  const [places, setPlaces] = useState(() => {
    if (Array.isArray(navState.places) && navState.places.length > 0) {
      return navState.places;
    }
    if (placesCache.hasData()) {
      return placesCache.getPlaces();
    }
    return [];
  });
  const ITEMS_PER_PAGE = activeMode === "all" ? 4 : 6;
  const [currentPage, setCurrentPage] = useState(() => {
    if (navState.currentPage) return navState.currentPage;
    if (placesCache.getCurrentPage()) return placesCache.getCurrentPage();
    return 1;
  });
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(() => {
    if (navState.hasSearched !== undefined) return navState.hasSearched;
    if (placesCache.hasData()) return true;
    return searchParams.get('browse') === '1' || Boolean(searchParams.get('q'));
  });

  // Cờ bỏ qua gọi API khi quay lại từ trang chi tiết nếu đã có dữ liệu sẵn
  const skipFetchRef = useRef(places.length > 0);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let isMounted = true;
    getAllCategoriesApi()
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (list.length > 0) {
          setCategories(
            list.map((c) => ({
              categoryId: c.code || String(c.categoryId),
              code: c.code || String(c.categoryId),
              name: c.name || c.nameVi || c.code,
              nameVi: c.nameVi || c.name || c.code,
              nameEn: c.nameEn || "",
              defaultLabel: c.name || c.code
            }))
          );
        }
      })
      .catch((err) => {
        console.warn("Could not load categories from backend:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const onPromptLogin = () => navigate("/login", { state: { from: location.pathname + location.search } });
    window.addEventListener("wayvee:prompt-login", onPromptLogin);
    return () => window.removeEventListener("wayvee:prompt-login", onPromptLogin);
  }, [location.pathname, location.search, navigate]);

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

  // Keep state in sync if navigating back from place detail
  useEffect(() => {
    if (location.state?.placesList) {
      const list = location.state.placesList;
      setSelectedPlaceIds(new Set(list.map((p) => p.osmId || p.id)));
      const nextMap = new Map();
      list.forEach((p) => nextMap.set(p.osmId || p.id, p));
      setAddedPlacesMap(nextMap);
    }
  }, [location.state?.placesList]);

  const handleApplyFilters = () => {
    skipFetchRef.current = false;
    applyFilters();
    setCurrentPage(1);
    placesCache.setCurrentPage(1);
    setHasSearched(true);
    // Nếu đang ở trang chỉ bộ lọc, chuyển sang trang kết quả sau khi áp dụng
    if (activeMode === "filters") {
      navigate(`/places/results${location.search}`, { state: location.state });
    }
  };

  const handleResetFilters = () => {
    skipFetchRef.current = false;
    resetFilters();
    setHasSearched(false);
    setPlaces([]);
    setCurrentPage(1);
    placesCache.clear();
  };

  const handleSwitchMode = (targetMode) => {
    const search = location.search ? location.search : "";
    if (targetMode === "filters") {
      navigate(`/places/filters${search}`, { state: location.state });
    } else if (targetMode === "results") {
      navigate(`/places/results${search}`, { state: location.state });
    } else {
      navigate(`/places${search}`, { state: location.state });
    }
  };

  // Lấy hết toàn bộ địa điểm một lần duy nhất khi áp dụng bộ lọc (size: 500)
  // Khi sang trang hoặc xem chi tiết rồi quay lại thì KHÔNG gọi lại API!
  useEffect(() => {
    if (!hasSearched) return;
    if (skipFetchRef.current) {
      skipFetchRef.current = false;
      return;
    }
    let isMounted = true;

    async function loadPlaces() {
      setLoading(true);
      try {
        const payload = {
          ...toBackendPayload(coordinates),
          page: 0,
          size: 500 // Lấy hết tất cả địa điểm trong phạm vi
        };
        const data = await searchNearbyPlaces(payload);
        if (isMounted) {
          const loadedPlaces = data?.content || [];
          setPlaces(loadedPlaces);
          setCurrentPage(1);
          placesCache.save({
            places: loadedPlaces,
            currentPage: 1,
            destination,
            hasSearched: true,
            appliedFilters
          });
        }
      } catch (err) {
        console.error("Error fetching places:", err);
        if (isMounted) {
          setPlaces([]);
          placesCache.save({ places: [], currentPage: 1, hasSearched: true });
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
  }, [hasSearched, appliedFilters, toBackendPayload, coordinates, destination]);

  // Client-side sorting
  const filteredPlaces = useMemo(() => {
    let result = [...places];

    if (sortBy === "rating") {
      result.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
    } else if (sortBy === "distance") {
      result.sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0));
    } else {
      result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    }

    return result;
  }, [places, sortBy]);

  const totalElements = filteredPlaces.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / ITEMS_PER_PAGE));

  // Client-side pagination: Sang trang chỉ cần hiển thị ngay từ mảng trong bộ nhớ
  const paginatedPlaces = useMemo(() => {
    const fromIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPlaces.slice(fromIndex, fromIndex + ITEMS_PER_PAGE);
  }, [filteredPlaces, currentPage, ITEMS_PER_PAGE]);

  // Thuật toán phân trang động: trượt cửa sổ khi qua 5 trang đầu
  const paginationItems = useMemo(
    () => getPaginationItems(currentPage, totalPages),
    [currentPage, totalPages]
  );

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    placesCache.setCurrentPage(page);
    const container = document.getElementById("places-scroll-container");
    if (container) {
      container.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Điều hướng xem chi tiết và lưu toàn bộ trạng thái để khi quay lại giữ nguyên
  const handleNavigateDetail = (place) => {
    const placeId = place.osmId || place.id;
    placesCache.save({
      places,
      currentPage,
      appliedFilters,
      destination,
      hasSearched,
      sortBy,
      cardLayout
    });
    navigate(`/places/${placeId}`, {
      state: {
        place,
        tripState,
        placesList: Array.from(addedPlacesMap.values()),
        returnUrl: `${location.pathname}${location.search}`,
        returnState: {
          places,
          currentPage,
          hasSearched,
          sortBy,
          cardLayout,
          destination,
          appliedFilters
        }
      }
    });
  };

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
        rating: place.rating,
        score: place.rating?.toFixed(1),
        reviewCount: place.reviewCount,
        image: place.imageUrl || null
      });
    }

    setSelectedPlaceIds(newSelected);
    setAddedPlacesMap(newMap);
  };

  // Return to trip creation
  const handleCompleteSelection = () => {
    const updatedList = Array.from(addedPlacesMap.values());
    const originalIds = new Set((tripState.placesList || []).map((place) => place.osmId || place.id));
    const addedPlaceForDay = tripState.targetDayNum
      ? updatedList.find((place) => !originalIds.has(place.osmId || place.id))
      : null;

    if (tripState.targetDayNum && !addedPlaceForDay) return;

    navigate(tripState.targetDayNum ? "/trip/confirm" : "/trip/create", {
      state: {
        ...tripState,
        placesList: updatedList,
        addedPlaceForDay,
        targetDayNum: tripState.targetDayNum
      }
    });
  };

  // Back to Step 2 (Trip creation)
  const handleBackToTrip = () => {
    const updatedList = Array.from(addedPlacesMap.values());
    navigate(tripState.targetDayNum ? "/trip/confirm" : "/trip/create", {
      state: {
        ...tripState,
        placesList: updatedList,
        targetDayNum: tripState.targetDayNum
      }
    });
  };

  return (
    <div className="bg-[#f8fafc] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans min-h-screen flex flex-col antialiased">
      {/* App Header */}
      <AppHeader
        onLogin={() => navigate("/login", { state: { from: location.pathname + location.search } })}
        onRegister={() => navigate("/register", { state: { from: location.pathname + location.search } })}
      />

      {/* Main Container - Full-width sát lề trái giống trang Admin để không tạo khoảng trắng */}
      <main className="flex-grow w-full px-3 sm:px-6 lg:px-8 py-5 space-y-4">
        {/* Top Destination Header & Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="mb-2">
              <button
                type="button"
                onClick={handleBackToTrip}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>{t("places.header.backToTrip") || "Quay lại chuyến đi"}</span>
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b2545] dark:text-white tracking-tight">
              {activeMode === "filters"
                ? "Bộ lọc tìm kiếm địa điểm"
                : activeMode === "results"
                  ? "Kết quả tìm kiếm địa điểm"
                  : t("places.header.title") || "Khám phá địa điểm"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {totalElements} {t("places.header.countFound") || "địa điểm được tìm thấy phù hợp"}
            </p>
          </div>

          {/* Controls Bar: Search Input, Sort & View layout */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[190px]">
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

            {/* Sort Dropdown (khi có kết quả) */}
            {activeMode !== "filters" && (
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-2 px-3 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <option value="popular">{t("places.sort.popular") || "Phổ biến nhất"}</option>
                <option value="rating">{t("places.sort.rating") || "Đánh giá cao nhất"}</option>
                <option value="distance">{t("places.sort.distance") || "Gần trung tâm nhất"}</option>
              </select>
            )}

            {/* View Layout Switcher (List vs Grid) */}
            {activeMode !== "filters" && (
              <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setCardLayout("list")}
                  title={t("places.view.list") || "Chế độ danh sách"}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${cardLayout === "list"
                      ? "bg-white dark:bg-slate-900 text-[#0b2545] dark:text-sky-400 shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => setCardLayout("grid")}
                  title={t("places.view.grid") || "Chế độ lưới"}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${cardLayout === "grid"
                      ? "bg-white dark:bg-slate-900 text-[#0b2545] dark:text-sky-400 shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── TRANG 1: CHỨA CẢ KẾT QUẢ VÀ THANH LỌC (Split View) ── */}
        {activeMode === "all" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Thanh lọc sát bên trái */}
            <aside className="lg:col-span-4 xl:col-span-3 shrink-0">
              <FilterPanel
                categories={categories}
                filters={pendingFilters}
                pendingFilterCount={pendingFilterCount}
                currentCategoryConfig={currentCategoryConfig}
                onSelectCategory={setCategory}
                onChangeDistance={setDistanceKm}
                onSelectRating={setMinRating}
                onSelectPrice={setPriceLevel}
                onTogglePreference={togglePreference}
                onApplyFilters={handleApplyFilters}
                onResetFilters={handleResetFilters}
                isLoading={loading}
              />
            </aside>

            {/* Cột Kết quả - Chiều cao ngang bằng với thanh lọc, cuộn nội bộ, không trải dài xuống dưới */}
            <section
              aria-label="Danh sách kết quả địa điểm"
              className="lg:col-span-8 xl:col-span-9 flex flex-col min-h-[580px] lg:max-h-[720px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs overflow-hidden"
            >
              {/* Header của khung kết quả */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                    Kết quả tìm kiếm
                  </h3>
                  <span className="text-xs text-slate-400">
                    ({totalElements} địa điểm)
                  </span>
                </div>
              </div>

              {/* Vùng nội dung cuộn bên trong để ngang bằng thanh lọc */}
              <div id="places-scroll-container" className="flex-1 overflow-y-auto pr-1 space-y-3">
                {/* Màn hình loading giống khi thanh toán */}
                {loading && (
                  <div className="h-full flex items-center justify-center py-6">
                    <WayveeTravelLoader
                      badgeText={t("places.loading.badge", "ĐANG TÌM KIẾM ĐỊA ĐIỂM")}
                      title={t("places.loading.title", "Đang quét và tìm kiếm địa điểm...")}
                      subtitle={t("places.loading.subtitle", "Wayvee đang truy xuất dữ liệu địa điểm phù hợp nhất cho chuyến đi của bạn.")}
                      showQR={false}
                    />
                  </div>
                )}

                {/* Khi chưa bấm Áp dụng bộ lọc */}
                {!hasSearched && !loading && (
                  <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center p-8 space-y-3">
                    <div className="w-14 h-14 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center text-2xl font-bold">
                      🎯
                    </div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">
                      Vui lòng chọn tiêu chí lọc & Bấm xác nhận
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                      Hãy chọn loại địa điểm và tùy chỉnh khoảng cách ở cột bên trái, sau đó nhấn nút <strong className="text-slate-800 dark:text-slate-200">"Áp dụng bộ lọc"</strong>.
                    </p>
                  </div>
                )}

                {/* Khi không tìm thấy kết quả */}
                {hasSearched && !loading && totalElements === 0 && (
                  <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center p-8 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center text-xl font-bold">
                      📍
                    </div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">
                      {t("places.empty.title") || "Không tìm thấy địa điểm phù hợp"}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                      {t("places.empty.desc") || "Hãy thử mở rộng bán kính khoảng cách hoặc chọn loại địa điểm khác."}
                    </p>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="px-4 py-2 bg-[#0b2545] text-white text-xs font-semibold rounded-xl hover:bg-[#102f58] transition-colors cursor-pointer"
                    >
                      {t("places.filter.clearAll") || "Đặt lại bộ lọc"}
                    </button>
                  </div>
                )}

                {/* Danh sách địa điểm */}
                {!loading && paginatedPlaces.length > 0 && (
                  <>
                    {cardLayout === "list" ? (
                      <div className="space-y-3.5">
                        {paginatedPlaces.map((place) => {
                          const placeId = place.osmId || place.id;
                          const isAdded = selectedPlaceIds.has(placeId);
                          return (
                            <PlaceCard
                              key={placeId}
                              place={place}
                              variant="list"
                              isAdded={isAdded}
                              onToggleAdd={handleToggleAddPlace}
                              onNavigateDetail={() => handleNavigateDetail(place)}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {paginatedPlaces.map((place) => {
                          const placeId = place.osmId || place.id;
                          const isAdded = selectedPlaceIds.has(placeId);
                          return (
                            <PlaceCard
                              key={placeId}
                              place={place}
                              variant="grid"
                              isAdded={isAdded}
                              onToggleAdd={handleToggleAddPlace}
                              onNavigateDetail={() => handleNavigateDetail(place)}
                            />
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Chân trang phân trang (gắn cố định ở đáy hộp kết quả, bỏ text Trang x / y theo yêu cầu ảnh 2) */}
              {!loading && paginatedPlaces.length > 0 && totalPages > 1 && (
                <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0 text-xs">
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Trang trước"
                    >
                      ‹
                    </button>

                    {paginationItems.map((pageItem, index) => {
                      if (pageItem === "...") {
                        return (
                          <span
                            key={`ellipsis-${index}`}
                            className="w-8 h-8 flex items-center justify-center text-xs text-slate-400 select-none"
                          >
                            ...
                          </span>
                        );
                      }
                      return (
                        <button
                          key={pageItem}
                          type="button"
                          onClick={() => handlePageChange(pageItem)}
                          className={`w-8 h-8 rounded-full text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center ${
                            pageItem === currentPage
                              ? "bg-[#0b2545] dark:bg-sky-500 text-white dark:text-slate-950 font-bold shadow-xs"
                              : "border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          {pageItem}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Trang sau"
                    >
                      ›
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {/* ── TRANG 2: CHỈ CHỨA THANH LỌC ── */}
        {activeMode === "filters" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Thanh lọc sát bên trái */}
            <aside className="lg:col-span-5 xl:col-span-4 shrink-0">
              <FilterPanel
                categories={categories}
                filters={pendingFilters}
                pendingFilterCount={pendingFilterCount}
                currentCategoryConfig={currentCategoryConfig}
                onSelectCategory={setCategory}
                onChangeDistance={setDistanceKm}
                onSelectRating={setMinRating}
                onSelectPrice={setPriceLevel}
                onTogglePreference={togglePreference}
                onApplyFilters={handleApplyFilters}
                onResetFilters={handleResetFilters}
                isLoading={loading}
              />
            </aside>

            {/* Bảng tổng kết & Chuyển sang xem kết quả */}
            <section className="lg:col-span-7 xl:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-12 shadow-xs flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-[#00a3e0] flex items-center justify-center text-3xl font-extrabold shadow-inner">
                ⚙️
              </div>

              <div className="space-y-2 max-w-lg">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Chế độ tùy chỉnh Bộ lọc tìm kiếm
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Bạn đang ở trang điều chỉnh chi tiết các tiêu chí (Loại địa điểm, Bán kính, Đánh giá tối thiểu và Sở thích). Sau khi thiết lập xong, nhấn <strong className="text-slate-800 dark:text-slate-200">"Áp dụng bộ lọc"</strong> để hệ thống trích xuất dữ liệu.
                </p>
              </div>

              {/* Tóm tắt bộ lọc hiện tại */}
              <div className="w-full max-w-md bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700/80 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Khu vực:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{destination}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bán kính:</span>
                  <strong className="text-slate-800 dark:text-slate-200">≤ {pendingFilters.distanceKm} km</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Đánh giá tối thiểu:</span>
                  <strong className="text-slate-800 dark:text-slate-200">★ {pendingFilters.minRating || 4.0}+</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số địa điểm đã tải:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">{totalElements} địa điểm</strong>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSwitchMode("results")}
                  className="px-6 py-2.5 rounded-xl bg-[#0b2545] hover:bg-[#102f58] dark:bg-sky-500 dark:hover:bg-sky-600 text-white dark:text-slate-950 font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Xem danh sách kết quả ({totalElements})</span>
                  <span>→</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchMode("all")}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Xem song song Bộ lọc & Kết quả
                </button>
              </div>
            </section>
          </div>
        )}

        {/* ── TRANG 3: CHỈ CHỨA KẾT QUẢ (Full Width) ── */}
        {activeMode === "results" && (
          <section aria-label="Toàn màn hình kết quả địa điểm" className="w-full space-y-4">
            {/* Thanh điều hướng quay lại bộ lọc */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSwitchMode("filters")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  <span>⚙</span>
                  <span>Mở bảng bộ lọc</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchMode("all")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer hidden sm:inline-flex"
                >
                  <span>◫</span>
                  <span>Xem dạng chia đôi</span>
                </button>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400">
                Hiển thị <strong className="text-slate-800 dark:text-white">{paginatedPlaces.length}</strong> / {totalElements} địa điểm
              </div>
            </div>

            {/* Màn hình loading giống khi thanh toán */}
            {loading && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 shadow-xs flex items-center justify-center min-h-[400px]">
                <WayveeTravelLoader
                  badgeText={t("places.loading.badge", "ĐANG TÌM KIẾM ĐỊA ĐIỂM")}
                  title={t("places.loading.title", "Đang quét và tìm kiếm địa điểm...")}
                  subtitle={t("places.loading.subtitle", "Wayvee đang truy xuất dữ liệu địa điểm phù hợp nhất cho chuyến đi của bạn.")}
                  showQR={false}
                />
              </div>
            )}

            {/* Khi chưa bấm Áp dụng bộ lọc */}
            {!hasSearched && !loading && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-xs">
                <div className="w-14 h-14 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 mx-auto flex items-center justify-center text-2xl font-bold">
                  🎯
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                  Chưa áp dụng bộ lọc tìm kiếm
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Hãy mở bảng bộ lọc để thiết lập tiêu chí địa điểm theo sở thích của bạn.
                </p>
                <button
                  type="button"
                  onClick={() => handleSwitchMode("filters")}
                  className="px-4 py-2 bg-[#0b2545] text-white text-xs font-semibold rounded-xl hover:bg-[#102f58] transition-colors cursor-pointer"
                >
                  Chuyển sang trang bộ lọc →
                </button>
              </div>
            )}

            {/* Khi không tìm thấy kết quả */}
            {hasSearched && !loading && totalElements === 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 mx-auto flex items-center justify-center text-xl font-bold">
                  📍
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                  {t("places.empty.title") || "Không tìm thấy địa điểm phù hợp"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  {t("places.empty.desc") || "Hãy thử mở rộng bán kính khoảng cách hoặc chọn loại địa điểm khác."}
                </p>
                <button
                  type="button"
                  onClick={() => handleSwitchMode("filters")}
                  className="px-4 py-2 bg-[#0b2545] text-white text-xs font-semibold rounded-xl hover:bg-[#102f58] transition-colors cursor-pointer"
                >
                  Đổi tiêu chí lọc
                </button>
              </div>
            )}

            {/* Render danh sách địa điểm toàn màn hình */}
            {!loading && paginatedPlaces.length > 0 && (
              <div className="space-y-4">
                {cardLayout === "list" ? (
                  <div className="space-y-4">
                    {paginatedPlaces.map((place) => {
                      const placeId = place.osmId || place.id;
                      const isAdded = selectedPlaceIds.has(placeId);
                      return (
                        <PlaceCard
                          key={placeId}
                          place={place}
                          variant="list"
                          isAdded={isAdded}
                          onToggleAdd={handleToggleAddPlace}
                          onNavigateDetail={() => handleNavigateDetail(place)}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {paginatedPlaces.map((place) => {
                      const placeId = place.osmId || place.id;
                      const isAdded = selectedPlaceIds.has(placeId);
                      return (
                        <PlaceCard
                          key={placeId}
                          place={place}
                          variant="grid"
                          isAdded={isAdded}
                          onToggleAdd={handleToggleAddPlace}
                          onNavigateDetail={() => handleNavigateDetail(place)}
                        />
                      );
                    })}
                  </div>
                )}

                {/* Phân trang Client-side */}
                {totalPages > 1 && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center justify-center">
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Trang trước"
                      >
                        ‹
                      </button>

                      {paginationItems.map((pageItem, index) => {
                        if (pageItem === "...") {
                          return (
                            <span
                              key={`res-ellipsis-${index}`}
                              className="w-8 h-8 flex items-center justify-center text-xs text-slate-400 select-none"
                            >
                              ...
                            </span>
                          );
                        }
                        return (
                          <button
                            key={pageItem}
                            type="button"
                            onClick={() => handlePageChange(pageItem)}
                            className={`w-8 h-8 rounded-full text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center ${
                              pageItem === currentPage
                                ? "bg-[#0b2545] dark:bg-sky-500 text-white dark:text-slate-950 font-bold shadow-xs"
                                : "border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                          >
                            {pageItem}
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Trang sau"
                      >
                        ›
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Floating Bottom Bar: Complete Selection and Return to Itinerary */}
      <aside aria-label="Thao tác chọn địa điểm" className="sticky bottom-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-3 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="w-full px-2 sm:px-4 flex items-center justify-between">
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

      {/* Footer */}
      <AppFooter />

    </div>
  );
}
