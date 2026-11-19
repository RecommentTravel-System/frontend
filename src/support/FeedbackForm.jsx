import { useEffect, useRef, useState } from 'react';
import { submitWebsiteReview, uploadWebsiteReviewMedia } from '~/shared/services/website-review-api.js';

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
  const [mediaList, setMediaList] = useState([]);
  const fileInputRef = useRef(null);

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
            item.id === tempId ? { ...item, url: uploadedUrl, uploading: false } : item
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

    if (mediaList.some((m) => m.uploading)) {
      setError('Đang tải tệp đính kèm lên hệ thống, vui lòng chờ...');
      return;
    }

    pending.current = true;
    setBusy(true);
    setError('');

    try {
      const mediaUrls = mediaList.map((m) => m.url);
      await submitWebsiteReview({
        rating: draft.rating,
        category: category,
        comment: draft.comment.trim(),
        userFullName: user?.fullName || (draft.email ? draft.email.split('@')[0] : 'Khách tham quan'),
        userEmail: draft.email || user?.email || '',
        anonymous: !draft.email && !user,
        mediaUrls
      });
      setSaved(true);
      setMediaList([]);
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

          <div style={{ margin: '15px 0' }}>
            <label className="feedback-comment-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Ảnh &amp; Video minh họa <small>(không bắt buộc)</small></span>
              <small style={{ color: '#64748b' }}>{mediaList.length} tệp đã chọn</small>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                disabled={busy}
                style={{ display: 'none' }}
                id="feedback-media-file-input"
              />
              <label
                htmlFor="feedback-media-file-input"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: '1px dashed #00a3e0',
                  background: '#f0f9ff',
                  color: '#00a3e0',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: busy ? 'not-allowed' : 'pointer'
                }}
              >
                + Đính kèm ảnh / video
              </label>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                Hỗ trợ ảnh JPG, PNG, WebP &amp; video MP4 (tối đa 30MB)
              </span>
            </div>

            {mediaList.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                  gap: '10px',
                  marginTop: '12px',
                  padding: '10px',
                  background: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0'
                }}
              >
                {mediaList.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      position: 'relative',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      aspectRatio: '16/9',
                      background: '#0f172a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #cbd5e1'
                    }}
                  >
                    {item.type === 'video' ? (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                        <span style={{ position: 'absolute', fontSize: '12px', color: '#fff' }}>▶</span>
                        <span style={{ position: 'absolute', bottom: '2px', left: '2px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '8px', padding: '1px 3px', borderRadius: '3px' }}>VIDEO</span>
                      </div>
                    ) : (
                      <img src={item.url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}

                    {item.uploading && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        Tải...
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => removeMedia(item.id)}
                      disabled={busy}
                      style={{
                        position: 'absolute',
                        top: '2px',
                        right: '2px',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.7)',
                        color: '#fff',
                        border: 'none',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Xóa tệp"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

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
              {busy ? 'Đang gửi…' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}
