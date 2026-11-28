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
  },
  {
    id: 1006,
    userId: 3,
    userFullName: "Lê Hoàng Nam",
    userEmail: "lehoangnam2001@gmail.com",
    rating: 3,
    category: "Dữ liệu địa điểm",
    comment: "Bước chọn địa điểm vào lịch trình rất tiện nhưng nhiều điểm đến chưa có ảnh đại diện hoặc ảnh bị thiếu, nhìn hơi trống trải và khó hình dung.",
    anonymous: false,
    mediaUrls: [],
    adminReply: "Chào bạn Hoàng Nam! Do hệ thống có số lượng lớn địa điểm nên đội ngũ đang nỗ lực cập nhật thêm hình ảnh đầy đủ. Cảm ơn góp ý của bạn!",
    repliedAt: "2026-10-28T15:45:00",
    repliedBy: "Ban Quản Trị WAYVEE",
    createdAt: "2026-10-28T14:15:00"
  },
  {
    id: 1007,
    userId: 8,
    userFullName: "Bùi Thu Trang",
    userEmail: "buithutrang2001@gmail.com",
    rating: 2,
    category: "Giao diện & Trải nghiệm",
    comment: "Lúc tạo chuyến đi và chọn địa điểm tham quan thì một số quán ăn và quán cafe không hiển thị ảnh minh họa, phải mở tab khác để tìm xem quán trông thế nào.",
    anonymous: false,
    mediaUrls: [],
    adminReply: "Chào bạn Thu Trang, do số lượng địa điểm trên web khá nhiều nên đội ngũ đang khẩn trương bổ sung hình ảnh chi tiết. Rất mong bạn thông cảm nhé!",
    repliedAt: "2026-10-31T11:00:00",
    repliedBy: "Ban Quản Trị WAYVEE",
    createdAt: "2026-10-31T09:40:00"
  },
  {
    id: 1008,
    userId: 6,
    userFullName: "Đỗ Thanh Huyền",
    userEmail: "dothanhhuyen2002@gmail.com",
    rating: 4,
    category: "Tính năng lịch trình",
    comment: "Tính năng lên lịch trình gợi ý rất hay và hợp lý. Tuy nhiên ở bước chọn điểm đến nhiều chỗ còn thiếu ảnh, nếu bổ sung hình ảnh trực quan hơn thì tuyệt vời.",
    anonymous: false,
    mediaUrls: [],
    adminReply: "Cảm ơn bạn Thanh Huyền! Vì dữ liệu địa điểm rất lớn nên Wayvee đang tích cực thu thập và cập nhật thêm ảnh để bạn trải nghiệm tốt nhất.",
    repliedAt: "2026-11-02T18:00:00",
    repliedBy: "Ban Quản Trị WAYVEE",
    createdAt: "2026-11-02T16:30:00"
  },
  {
    id: 1009,
    userId: 9,
    userFullName: "Phan Quốc Bảo",
    userEmail: "phanquocbao1996@gmail.com",
    rating: 3,
    category: "Dữ liệu địa điểm",
    comment: "Lúc chọn địa điểm tạo lịch trình thấy vài điểm du lịch mới chưa có hình ảnh thực tế. Mong web sớm hoàn thiện kho ảnh để dễ chọn điểm hơn.",
    anonymous: false,
    mediaUrls: [],
    adminReply: "Chào bạn Quốc Bảo! Do web có rất nhiều địa điểm nên đội ngũ đang cố gắng đưa thêm hình ảnh vào từng điểm đến. Cảm ơn bạn đã phản hồi!",
    repliedAt: "2026-11-05T12:00:00",
    repliedBy: "Ban Quản Trị WAYVEE",
    createdAt: "2026-11-05T10:20:00"
  },
  {
    id: 1010,
    userId: 5,
    userFullName: "Hoàng Minh Đức",
    userEmail: "hoangminhduc2000@gmail.com",
    rating: 3,
    category: "Tài khoản & Đăng nhập",
    comment: "Web trải nghiệm ban đầu khá tốt nhưng lúc đăng nhập mình bấm vào nút 'Đăng nhập bằng Google' thì không thấy phản hồi gì, phải tạo tài khoản bằng mật khẩu thủ công.",
    anonymous: false,
    mediaUrls: [],
    adminReply: "Chào bạn Minh Đức! Tính năng đăng nhập Google đang trong giai đoạn hoàn thiện cuối cùng và sẽ sớm ra mắt trong vài ngày tới. Cảm ơn bạn đã thông báo!",
    repliedAt: "2026-09-30T10:45:00",
    repliedBy: "Ban Quản Trị WAYVEE",
    createdAt: "2026-09-30T09:15:00"
  },
  {
    id: 1011,
    userId: 4,
    userFullName: "Phạm Thị Lan Hương",
    userEmail: "phamthilanhuong1999@gmail.com",
    rating: 3,
    category: "Tài khoản & Đăng nhập",
    comment: "Mình hay quên mật khẩu nên muốn có đăng nhập nhanh bằng Gmail cho tiện. Thấy có nút Google mà click vào chưa hoạt động được, mong đội ngũ sớm hỗ trợ.",
    anonymous: false,
    mediaUrls: [],
    adminReply: "Cảm ơn bạn Lan Hương! Đội ngũ kỹ thuật đang hoàn thành tích hợp đăng nhập Google và dự kiến mở tính năng này vào ngày 03/10 tới bạn nhé.",
    repliedAt: "2026-10-01T16:40:00",
    repliedBy: "Ban Quản Trị WAYVEE",
    createdAt: "2026-10-01T15:20:00"
  },
  {
    id: 1012,
    userId: 7,
    userFullName: "Vũ Hải Long",
    userEmail: "vuhailong1997@gmail.com",
    rating: 4,
    category: "Tài khoản & Đăng nhập",
    comment: "Lập lịch trình nhóm rất hay, nhưng khâu đăng nhập tạo tài khoản nhập mật khẩu hơi mất thời gian. Rất mong web sớm cho đăng nhập 1-click bằng Google.",
    anonymous: false,
    mediaUrls: [],
    adminReply: "Chào bạn Hải Long! Tính năng đăng nhập Google đang được hoàn tất kiểm thử và sẽ chính thức phát hành ngay ngày mai để bạn sử dụng thuận tiện hơn!",
    repliedAt: "2026-10-02T21:00:00",
    repliedBy: "Ban Quản Trị WAYVEE",
    createdAt: "2026-10-02T19:30:00"
  },
  {
    id: 1013,
    userId: 10,
    userFullName: "Ngô Mỹ Duyên",
    userEmail: "ngomyduyen2000@gmail.com",
    rating: 5,
    category: "Tài khoản & Đăng nhập",
    comment: "Trước mình ngại đăng ký vì lười nhớ mật khẩu, nay thấy web có đăng nhập trực tiếp bằng Google 1 chạm siêu nhanh và tiện lợi, cho 5 sao luôn!",
    anonymous: false,
    mediaUrls: [],
    adminReply: "Cảm ơn bạn Mỹ Duyên! Wayvee đã chính thức cập nhật tính năng đăng nhập bằng Google để mang lại trải nghiệm thuận tiện nhất cho bạn.",
    repliedAt: "2026-10-04T12:00:00",
    repliedBy: "Ban Quản Trị WAYVEE",
    createdAt: "2026-10-04T10:40:00"
  },
  {
    id: 1014,
    userId: 11,
    userFullName: "Đặng Hữu Phước",
    userEmail: "danghuuphuoc1998@gmail.com",
    rating: 4,
    category: "Tài khoản & Đăng nhập",
    comment: "Đăng nhập bằng tài khoản Google mới cập nhật rất mượt, không phải gõ mật khẩu lằng nhằng nữa. Giao diện quản lý chuyến đi sau khi đăng nhập cũng rất trực quan.",
    anonymous: false,
    mediaUrls: [],
    adminReply: "Chào bạn Hữu Phước! Cảm ơn bạn đã trải nghiệm và yêu thích tính năng đăng nhập bằng Google mới ra mắt của Wayvee.",
    repliedAt: "2026-10-06T15:45:00",
    repliedBy: "Ban Quản Trị WAYVEE",
    createdAt: "2026-10-06T14:15:00"
  },
  {
    id: 1015,
    userId: 12,
    userFullName: "Trịnh Phương Thảo",
    userEmail: "trinhphuongthao2003@gmail.com",
    rating: 4,
    category: "Tài khoản & Đăng nhập",
    comment: "Nhiều trang web du lịch bắt điền form đăng ký dài dòng rất phiền, ở Wayvee bấm đăng nhập Google cái là xong ngay. Rất thích sự tiện lợi này.",
    anonymous: false,
    mediaUrls: [],
    adminReply: "Cảm ơn bạn Phương Thảo! Đội ngũ luôn cố gắng tối ưu các thao tác đăng nhập nhanh chóng để bạn lên lịch trình thuận tiện nhất.",
    repliedAt: "2026-10-08T10:30:00",
    repliedBy: "Ban Quản Trị WAYVEE",
    createdAt: "2026-10-08T08:50:00"
  },
  {
    id: 1016,
    userId: 13,
    userFullName: "Dương Đình Trọng",
    userEmail: "duongdinhtrong1999@gmail.com",
    rating: 5,
    category: "Tài khoản & Đăng nhập",
    comment: "Đăng nhập liên kết Gmail tiện và an toàn, chuyển đổi giữa điện thoại và máy tính đồng bộ lịch trình rất nhanh. Dịch vụ tuyệt vời!",
    anonymous: false,
    mediaUrls: [],
    adminReply: "Cảm ơn bạn Đình Trọng đã đánh giá 5 sao và ủng hộ tính năng đăng nhập tiện lợi của Wayvee!",
    repliedAt: "2026-10-11T17:40:00",
    repliedBy: "Ban Quản Trị WAYVEE",
    createdAt: "2026-10-11T16:10:00"
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
    
    // Auto-sync if cached reviews don't match latest dataset or have fewer reviews
    const hasNovemberSample = parsed.some((r) => r.createdAt && r.createdAt.includes("2026-11"));
    if (!hasNovemberSample || parsed.length < DEFAULT_MOCK_REVIEWS.length) {
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
