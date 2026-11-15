import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';
import AccountSidebar from '../components/AccountSidebar.jsx';
import { AppHeader, AppFooter } from '~/shared/components';
import Icon from '../components/AccountIcon.jsx';
import { readReviews, reviewsKey, reviewStatuses, scoreLabel } from './reviewsData.js';
import { getMyWebsiteReviews } from '~/shared/services/website-review-api.js';
import WebsiteReviewModal from './WebsiteReviewModal.jsx';
import './Reviews.css';

function Face({ unhappy = false }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 9h1m6 0h1" strokeLinecap="round" />
      <path d={unhappy ? 'M8 16q4-5 8 0' : 'M8 14q4 5 8 0'} strokeLinecap="round" />
    </svg>
  );
}

function ReviewPhoto({ review }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="review-photo">
      {failed ? (
        <Icon name="review" width="32" height="32" />
      ) : (
        <img src={review.image} alt={review.hotel} loading="lazy" onError={() => setFailed(true)} />
      )}
    </div>
  );
}

function EmptyReviews({ onWriteReview, title, subtitle }) {
  return (
    <section className="reviews-empty" aria-labelledby="reviews-empty-title">
      <svg className="reviews-empty-art" width="140" height="130" viewBox="0 0 140 130" fill="none" aria-hidden="true">
        <path d="M72 24c-30-5-51 14-51 39 0 10 3 18 9 25l-10 21 27-10c30 8 56-8 59-34" stroke="#535b68" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M46 52h27M46 69h19" stroke="#535b68" strokeWidth="7" strokeLinecap="round" />
        <path d="m94 17 7 15 17 2-12 12 3 17-15-8-16 8 3-17-12-12 17-2Z" stroke="#97a3b6" strokeWidth="5" strokeLinejoin="round" />
      </svg>
      <h2 id="reviews-empty-title" className="text-base font-bold text-slate-700 dark:text-slate-200">
        {title || 'Bạn chưa có bài đánh giá nào.'}
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">
        {subtitle || 'Hãy chia sẻ cảm nhận của bạn để giúp hệ thống và cộng đồng du lịch ngày càng tốt hơn!'}
      </p>
      {onWriteReview && (
        <button
          type="button"
          onClick={onWriteReview}
          className="px-5 py-2.5 bg-[#00a3e0] hover:bg-[#008ec4] text-white font-bold rounded-xl text-sm transition-all shadow-sm cursor-pointer"
        >
          + Gửi đánh giá ngay
        </button>
      )}
    </section>
  );
}

function ReviewEditor({ review, onSave, onClose }) {
  const dialog = useRef(null);
  const [score, setScore] = useState(review.score);
  const [positive, setPositive] = useState(review.positive);
  const [negative, setNegative] = useState(review.negative);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!dialog.current.open) dialog.current.showModal();
  }, []);
  function submit(event) {
    event.preventDefault();
    if (!positive.trim() && !negative.trim()) {
      setError('Vui lòng nhập ít nhất một cảm nhận.');
      return;
    }
    const failure = onSave({
      ...review,
      score: Number(score),
      positive: positive.trim(),
      negative: negative.trim(),
      status: 'pending',
      helpful: 0,
      response: ''
    });
    if (failure) setError(failure);
    else dialog.current.close();
  }
  return (
    <dialog ref={dialog} className="review-editor" onClose={onClose} aria-labelledby="review-editor-title">
      <form onSubmit={submit}>
        <div className="review-editor-heading">
          <h2 id="review-editor-title">Chỉnh sửa bài đánh giá</h2>
          <button type="button" onClick={() => dialog.current.close()} aria-label="Đóng">
            ×
          </button>
        </div>
        <p className="review-editor-hotel">{review.hotel}</p>
        <label>
          điểm đánh giá
          <select value={score} onChange={(event) => setScore(event.target.value)}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
              <option key={value} value={value}>
                {value} / 10 — {scoreLabel(value)}
              </option>
            ))}
          </select>
        </label>
        <label>
          điều bạn thích
          <textarea rows={3} maxLength={2000} value={positive} onChange={(event) => setPositive(event.target.value)} />
        </label>
        <label>
          điều cần cải thiện
          <textarea rows={3} maxLength={2000} value={negative} onChange={(event) => setNegative(event.target.value)} />
        </label>
        <p className="review-editor-note">Bản chỉnh sửa được lưu trên trình duyệt với trạng thái chờ duyệt minh họa.</p>
        <p className="review-editor-error" role="alert">
          {error}
        </p>
        <div className="review-editor-actions">
          <button type="button" onClick={() => dialog.current.close()}>
            Hủy
          </button>
          <button type="submit">Lưu thay đổi</button>
        </div>
      </form>
    </dialog>
  );
}

function ReviewCard({ review, onEdit, onDelete }) {
  const status = reviewStatuses[review.status] || { label: review.status, className: 'pending' };
  const menu = useRef(null);
  const date = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${review.date}T00:00:00Z`));
  return (
    <article className="review-card shadow-xs border border-slate-100 dark:border-slate-800" aria-label={`Đánh giá ${review.hotel}`}>
      <ReviewPhoto review={review} />
      <div className="review-body">
        <div className="review-card-top">
          <span className={`review-status review-status-${status.className}`}>{status.label}</span>
          <details
            ref={menu}
            className="review-menu"
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                menu.current.open = false;
                menu.current.querySelector('summary').focus();
              }
            }}
          >
            <summary aria-label={`Tùy chọn đánh giá ${review.hotel}`}>⋮</summary>
            <div>
              <button
                type="button"
                onClick={() => {
                  menu.current.open = false;
                  onEdit(review);
                }}
              >
                Chỉnh sửa
              </button>
              <button
                type="button"
                onClick={() => {
                  menu.current.open = false;
                  onDelete(review);
                }}
              >
                Xóa bài đánh giá
              </button>
            </div>
          </details>
        </div>
        <h2>
          đánh giá cho{' '}
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(review.hotel)}`} target="_blank" rel="noreferrer">
            {review.hotel}
          </a>
        </h2>
        <time dateTime={review.date}>{date}</time>
        <p className="review-rating">
          <strong>{review.score.toFixed(1)}</strong>
          <span>{scoreLabel(review.score)}</span>
        </p>
        {review.positive && (
          <p className="review-comment review-positive">
            <Face />
            <span>{review.positive}</span>
          </p>
        )}
        {review.negative && (
          <p className="review-comment review-negative">
            <Face unhappy />
            <span>{review.negative}</span>
          </p>
        )}
        {review.helpful > 0 && (
          <p className="review-helpful">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M2 10h4v12H2Zm6 12V10l5-8c2 0 3 2 2 5l-1 3h6c2 0 2 2 2 3l-2 7c0 1-1 2-3 2Z" />
            </svg>
            {review.helpful} người thấy đánh giá này hữu ích
          </p>
        )}
        {review.response && (
          <section className="review-response">
            <h3>
              <Icon name="review" width="16" height="16" />
              Phản hồi từ ban quản lý
            </h3>
            <p>{review.response}</p>
          </section>
        )}
      </div>
    </article>
  );
}

function WebsiteReviewCard({ item }) {
  const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Vừa xong';
  const name = item.anonymous ? 'Bạn (Đánh giá ẩn danh)' : (item.userFullName || 'Đánh giá của bạn');
  const initial = item.anonymous ? '?' : (name.slice(0, 2).toUpperCase() || 'WV');

  return (
    <article className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-950/60 text-[#00a3e0] font-bold text-sm flex items-center justify-center border border-sky-200 dark:border-sky-800 shrink-0">
            {initial}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{name}</h3>
              {item.anonymous ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                  Ẩn danh
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 dark:bg-sky-950/60 text-[#00a3e0] border border-sky-200 dark:border-sky-900">
                  Đánh giá của bạn
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">{dateStr}</p>
          </div>
        </div>

        {/* Rating stars */}
        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 px-2.5 py-1 rounded-full text-xs font-bold text-amber-500">
          <span>★</span>
          <span className="text-slate-800 dark:text-slate-100 font-extrabold">{Number(item.rating || 5).toFixed(1)}</span>
        </div>
      </div>

      {/* Category badge */}
      {item.category && (
        <div className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          Chủ đề: {item.category}
        </div>
      )}

      {/* Comment quote */}
      <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 leading-relaxed italic">
        “{item.comment}”
      </p>
    </article>
  );
}

export default function Reviews() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'places' ? 'places' : 'website';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get('action') === 'submit' || searchParams.get('view') === 'feedback');

  const [initial] = useState(() => {
    try {
      return { reviews: readReviews(user?.email), error: '' };
    } catch {
      return { reviews: [], error: 'Không thể đọc bài đánh giá đã lưu. Vui lòng kiểm tra quyền lưu trữ của trình duyệt.' };
    }
  });
  const [placeReviews, setPlaceReviews] = useState(initial.reviews);
  const [websiteReviews, setWebsiteReviews] = useState([]);
  const [loadingWebsiteReviews, setLoadingWebsiteReviews] = useState(true);
  const [notice, setNotice] = useState(initial.error);
  const [editing, setEditing] = useState(null);

  const loadWebsiteReviews = useCallback(async () => {
    setLoadingWebsiteReviews(true);
    try {
      const res = await getMyWebsiteReviews();
      setWebsiteReviews(res.data || []);
    } catch (err) {
      console.error('Failed to load user website reviews:', err);
    } finally {
      setLoadingWebsiteReviews(false);
    }
  }, []);

  useEffect(() => {
    loadWebsiteReviews();
  }, [loadWebsiteReviews]);

  useEffect(() => {
    if (searchParams.get('action') === 'submit' || searchParams.get('view') === 'feedback') {
      setIsModalOpen(true);
      setActiveTab('website');
    }
  }, [searchParams]);

  function persistPlaceReviews(next) {
    try {
      localStorage.setItem(reviewsKey(user?.email), JSON.stringify(next));
      setPlaceReviews(next);
      return '';
    } catch {
      return 'Không thể lưu thay đổi. Vui lòng kiểm tra quyền lưu trữ của trình duyệt.';
    }
  }

  function savePlaceReview(review) {
    const error = persistPlaceReviews(placeReviews.map((item) => (item.id === review.id ? review : item)));
    if (!error) setNotice('Đã lưu bản chỉnh sửa trên trình duyệt.');
    return error;
  }

  function removePlaceReview(review) {
    if (!window.confirm(`Xóa bài đánh giá về ${review.hotel}?`)) return;
    setNotice(persistPlaceReviews(placeReviews.filter((item) => item.id !== review.id)) || 'Đã xóa bài đánh giá.');
  }

  const handleModalClose = () => {
    setIsModalOpen(false);
    if (searchParams.get('action') || searchParams.get('view')) {
      const next = new URLSearchParams(searchParams);
      next.delete('action');
      next.delete('view');
      setSearchParams(next, { replace: true });
    }
  };

  const handleReviewSuccess = (newReview) => {
    setNotice('Gửi đánh giá trang web thành công! Cảm ơn bạn đã đóng góp ý kiến.');
    loadWebsiteReviews();
  };

  return (
    <div className="reviews-page">
      <AppHeader />

      <main className="account-layout reviews-layout">
        <AccountSidebar onNotice={setNotice} />

        <div className="reviews-content">
          {/* Top Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#002d54] dark:text-white">
                Trung tâm đánh giá &amp; Góp ý
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Theo dõi các nhận xét của bạn và chia sẻ đánh giá trải nghiệm hệ thống WAYVEE
              </p>
            </div>

            {/* Main Action Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2.5 bg-[#00a3e0] hover:bg-[#008ec4] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="text-base leading-none">★</span>
                <span>Gửi đánh giá trang web</span>
              </button>
            </div>
          </div>

          {/* Feedback notice toast */}
          {notice && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-medium flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>{notice}</span>
              </div>
              <button type="button" onClick={() => setNotice('')} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                ✕
              </button>
            </div>
          )}

          {/* Tabs Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('website')}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
                activeTab === 'website'
                  ? 'text-[#00a3e0] border-b-2 border-[#00a3e0]'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Đánh giá của bạn ({websiteReviews.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('places')}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
                activeTab === 'places'
                  ? 'text-[#00a3e0] border-b-2 border-[#00a3e0]'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              đánh giá địa điểm ({placeReviews.length})
            </button>
          </div>

          {/* TAB 1: WEBSITE REVIEWS */}
          {activeTab === 'website' && (
            <div className="space-y-4">
              {/* Callout Card */}
              <div className="bg-gradient-to-r from-sky-50 to-indigo-50/50 dark:from-slate-900 dark:to-sky-950/30 p-5 rounded-2xl border border-sky-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-sm font-bold text-[#002d54] dark:text-sky-300 flex items-center gap-1.5">
                    <span>💬</span>
                    <span>Bạn đánh giá thế nào về trang web WAYVEE?</span>
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Mỗi góp ý của bạn đều được gửi trực tiếp đến Ban Quản Trị. Bạn luôn có thể xem lại những phản hồi của chính mình tại đây.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-[#00a3e0] border border-sky-200 dark:border-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer shrink-0 shadow-2xs"
                >
                  Gửi đánh giá trang web
                </button>
              </div>

              {/* Reviews List */}
              {loadingWebsiteReviews ? (
                <div className="p-12 text-center text-slate-400 text-sm bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse">
                  đang tải danh sách đánh giá của bạn...
                </div>
              ) : websiteReviews.length ? (
                <div className="space-y-3">
                  {websiteReviews.map((item) => (
                    <WebsiteReviewCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <EmptyReviews
                  onWriteReview={() => setIsModalOpen(true)}
                  title="Bạn chưa gửi đánh giá trang web nào."
                  subtitle="Chỉ bạn mới có thể xem các đánh giá mình đã gửi. Mọi ý kiến đều được Ban Quản Trị tiếp nhận để nâng cấp hệ thống!"
                />
              )}
            </div>
          )}

          {/* TAB 2: PLACE REVIEWS */}
          {activeTab === 'places' && (
            <div>
              {placeReviews.length ? (
                <>
                  <h2 className="reviews-sr-only">Bài đánh giá của bạn</h2>
                  <div className="reviews-list">
                    {placeReviews.map((review) => (
                      <ReviewCard key={review.id} review={review} onEdit={setEditing} onDelete={removePlaceReview} />
                    ))}
                  </div>
                  <p className="reviews-demo-note">Bài đánh giá, trạng thái duyệt, lượt hữu ích và phản hồi minh họa.</p>
                </>
              ) : (
                <EmptyReviews />
              )}
            </div>
          )}
        </div>
      </main>

      <AppFooter />

      {/* Website Review Modal */}
      <WebsiteReviewModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        user={user}
        onSuccess={handleReviewSuccess}
      />

      {/* Place Review Editor Modal */}
      {editing && (
        <ReviewEditor review={editing} onSave={savePlaceReview} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}
