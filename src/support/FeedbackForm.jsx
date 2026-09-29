import { useEffect, useRef, useState } from 'react';
import { submitFeedback } from './feedbackService.js';

export default function FeedbackForm({ user, draft, onDraftChange, onClose }) {
  const dialog = useRef(null);
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const update = (key, value) => { onDraftChange({ ...draft, [key]: value }); setError(''); };
  useEffect(() => { if (!dialog.current.open) dialog.current.showModal(); }, []);
  async function submit(event) {
    event.preventDefault();
    if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try { await submitFeedback(user?.email, draft); setSaved(true); onDraftChange({ rating: 0, comment: '', email: '' }); }
    catch (failure) { setError(failure.message || 'Không thể lưu phản hồi. Vui lòng thử lại.'); }
    finally { pending.current = false; setBusy(false); }
  }
  return <dialog ref={dialog} className="feedback-dialog" aria-labelledby="feedback-title" onClose={onClose} onCancel={event => { if (pending.current) event.preventDefault(); }}>
    {saved ? <div className="feedback-success"><h2 id="feedback-title">Cảm ơn bạn đã chia sẻ!</h2><p role="status">Phản hồi đã được lưu trên trình duyệt để test, chưa gửi đến đội ngũ Wayvee.</p><button type="button" className="support-primary" onClick={() => dialog.current.close()}>Đóng</button></div> : <form onSubmit={submit}>
      <fieldset className="feedback-rating" disabled={busy}><legend id="feedback-title">Bạn có sẵn sàng giới thiệu Wayvee cho bạn bè hoặc người thân không?</legend><div className="feedback-rating-options">{[1, 2, 3, 4, 5].map(rating => <label key={rating}><input type="radio" name="recommendation" value={rating} checked={draft.rating === rating} onChange={() => update('rating', rating)} aria-label={`${rating} trên 5 điểm`} required /><span>{rating}</span></label>)}</div></fieldset>
      <label className="feedback-comment-label" htmlFor="feedback-comment">Bạn có góp ý hoặc trải nghiệm muốn chia sẻ không?</label><textarea id="feedback-comment" value={draft.comment} onChange={event => update('comment', event.target.value)} placeholder="Nhập ý kiến của bạn tại đây..." maxLength={3000} disabled={busy} />
      <label className="feedback-email-label" htmlFor="feedback-email">Email liên hệ <small>(không bắt buộc)</small></label><p className="feedback-email-help" id="feedback-email-help">Chúng tôi sẽ sử dụng email này để phản hồi nếu cần. Không sử dụng cho mục đích khác.</p><input id="feedback-email" type="email" value={draft.email} onChange={event => update('email', event.target.value)} placeholder="Email của bạn" autoComplete="email" maxLength={254} aria-describedby="feedback-email-help" disabled={busy} />
      <p className="feedback-demo-note">Bản thử nghiệm: phản hồi chỉ lưu trên trình duyệt.</p><p className="support-error" role="alert">{error}</p><div className="feedback-actions"><button type="button" className="support-outline" disabled={busy} onClick={() => dialog.current.close()}>Để sau</button><button type="submit" className="support-primary" disabled={busy}>{busy ? 'Đang lưu…' : 'Gửi phản hồi'}</button></div>
    </form>}
  </dialog>;
}
