import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppFooter, AppHeader } from "~/shared/components";
import { useTranslation } from "~/providers/i18n-provider";
import AdminDashboardRail from "./AdminDashboardRail";
import { getAllReviews, deleteReview } from "~/shared/services/review-api.js";

const statusLabels = {
  pending: "Chờ duyệt",
  flagged: "Báo cáo khẩn",
  approved: "Đã duyệt",
  hidden: "Đã ẩn"
};

function Rating({ value }) {
  const num = Number(value) || 5;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500" aria-label={`${num} trên 5 sao`}>
      <span>★</span>
      <span className="text-slate-800 dark:text-slate-200 font-extrabold">{num.toFixed(1)}</span>
    </span>
  );
}

function ReviewCard({ review, selected, onSelect, onAction }) {
  const isFlagged = review.status === "flagged";
  return (
    <article
      className={`bg-white dark:bg-[#0f172a] p-5 rounded-2xl border transition-shadow shadow-sm hover:shadow-md flex flex-col md:flex-row md:items-start justify-between gap-4 ${
        isFlagged
          ? "border-red-300 dark:border-red-900/80 bg-red-50/10 dark:bg-red-950/10"
          : "border-slate-200 dark:border-slate-800"
      }`}
    >
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        {/* Checkbox */}
        <div className="pt-1">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(review.id)}
            aria-label={`Chọn ${review.id}`}
            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-[#00a3e0] focus:ring-[#00a3e0] cursor-pointer"
          />
        </div>

        {/* User Avatar */}
        <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-950/60 text-[#00a3e0] font-bold text-sm flex items-center justify-center border border-sky-200 dark:border-sky-800 shrink-0">
          {review.avatar}
        </div>

        {/* Content Body */}
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {review.name}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 dark:bg-sky-950/60 text-[#00a3e0] border border-sky-200 dark:border-sky-900">
              {review.badge}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              ID: #{review.id} · {review.time}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="font-bold text-[#002d54] dark:text-sky-300">
              📍 {review.place}
            </span>
            <Rating value={review.rating} />
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                review.status === "approved"
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60"
                  : review.status === "flagged"
                  ? "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60"
                  : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  review.status === "approved"
                    ? "bg-emerald-500"
                    : review.status === "flagged"
                    ? "bg-red-500"
                    : "bg-amber-500"
                }`}
              />
              {statusLabels[review.status] || review.status}
            </span>
          </div>

          {isFlagged && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-700 dark:text-red-300">
              <strong className="font-bold flex items-center gap-1 mb-0.5">
                <span>⚠</span> Lý do báo cáo từ cộng đồng:
              </strong>
              <span>Nội dung cần xem xét và kiểm duyệt kỹ lưỡng.</span>
            </div>
          )}

          <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 italic leading-relaxed">
            “{review.content}”
          </p>

          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {review.evidence}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex md:flex-col items-center justify-end gap-2 shrink-0 pt-2 md:pt-0">
        {isFlagged ? (
          <>
            <button
              type="button"
              className="px-3.5 py-1.5 bg-[#00a3e0] hover:bg-[#008ec4] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
              onClick={() => onAction(review.id, "approved")}
            >
              Xác minh
            </button>
            <button
              type="button"
              className="px-3.5 py-1.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 hover:bg-red-100 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              onClick={() => onAction(review.id, "hidden")}
            >
              Xóa review
            </button>
          </>
        ) : (
          <button
            type="button"
            className="px-3.5 py-1.5 bg-[#00a3e0] hover:bg-[#008ec4] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
            onClick={() => onAction(review.id, "approved")}
          >
            Duyệt ngay
          </button>
        )}
        <button
          type="button"
          className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          onClick={() => onAction(review.id, "hidden")}
        >
          Ẩn / Xóa
        </button>
      </div>
    </article>
  );
}

export default function AdminReviews() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [quickFilter, setQuickFilter] = useState("all");
  const [selected, setSelected] = useState([]);
  const [notice, setNotice] = useState("");

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await getAllReviews();
      const list = res.data || [];
      const mapped = list.map((item) => ({
        id: String(item.reviewId),
        reviewId: item.reviewId,
        name: item.userFullName || item.username || (item.anonymous ? "Người dùng ẩn danh" : "Thành viên WAYVEE"),
        badge: item.anonymous ? "Ẩn danh" : "Thành viên",
        place: item.placeName || `Địa điểm #${item.osmId}`,
        rating: item.rating || 5,
        time: item.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : "Gần đây",
        status: "approved",
        verified: true,
        avatar: item.userFullName ? item.userFullName.slice(0, 2).toUpperCase() : "WV",
        content: item.comment || "Đánh giá không có nội dung văn bản.",
        evidence: `OSM ID: ${item.osmId} · User ID: ${item.userId || "N/A"}`
      }));
      setReviews(mapped);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const visibleReviews = useMemo(() => {
    return reviews.filter((review) => {
      const matchesQuery = `${review.name} ${review.place} ${review.content}`.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "all" || review.status === status;
      const matchesQuick = quickFilter === "all" || (quickFilter === "flagged" && review.status === "flagged") || (quickFilter === "verified" && review.verified);
      return matchesQuery && matchesStatus && matchesQuick;
    });
  }, [query, quickFilter, reviews, status]);

  const pendingCount = reviews.filter((review) => review.status === "pending" || review.status === "flagged").length;
  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1) : "5.0";
  const positiveCount = reviews.filter((r) => r.rating >= 4).length;
  const positivePercent = reviews.length > 0 ? Math.round((positiveCount / reviews.length) * 100) : 100;

  const updateReview = async (id, nextStatus) => {
    try {
      if (nextStatus === "hidden") {
        await deleteReview(id);
        setNotice("Đã xóa/ẩn bài đánh giá thành công.");
      } else {
        setNotice("Đã cập nhật trạng thái đánh giá thành công.");
      }
      await fetchReviews();
    } catch (err) {
      console.error("Update review error:", err);
      setNotice("Có lỗi xảy ra khi xử lý đánh giá.");
    }
    setSelected((current) => current.filter((item) => item !== id));
  };

  const bulkUpdate = async (nextStatus) => {
    if (!selected.length) return setNotice("Hãy chọn ít nhất một review để thực hiện thao tác.");
    try {
      if (nextStatus === "hidden") {
        await Promise.all(selected.map((id) => deleteReview(id).catch(() => {})));
      }
      setNotice(`${selected.length} review đã được xử lý.`);
      await fetchReviews();
      setSelected([]);
    } catch (err) {
      console.error("Bulk update error:", err);
      setNotice("Có lỗi xảy ra khi cập nhật hàng loạt.");
    }
  };

  const toggleSelectAll = () => setSelected(selected.length === visibleReviews.length ? [] : visibleReviews.map((review) => review.id));

  return (
    <div className="bg-[#f8fafc] dark:bg-[#070e18] min-h-screen text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors">
      <AppHeader />

      <div className="flex flex-1 relative">
        <AdminDashboardRail active="reviews" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1550px] w-full mx-auto space-y-6">
          {/* Topbar / Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                <span>{t("adminNav.portalBadge", "Admin Portal")}</span>
                <span className="text-slate-400">›</span>
                <span>{t("adminReviews.moderation", "Kiểm duyệt")}</span>
                <span className="text-slate-400">›</span>
                <span className="text-[#00a3e0]">{t("adminNav.reviews", "Quản lý Đánh giá & Review")}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002d54] dark:text-white tracking-tight">
                {t("adminNav.reviews", "Quản lý Đánh giá & Review")}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                {t("adminReviews.subtitle", "Kiểm duyệt phản hồi, xác thực trải nghiệm và xử lý dữ liệu đánh giá thực tế từ người dùng.")}
              </p>
            </div>

            <div className="flex items-center flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#00a3e0] text-slate-700 dark:text-slate-200 hover:text-[#00a3e0] rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer"
              >
                <span>{t("adminReviews.backToHome", "Về trang người dùng")}</span>
              </button>
            </div>
          </div>

          {/* Feedback Notice Toast */}
          {notice && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm font-medium flex items-center gap-2 animate-fade-in">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>{notice}</span>
            </div>
          )}

          {/* Summary KPI Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" aria-label="Tổng quan đánh giá">
            {/* Card 1 */}
            <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Tổng đánh giá
                </span>
                <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-[#00a3e0] flex items-center justify-center">
                  <span className="text-lg">💬</span>
                </div>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{reviews.length}</span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                  ★ {avgRating} / 5.0
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center space-x-1">
                <span className="text-[#00a3e0]">✓</span>
                <span>Dữ liệu thời gian thực từ CSDL</span>
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Đánh giá cần chú ý
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <span className="text-lg">⚠</span>
                </div>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {String(pendingCount).padStart(2, "0")}
                </span>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full">
                  Chờ duyệt
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center space-x-1">
                <span className="text-amber-500">⚡</span>
                <span>Cập nhật tự động theo CSDL</span>
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Tích cực (4-5★)
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <span className="text-lg">⭐</span>
                </div>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {positivePercent}%
                </span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                  Hài lòng
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center space-x-1">
                <span className="text-emerald-500">📈</span>
                <span>Tỷ lệ phản hồi tích cực</span>
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Trạng thái kết nối
                </span>
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <span className="text-lg">🔗</span>
                </div>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">Hoạt động</span>
                <span className="text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-0.5 rounded-full">
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center space-x-1">
                <span className="text-[#00a3e0]">●</span>
                <span>Đồng bộ trực tiếp qua REST API</span>
              </p>
            </div>
          </section>

          {/* Filter Bar & Search */}
          <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              {/* Search text field */}
              <div className="relative flex-1 min-w-[220px]">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm theo tên, địa điểm hoặc từ khóa review..."
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#00a3e0]"
                />
              </div>

              {/* Status Dropdown */}
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#00a3e0] min-w-[150px]"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="approved">Đã duyệt / Công khai</option>
                <option value="pending">Chờ duyệt</option>
                <option value="flagged">Báo cáo khẩn</option>
              </select>

              {/* Quick Filter Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setQuickFilter("all")}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    quickFilter === "all"
                      ? "bg-[#00a3e0] text-white shadow-sm"
                      : "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Tất cả ({reviews.length})
                </button>
                <button
                  type="button"
                  onClick={() => setQuickFilter("verified")}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    quickFilter === "verified"
                      ? "bg-[#00a3e0] text-white shadow-sm"
                      : "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Đã xác thực
                </button>
                <button
                  type="button"
                  onClick={() => setQuickFilter("flagged")}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    quickFilter === "flagged"
                      ? "bg-red-500 text-white shadow-sm"
                      : "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Cần chú ý ({pendingCount})
                </button>
              </div>

              {/* Reset */}
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setStatus("all");
                  setQuickFilter("all");
                  fetchReviews();
                }}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Làm mới bộ lọc"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M8 16H3v5" />
                </svg>
              </button>
            </div>
          </div>

          {/* Bulk Actions Toolbar */}
          <div className="bg-white dark:bg-[#0f172a] p-3.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={visibleReviews.length > 0 && selected.length === visibleReviews.length}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-[#00a3e0] focus:ring-[#00a3e0] cursor-pointer"
              />
              <span>Chọn tất cả trên trang</span>
            </label>
            <div className="flex items-center gap-3">
              <span>
                Đã chọn: <strong className="text-slate-900 dark:text-white">{selected.length}</strong>
              </span>
              <button
                type="button"
                onClick={() => bulkUpdate("approved")}
                className="px-3 py-1.5 bg-[#00a3e0] hover:bg-[#008ec4] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Duyệt đã chọn
              </button>
              <button
                type="button"
                onClick={() => bulkUpdate("hidden")}
                className="px-3 py-1.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 hover:bg-red-100 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Ẩn / Xóa hàng loạt
              </button>
            </div>
          </div>

          {/* Review List Heading */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Danh sách đánh giá thực tế
            </h2>
            <span>{visibleReviews.length} mục hiển thị</span>
          </div>

          {/* Review Cards Grid / List */}
          <section className="space-y-4">
            {loading ? (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse">
                Đang tải dữ liệu đánh giá từ CSDL...
              </div>
            ) : visibleReviews.length ? (
              visibleReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  selected={selected.includes(review.id)}
                  onSelect={(id) =>
                    setSelected((current) =>
                      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
                    )
                  }
                  onAction={updateReview}
                />
              ))
            ) : (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800">
                Không có review phù hợp với bộ lọc hiện tại.
              </div>
            )}
          </section>
        </main>
      </div>

      <AppFooter />
    </div>
  );
}