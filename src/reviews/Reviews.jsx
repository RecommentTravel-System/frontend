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
        {title || 'Báº¡n chÆ°a cÃ³ bÃ i Ä‘Ã¡nh giÃ¡ nÃ o.'}
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">
      </p>
      {onWriteReview && (
        <button
          type="button"
          onClick={onWriteReview}
          className="px-5 py-2.5 bg-[#00a3e0] hover:bg-[#008ec4] text-white font-bold rounded-xl text-sm transition-all shadow-sm cursor-pointer"
        >
          + Gá»­i Ä‘Ã¡nh giÃ¡ ngay
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
      setError('Vui lÃ²ng nháº­p Ã­t nháº¥t má»™t cáº£m nháº­n.');
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
          <h2 id="review-editor-title">Chá»‰nh sá»­a bÃ i Ä‘Ã¡nh giÃ¡</h2>
          <button type="button" onClick={() => dialog.current.close()} aria-label="ÄÃ³ng">
            Ã—
          </button>
        </div>
        <p className="review-editor-hotel">{review.hotel}</p>
        <label>
          Ä‘iá»ƒm Ä‘Ã¡nh giÃ¡
          <select value={score} onChange={(event) => setScore(event.target.value)}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
              <option key={value} value={value}>
                {value} / 10 â€” {scoreLabel(value)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Ä‘iá»u báº¡n thÃ­ch
          <textarea rows={3} maxLength={2000} value={positive} onChange={(event) => setPositive(event.target.value)} />
        </label>
        <label>
          Ä‘iá»u cáº§n cáº£i thiá»‡n
          <textarea rows={3} maxLength={2000} value={negative} onChange={(event) => setNegative(event.target.value)} />
        </label>
        <p className="review-editor-note">Báº£n chá»‰nh sá»­a Ä‘Æ°á»£c lÆ°u trÃªn trÃ¬nh duyá»‡t vá»›i tráº¡ng thÃ¡i chá» duyá»‡t minh há»a.</p>
        <p className="review-editor-error" role="alert">
          {error}
        </p>
        <div className="review-editor-actions">
          <button type="button" onClick={() => dialog.current.close()}>
            Há»§y
          </button>
          <button type="submit">LÆ°u thay Ä‘á»•i</button>
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
    <article className="review-card shadow-xs border border-slate-100 dark:border-slate-800" aria-label={`ÄÃ¡nh giÃ¡ ${review.hotel}`}>
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
            <summary aria-label={`TÃ¹y chá»n Ä‘Ã¡nh giÃ¡ ${review.hotel}`}>â‹®</summary>
            <div>
              <button
                type="button"
                onClick={() => {
                  menu.current.open = false;
                  onEdit(review);
                }}
              >
                Chá»‰nh sá»­a
              </button>
              <button
                type="button"
                onClick={() => {
                  menu.current.open = false;
                  onDelete(review);
                }}
              >
                XÃ³a bÃ i Ä‘Ã¡nh giÃ¡
              </button>
            </div>
          </details>
        </div>
        <h2>
          Ä‘Ã¡nh giÃ¡ cho{' '}
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
            {review.helpful} ngÆ°á»i tháº¥y Ä‘Ã¡nh giÃ¡ nÃ y há»¯u Ã­ch
          </p>
        )}
        {review.response && (
          <section className="review-response">
            <h3>
              <Icon name="review" width="16" height="16" />
              Pháº£n há»“i tá»« ban quáº£n lÃ½
            </h3>
            <p>{review.response}</p>
          </section>
        )}
      </div>
    </article>
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
          title="ÄÃ³ng"
        >
          âœ•
        </button>

        {isVideo ? (
          <div className="w-full flex flex-col items-center space-y-3">
            <div className="relative w-full max-h-[72vh] flex items-center justify-center bg-black/60 rounded-2xl overflow-hidden border border-slate-800">
              {loading && !error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-2 bg-black/40 z-10 pointer-events-none">
                  <div className="w-8 h-8 border-[3px] border-sky-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-sky-200">Äang náº¡p video...</span>
                </div>
              )}
              {error ? (
                <div className="p-8 text-center space-y-3 max-w-md">
                  <div className="text-3xl">âš ï¸</div>
                  <p className="text-sm text-amber-300 font-bold">
                    KhÃ´ng thá»ƒ phÃ¡t trá»±c tiáº¿p tá»‡p video nÃ y trong khung xem nhanh.
                  </p>
                  <p className="text-xs text-slate-400">
                    Báº¡n cÃ³ thá»ƒ má»Ÿ trá»±c tiáº¿p trong tab má»›i hoáº·c chá»n tá»‡p video tá»« mÃ¡y tÃ­nh Ä‘á»ƒ phÃ¡t.
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
                  TrÃ¬nh duyá»‡t cá»§a báº¡n khÃ´ng há»— trá»£ phÃ¡t video nÃ y.
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
                <span>â†— Má»Ÿ tab má»›i</span>
              </a>
              <a
                href={url}
                download="wayvee-feedback-video.mp4"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors shadow-sm cursor-pointer"
              >
                <span>â¬‡ Táº£i video</span>
              </a>
              <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors cursor-pointer">
                <span>ðŸ“ Chá»n video tá»« mÃ¡y</span>
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
              alt="Chi tiáº¿t Ä‘Ã­nh kÃ¨m"
              className="max-w-full max-h-[78vh] object-contain rounded-2xl shadow-2xl"
            />
            <div className="pt-2">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs transition-colors"
              >
                <span>â†— Xem áº£nh kÃ­ch thÆ°á»›c gá»‘c</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function WebsiteReviewCard({ item }) {
  const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Vá»«a xong';
  const name = item.anonymous ? 'Báº¡n (ÄÃ¡nh giÃ¡ áº©n danh)' : (item.userFullName || 'ÄÃ¡nh giÃ¡ cá»§a báº¡n');
  const initial = item.anonymous ? '?' : (name.slice(0, 2).toUpperCase() || 'WV');
  const [selectedMedia, setSelectedMedia] = useState(null);

  const mediaList = Array.isArray(item.mediaUrls) ? item.mediaUrls : [];

  return (
    <article className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-950/60 text-[#00a3e0] font-bold text-sm flex items-center justify-center border border-sky-200 dark:border-sky-800 shrink-0">
            {initial}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{name}</h3>
              {item.anonymous ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                  áº¨n danh
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 dark:bg-sky-950/60 text-[#00a3e0] border border-sky-200 dark:border-sky-900">
                  ÄÃ¡nh giÃ¡ cá»§a báº¡n
                </span>
              )}
              {item.adminReply && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <span>âœ“</span> ÄÃ£ cÃ³ pháº£n há»“i tá»« Admin
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">{dateStr}</p>
          </div>
        </div>

        {/* Rating stars */}
        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 px-2.5 py-1 rounded-full text-xs font-bold text-amber-500">
          <span>â˜…</span>
          <span className="text-slate-800 dark:text-slate-100 font-extrabold">{Number(item.rating || 5).toFixed(1)}</span>
        </div>
      </div>

      {/* Category badge */}
      {item.category && (
        <div className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          Chá»§ Ä‘á»: {item.category}
        </div>
      )}

      {/* Comment quote */}
      <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 leading-relaxed italic">
        â€œ{item.comment}â€
      </p>

      {/* Attached Media Gallery (Images & Videos) */}
      {mediaList.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span>ðŸ“Ž</span> Tá»‡p Ä‘Ã­nh kÃ¨m ({mediaList.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
            {mediaList.map((url, idx) => {
              const isVideo = url.endsWith('.mp4') || url.endsWith('.webm') || url.includes('/video/');
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedMedia({ url, isVideo })}
                  className="relative group rounded-xl overflow-hidden aspect-video bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-[#00a3e0] transition-colors"
                >
                  {isVideo ? (
                    <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
                      <video src={url} className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center text-sm shadow-md">
                          â–¶
                        </span>
                      </div>
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/70 text-white">
                        VIDEO
                      </span>
                    </div>
                  ) : (
                    <img
                      src={url}
                      alt={`ÄÃ­nh kÃ¨m ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Admin Reply Section */}
      {item.adminReply && (
        <div className="mt-3 p-4 bg-gradient-to-r from-sky-50/80 to-blue-50/60 dark:from-sky-950/40 dark:to-blue-950/30 border border-sky-200 dark:border-sky-900/60 rounded-2xl space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-bold text-[#002d54] dark:text-sky-300">
            <span className="flex items-center gap-1.5">
              <span className="text-sm">ðŸ›¡ï¸</span>
              <span>Pháº£n há»“i tá»« {item.repliedBy || 'Ban Quáº£n Trá»‹ WAYVEE'}</span>
            </span>
            {item.repliedAt && (
              <span className="text-[11px] text-slate-400 font-normal">
                {new Date(item.repliedAt).toLocaleString('vi-VN')}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-sky-100 dark:border-sky-900/40">
            {item.adminReply}
          </p>
        </div>
      )}

      {/* Media Lightbox Modal */}
      {selectedMedia && (
        <MediaViewerModal
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
        />
      )}
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
      return { reviews: [], error: 'KhÃ´ng thá»ƒ Ä‘á»c bÃ i Ä‘Ã¡nh giÃ¡ Ä‘Ã£ lÆ°u. Vui lÃ²ng kiá»ƒm tra quyá»n lÆ°u trá»¯ cá»§a trÃ¬nh duyá»‡t.' };
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
      return 'KhÃ´ng thá»ƒ lÆ°u thay Ä‘á»•i. Vui lÃ²ng kiá»ƒm tra quyá»n lÆ°u trá»¯ cá»§a trÃ¬nh duyá»‡t.';
    }
  }

  function savePlaceReview(review) {
    const error = persistPlaceReviews(placeReviews.map((item) => (item.id === review.id ? review : item)));
    if (!error) setNotice('ÄÃ£ lÆ°u báº£n chá»‰nh sá»­a trÃªn trÃ¬nh duyá»‡t.');
    return error;
  }

  function removePlaceReview(review) {
    if (!window.confirm(`XÃ³a bÃ i Ä‘Ã¡nh giÃ¡ vá» ${review.hotel}?`)) return;
    setNotice(persistPlaceReviews(placeReviews.filter((item) => item.id !== review.id)) || 'ÄÃ£ xÃ³a bÃ i Ä‘Ã¡nh giÃ¡.');
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
    setNotice('Gá»­i Ä‘Ã¡nh giÃ¡ trang web thÃ nh cÃ´ng! Cáº£m Æ¡n báº¡n Ä‘Ã£ Ä‘Ã³ng gÃ³p Ã½ kiáº¿n.');
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
                Trung tÃ¢m Ä‘Ã¡nh giÃ¡ &amp; GÃ³p Ã½
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Theo dÃµi cÃ¡c nháº­n xÃ©t cá»§a báº¡n vÃ  chia sáº» Ä‘Ã¡nh giÃ¡ tráº£i nghiá»‡m há»‡ thá»‘ng WAYVEE
              </p>
            </div>

            {/* Main Action Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2.5 bg-[#00a3e0] hover:bg-[#008ec4] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="text-base leading-none">â˜…</span>
                <span>Gá»­i Ä‘Ã¡nh giÃ¡ trang web</span>
              </button>
            </div>
          </div>

          {/* Feedback notice toast */}
          {notice && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-medium flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span>âœ“</span>
                <span>{notice}</span>
              </div>
              <button type="button" onClick={() => setNotice('')} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                âœ•
              </button>
            </div>
          )}

          {/* Tabs Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('website')}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${activeTab === 'website'
                ? 'text-[#00a3e0] border-b-2 border-[#00a3e0]'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
            >
              ÄÃ¡nh giÃ¡ cá»§a báº¡n ({websiteReviews.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('places')}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${activeTab === 'places'
                ? 'text-[#00a3e0] border-b-2 border-[#00a3e0]'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
            >
              Ä‘Ã¡nh giÃ¡ Ä‘á»‹a Ä‘iá»ƒm ({placeReviews.length})
            </button>
          </div>

          {/* TAB 1: WEBSITE REVIEWS */}
          {activeTab === 'website' && (
            <div className="space-y-4">
              {/* Callout Card */}
              <div className="bg-gradient-to-r from-sky-50 to-indigo-50/50 dark:from-slate-900 dark:to-sky-950/30 p-5 rounded-2xl border border-sky-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-sm font-bold text-[#002d54] dark:text-sky-300 flex items-center gap-1.5">
                    <span>ðŸ’¬</span>
                    <span>Báº¡n Ä‘Ã¡nh giÃ¡ tháº¿ nÃ o vá» trang web WAYVEE?</span>
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Má»—i gÃ³p Ã½ cá»§a báº¡n Ä‘á»u Ä‘Æ°á»£c gá»­i trá»±c tiáº¿p Ä‘áº¿n Ban Quáº£n Trá»‹. Báº¡n luÃ´n cÃ³ thá»ƒ xem láº¡i nhá»¯ng pháº£n há»“i cá»§a chÃ­nh mÃ¬nh táº¡i Ä‘Ã¢y.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-[#00a3e0] border border-sky-200 dark:border-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer shrink-0 shadow-2xs"
                >
                  Gá»­i Ä‘Ã¡nh giÃ¡ trang web
                </button>
              </div>

              {/* Reviews List */}
              {loadingWebsiteReviews ? (
                <div className="p-12 text-center text-slate-400 text-sm bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse">
                  Ä‘ang táº£i danh sÃ¡ch Ä‘Ã¡nh giÃ¡ cá»§a báº¡n...
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
                  title="Báº¡n chÆ°a gá»­i Ä‘Ã¡nh giÃ¡ trang web nÃ o."
                />
              )}
            </div>
          )}

          {/* TAB 2: PLACE REVIEWS */}
          {activeTab === 'places' && (
            <div>
              {placeReviews.length ? (
                <>
                  <h2 className="reviews-sr-only">BÃ i Ä‘Ã¡nh giÃ¡ cá»§a báº¡n</h2>
                  <div className="reviews-list">
                    {placeReviews.map((review) => (
                      <ReviewCard key={review.id} review={review} onEdit={setEditing} onDelete={removePlaceReview} />
                    ))}
                  </div>
                  <p className="reviews-demo-note">BÃ i Ä‘Ã¡nh giÃ¡, tráº¡ng thÃ¡i duyá»‡t, lÆ°á»£t há»¯u Ã­ch vÃ  pháº£n há»“i minh há»a.</p>
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

