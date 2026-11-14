import { useEffect, useRef, useState } from 'react';
import { submitWebsiteReview } from '~/shared/services/website-review-api.js';

const CATEGORIES = [
  "Trải nghiệm chung",
  "Giao diện & Thiết kế (UI/UX)",
  "Lập kế hoạch & Lịch trình",
  "Tìm kiếm & Khám phá địa điểm",
  "Tốc độ & Hiệu năng hệ thống",
  "Dịch vụ & Hỗ trợ người dùng"
];

export default function FeedbackForm({ user, draft, onDraftChange, onClose }) {
  const dialog = useRef(null);
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [category, setCategory] = useState(draft?.category || "Trải nghiệm chung");

  const update = (key, value) => {
    onDraftChange({ ...draft, [key]: value });
    setError('');
  };

  useEffect(() => {
    if (!dialog.current?.open) dialog.current?.showModal();
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (pending.current) return;
    if (!draft.rating || draft.rating < 1) {
      setError('Vui lòng chọn mức điểm đánh giá từ 1 đến 5 sao.');
      return;
    }
    if (!draft.comment || !draft.comment.trim()) {
      setError('Vui lòng nhập nội dung đánh giá của bạn.');
      return;
    }

    pending.current = true;
    setBusy(true);
    setError('');

    try {
      await submitWebsiteReview({
        rating: draft.rating,
        category: category,
        comment: draft.comment.trim(),
        userFullName: user?.fullName || (draft.email ? draft.email.split('@')[0] : 'Khách tham quan'),
        userEmail: draft.email || user?.email || '',
        anonymous: !draft.email && !user
      });
      setSaved(true);
      onDraftChange({ rating: 0, comment: '', email: '' });
    } catch (failure) {
      setError(failure.message || 'Không thể lưu đánh giá. Vui lòng thử lại.');
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      className="feedback-dialog"
      aria-labelledby="feedback-title"
      onClose={onClose}
      onCancel={(event) => {
        if (pending.current) event.preventDefault();
      }}
    >
      {saved ? (
        <div className="feedback-success">
          <h2 id="feedback-title">Cảm ơn bạn đã gửi đánh giá!</h2>
          <p role="status">
            đánh giá trang web của bạn đã được gửi thành công đến hệ thống WAYVEE. Ý kiến của bạn là động lực để chúng tôi phát triển tốt hơn!
          </p>
          <button type="button" className="support-primary cursor-pointer" onClick={() => dialog.current.close()}>
            đóng
          </button>
        </div>
      ) : (
        <form onSubmit={submit}>
          <fieldset className="feedback-rating" disabled={busy}>
            <legend id="feedback-title">
              đánh giá chất lượng và trải nghiệm trang web WAYVEE (1 - 5 sao)
            </legend>
            <div className="feedback-rating-options">
              {[1, 2, 3, 4, 5].map((rating) => (
                <label key={rating} title={`${rating} sao`}>
                  <input
                    type="radio"
                    name="recommendation"
                    value={rating}
                    checked={draft.rating === rating}
                    onChange={() => update('rating', rating)}
                    aria-label={`${rating} trên 5 điểm`}
                    required
                  />
                  <span>{rating} ★</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="feedback-comment-label" htmlFor="feedback-category">
            Khía cạnh bạn muốn đánh giá / góp ý
          </label>
          <select
            id="feedback-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={busy}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #d5dee8',
              marginBottom: '15px',
              fontSize: '13px'
            }}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <label className="feedback-comment-label" htmlFor="feedback-comment">
            Bạn có góp ý hoặc trải nghiệm muốn chia sẻ không?
          </label>
          <textarea
            id="feedback-comment"
            value={draft.comment}
            onChange={(event) => update('comment', event.target.value)}
            placeholder="Nhập ý kiến, cảm nhận hoặc báo cáo trải nghiệm của bạn tại đây..."
            maxLength={3000}
            disabled={busy}
          />

          <label className="feedback-email-label" htmlFor="feedback-email">
            Email liên hệ <small>(không bắt buộc)</small>
          </label>
          <p className="feedback-email-help" id="feedback-email-help">
            Chúng tôi sẽ sử dụng email này để phản hồi nếu cần. Không sử dụng cho mục đích khác.
          </p>
          <input
            id="feedback-email"
            type="email"
            value={draft.email}
            onChange={(event) => update('email', event.target.value)}
            placeholder="Email của bạn"
            autoComplete="email"
            maxLength={254}
            aria-describedby="feedback-email-help"
            disabled={busy}
          />

          <p className="support-error" role="alert">
            {error}
          </p>
          <div className="feedback-actions">
            <button type="button" className="support-outline cursor-pointer" disabled={busy} onClick={() => dialog.current.close()}>
              để sau
            </button>
            <button type="submit" className="support-primary cursor-pointer" disabled={busy}>
              {busy ? 'đang gửi…' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}
