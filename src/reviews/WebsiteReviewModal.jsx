import { useState, useEffect } from "react";
import { submitWebsiteReview } from "~/shared/services/website-review-api";

const CATEGORIES = [
  "Trải nghiệm chung",
  "Giao diện & Thiết kế (UI/UX)",
  "Lập kế hoạch & Lịch trình",
  "Tìm kiếm & Khám phá địa điểm",
  "Tốc độ & Hiệu năng hệ thống",
  "Dịch vụ & Hỗ trợ người dùng"
];

const RATING_DESCRIPTIONS = {
  1: "Rất tệ - Cần cải thiện nhiều",
  2: "Chưa hài lòng - Còn nhiều lỗi",
  3: "Bình thường - Tạm chấp nhận được",
  4: "Hài lòng - Trang web hoạt động tốt",
  5: "Tuyệt vời - Rất thích trải nghiệm này!"
};

export default function WebsiteReviewModal({ isOpen, onClose, user, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState("Trải nghiệm chung");
  const [comment, setComment] = useState("");
  const [userFullName, setUserFullName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (user) {
      setUserFullName(user.fullName || user.username || "");
      setUserEmail(user.email || "");
    }
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !submitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError("Vui lòng nhập nội dung đánh giá của bạn.");
      return;
    }
    if (comment.trim().length < 5) {
      setError("Nội dung đánh giá nên có ít nhất 5 ký tự.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        rating,
        category,
        comment: comment.trim(),
        userFullName: anonymous ? "Người dùng ẩn danh" : userFullName.trim(),
        userEmail: anonymous ? "" : userEmail.trim(),
        anonymous
      };

      const res = await submitWebsiteReview(payload);
      setSubmitted(true);
      if (onSuccess) {
        onSuccess(res.data);
      }
    } catch (err) {
      console.error("Submit review error:", err);
      setError(err?.message || "Không thể gửi đánh giá lúc này. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setComment("");
    setRating(5);
    setCategory("Trải nghiệm chung");
    setError("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="website-review-title"
    >
      <div
        className="bg-white dark:bg-[#0f172a] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden transition-all transform animate-modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800 flex items-center justify-center text-[#00a3e0] text-xl font-bold shadow-xs">
              ★
            </div>
            <div>
              <h2 id="website-review-title" className="text-lg sm:text-xl font-extrabold text-[#002d54] dark:text-white">
                Gửi đánh giá trang web
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chia sẻ cảm nhận & đóng góp ý kiến để hoàn thiện WAYVEE
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="đóng"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl font-bold animate-success-check">
              ✓
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Cảm ơn bạn đã gửi đánh giá!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              đánh giá của bạn đã được ghi nhận vào hệ thống. Những ý kiến đóng góp quý báu này sẽ giúp đội ngũ WAYVEE không ngừng cải thiện và mang lại trải nghiệm du lịch tốt nhất.
            </p>
            <div className="pt-4">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 bg-[#00a3e0] hover:bg-[#008ec4] text-white font-bold rounded-xl shadow-md transition-all cursor-pointer text-sm"
              >
                Hoàn tất &amp; đóng
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Rating Stars Selector */}
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800/80">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Mức độ hài lòng của bạn
              </label>
              <div className="flex items-center justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="text-3xl sm:text-4xl transition-transform hover:scale-125 focus:outline-none cursor-pointer p-1"
                      aria-label={`${star} sao`}
                    >
                      <span className={active ? "text-amber-400 drop-shadow-xs" : "text-slate-300 dark:text-slate-700"}>
                        ★
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 h-4">
                {RATING_DESCRIPTIONS[hoverRating || rating]}
              </p>
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Khía cạnh muốn góp ý / đánh giá
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-[#00a3e0]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Comment Textarea */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nội dung nhận xét &amp; góp ý <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {comment.length}/2000 ký tự
                </span>
              </div>
              <textarea
                rows={4}
                maxLength={2000}
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Chia sẻ chi tiết trải nghiệm của bạn khi sử dụng trang web (điều bạn thích, khó khăn gặp phải, tính năng bạn mong muốn có thêm)..."
                className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#00a3e0] resize-y"
              />
            </div>

            {/* Author info (Name & Email) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Họ và tên của bạn
                </label>
                <input
                  type="text"
                  disabled={anonymous}
                  value={userFullName}
                  onChange={(e) => setUserFullName(e.target.value)}
                  placeholder={anonymous ? "Ẩn danh" : "Nguyễn Văn A"}
                  className={`w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 ${
                    anonymous ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed" : "bg-white dark:bg-slate-900 focus:border-[#00a3e0]"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email liên hệ (tùy chọn)
                </label>
                <input
                  type="email"
                  disabled={anonymous}
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder={anonymous ? "Ẩn danh" : "email@example.com"}
                  className={`w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 ${
                    anonymous ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed" : "bg-white dark:bg-slate-900 focus:border-[#00a3e0]"
                  }`}
                />
              </div>
            </div>

            {/* Anonymous checkbox */}
            <label className="flex items-center gap-2.5 cursor-pointer pt-1 text-xs text-slate-600 dark:text-slate-400 select-none">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-[#00a3e0] focus:ring-[#00a3e0] cursor-pointer"
              />
              <span>Gửi đánh giá dưới dạng <strong>ẩn danh</strong> (không hiển thị tên và email công khai)</span>
            </label>

            {/* Error banner */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-600 dark:text-red-400">
                ⚠ {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleReset}
                disabled={submitting}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-[#00a3e0] hover:bg-[#008ec4] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>đang gửi...</span>
                  </>
                ) : (
                  <span>Gửi đánh giá</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

