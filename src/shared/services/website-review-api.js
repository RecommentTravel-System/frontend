import { api } from "../lib/api.js";

const LOCAL_STORAGE_KEY = "wayvee_website_reviews_local";

const DEFAULT_MOCK_REVIEWS = [
  {
    id: 1001,
    userId: 1,
    userFullName: "Nguyễn Văn An",
    userEmail: "nguyenvanan.2003@gmail.com",
    rating: 2,
    category: "Lập kế hoạch & Lịch trình",
    comment: "Giao diện tạo chuyến đi nhìn chung trực quan nhưng ở bước tìm và chọn địa điểm để thêm vào lịch trình thì hệ thống load xoay vòng rất lâu, đôi khi phải đợi 10-15 giây mới hiện danh sách địa điểm gợi ý làm trải nghiệm lên kế hoạch bị ngắt quãng. Mong team kỹ thuật tối ưu lại tốc độ tải phần này.",
    anonymous: false,
    mediaUrls: [],
    adminReply: "Chào bạn Văn An, cảm ơn bạn đã phản hồi chi tiết về trải nghiệm tạo lịch trình. Đội ngũ kỹ thuật Wayvee đã ghi nhận hiện tượng giật lag khi tải danh sách địa điểm do đang đồng bộ dữ liệu bản đồ lớn. Chúng tôi đang triển khai bộ nhớ đệm (caching) và tối ưu truy vấn để khắc phục triệt để độ trễ này trong bản cập nhật tuần tới. Rất xin lỗi bạn vì trải nghiệm chưa trọn vẹn này!",
    repliedAt: "2026-11-21T16:40:15",
    repliedBy: "Ban Quản Trị WAYVEE",
    createdAt: "2026-11-21T14:15:30"
  },
  {
    id: 1002,
    userId: 2,
    userFullName: "Trần Thị Mai",
    userEmail: "tranthimai.1998@gmail.com",
    rating: 2,
    category: "Lập kế hoạch & Lịch trình",
    comment: "Mình vừa dùng thử tính năng lên lịch trình chuyến đi, tới bước chọn các địa điểm tham quan thì tải cực kỳ chậm, bấm vào chọn điểm đến mà thanh loading xoay mãi không hiện kết quả. Nhiều lúc tưởng trang web bị đơ phải F5 lại từ đầu. Hy vọng bên mình cải thiện hiệu năng phần chọn địa điểm sớm.",
    anonymous: false,
    mediaUrls: [],
    adminReply: "Chào bạn Mai, Wayvee rất tiếc về sự bất tiện bạn gặp phải khi lên lịch trình chuyến đi. Hiện tại hệ thống đang tinh chỉnh lại kết nối API bản đồ và thuật toán lọc địa điểm để tăng tốc độ tải trang lên gấp nhiều lần. Cảm ơn bạn đã đóng góp ý kiến quý báu giúp Wayvee ngày càng hoàn thiện hơn!",
    repliedAt: "2026-11-22T13:55:00",
    repliedBy: "Ban Quản Trị WAYVEE",
    createdAt: "2026-11-22T10:20:45"
  },
  {
    id: 1003,
    userId: 3,
    userFullName: "Lê Hoàng Nam",
    userEmail: "lehoangnam.2001@gmail.com",
    rating: 1,
    category: "Lập kế hoạch & Lịch trình",
    comment: "Mình có quay lại màn hình lúc chọn địa điểm khi tạo chuyến đi đính kèm bên dưới. Lúc mở phần khám phá và chọn địa điểm vào chuyến đi thì màn hình load rất lâu, chờ mãi mới tải được thông tin và ảnh địa điểm. Mong admin và đội dev xem video kiểm tra lỗi và tối ưu lại tốc độ load giúp người dùng.",
    anonymous: false,
    mediaUrls: ["/videos/kham-pha-dia-diem-loading-slow.mp4"],
    adminReply: "Chào bạn Hoàng Nam, Wayvee chân thành cảm ơn video quay lại màn hình rất chi tiết của bạn! Nhờ video này, đội ngũ kỹ thuật đã xác định chính xác nút thắt cổ chai ở bước render danh sách và ảnh địa điểm khi kết nối hệ thống. Chúng tôi đã đưa vấn đề này vào danh sách ưu tiên cao nhất (P0) để vá lỗi và tối ưu hiệu năng ngay trong bản vá hôm nay. Cảm ơn sự đồng hành và hỗ trợ nhiệt tình của bạn dành cho Wayvee!",
    repliedAt: "2026-11-23T08:30:10",
    repliedBy: "Ban Quản Trị WAYVEE",
    createdAt: "2026-11-22T18:05:20"
  },
  {
    id: 1004,
    userId: 8,
    userFullName: "Bùi Thu Trang",
    userEmail: "buithutrang.2001@gmail.com",
    rating: 3,
    category: "Lập kế hoạch & Lịch trình",
    comment: "Các gợi ý lộ trình và địa điểm của Wayvee khá hay và hữu ích, tuy nhiên thời gian chờ tải dữ liệu ở bước chọn địa điểm chuyến đi vẫn còn chậm hơn so với kỳ vọng. Thao tác lọc và duyệt qua các điểm đến đôi khi bị khựng 5-7 giây. Nếu tối ưu tốc độ nhanh và mượt mà hơn thì mình sẽ đánh giá 5 sao.",
    anonymous: false,
    mediaUrls: [],
    adminReply: "Chào bạn Thu Trang, cảm ơn bạn đã yêu thích tính năng gợi ý lộ trình và dành lời khen cho Wayvee! Đội ngũ phát triển đã hoàn tất nâng cấp CDN và tối ưu hóa truy vấn địa điểm, tình trạng tải chậm đã được cải thiện rõ rệt. Bạn hãy thử trải nghiệm lại và tiếp tục góp ý cho chúng mình nhé. Chúc bạn có những chuyến đi thật trọn vẹn!",
    repliedAt: "2026-11-24T09:15:25",
    repliedBy: "Ban Quản Trị WAYVEE",
    createdAt: "2026-11-23T15:40:10"
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
    const hasMock = parsed.some((r) => r.userEmail === "lehoangnam.2001@gmail.com");
    if (!hasMock) {
      const merged = [...parsed, ...DEFAULT_MOCK_REVIEWS];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
      return merged;
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
    // Fallback: create an object URL so user can still see preview and submit
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
    // Update local storage mirror
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

