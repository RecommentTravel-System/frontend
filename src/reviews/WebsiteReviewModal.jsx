import { useState, useEffect, useRef } from "react";
import { submitWebsiteReview, uploadWebsiteReviewMedia } from "~/shared/services/website-review-api";

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
  const [mediaList, setMediaList] = useState([]);
  const fileInputRef = useRef(null);

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

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    for (const file of files) {
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      if (!isImage && !isVideo) {
        setError("Chỉ chấp nhận tệp hình ảnh (JPG, PNG, WebP) hoặc video (MP4, WebM).");
        continue;
      }
      if (file.size > 30 * 1024 * 1024) {
        setError(`Tệp "${file.name}" vượt quá dung lượng cho phép (tối đa 30MB).`);
        continue;
      }

      const tempId = `media-${Date.now()}-${Math.random()}`;
      const previewUrl = URL.createObjectURL(file);

      setMediaList((prev) => [
        ...prev,
        {
          id: tempId,
          url: previewUrl,
          type: isVideo ? "video" : "image",
          name: file.name,
          uploading: true
        }
      ]);

      try {
        const res = await uploadWebsiteReviewMedia(file);
        const uploadedUrl = res.data?.url || previewUrl;
        setMediaList((prev) =>
          prev.map((item) =>
            item.id === tempId
              ? { ...item, url: uploadedUrl, uploading: false }
              : item
          )
        );
      } catch (uploadErr) {
        console.warn("Upload failed, retaining preview:", uploadErr);
        setMediaList((prev) =>
          prev.map((item) =>
            item.id === tempId ? { ...item, uploading: false } : item
          )
        );
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeMedia = (idToRemove) => {
    setMediaList((prev) => prev.filter((item) => item.id !== idToRemove));
  };

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

    if (mediaList.some((m) => m.uploading)) {
      setError("Đang trong quá trình tải tệp lên. Vui lòng đợi trong giây lát...");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const mediaUrls = mediaList.map((m) => m.url);
      const payload = {
        rating,
        category,
        comment: comment.trim(),
        userFullName: anonymous ? "Người dùng ẩn danh" : userFullName.trim(),
        userEmail: anonymous ? "" : userEmail.trim(),
        anonymous,
        mediaUrls
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
    setMediaList([]);
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-all cursor-pointer shadow-2xs"
            aria-label="Thoát"
            title="Thoát / Đóng"
          >
            <span aria-hidden="true" className="font-bold text-sm">✕</span>
            <span>Thoát</span>
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

            {/* Media Upload Section (Images & Videos) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Ảnh &amp; Video minh họa <span className="text-slate-400 font-normal">(tùy chọn)</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {mediaList.length} tệp đã chọn
                </span>
              </div>

              {/* Upload trigger button */}
              <div className="flex items-center gap-2 mb-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="website-review-media-input"
                />
                <label
                  htmlFor="website-review-media-input"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-dashed border-sky-300 dark:border-sky-800 bg-sky-50/60 dark:bg-sky-950/30 text-[#00a3e0] text-xs font-bold hover:bg-sky-100/70 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>+ Đính kèm ảnh / video</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  Hỗ trợ PNG, JPG, WebP, MP4 (tối đa 30MB)
                </span>
              </div>

              {/* Previews grid */}
              {mediaList.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {mediaList.map((item) => (
                    <div
                      key={item.id}
                      className="relative group rounded-xl overflow-hidden aspect-video bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-slate-800 flex items-center justify-center"
                    >
                      {item.type === "video" ? (
                        <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
                          <video
                            src={item.url}
                            className="w-full h-full object-cover opacity-80"
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center text-xs">
                              ▶
                            </span>
                          </div>
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/70 text-white">
                            VIDEO
                          </span>
                        </div>
                      ) : (
                        <img
                          src={item.url}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      )}

                      {/* Loading spinner */}
                      {item.uploading && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-[10px] gap-1">
                          <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          <span>Đang tải...</span>
                        </div>
                      )}

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removeMedia(item.id)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center text-xs transition-colors cursor-pointer shadow-sm"
                        title="Xóa tệp này"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                    <span>Đang gửi...</span>
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

