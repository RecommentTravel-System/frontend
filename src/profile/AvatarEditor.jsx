import { useEffect, useRef, useState } from 'react';
import Avatar from '../components/AccountAvatar.jsx';
import { useAuth } from '../auth/useAuth.js';
import { uploadAvatarApi, removeAvatarApi } from '~/features/auth/services/auth-api';
import './AvatarEditor.css';

export default function AvatarEditor({ name }) {
  const { user, updateUser } = useAuth();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const input = useRef(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function validateFile(f) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      throw new Error('Vui lòng chọn ảnh định dạng JPG, PNG hoặc WebP.');
    }
    if (!f.size || f.size > 5 * 1024 * 1024) {
      throw new Error('Ảnh phải có dung lượng không quá 5 MB.');
    }
  }

  function choose(event) {
    const next = event.target.files?.[0];
    event.target.value = '';
    if (!next) return;
    try {
      validateFile(next);
      setPreview(URL.createObjectURL(next));
      setFile(next);
      setNotice('Ảnh xem trước. Bấm "Lưu ảnh" để cập nhật lên Cloudinary.');
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function save() {
    if (!file || busy) return;
    setBusy(true);
    setNotice('Đang upload ảnh lên …');

    try {
      const response = await uploadAvatarApi(file);
      const updatedUser = response?.data || response;
      if (updatedUser) {
        updateUser(updatedUser);
      }
      setFile(null);
      setPreview('');
      setNotice('Đã lưu ảnh lên hệ thống thành công!');
    } catch (error) {
      setNotice(error?.response?.data?.message || error.message || 'Không thể lưu ảnh.');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (busy) return;
    setBusy(true);
    setNotice('Đang xóa ảnh…');
    try {
      const response = await removeAvatarApi();
      const updatedUser = response?.data || response;
      if (updatedUser) {
        updateUser(updatedUser);
      }
      setFile(null);
      setPreview('');
      setNotice('Đã khôi phục ảnh đại diện mặc định.');
    } catch (error) {
      setNotice(error?.response?.data?.message || error.message || 'Không thể xóa ảnh.');
    } finally {
      setBusy(false);
    }
  }

  const currentAvatarUrl = user?.avatarUrl || user?.avatar || '';

  return (
    <section className="avatar-editor" aria-label="Cập nhật ảnh đại diện">
      <Avatar name={name || user?.fullName} large src={preview || currentAvatarUrl} />
      <div>
        <h2>Ảnh đại diện</h2>
        <p>JPG, PNG hoặc WebP · Tối đa 5 MB</p>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={choose}
          hidden
          disabled={busy}
        />
        <div className="avatar-editor-actions">
          <button type="button" disabled={busy} onClick={() => input.current?.click()}>
            Chọn ảnh
          </button>
          {file && (
            <>
              <button type="button" disabled={busy} onClick={save}>
                {busy ? 'Đang lưu…' : 'Lưu ảnh'}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setFile(null);
                  setPreview('');
                  setNotice('Đã hủy thay đổi ảnh.');
                }}
              >
                Hủy
              </button>
            </>
          )}
          {currentAvatarUrl && !file && (
            <button type="button" disabled={busy} onClick={remove}>
              Xóa ảnh
            </button>
          )}
        </div>
        {notice && (
          <p className="avatar-notice" role="status">
            {notice}
          </p>
        )}
      </div>
    </section>
  );
}
