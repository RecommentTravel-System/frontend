import { useEffect, useRef, useState } from 'react';
import Avatar from '../components/AccountAvatar.jsx';
import { useAvatar, saveAvatar } from './avatarStore.js';
import { uploadAvatar, validateAvatar } from '../services/avatarUpload.js';
import './AvatarEditor.css';

export default function AvatarEditor({ user, name }) {
  const saved = useAvatar(user.email);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const input = useRef(null);
  const controller = useRef(null);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  useEffect(() => () => controller.current?.abort(), []);
  function choose(event) {
    const next = event.target.files?.[0];
    event.target.value = '';
    if (!next) return;
    try { validateAvatar(next); setPreview(URL.createObjectURL(next)); setFile(next); setNotice('Ảnh xem trước. Bấm Lưu ảnh để cập nhật.'); }
    catch (error) { setNotice(error.message); }
  }
  async function save() {
    if (!file || busy) return;
    setBusy(true); setNotice('Đang lưu ảnh…');
    const request = new AbortController();
    controller.current = request;
    let timedOut = false;
    const timeout = setTimeout(() => { timedOut = true; request.abort(); }, 30000);
    try {
      const url = await uploadAvatar(file, request.signal);
      if (request.signal.aborted) return;
      saveAvatar(user.email, url);
      setFile(null);
      setPreview('');
      setNotice('Đã cập nhật ảnh đại diện từ Cloudinary.');
    } catch (error) { if (!request.signal.aborted || timedOut) setNotice(timedOut ? 'Upload quá thời gian. Vui lòng thử lại.' : error.message || 'Không thể lưu ảnh.'); }
    finally { clearTimeout(timeout); if (!request.signal.aborted || timedOut) setBusy(false); }
  }
  function remove() {
    try { saveAvatar(user.email, ''); setFile(null); setPreview(''); setNotice('Đã khôi phục avatar mặc định.'); }
    catch { setNotice('Không thể xóa ảnh đã lưu trên trình duyệt.'); }
  }
  return <section className="avatar-editor" aria-label="Cập nhật ảnh đại diện"><Avatar name={name} large src={preview || saved} /><div><h2>Ảnh đại diện</h2><p>JPG, PNG hoặc WebP · Tối đa 5 MB</p><input ref={input} type="file" accept="image/jpeg,image/png,image/webp" onChange={choose} hidden disabled={busy} /><div className="avatar-editor-actions"><button type="button" disabled={busy} onClick={() => input.current.click()}>Chọn ảnh</button>{file && <><button type="button" disabled={busy} onClick={save}>{busy ? 'Đang lưu…' : 'Lưu ảnh'}</button><button type="button" disabled={busy} onClick={() => { setFile(null); setPreview(''); setNotice('Đã hủy thay đổi ảnh.'); }}>Hủy</button></>}{saved && !file && <button type="button" disabled={busy} onClick={remove}>Xóa ảnh</button>}</div><p className="avatar-notice" role="status">{notice}</p></div></section>;
}
