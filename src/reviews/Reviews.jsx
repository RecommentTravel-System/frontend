import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/useAuth.js';
import AccountSidebar from '../components/AccountSidebar.jsx';
import SiteHeader from '../components/SiteHeader.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import Icon from '../components/AccountIcon.jsx';
import { readReviews, reviewsKey, reviewStatuses, scoreLabel } from './reviewsData.js';
import './Reviews.css';

function Face({ unhappy = false }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M8 9h1m6 0h1" strokeLinecap="round" /><path d={unhappy ? 'M8 16q4-5 8 0' : 'M8 14q4 5 8 0'} strokeLinecap="round" /></svg>;
}

function ReviewPhoto({ review }) {
  const [failed, setFailed] = useState(false);
  return <div className="review-photo">{failed ? <Icon name="review" width="32" height="32" /> : <img src={review.image} alt={review.hotel} loading="lazy" onError={() => setFailed(true)} />}</div>;
}

function EmptyReviews() {
  return <section className="reviews-empty" aria-labelledby="reviews-empty-title">
    <svg className="reviews-empty-art" width="140" height="130" viewBox="0 0 140 130" fill="none" aria-hidden="true"><path d="M72 24c-30-5-51 14-51 39 0 10 3 18 9 25l-10 21 27-10c30 8 56-8 59-34" stroke="#535b68" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" /><path d="M46 52h27M46 69h19" stroke="#535b68" strokeWidth="7" strokeLinecap="round" /><path d="m94 17 7 15 17 2-12 12 3 17-15-8-16 8 3-17-12-12 17-2Z" stroke="#97a3b6" strokeWidth="5" strokeLinejoin="round" /></svg>
    <h1 id="reviews-empty-title">Bạn chưa có bài đánh giá nào.</h1><p>Sau khi trải nghiệm địa điểm, bạn có thể chia sẻ cảm nhận tại đây</p>
  </section>;
}

function ReviewEditor({ review, onSave, onClose }) {
  const dialog = useRef(null);
  const [score, setScore] = useState(review.score);
  const [positive, setPositive] = useState(review.positive);
  const [negative, setNegative] = useState(review.negative);
  const [error, setError] = useState('');
  useEffect(() => { if (!dialog.current.open) dialog.current.showModal(); }, []);
  function submit(event) {
    event.preventDefault();
    if (!positive.trim() && !negative.trim()) { setError('Vui lòng nhập ít nhất một cảm nhận.'); return; }
    const failure = onSave({ ...review, score: Number(score), positive: positive.trim(), negative: negative.trim(), status: 'pending', helpful: 0, response: '' });
    if (failure) setError(failure);
    else dialog.current.close();
  }
  return <dialog ref={dialog} className="review-editor" onClose={onClose} aria-labelledby="review-editor-title"><form onSubmit={submit}><div className="review-editor-heading"><h2 id="review-editor-title">Chỉnh sửa bài đánh giá</h2><button type="button" onClick={() => dialog.current.close()} aria-label="Đóng">×</button></div><p className="review-editor-hotel">{review.hotel}</p>
    <label>Điểm đánh giá<select value={score} onChange={event => setScore(event.target.value)}>{Array.from({ length: 10 }, (_, i) => i + 1).map(value => <option key={value} value={value}>{value} / 10 — {scoreLabel(value)}</option>)}</select></label>
    <label>Điều bạn thích<textarea rows={3} maxLength={2000} value={positive} onChange={event => setPositive(event.target.value)} /></label><label>Điều cần cải thiện<textarea rows={3} maxLength={2000} value={negative} onChange={event => setNegative(event.target.value)} /></label>
    <p className="review-editor-note">Bản chỉnh sửa được lưu trên trình duyệt với trạng thái chờ duyệt minh họa.</p><p className="review-editor-error" role="alert">{error}</p><div className="review-editor-actions"><button type="button" onClick={() => dialog.current.close()}>Hủy</button><button type="submit">Lưu thay đổi</button></div>
  </form></dialog>;
}

function ReviewCard({ review, onEdit, onDelete }) {
  const status = reviewStatuses[review.status];
  const menu = useRef(null);
  const date = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${review.date}T00:00:00Z`));
  return <article className="review-card" aria-label={`Đánh giá ${review.hotel}`}><ReviewPhoto review={review} /><div className="review-body">
    <div className="review-card-top"><span className={`review-status review-status-${status.className}`}>{status.label}</span><details ref={menu} className="review-menu" onKeyDown={event => { if (event.key === 'Escape') { menu.current.open = false; menu.current.querySelector('summary').focus(); } }}><summary aria-label={`Tùy chọn đánh giá ${review.hotel}`}>⋮</summary><div><button type="button" onClick={() => { menu.current.open = false; onEdit(review); }}>Chỉnh sửa</button><button type="button" onClick={() => { menu.current.open = false; onDelete(review); }}>Xóa bài đánh giá</button></div></details></div>
    <h2>You reviewed <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(review.hotel)}`} target="_blank" rel="noreferrer">{review.hotel}</a></h2>
    <time dateTime={review.date}>{date}</time><p className="review-rating"><strong>{review.score.toFixed(1)}</strong><span>{scoreLabel(review.score)}</span></p>
    {review.positive && <p className="review-comment review-positive"><Face /><span>{review.positive}</span></p>}
    {review.negative && <p className="review-comment review-negative"><Face unhappy /><span>{review.negative}</span></p>}
    {review.helpful > 0 && <p className="review-helpful"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2 10h4v12H2Zm6 12V10l5-8c2 0 3 2 2 5l-1 3h6c2 0 2 2 2 3l-2 7c0 1-1 2-3 2Z" /></svg>{review.helpful} people found this review helpful</p>}
    {review.response && <section className="review-response"><h3><Icon name="review" width="16" height="16" />Property response</h3><p>{review.response}</p></section>}
  </div></article>;
}

export default function Reviews() {
  const { user } = useAuth();
  const [initial] = useState(() => { try { return { reviews: readReviews(user.email), error: '' }; } catch { return { reviews: [], error: 'Không thể đọc bài đánh giá đã lưu. Vui lòng kiểm tra quyền lưu trữ của trình duyệt.' }; } });
  const [reviews, setReviews] = useState(initial.reviews);
  const [notice, setNotice] = useState(initial.error);
  const [editing, setEditing] = useState(null);
  function persist(next) {
    try { localStorage.setItem(reviewsKey(user.email), JSON.stringify(next)); setReviews(next); return ''; }
    catch { return 'Không thể lưu thay đổi. Vui lòng kiểm tra quyền lưu trữ của trình duyệt.'; }
  }
  function save(review) {
    const error = persist(reviews.map(item => item.id === review.id ? review : item));
    if (!error) setNotice('Đã lưu bản chỉnh sửa trên trình duyệt.');
    return error;
  }
  function remove(review) {
    if (!window.confirm(`Xóa bài đánh giá về ${review.hotel}?`)) return;
    setNotice(persist(reviews.filter(item => item.id !== review.id)) || 'Đã xóa bài đánh giá.');
  }
  return <div className="reviews-page"><SiteHeader /><main className="account-layout reviews-layout"><AccountSidebar onNotice={setNotice} /><div className="reviews-content">{reviews.length ? <><h1 className="reviews-sr-only">Bài đánh giá của bạn</h1><div className="reviews-list">{reviews.map(review => <ReviewCard key={review.id} review={review} onEdit={setEditing} onDelete={remove} />)}</div><p className="reviews-demo-note">Bài đánh giá, trạng thái duyệt, lượt hữu ích và phản hồi minh họa.</p></> : <EmptyReviews />}{notice && <p className="reviews-notice" role="status">{notice}</p>}</div></main><SiteFooter />{editing && <ReviewEditor review={editing} onSave={save} onClose={() => setEditing(null)} />}</div>;
}
