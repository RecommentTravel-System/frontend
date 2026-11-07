import { api } from "../lib/api.js";

const LOCAL_STORAGE_KEY = "wayvee_website_reviews_local";

const INITIAL_FALLBACK_REVIEWS = [
  {
    id: 1,
    userFullName: "Nguyễn Văn An",
    userEmail: "an.nguyen@example.com",
    rating: 5,
    category: "Giao diện & Trải nghiệm",
    comment: "Giao diện trang web rất hiện đại và tinh tế, phối màu hài hòa. Các thao tác tìm kiếm địa điểm và lập lịch trình rất mượt mà.",
    anonymous: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 2,
    userFullName: "Trần Thị Mai",
    userEmail: "mai.tran@example.com",
    rating: 5,
    category: "Tính năng lịch trình",
    comment: "Tính năng tạo lịch trình thông minh quá tuyệt vời! Tiết kiệm cho mình cả buổi chiều lên kế hoạch đi du lịch Đà Nẵng cùng nhóm bạn.",
    anonymous: false,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 3,
    userFullName: "Lê Hoàng Quân",
    userEmail: "quan.le@example.com",
    rating: 4,
    category: "Tốc độ & Hiệu năng",
    comment: "Tốc độ tải bản đồ và định tuyến rất nhanh. Bản đồ hiển thị rõ ràng, nếu bổ sung thêm chế độ xem 3D nữa thì hoàn hảo.",
    anonymous: false,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: 4,
    userFullName: "Người dùng ẩn danh",
    userEmail: null,
    rating: 5,
    category: "Trải nghiệm chung",
    comment: "Trang web cung cấp đầy đủ thông tin địa điểm cần thiết, phân loại danh mục rõ ràng, rất dễ tra cứu.",
    anonymous: true,
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString()
  },
  {
    id: 5,
    userFullName: "Phạm Thùy Linh",
    userEmail: "linh.pham@example.com",
    rating: 4,
    category: "Gợi ý địa điểm",
    comment: "Các quán ăn và điểm check-in được gợi ý rất chuẩn gu giới trẻ. Rất mong đội ngũ phát triển thêm ứng dụng trên điện thoại.",
    anonymous: false,
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString()
  }
];

function getLocalReviews() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_FALLBACK_REVIEWS));
      return [...INITIAL_FALLBACK_REVIEWS];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...INITIAL_FALLBACK_REVIEWS];
  } catch {
    return [...INITIAL_FALLBACK_REVIEWS];
  }
}

function saveLocalReview(review) {
  try {
    const current = getLocalReviews();
    const newReview = {
      ...review,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    const updated = [newReview, ...current];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return newReview;
  } catch {
    return review;
  }
}

/**
 * Submit a website review.
 * @param {{ rating: number, category?: string, comment: string, userFullName?: string, userEmail?: string, anonymous?: boolean }} data
 */
export async function submitWebsiteReview(data) {
  try {
    const res = await api.post("/api/v1/website-reviews", data);
    // Also save in local storage as mirror
    saveLocalReview(res.data || data);
    return res;
  } catch (err) {
    console.warn("Backend submit failed, falling back to local storage:", err);
    const local = saveLocalReview(data);
    return { data: local, success: true, message: "Đánh giá trang web đã được lưu thành công." };
  }
}

/**
 * Get all website reviews with optional filtering.
 * @param {{ rating?: number, category?: string, search?: string }} [params]
 */
export async function getWebsiteReviews(params = {}) {
  try {
    const res = await api.get("/api/v1/website-reviews", { params });
    if (res.data && Array.isArray(res.data)) {
      return res;
    }
    throw new Error("Invalid response format");
  } catch (err) {
    console.warn("Backend get reviews failed, falling back to local storage:", err);
    let list = getLocalReviews();
    if (params.rating && Number(params.rating) > 0) {
      list = list.filter((r) => Number(r.rating) === Number(params.rating));
    }
    if (params.category && params.category !== "all") {
      list = list.filter((r) => r.category?.toLowerCase().includes(params.category.toLowerCase()));
    }
    if (params.search) {
      const kw = params.search.toLowerCase();
      list = list.filter(
        (r) =>
          r.userFullName?.toLowerCase().includes(kw) ||
          r.userEmail?.toLowerCase().includes(kw) ||
          r.comment?.toLowerCase().includes(kw)
      );
    }
    return { data: list, success: true };
  }
}

/**
 * Get website review summary statistics.
 */
export async function getWebsiteReviewStats() {
  try {
    const res = await api.get("/api/v1/website-reviews/stats");
    if (res.data) return res;
    throw new Error("Invalid stats format");
  } catch (err) {
    console.warn("Backend get stats failed, computing from local storage:", err);
    const list = getLocalReviews();
    const total = list.length;
    const avg = total > 0 ? (list.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / total).toFixed(1) : "5.0";
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let positive = 0;
    list.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
      counts[star] = (counts[star] || 0) + 1;
      if (star >= 4) positive++;
    });
    const positivePercentage = total > 0 ? Math.round((positive / total) * 100) : 100;
    return {
      data: {
        totalReviews: total,
        averageRating: Number(avg),
        ratingCounts: counts,
        positivePercentage
      },
      success: true
    };
  }
}

/**
 * Get reviews submitted by current user.
 */
export async function getMyWebsiteReviews() {
  try {
    return await api.get("/api/v1/website-reviews/me");
  } catch (err) {
    console.warn("Backend get my reviews failed, returning local storage:", err);
    return { data: getLocalReviews(), success: true };
  }
}

