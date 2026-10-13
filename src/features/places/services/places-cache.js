/**
 * Places Cache Store
 * Giữ nguyên kết quả tìm kiếm, trang hiện tại, bộ lọc khi chuyển sang trang chi tiết và quay lại,
 * đảm bảo không mất dữ liệu và không gọi lại API khi quay về.
 */
class PlacesCacheStore {
  constructor() {
    this.cache = {
      places: [],
      currentPage: 1,
      appliedFilters: null,
      pendingFilters: null,
      destination: null,
      hasSearched: false,
      sortBy: "popular",
      cardLayout: "list"
    };
    this.restoreFromSession();
  }

  save(data) {
    if (!data) return;
    this.cache = {
      ...this.cache,
      ...data
    };
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        window.sessionStorage.setItem(
          "wayvee_places_cache",
          JSON.stringify({
            places: this.cache.places,
            currentPage: this.cache.currentPage,
            destination: this.cache.destination,
            hasSearched: this.cache.hasSearched,
            sortBy: this.cache.sortBy,
            cardLayout: this.cache.cardLayout,
            appliedFilters: this.cache.appliedFilters
          })
        );
      }
    } catch {
      // Bỏ qua lỗi session storage nếu bộ nhớ vượt hạn mức
    }
  }

  get() {
    return this.cache;
  }

  getPlaces() {
    return this.cache.places || [];
  }

  getCurrentPage() {
    return this.cache.currentPage || 1;
  }

  setCurrentPage(page) {
    this.cache.currentPage = page;
    this.save({ currentPage: page });
  }

  hasData() {
    return Array.isArray(this.cache.places) && this.cache.places.length > 0;
  }

  clear() {
    this.cache = {
      places: [],
      currentPage: 1,
      appliedFilters: null,
      pendingFilters: null,
      destination: null,
      hasSearched: false,
      sortBy: "popular",
      cardLayout: "list"
    };
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        window.sessionStorage.removeItem("wayvee_places_cache");
      }
    } catch {
      // Bỏ qua
    }
  }

  restoreFromSession() {
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        const raw = window.sessionStorage.getItem("wayvee_places_cache");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.places)) {
            this.cache = { ...this.cache, ...parsed };
          }
        }
      }
    } catch {
      // Bỏ qua
    }
  }
}

export const placesCache = new PlacesCacheStore();

/**
 * Thuật toán phân trang thông minh:
 * - Khi ở đoạn đầu (trang 1..4): Hiện 5 số đầu xong sẽ ... tới 1 số cuối: [1, 2, 3, 4, 5, '...', totalPages]
 * - Khi chuyển sang số tiếp theo (ở giữa): Cửa sổ 5 số trượt quanh trang hiện tại: [1, '...', c-2, c-1, c, c+1, c+2, '...', totalPages]
 * - Khi gần đến cuối: Hiện 1 số đầu, ..., 5 số cuối: [1, '...', totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages]
 */
export function getPaginationItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  // 1. Đoạn đầu: 5 số đầu ... 1 số cuối
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  // 2. Đoạn gần cuối: 1 số đầu ... 5 số cuối
  if (currentPage >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages
    ];
  }

  // 3. Ở giữa: 1 số đầu ... 5 số trượt quanh trang hiện tại ... 1 số cuối
  return [
    1,
    "...",
    currentPage - 2,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    currentPage + 2,
    "...",
    totalPages
  ];
}
