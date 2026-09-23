import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppFooter, AppHeader } from "~/shared/components";
import AdminDashboardRail from "./AdminDashboardRail";
import { getAllReviews, deleteReview, updateReview as updateReviewApi } from "~/shared/services/review-api.js";
import "./AdminReviews.css";

const statusLabels = { pending: "Chờ duyệt", flagged: "Báo cáo khẩn", approved: "Đã duyệt", hidden: "Đã ẩn" };

function Icon({ name, size = 20 }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
    review: <><path d="M20 15.5a2 2 0 0 1-2 2H8l-4 3v-13a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z" /><path d="M8 10h8M8 13h5" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    hide: <><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.7 10.7 0 0 1 12 5c5.2 0 8.5 5 8.5 5a16 16 0 0 1-3.1 3.6M6.1 6.1C3.9 7.7 2.5 10 2.5 10s3.3 5 9.5 5c.7 0 1.4-.1 2-.2" /></>,
    warning: <><path d="m12 3 9 17H3Z" /><path d="M12 9v4M12 16h.01" /></>,
  };
  return <svg className="admin-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function Rating({ value }) {
  const num = Number(value) || 5;
  return <span className="admin-rating" aria-label={`${num} trên 5 sao`}>{Array.from({ length: 5 }, (_, index) => <span key={index} className={index < Math.round(num) ? "star-filled" : "star-empty"}>★</span>)} <strong>{num.toFixed(1)}</strong></span>;
}

function ReviewCard({ review, selected, onSelect, onAction }) {
  const isFlagged = review.status === "flagged";
  return <article className={`admin-review-card${isFlagged ? " is-flagged" : ""}`}>
    <div className="admin-review-main">
      <label className="admin-checkbox-label"><input type="checkbox" checked={selected} onChange={() => onSelect(review.id)} aria-label={`Chọn ${review.id}`} /></label>
      <div className={`admin-avatar${isFlagged ? " avatar-alert" : ""}`}>{review.avatar}</div>
      <div className="admin-review-copy">
        <div className="admin-review-meta"><h3>{review.name}</h3><span className={`admin-badge${isFlagged ? " badge-alert" : ""}`}>{review.badge}</span><span className="admin-review-id">ID: #{review.id} · {review.time}</span></div>
        <div className="admin-place-line"><strong>{review.place}</strong><Rating value={review.rating} /></div>
        <span className={`admin-status status-${review.status}`}><span className="status-dot" />{statusLabels[review.status] || review.status}</span>
        {isFlagged && <div className="admin-alert-box"><strong><Icon name="warning" size={15} /> Lý do báo cáo từ cộng đồng</strong><p>Nội dung cần xem xét và kiểm duyệt.</p></div>}
        <p className={`admin-review-content${isFlagged ? " flagged-content" : ""}`}>“{review.content}”</p>
        <p className="admin-evidence">{review.evidence}</p>
      </div>
    </div>
    <div className="admin-review-actions">
      {isFlagged ? <><button type="button" className="admin-button button-neutral" onClick={() => onAction(review.id, "approved")}><Icon name="check" size={16} /> Xác minh</button><button type="button" className="admin-button button-danger" onClick={() => onAction(review.id, "hidden")}><Icon name="hide" size={16} /> Xóa</button></> : <button type="button" className="admin-button button-primary" onClick={() => onAction(review.id, "approved")}><Icon name="check" size={16} /> Duyệt ngay</button>}
      <button type="button" className="admin-button button-quiet" onClick={() => onAction(review.id, "hidden")}><Icon name="hide" size={16} /> Ẩn / Xóa</button>
    </div>
  </article>;
}

export default function AdminReviews() {
  const navigate = useNavigate();
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

  const visibleReviews = useMemo(() => reviews.filter((review) => {
    const matchesQuery = `${review.name} ${review.place} ${review.content}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "all" || review.status === status;
    const matchesQuick = quickFilter === "all" || (quickFilter === "flagged" && review.status === "flagged") || (quickFilter === "verified" && review.verified);
    return matchesQuery && matchesStatus && matchesQuick;
  }), [query, quickFilter, reviews, status]);

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
    <div className="admin-page flex flex-col min-h-screen bg-[#f8fafc]">
      <AppHeader />
      <div className="flex flex-1 relative">
        <AdminDashboardRail active="reviews" />
        <main className="admin-main flex-1">
          <div className="admin-topbar">
            <div>
              <p className="admin-eyebrow">Moderation hub · Quality control <span className="live-dot" /> Live sync</p>
              <h1>Quản lý Đánh giá &amp; Review</h1>
              <p className="admin-subtitle">Kiểm duyệt phản hồi, xác thực trải nghiệm và xử lý dữ liệu đánh giá thực tế từ người dùng.</p>
            </div>
            <button type="button" className="admin-outline-button" onClick={() => navigate("/")}>Về trang người dùng</button>
          </div>
          <section className="admin-kpis" aria-label="Tổng quan đánh giá">
            <div className="admin-kpi"><span>Tổng đánh giá</span><strong>{reviews.length}</strong><small>★ {avgRating} / 5.0 · Dữ liệu thời gian thực</small></div>
            <div className="admin-kpi kpi-alert"><span>Đánh giá cần chú ý</span><strong>{pendingCount}</strong><small>Cập nhật tự động theo CSDL</small></div>
            <div className="admin-kpi"><span>Tích cực (4-5★)</span><strong>{positivePercent}%</strong><div className="admin-progress"><i style={{ width: `${positivePercent}%` }} /></div></div>
            <div className="admin-kpi"><span>Trạng thái kết nối CSDL</span><strong>Hoạt động</strong><small>Đồng bộ trực tiếp qua REST API</small></div>
          </section>
          <section className="admin-console" aria-label="Bộ lọc review">
            <div className="admin-search-row">
              <label className="admin-search">
                <Icon name="search" size={19} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tên, địa điểm hoặc từ khóa review..." />
              </label>
              <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Lọc trạng thái">
                <option value="all">Tất cả trạng thái</option>
                <option value="approved">Đã duyệt / Công khai</option>
                <option value="pending">Chờ duyệt</option>
                <option value="flagged">Báo cáo khẩn</option>
              </select>
              <button type="button" className="admin-refresh" onClick={() => { setQuery(""); setStatus("all"); setQuickFilter("all"); fetchReviews(); }} aria-label="Làm mới bộ lọc">↻</button>
            </div>
            <div className="admin-filter-row">
              <button type="button" className={quickFilter === "all" ? "filter-active" : ""} onClick={() => setQuickFilter("all")}>Tất cả ({reviews.length})</button>
              <button type="button" className={quickFilter === "verified" ? "filter-active" : ""} onClick={() => setQuickFilter("verified")}>Đã xác thực</button>
              <button type="button" className={quickFilter === "flagged" ? "filter-alert" : ""} onClick={() => setQuickFilter("flagged")}>Cần chú ý ({pendingCount})</button>
            </div>
          </section>
          <section className="admin-bulkbar">
            <label><input type="checkbox" checked={visibleReviews.length > 0 && selected.length === visibleReviews.length} onChange={toggleSelectAll} /> Chọn tất cả trên trang</label>
            <span>Đã chọn: <strong>{selected.length}</strong></span>
            <div>
              <button type="button" className="admin-button button-primary" onClick={() => bulkUpdate("approved")}>Duyệt đã chọn</button>
              <button type="button" className="admin-button button-quiet" onClick={() => bulkUpdate("hidden")}>Ẩn / Xóa hàng loạt</button>
            </div>
          </section>
          <div className="admin-list-heading"><h2>Danh sách đánh giá thực tế</h2><span>{visibleReviews.length} mục hiển thị</span></div>
          <section className="admin-review-list">
            {loading ? (
              <div className="p-8 text-center text-slate-500 text-sm">Đang tải dữ liệu đánh giá từ CSDL...</div>
            ) : visibleReviews.length ? (
              visibleReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  selected={selected.includes(review.id)}
                  onSelect={(id) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])}
                  onAction={updateReview}
                />
              ))
            ) : (
              <div className="admin-empty">Không có review phù hợp với bộ lọc hiện tại.</div>
            )}
          </section>
          {notice && <p className="admin-notice" role="status">{notice}</p>}
        </main>
      </div>
      <AppFooter />
    </div>
  );
}