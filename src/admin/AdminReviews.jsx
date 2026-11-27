import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "~/shared/components";
import { useTranslation } from "~/providers/i18n-provider";
import AdminDashboardRail from "./AdminDashboardRail";
import { getAllReviews, deleteReview } from "~/shared/services/review-api.js";
import {
  getWebsiteReviews,
  getWebsiteReviewStats,
  replyWebsiteReview,
  deleteWebsiteReviewReply
} from "~/shared/services/website-review-api.js";

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

function MediaViewerModal({ media, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [customSrc, setCustomSrc] = useState(null);
  const videoRef = useRef(null);

  if (!media) return null;

  const url = customSrc || media.url;
  const isVideo = media.isVideo || url.endsWith('.mp4') || url.endsWith('.webm') || url.includes('/video/');

  const handleLocalFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const objUrl = URL.createObjectURL(file);
      setCustomSrc(objUrl);
      setError(false);
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full max-h-[92vh] flex flex-col items-center justify-center bg-slate-900/90 rounded-3xl border border-slate-700/80 shadow-2xl p-4 sm:p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-9 h-9 rounded-full bg-white/20 hover:bg-rose-500/80 text-white flex items-center justify-center text-lg transition-colors cursor-pointer shadow-md"
          title="Đóng"
        >
          ✕
        </button>

        {isVideo ? (
          <div className="w-full flex flex-col items-center space-y-3">
            <div className="relative w-full max-h-[72vh] flex items-center justify-center bg-black/60 rounded-2xl overflow-hidden border border-slate-800">
              {loading && !error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-2 bg-black/40 z-10 pointer-events-none">
                  <div className="w-8 h-8 border-[3px] border-sky-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-sky-200">Đang nạp video...</span>
                </div>
              )}
              {error ? (
                <div className="p-8 text-center space-y-3 max-w-md">
                  <div className="text-3xl">⚠️</div>
                  <p className="text-sm text-amber-300 font-bold">
                    Không thể phát trực tiếp tệp video này trong khung xem nhanh.
                  </p>
                  <p className="text-xs text-slate-400">
                    Bạn có thể mở trực tiếp trong tab mới hoặc chọn tệp video từ máy tính để phát.
                  </p>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  src={url}
                  controls
                  autoPlay
                  playsInline
                  preload="auto"
                  onLoadedData={() => setLoading(false)}
                  onCanPlay={() => setLoading(false)}
                  onError={() => {
                    setLoading(false);
                    setError(true);
                  }}
                  className="max-w-full max-h-[70vh] rounded-xl shadow-lg object-contain"
                >
                  <source src={url} type="video/mp4" />
                  Trình duyệt của bạn không hỗ trợ phát video này.
                </video>
              )}
            </div>

            <div className="flex items-center justify-center gap-2.5 flex-wrap pt-1 text-xs">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold transition-colors shadow-sm cursor-pointer"
              >
                <span>↗ Mở tab mới</span>
              </a>
              <a
                href={url}
                download="wayvee-feedback-video.mp4"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors shadow-sm cursor-pointer"
              >
                <span>⬇ Tải video</span>
              </a>
              <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors cursor-pointer">
                <span>📁 Chọn video từ máy</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleLocalFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center space-y-2">
            <img
              src={url}
              alt="Chi tiết đính kèm"
              className="max-w-full max-h-[78vh] object-contain rounded-2xl shadow-2xl"
            />
            <div className="pt-2">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs transition-colors"
              >
                <span>↗ Xem ảnh kích thước gốc</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function WebsiteReviewDetailModal({ review, onClose, onReplySuccess, onReplyDeleted }) {
  const [replyText, setReplyText] = useState(review?.adminReply || "");
  const [isEditing, setIsEditing] = useState(!review?.adminReply);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [activeMedia, setActiveMedia] = useState(null);

  if (!review) return null;
  const num = Number(review.rating || 5);
  const dateStr = review.createdAt
    ? new Date(review.createdAt).toLocaleString("vi-VN")
    : "Gần đây";

  const mediaList = Array.isArray(review.mediaUrls) ? review.mediaUrls : [];

  const replyTemplates = [
    "Cảm ơn bạn đã đóng góp ý kiến! Đội ngũ WAYVEE đã ghi nhận và sẽ tối ưu trải nghiệm này trong bản cập nhật tới.",
    "Cảm ơn bạn đã phản hồi! Bộ phận kỹ thuật đang kiểm tra và sẽ sớm khắc phục vấn đề bạn gặp phải.",
    "Cảm ơn bạn đã tin tưởng và đồng hành cùng WAYVEE! Chúc bạn có những chuyến đi thật trọn vẹn và ý nghĩa."
  ];

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      setError("Vui lòng nhập nội dung phản hồi.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await replyWebsiteReview(review.id, replyText.trim());
      setIsEditing(false);
      if (onReplySuccess) {
        onReplySuccess(
          res.data || {
            ...review,
            adminReply: replyText.trim(),
            repliedAt: new Date().toISOString(),
            repliedBy: "Ban Quản Trị WAYVEE"
          }
        );
      }
    } catch (err) {
      setError(err?.message || "Không thể gửi phản hồi. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReply = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phản hồi này không?")) return;
    setDeleting(true);
    setError("");
    try {
      await deleteWebsiteReviewReply(review.id);
      setReplyText("");
      setIsEditing(true);
      if (onReplyDeleted) {
        onReplyDeleted(review.id);
      }
    } catch (err) {
      setError(err?.message || "Không thể xóa phản hồi. Vui lòng thử lại!");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">★</span>
            <h3 className="text-base font-extrabold text-[#002d54] dark:text-white">
              Chi tiết đánh giá &amp; Phản hồi
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-sm">
          {/* User & Rating */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs text-slate-400">Người đánh giá</p>
              <p className="font-bold text-slate-900 dark:text-white">
                {review.anonymous ? "Người dùng ẩn danh" : review.userFullName || "Khách"}
              </p>
              
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Điểm số</p>
              <span className="text-base font-extrabold text-amber-500">
                ★ {num.toFixed(1)} / 5.0
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 mr-2">Khía cạnh:</span>
              <span className="inline-block px-3 py-1 rounded-lg font-semibold bg-sky-50 dark:bg-sky-950/60 text-[#00a3e0] border border-sky-100 dark:border-sky-800">
                {review.category || "Trải nghiệm chung"}
              </span>
            </div>
            <div className="text-slate-400">
              {dateStr}
            </div>
          </div>

          {/* Comment */}
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Nội dung nhận xét &amp; góp ý</p>
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed italic">
              “{review.comment}”
            </div>
          </div>

          {/* Attached Media (Images & Videos) */}
          {mediaList.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span>📎</span> Ảnh &amp; Video người dùng đính kèm ({mediaList.length})
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                {mediaList.map((url, idx) => {
                  const isVideo = url.endsWith(".mp4") || url.endsWith(".webm") || url.includes("/video/");
                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveMedia({ url, isVideo })}
                      className="relative group rounded-xl overflow-hidden aspect-video bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-[#00a3e0] transition-colors"
                    >
                      {isVideo ? (
                        <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
                          <video src={url} className="w-full h-full object-cover opacity-80" />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center text-xs">
                              ▶
                            </span>
                          </div>
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-black/70 text-white">
                            VIDEO
                          </span>
                        </div>
                      ) : (
                        <img
                          src={url}
                          alt={`Đính kèm ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Admin Reply Section */}
          <div className="p-4 bg-sky-50/60 dark:bg-sky-950/30 rounded-2xl border border-sky-100 dark:border-sky-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#002d54] dark:text-sky-300 flex items-center gap-1.5">
                <span>🛡️</span> Phản hồi từ Ban Quản Trị
              </h4>
              {review.adminReply && !isEditing && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="text-xs font-semibold text-[#00a3e0] hover:underline cursor-pointer"
                  >
                    Sửa phản hồi
                  </button>
                  <span className="text-slate-300">·</span>
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={handleDeleteReply}
                    className="text-xs font-semibold text-red-500 hover:underline cursor-pointer disabled:opacity-50"
                  >
                    {deleting ? "Đang xóa..." : "Xóa"}
                  </button>
                </div>
              )}
            </div>

            {review.adminReply && !isEditing ? (
              <div className="space-y-1.5">
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-sky-200 dark:border-sky-900/60 leading-relaxed">
                  {review.adminReply}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Người trả lời: <strong>{review.repliedBy || "Ban Quản Trị WAYVEE"}</strong></span>
                  {review.repliedAt && <span>{new Date(review.repliedAt).toLocaleString("vi-VN")}</span>}
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => {
                    setReplyText(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Nhập nội dung phản hồi gửi tới người dùng..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#00a3e0] resize-y"
                />

                {/* Quick Templates */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Gợi ý phản hồi nhanh:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {replyTemplates.map((template, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setReplyText(template)}
                        className="px-2 py-1 rounded-lg text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-[#00a3e0] hover:text-[#00a3e0] transition-colors cursor-pointer text-left truncate max-w-full"
                        title={template}
                      >
                        {template.slice(0, 45)}...
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-500 font-medium">⚠ {error}</p>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  {review.adminReply && (
                    <button
                      type="button"
                      onClick={() => {
                        setReplyText(review.adminReply);
                        setIsEditing(false);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Hủy
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleSendReply}
                    className="px-4 py-2 bg-[#00a3e0] hover:bg-[#008ec4] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {submitting ? "Đang gửi..." : review.adminReply ? "Lưu phản hồi" : "Gửi phản hồi"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Lightbox Preview */}
      {activeMedia && (
        <MediaViewerModal
          media={activeMedia}
          onClose={() => setActiveMedia(null)}
        />
      )}
    </div>
  );
}

function WebsiteReviewAdminCard({ review, onViewDetail, onPreviewMedia }) {
  const dateStr = review.createdAt
    ? new Date(review.createdAt).toLocaleString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
    : "Gần đây";

  const name = review.anonymous ? "Người dùng ẩn danh" : review.userFullName || "Thành viên WAYVEE";
  const initial = review.anonymous ? "?" : (name.slice(0, 2).toUpperCase() || "WV");
  const mediaList = Array.isArray(review.mediaUrls) ? review.mediaUrls : [];

  return (
    <article className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-start justify-between gap-4">
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-950/60 text-[#00a3e0] font-bold text-sm flex items-center justify-center border border-sky-200 dark:border-sky-800 shrink-0">
          {initial}
        </div>

        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {name}
            </h3>
            {review.anonymous ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                Ẩn danh
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 dark:bg-sky-950/60 text-[#00a3e0] border border-sky-200 dark:border-sky-900">
                Thành viên
              </span>
            )}
            {review.adminReply && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <span>✓</span> Đã phản hồi
              </span>
            )}
            <span className="text-xs text-slate-400 dark:text-slate-500">
              ID: #{review.id} · {dateStr}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs flex-wrap">
            <span className="font-bold text-[#002d54] dark:text-sky-300">
              🌐 Trang web WAYVEE
            </span>
            <Rating value={review.rating} />
            {review.category && (
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {review.category}
              </span>
            )}
            {mediaList.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 dark:bg-sky-950/40 text-[#00a3e0] border border-sky-200 dark:border-sky-800">
                📎 {mediaList.length} tệp đính kèm
              </span>
            )}
          </div>

          <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 italic leading-relaxed">
            “{review.comment}”
          </p>

          {/* Media preview strip if present */}
          {mediaList.length > 0 && (
            <div className="flex items-center gap-2 pt-0.5">
              {mediaList.slice(0, 4).map((url, idx) => {
                const isVideo = url.endsWith(".mp4") || url.endsWith(".webm") || url.includes("/video/");
                return (
                  <div
                    key={idx}
                    onClick={() => onPreviewMedia && onPreviewMedia({ url, isVideo })}
                    className="w-14 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 relative cursor-pointer hover:border-[#00a3e0] hover:scale-105 transition-all shadow-2xs"
                    title={isVideo ? "Bấm để xem video" : "Bấm để xem ảnh"}
                  >
                    {isVideo ? (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center text-[10px] text-white font-bold hover:bg-sky-950 transition-colors">
                        ▶ MP4
                      </div>
                    ) : (
                      <img src={url} alt="thumb" className="w-full h-full object-cover" />
                    )}
                  </div>
                );
              })}
              {mediaList.length > 4 && (
                <span className="text-xs text-slate-400">+{mediaList.length - 4} tệp khác</span>
              )}
            </div>
          )}

          {/* Admin reply snippet */}
          {review.adminReply && (
            <div className="p-3 bg-sky-50/50 dark:bg-sky-950/30 rounded-xl border border-sky-200/70 dark:border-sky-900/50 text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <div className="flex items-center justify-between font-bold text-[#002d54] dark:text-sky-300 text-[11px]">
                <span>🛡️ Phản hồi từ Ban Quản Trị:</span>
                {review.repliedAt && (
                  <span className="font-normal text-slate-400 text-[10px]">
                    {new Date(review.repliedAt).toLocaleString("vi-VN")}
                  </span>
                )}
              </div>
              <p className="italic">“{review.adminReply}”</p>
            </div>
          )}

          
        </div>
      </div>

      <div className="flex md:flex-col items-center justify-end shrink-0 pt-2 md:pt-0">
        <button
          type="button"
          onClick={() => onViewDetail(review)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${review.adminReply
              ? "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
              : "bg-sky-50 dark:bg-sky-950/40 text-[#00a3e0] border border-sky-200 dark:border-sky-900 hover:bg-sky-100"
            }`}
        >
          {review.adminReply ? "Xem & Sửa phản hồi" : "Xem chi tiết"}
        </button>
      </div>
    </article>
  );
}

function PlaceReviewCard({ review, selected, onSelect, onAction }) {
  const isFlagged = review.status === "flagged";
  return (
    <article
      className={`bg-white dark:bg-[#0f172a] p-5 rounded-2xl border transition-shadow shadow-sm hover:shadow-md flex flex-col md:flex-row md:items-start justify-between gap-4 ${isFlagged
          ? "border-red-300 dark:border-red-900/80 bg-red-50/10 dark:bg-red-950/10"
          : "border-slate-200 dark:border-slate-800"
        }`}
    >
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        <div className="pt-1">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(review.id)}
            aria-label={`Chọn ${review.id}`}
            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-[#00a3e0] focus:ring-[#00a3e0] cursor-pointer"
          />
        </div>

        <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-950/60 text-[#00a3e0] font-bold text-sm flex items-center justify-center border border-sky-200 dark:border-sky-800 shrink-0">
          {review.avatar}
        </div>

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
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${review.status === "approved"
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60"
                  : review.status === "flagged"
                    ? "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60"
                    : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60"
                }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${review.status === "approved"
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

  // Active moderation view: "website" (đánh giá trang web) vs "places" (đánh giá địa điểm)
  const [activeTab, setActiveTab] = useState("website");

  // Website Reviews State (READ-ONLY)
  const [websiteReviews, setWebsiteReviews] = useState([]);
  const [webStats, setWebStats] = useState({
    totalReviews: 0,
    averageRating: 5.0,
    ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    positivePercentage: 100
  });
  const [loadingWebReviews, setLoadingWebReviews] = useState(true);
  const [webQuery, setWebQuery] = useState("");
  const [webMinRating, setWebMinRating] = useState("all");
  const [webMaxRating, setWebMaxRating] = useState("all");
  const [webDate, setWebDate] = useState("");
  const [webReplyFilter, setWebReplyFilter] = useState("all");
  const [detailModalReview, setDetailModalReview] = useState(null);
  const [previewMedia, setPreviewMedia] = useState(null);

  // Place Reviews State
  const [placeReviews, setPlaceReviews] = useState([]);
  const [loadingPlaceReviews, setLoadingPlaceReviews] = useState(true);
  const [placeQuery, setPlaceQuery] = useState("");
  const [placeStatus, setPlaceStatus] = useState("all");
  const [placeQuickFilter, setPlaceQuickFilter] = useState("all");
  const [selectedPlaceReviews, setSelectedPlaceReviews] = useState([]);
  const [notice, setNotice] = useState("");

  const handleReplySuccess = (updatedReview) => {
    setWebsiteReviews((prev) =>
      prev.map((r) => (String(r.id) === String(updatedReview.id) ? updatedReview : r))
    );
    setDetailModalReview(updatedReview);
    setNotice("Đã gửi phản hồi thành công đến người dùng!");
  };

  const handleReplyDeleted = (reviewId) => {
    setWebsiteReviews((prev) =>
      prev.map((r) =>
        String(r.id) === String(reviewId)
          ? { ...r, adminReply: null, repliedAt: null, repliedBy: null }
          : r
      )
    );
    setDetailModalReview((prev) =>
      prev ? { ...prev, adminReply: null, repliedAt: null, repliedBy: null } : null
    );
    setNotice("Đã xóa phản hồi của bài đánh giá.");
  };

  const fetchWebsiteReviews = useCallback(async () => {
    setLoadingWebReviews(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        getWebsiteReviews(),
        getWebsiteReviewStats()
      ]);
      setWebsiteReviews(listRes.data || []);
      if (statsRes?.data) {
        setWebStats(statsRes.data);
      }
    } catch (err) {
      console.error("Failed to load website reviews in admin:", err);
    } finally {
      setLoadingWebReviews(false);
    }
  }, []);

  const fetchPlaceReviews = useCallback(async () => {
    setLoadingPlaceReviews(true);
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
      setPlaceReviews(mapped);
    } catch (err) {
      console.error("Failed to fetch place reviews:", err);
      setPlaceReviews([]);
    } finally {
      setLoadingPlaceReviews(false);
    }
  }, []);

  useEffect(() => {
    fetchWebsiteReviews();
    fetchPlaceReviews();
  }, [fetchWebsiteReviews, fetchPlaceReviews]);

  // Filtered Website Reviews (lọc theo từ mấy sao đến mấy sao, chọn ngày, trạng thái phản hồi)
  const visibleWebsiteReviews = useMemo(() => {
    return websiteReviews.filter((r) => {
      const kw = webQuery.toLowerCase();
      const matchesKw =
        !kw ||
        (r.userFullName && r.userFullName.toLowerCase().includes(kw)) ||
        (r.userEmail && r.userEmail.toLowerCase().includes(kw)) ||
        (r.comment && r.comment.toLowerCase().includes(kw)) ||
        (r.adminReply && r.adminReply.toLowerCase().includes(kw));

      // Lọc từ mấy sao đến mấy sao
      const rRating = Number(r.rating) || 5;
      const min = webMinRating === "all" ? 1 : Number(webMinRating);
      const max = webMaxRating === "all" ? 5 : Number(webMaxRating);
      const effectiveMin = Math.min(min, max);
      const effectiveMax = Math.max(min, max);
      const matchesRating = rRating >= effectiveMin && rRating <= effectiveMax;

      // Lọc chọn ngày
      let matchesDate = true;
      if (webDate && r.createdAt) {
        const d = new Date(r.createdAt);
        if (!isNaN(d.getTime())) {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          const localDate = `${y}-${m}-${day}`;
          const strPrefix = typeof r.createdAt === "string" ? r.createdAt.slice(0, 10) : "";
          matchesDate = localDate === webDate || strPrefix === webDate;
        }
      }

      // Lọc trạng thái phản hồi
      const matchesReply =
        webReplyFilter === "all" ||
        (webReplyFilter === "replied" && Boolean(r.adminReply)) ||
        (webReplyFilter === "unreplied" && !r.adminReply);

      return matchesKw && matchesRating && matchesDate && matchesReply;
    });
  }, [websiteReviews, webQuery, webMinRating, webMaxRating, webDate, webReplyFilter]);

  // Filtered Place Reviews
  const visiblePlaceReviews = useMemo(() => {
    return placeReviews.filter((review) => {
      const matchesQuery = `${review.name} ${review.place} ${review.content}`.toLowerCase().includes(placeQuery.toLowerCase());
      const matchesStatus = placeStatus === "all" || review.status === placeStatus;
      const matchesQuick =
        placeQuickFilter === "all" ||
        (placeQuickFilter === "flagged" && review.status === "flagged") ||
        (placeQuickFilter === "verified" && review.verified);
      return matchesQuery && matchesStatus && matchesQuick;
    });
  }, [placeReviews, placeQuery, placeStatus, placeQuickFilter]);

  const pendingCount = placeReviews.filter((r) => r.status === "pending" || r.status === "flagged").length;

  // Place Reviews update action
  const updatePlaceReview = async (id, nextStatus) => {
    try {
      if (nextStatus === "hidden") {
        await deleteReview(id);
        setNotice("Đã xóa/ẩn bài đánh giá địa điểm thành công.");
      } else {
        setNotice("Đã cập nhật trạng thái đánh giá địa điểm thành công.");
      }
      await fetchPlaceReviews();
    } catch (err) {
      console.error("Update place review error:", err);
      setNotice("Có lỗi xảy ra khi xử lý đánh giá địa điểm.");
    }
    setSelectedPlaceReviews((current) => current.filter((item) => item !== id));
  };

  const bulkUpdatePlaceReviews = async (nextStatus) => {
    if (!selectedPlaceReviews.length) return setNotice("Hãy chọn ít nhất một review để thực hiện thao tác.");
    try {
      if (nextStatus === "hidden") {
        await Promise.all(selectedPlaceReviews.map((id) => deleteReview(id).catch(() => { })));
      }
      setNotice(`${selectedPlaceReviews.length} review đã được xử lý.`);
      await fetchPlaceReviews();
      setSelectedPlaceReviews([]);
    } catch (err) {
      console.error("Bulk update error:", err);
      setNotice("Có lỗi xảy ra khi cập nhật hàng loạt.");
    }
  };

  const toggleSelectAllPlaceReviews = () => {
    setSelectedPlaceReviews(
      selectedPlaceReviews.length === visiblePlaceReviews.length
        ? []
        : visiblePlaceReviews.map((r) => r.id)
    );
  };

  return (
    <div className="bg-[#f8fafc] dark:bg-[#070e18] h-screen flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 font-sans transition-colors">
      <AppHeader />

      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        <AdminDashboardRail active="reviews" />

        <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-[1550px] w-full mx-auto space-y-6">
          {/* Topbar / Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                <span>{t("adminNav.portalBadge", "Admin Portal")}</span>
                <span className="text-slate-400">›</span>
                <span>Kiểm duyệt &amp; đánh giá</span>
                <span className="text-slate-400">›</span>
                <span className="text-[#00a3e0]">
                  {activeTab === "website" ? "Đánh giá trang web" : "Đánh giá địa điểm"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002d54] dark:text-white tracking-tight">
                {activeTab === "website" ? "Đánh giá trang web WAYVEE" : "Quản lý đánh giá địa điểm"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                {activeTab === "website"
                  ? "Theo dõi đánh giá trải nghiệm hệ thống và mức độ hài lòng từ người dùng "
                  : "Kiểm duyệt phản hồi, xác thực trải nghiệm và xử lý dữ liệu đánh giá địa điểm từ cộng đồng."}
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
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm font-medium flex items-center justify-between gap-2 animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>{notice}</span>
              </div>
              <button
                type="button"
                onClick={() => setNotice("")}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* View Mode Tabs: Website Reviews vs Place Reviews */}
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("website")}
              className={`pb-3 px-3 text-sm font-bold transition-all relative cursor-pointer flex items-center gap-2 ${activeTab === "website"
                  ? "text-[#00a3e0] border-b-2 border-[#00a3e0]"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
            >
              <span className="text-base">★</span>
              <span>Đánh giá trang web ({websiteReviews.length})</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 dark:bg-sky-950/80 text-[#00a3e0] border border-sky-200 dark:border-sky-900">
                Có thể phản hồi
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("places")}
              className={`pb-3 px-3 text-sm font-bold transition-all relative cursor-pointer flex items-center gap-2 ${activeTab === "places"
                  ? "text-[#00a3e0] border-b-2 border-[#00a3e0]"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
            >
              <span>📍</span>
              <span>Đánh giá địa điểm ({placeReviews.length})</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: WEBSITE REVIEWS (QUẢN LÝ ĐÁNH GIÁ & PHẢN HỒI NGƯỜI DÙNG)          */}
          {/* ========================================================================= */}
          {activeTab === "website" && (
            <div className="space-y-6">
              {/* FEEDBACK & REPLY POLICY BANNER */}
              <div className="bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 dark:from-slate-900 dark:via-sky-950/40 dark:to-slate-900 p-4 sm:p-5 rounded-2xl border border-blue-200 dark:border-blue-900/60 shadow-xs flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-sm">
                  🛡️
                </div>
                <div className="space-y-1 text-xs sm:text-sm">
                  <h2 className="font-extrabold text-[#002d54] dark:text-sky-300 text-sm sm:text-base">
                    Quản lý phản hồi &amp; Chăm sóc khách hàng dành cho Quản trị viên
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Theo dõi đánh giá trải nghiệm hệ thống, xem hình ảnh và video người dùng đính kèm. Quản trị viên có thể
                    <span className="text-[#00a3e0] font-bold ml-1">
                      gửi phản hồi trực tiếp tới từng đánh giá
                    </span> để giải đáp thắc mắc và tương tác với người dùng kịp thời.
                  </p>
                </div>
              </div>

              {/* KPI CARDS FOR WEBSITE REVIEWS */}
              <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" aria-label="Tổng quan đánh giá trang web">
                <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                      Tổng đánh giá web
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-[#00a3e0] flex items-center justify-center">
                      <span className="text-lg">💬</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline space-x-2">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      {webStats.totalReviews || websiteReviews.length}
                    </span>
                    <span className="text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-0.5 rounded-full">
                      Lượt gửi
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center space-x-1">
                    <span className="text-[#00a3e0]">✓</span>
                    <span>Từ người dùng &amp; khách tham quan</span>
                  </p>
                </div>

                <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                      điểm hài lòng TB
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
                      <span className="text-lg">★</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline space-x-2">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      {Number(webStats.averageRating || 5.0).toFixed(1)}
                    </span>
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full">
                      / 5.0 Sao
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center space-x-1">
                    <span className="text-amber-500">★</span>
                    <span>Điểm trung bình thời gian thực</span>
                  </p>
                </div>

                <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                      Tỷ lệ tích cực (4-5★)
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <span className="text-lg">⭐</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline space-x-2">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      {webStats.positivePercentage || 100}%
                    </span>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                      Hài lòng cao
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center space-x-1">
                    <span className="text-emerald-500">📈</span>
                    <span>Mức độ sẵn sàng giới thiệu</span>
                  </p>
                </div>

                <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                      Đã phản hồi
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <span className="text-lg">💬</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline space-x-2">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      {websiteReviews.filter((r) => Boolean(r.adminReply)).length}
                    </span>
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full">
                      / {websiteReviews.length} mục
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center space-x-1">
                    <span className="text-indigo-500">✓</span>
                    <span>Tương tác quản trị với người dùng</span>
                  </p>
                </div>
              </section>

              {/* RATING BREAKDOWN BARS */}
              <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Phân bố đánh giá số sao
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = webStats.ratingCounts?.[star] || 0;
                    const total = webStats.totalReviews || websiteReviews.length || 1;
                    const percent = Math.round((count / total) * 100);
                    return (
                      <div key={star} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                          <span className="text-amber-500">{star} ★</span>
                          <span className="text-slate-700 dark:text-slate-300">{count} lượt ({percent}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* FILTER BAR FOR WEBSITE REVIEWS */}
              <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="flex flex-1 flex-wrap items-center gap-3">
                  {/* Search query */}
                  <div className="relative flex-1 min-w-[220px]">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={webQuery}
                      onChange={(e) => setWebQuery(e.target.value)}
                      placeholder="Tìm theo người gửi, email hoặc nội dung nhận xét..."
                      className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#00a3e0]"
                    />
                  </div>

                  {/* Min rating filter */}
                  <select
                    value={webMinRating}
                    onChange={(e) => setWebMinRating(e.target.value)}
                    className="px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#00a3e0] min-w-[125px]"
                    title="Chọn từ số sao"
                  >
                    <option value="all">Từ: 1 Sao ★</option>
                    <option value="1">Từ 1 Sao ★</option>
                    <option value="2">Từ 2 Sao ★</option>
                    <option value="3">Từ 3 Sao ★</option>
                    <option value="4">Từ 4 Sao ★</option>
                    <option value="5">Từ 5 Sao ★</option>
                  </select>

                  {/* Max rating filter */}
                  <select
                    value={webMaxRating}
                    onChange={(e) => setWebMaxRating(e.target.value)}
                    className="px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#00a3e0] min-w-[125px]"
                    title="Chọn đến số sao"
                  >
                    <option value="all">Đến: 5 Sao ★</option>
                    <option value="5">Đến 5 Sao ★</option>
                    <option value="4">Đến 4 Sao ★</option>
                    <option value="3">Đến 3 Sao ★</option>
                    <option value="2">Đến 2 Sao ★</option>
                    <option value="1">Đến 1 Sao ★</option>
                  </select>

                  {/* Date filter (Chọn ngày) */}
                  <div className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 min-w-[160px]">
                    <span className="text-slate-400 text-xs shrink-0 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-[#00a3e0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      Ngày:
                    </span>
                    <input
                      type="date"
                      value={webDate}
                      onChange={(e) => setWebDate(e.target.value)}
                      className="bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none text-xs sm:text-sm cursor-pointer w-full"
                      title="Chọn ngày đánh giá"
                    />
                    {webDate && (
                      <button
                        type="button"
                        onClick={() => setWebDate("")}
                        className="text-slate-400 hover:text-rose-500 text-xs font-bold px-1 transition-colors cursor-pointer"
                        title="Bỏ chọn ngày"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Reply Status Filter */}
                  <select
                    value={webReplyFilter}
                    onChange={(e) => setWebReplyFilter(e.target.value)}
                    className="px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#00a3e0] min-w-[140px]"
                  >
                    <option value="all">Tất cả đánh giá</option>
                    <option value="replied">Đã phản hồi</option>
                    <option value="unreplied">Chưa phản hồi</option>
                  </select>

                  {/* Reset */}
                  <button
                    type="button"
                    onClick={() => {
                      setWebQuery("");
                      setWebMinRating("all");
                      setWebMaxRating("all");
                      setWebDate("");
                      setWebReplyFilter("all");
                      fetchWebsiteReviews();
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

              {/* LIST HEADING */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Danh sách đánh giá trang web từ người dùng</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#00a3e0] border border-sky-200 dark:border-sky-800">
                    Phản hồi trực tiếp
                  </span>
                </h2>
                <span>{visibleWebsiteReviews.length} mục hiển thị</span>
              </div>

              {/* WEBSITE REVIEWS LIST */}
              <section className="space-y-4">
                {loadingWebReviews ? (
                  <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse">
                    đang tải dữ liệu đánh giá trang web...
                  </div>
                ) : visibleWebsiteReviews.length ? (
                  visibleWebsiteReviews.map((review) => (
                    <WebsiteReviewAdminCard
                      key={review.id}
                      review={review}
                      onViewDetail={setDetailModalReview}
                      onPreviewMedia={setPreviewMedia}
                    />
                  ))
                ) : (
                  <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800">
                    Không tìm thấy đánh giá trang web nào phù hợp với bộ lọc.
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: PLACE REVIEWS (KIỂM DUYỆT đỊA đIỂM)                                 */}
          {/* ========================================================================= */}
          {activeTab === "places" && (
            <div className="space-y-6">
              {/* Summary KPI Cards for Place Reviews */}
              <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" aria-label="Tổng quan đánh giá địa điểm">
                <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                      Tổng đánh giá địa điểm
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-[#00a3e0] flex items-center justify-center">
                      <span className="text-lg">💬</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline space-x-2">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{placeReviews.length}</span>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                      ★ {placeReviews.length > 0 ? (placeReviews.reduce((acc, r) => acc + (r.rating || 0), 0) / placeReviews.length).toFixed(1) : "5.0"} / 5.0
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center space-x-1">
                    <span className="text-[#00a3e0]">✓</span>
                    <span>Dữ liệu thời gian thực từ CSDL</span>
                  </p>
                </div>

                <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                      đánh giá cần chú ý
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
                      {placeReviews.length > 0 ? Math.round((placeReviews.filter((r) => r.rating >= 4).length / placeReviews.length) * 100) : 100}%
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

              {/* Filter Bar & Search for Place Reviews */}
              <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="flex flex-1 flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[220px]">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={placeQuery}
                      onChange={(e) => setPlaceQuery(e.target.value)}
                      placeholder="Tìm theo tên, địa điểm hoặc từ khóa review..."
                      className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#00a3e0]"
                    />
                  </div>

                  <select
                    value={placeStatus}
                    onChange={(e) => setPlaceStatus(e.target.value)}
                    className="px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#00a3e0] min-w-[150px]"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="approved">Đã duyệt / Công khai</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="flagged">Báo cáo khẩn</option>
                  </select>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPlaceQuickFilter("all")}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${placeQuickFilter === "all"
                          ? "bg-[#00a3e0] text-white shadow-sm"
                          : "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                    >
                      Tất cả ({placeReviews.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlaceQuickFilter("verified")}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${placeQuickFilter === "verified"
                          ? "bg-[#00a3e0] text-white shadow-sm"
                          : "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                    >
                      đã xác thực
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlaceQuickFilter("flagged")}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${placeQuickFilter === "flagged"
                          ? "bg-red-500 text-white shadow-sm"
                          : "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                    >
                      Cần chú ý ({pendingCount})
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPlaceQuery("");
                      setPlaceStatus("all");
                      setPlaceQuickFilter("all");
                      fetchPlaceReviews();
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

              {/* Bulk Actions Toolbar for Place Reviews */}
              <div className="bg-white dark:bg-[#0f172a] p-3.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={visiblePlaceReviews.length > 0 && selectedPlaceReviews.length === visiblePlaceReviews.length}
                    onChange={toggleSelectAllPlaceReviews}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-[#00a3e0] focus:ring-[#00a3e0] cursor-pointer"
                  />
                  <span>Chọn tất cả trên trang</span>
                </label>
                <div className="flex items-center gap-3">
                  <span>
                    đã chọn: <strong className="text-slate-900 dark:text-white">{selectedPlaceReviews.length}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => bulkUpdatePlaceReviews("approved")}
                    className="px-3 py-1.5 bg-[#00a3e0] hover:bg-[#008ec4] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    Duyệt đã chọn
                  </button>
                  <button
                    type="button"
                    onClick={() => bulkUpdatePlaceReviews("hidden")}
                    className="px-3 py-1.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 hover:bg-red-100 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    Ẩn / Xóa hàng loạt
                  </button>
                </div>
              </div>

              {/* List Heading for Place Reviews */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Danh sách đánh giá địa điểm thực tế
                </h2>
                <span>{visiblePlaceReviews.length} mục hiển thị</span>
              </div>

              {/* Place Reviews List */}
              <section className="space-y-4">
                {loadingPlaceReviews ? (
                  <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse">
                    đang tải dữ liệu đánh giá địa điểm từ CSDL...
                  </div>
                ) : visiblePlaceReviews.length ? (
                  visiblePlaceReviews.map((review) => (
                    <PlaceReviewCard
                      key={review.id}
                      review={review}
                      selected={selectedPlaceReviews.includes(review.id)}
                      onSelect={(id) =>
                        setSelectedPlaceReviews((current) =>
                          current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
                        )
                      }
                      onAction={updatePlaceReview}
                    />
                  ))
                ) : (
                  <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800">
                    Không có review địa điểm phù hợp với bộ lọc hiện tại.
                  </div>
                )}
              </section>
            </div>
          )}
        </main>
      </div>

      {/* Website Review & Reply Detail Modal */}
      {detailModalReview && (
        <WebsiteReviewDetailModal
          review={detailModalReview}
          onClose={() => setDetailModalReview(null)}
          onReplySuccess={handleReplySuccess}
          onReplyDeleted={handleReplyDeleted}
        />
      )}

      {/* Direct Media Preview Modal (from Card Thumbnail) */}
      {previewMedia && (
        <MediaViewerModal
          media={previewMedia}
          onClose={() => setPreviewMedia(null)}
        />
      )}
    </div>
  );
}
