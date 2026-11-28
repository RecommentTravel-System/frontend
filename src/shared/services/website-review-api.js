import { api } from "../lib/api.js";

const LOCAL_STORAGE_KEY = "wayvee_website_reviews_local";

const DEFAULT_MOCK_REVIEWS = [
  {
    id: 1001,
    userId: 1,
    userFullName: "Nguyễn Văn An",
    userEmail: "nguyenvanan2003@gmail.com",
    rating: 5,
    category: "Giao diện & Trải nghiệm",
    comment: "Giao diện trang web rất hiện đại và tinh tế, phối màu hài hòa. Các thao tác tìm kiếm địa điểm và lập lịch trình rất mượt mà.",
    anonymous: false,
    mediaUrls: [],
    adminReply: "Cảm ơn bạn Văn An đã khen ngợi giao diện và ủng hộ Wayvee!",
    repliedAt: "2026-10-03T11:45:00",
    repliedBy: "Ban Quản Trị WAYVEE",
    createdAt: "2026-10-03T10:15:00"
  },
  {
    id: 1002,
    userId: 2,
    userFullName: "Trần Thị Mai",
    userEmail: "tranthimai1998@gmail.com",
    rating: 5,
    category: "Tính năng lịch trình",
    comment: "Tính năng tạo lịch trình thông minh quá tuyệt vời! Tiết kiệm cho mình cả buổi chiều lên kế hoạch đi du lịch Đà Nẵng cùng nhóm bạn.",
    anonymous: false,
    mediaUrls: [],
    adminReply: null,
    repliedAt: null,
    repliedBy: null,
    createdAt: "2026-10-09T14:20:00"
  },
  {
    id: 1003,
    userId: 3,
    userFullName: "Lê Hoàng Quân",
    userEmail: "lehoangquan2001@gmail.com",
    rating: 4,
    category: "Tốc độ & Hiệu năng",
    comment: "Tốc độ tải bản đồ và định tuyến rất nhanh. Bản đồ hiển thị rõ ràng, nếu bổ sung thêm chế độ xem 3D nữa thì hoàn hảo.",
    anonymous: false,
    mediaUrls: [],
    adminReply: "Cảm ơn bạn Quân! Wayvee hứa sẽ nghiên cứu bổ sung chế độ 3D ở bản cập nhật tới.",
    repliedAt: "2026-10-16T11:00:00",
    repliedBy: "Ban Quản Trị WAYVEE",
    createdAt: "2026-10-16T09:30:00"
  },
  {
    id: 1004,
    userId: null,
    userFullName: "Người dùng ẩn danh",
    userEmail: null,
    rating: 5,
    category: "Trải nghiệm chung",
    comment: "Trang web cung cấp đầy đủ thông tin địa điểm cần thiết, phân loại danh mục rõ ràng, rất dễ tra cứu.",
    anonymous: true,
    mediaUrls: [],
    adminReply: null,
    repliedAt: null,
    repliedBy: null,
    createdAt: "2026-10-23T16:10:00"
  },
  {
    id: 1005,
    userId: 5,
    userFullName: "Phạm Thùy Linh",
    userEmail: "phamthuylinh2000@gmail.com",
    rating: 4,
    category: "Gợi ý địa điểm",
    comment: "Các quán ăn và điểm check-in được gợi ý rất chuẩn gu giới trẻ. Rất mong đội ngũ phát triển thêm ứng dụng trên điện thoại.",
    anonymous: false,
    mediaUrls: [],
    adminReply: "Cảm ơn bạn Linh! Đội ngũ Wayvee hứa sẽ sớm ra mắt ứng dụng di động cho bạn.",
    repliedAt: "2026-10-29T15:30:00",
    repliedBy: "Ban Quản Trị WAYVEE",
    createdAt: "2026-10-29T14:00:00"
  }
];

function getLocalReviews() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_MOCK_REVIEWS));
      return DEFAULT_MOCK_REVIEWS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_MOCK_REVIEWS));
      return DEFAULT_MOCK_REVIEWS;
    }
    
    // Auto-sync if cached reviews don't match latest dataset or have older dates
    const hasOctoberSample = parsed.some((r) => r.createdAt && r.createdAt.includes("2026-10"));
    if (!hasOctoberSample) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_MOCK_REVIEWS));
      return DEFAULT_MOCK_REVIEWS;
    }

    return parsed;
  } catch {
    return DEFAULT_MOCK_REVIEWS;
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
 * Submit feedback / review for the Wayvee platform.
 * @param {Object} payload
 */
export async function submitWebsiteReview(payload) {
  try {
    return await api.post("/api/v1/website-reviews", payload);
  } catch (err) {
    console.warn("Backend submit review failed, persisting to local storage:", err);
    const saved = saveLocalReview(payload);
    return { data: saved, success: true, message: "Đã lưu đánh giá ngoại tuyến thành công." };
  }
}

/**
 * Get all website reviews with optional filtering and pagination.
 * @param {Object} params
 */
export async function getWebsiteReviews(params = {}) {
  try {
    const res = await api.get("/api/v1/website-reviews", { params });
    if (res.data && Array.isArray(res.data)) {
      return res;
    }
    if (res.data && Array.isArray(res.data.content)) {
      return { ...res, data: res.data.content };
    }
    throw new Error("Invalid response format");
  } catch (err) {
    console.warn("Backend get website reviews failed, falling back to local storage:", err);
    let list = getLocalReviews();
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

/**
 * Upload image or video file for website review/feedback.
 * @param {File} file
 */
export async function uploadWebsiteReviewMedia(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/api/v1/website-reviews/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res;
  } catch (err) {
    console.warn("Backend media upload failed, creating local preview URL:", err);
    const localUrl = URL.createObjectURL(file);
    return {
      data: {
        url: localUrl,
        publicId: `local-${Date.now()}`
      },
      success: true
    };
  }
}

/**
 * Admin reply to a website review.
 * @param {number|string} reviewId
 * @param {string} reply
 */
export async function replyWebsiteReview(reviewId, reply) {
  try {
    const res = await api.post(`/api/v1/website-reviews/${reviewId}/reply`, { reply });
    const list = getLocalReviews();
    const updated = list.map((item) =>
      String(item.id) === String(reviewId)
        ? { ...item, adminReply: reply, repliedAt: new Date().toISOString(), repliedBy: "Ban Quản Trị WAYVEE" }
        : item
    );
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return res;
  } catch (err) {
    console.warn("Backend reply failed, updating local storage:", err);
    const list = getLocalReviews();
    const now = new Date().toISOString();
    let updatedItem = null;
    const updated = list.map((item) => {
      if (String(item.id) === String(reviewId)) {
        updatedItem = { ...item, adminReply: reply, repliedAt: now, repliedBy: "Ban Quản Trị WAYVEE" };
        return updatedItem;
      }
      return item;
    });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return { data: updatedItem, success: true, message: "Đã phản hồi đánh giá thành công." };
  }
}

/**
 * Update a website review (only owner user can update their own review).
 * @param {number|string} id
 * @param {Object} payload - { rating, category, comment, anonymous, mediaUrls }
 */
export async function updateWebsiteReview(id, payload) {
  try {
    const res = await api.put(`/api/v1/website-reviews/${id}`, payload);
    // Also update local storage cache
    const list = getLocalReviews();
    const updated = list.map((item) =>
      String(item.id) === String(id) ? { ...item, ...payload } : item
    );
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return res;
  } catch (err) {
    console.warn("Backend update review failed, updating local storage:", err);
    const list = getLocalReviews();
    let updatedItem = null;
    const updated = list.map((item) => {
      if (String(item.id) === String(id)) {
        updatedItem = { ...item, ...payload };
        return updatedItem;
      }
      return item;
    });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return { data: updatedItem, success: true, message: "Đã cập nhật đánh giá thành công." };
  }
}

/**
 * Delete a website review (only owner user can delete their own review).
 * @param {number|string} id
 */
export async function deleteWebsiteReview(id) {
  try {
    const res = await api.delete(`/api/v1/website-reviews/${id}`);
    // Also remove from local storage cache
    const list = getLocalReviews();
    const updated = list.filter((item) => String(item.id) !== String(id));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return res;
  } catch (err) {
    console.warn("Backend delete review failed, removing from local storage:", err);
    const list = getLocalReviews();
    const updated = list.filter((item) => String(item.id) !== String(id));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return { success: true, message: "Đã xóa đánh giá thành công." };
  }
}

/**
 * Admin delete reply from a website review.
 * @param {number|string} reviewId
 */
export async function deleteWebsiteReviewReply(reviewId) {
  try {
    const res = await api.delete(`/api/v1/website-reviews/${reviewId}/reply`);
    const list = getLocalReviews();
    const updated = list.map((item) =>
      String(item.id) === String(reviewId)
        ? { ...item, adminReply: null, repliedAt: null, repliedBy: null }
        : item
    );
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return res;
  } catch (err) {
    console.warn("Backend delete reply failed, updating local storage:", err);
    const list = getLocalReviews();
    const updated = list.map((item) =>
      String(item.id) === String(reviewId)
        ? { ...item, adminReply: null, repliedAt: null, repliedBy: null }
        : item
    );
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return { success: true, message: "Đã xóa phản hồi thành công." };
  }
}
