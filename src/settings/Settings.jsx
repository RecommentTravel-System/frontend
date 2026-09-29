import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';
import { changeAccountPassword, deleteLocalAccount } from '../auth/authService.js';
import SiteHeader from '../components/SiteHeader.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import AccountSidebar from '../components/AccountSidebar.jsx';
import { usePreferences } from './preferences.js';
import './Settings.css';

function SecurityDialog({ mode, user, onClose, onSaved, onDeleted }) {
  const dialog = useRef(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [deletionText, setDeletionText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const deleting = mode === 'delete';
  const demo = user.mode === 'flow-test';
  useEffect(() => { if (!dialog.current.open) dialog.current.showModal(); }, []);
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setError('');
    if (deleting && deletionText.trim() !== 'XÓA') { setError('Nhập XÓA để xác nhận.'); return; }
    if (!deleting && (password.length < 8 || password !== confirmation)) { setError('Mật khẩu cần ít nhất 8 ký tự và xác nhận phải khớp.'); return; }
    setBusy(true);
    try {
      if (deleting) { await deleteLocalAccount(user, currentPassword); onDeleted(); }
      else { await changeAccountPassword(user, currentPassword, password); onSaved('Đã cập nhật mật khẩu tài khoản trên trình duyệt.'); dialog.current.close(); }
    } catch (failure) { setError(failure.message || 'Không thể lưu thay đổi. Vui lòng thử lại.'); }
    finally { setBusy(false); }
  }
  return <dialog ref={dialog} className="settings-dialog" aria-labelledby="settings-dialog-title" onClose={onClose} onCancel={event => { if (busy) event.preventDefault(); }}><form onSubmit={submit}>
    <div className="settings-dialog-heading"><h2 id="settings-dialog-title">{deleting ? 'Xóa tài khoản' : 'Đổi mật khẩu'}</h2><button type="button" disabled={busy} onClick={() => dialog.current.close()} aria-label="Đóng">×</button></div>
    {deleting ? <p>Thao tác này xóa thông tin hồ sơ, avatar đã lưu, bộ sưu tập, bài đánh giá và cài đặt của tài khoản này trên trình duyệt, rồi đăng xuất. Ảnh trên Cloudinary không bị xóa.</p> : demo && <p>Bạn đang dùng Continue để test, chưa có mật khẩu để thay đổi. Chức năng này sẽ dùng được khi bật đăng nhập bằng tài khoản.</p>}
    {deleting && demo && <p>Bấm Continue lần nữa sẽ tạo lại phiên demo mới.</p>}
    {!demo && <label>Mật khẩu hiện tại<input type="password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} autoComplete="current-password" required disabled={busy} /></label>}
    {deleting ? <label>Nhập XÓA để xác nhận<input value={deletionText} onChange={event => setDeletionText(event.target.value)} autoComplete="off" required disabled={busy} /></label> : !demo && <><label>Mật khẩu mới<input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="new-password" minLength={8} required disabled={busy} /></label><label>Xác nhận mật khẩu mới<input type="password" value={confirmation} onChange={event => setConfirmation(event.target.value)} autoComplete="new-password" minLength={8} required disabled={busy} /></label></>}
    <p className="settings-error" role="alert">{error}</p><div className="settings-dialog-actions"><button type="button" disabled={busy} onClick={() => dialog.current.close()}>{!deleting && demo ? 'Đã hiểu' : 'Hủy'}</button>{(deleting || !demo) && <button type="submit" disabled={busy || (deleting && deletionText.trim() !== 'XÓA')} className={deleting ? 'settings-danger' : 'settings-primary'}>{busy ? 'Đang xử lý…' : deleting ? 'Xóa tài khoản' : 'Lưu mật khẩu'}</button>}</div>
  </form></dialog>;
}

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [preferences, update] = usePreferences(user.email);
  const [notice, setNotice] = useState('');
  const [dialog, setDialog] = useState(null);
  function toggle(key) {
    try { update(key, !preferences[key]); setNotice(key === 'notifications' ? 'Đã lưu lựa chọn thông báo. Dịch vụ gửi thông báo chưa được kết nối.' : 'Đã cập nhật hiệu ứng chuyển động.'); }
    catch { setNotice('Không thể lưu cài đặt. Vui lòng kiểm tra quyền lưu trữ của trình duyệt.'); }
  }
  return <div className="settings-page"><SiteHeader /><main className="account-layout settings-layout"><AccountSidebar onNotice={setNotice} /><section className="settings-panel" aria-labelledby="settings-heading">
    <h1 id="settings-heading">Cài đặt</h1>
    <div className="settings-row"><div><h2 id="settings-motion-label">Hiệu ứng chuyển động</h2><p id="settings-motion-description">Bật hiệu ứng mượt khi chuyển trang và tương tác.</p></div><button type="button" className="settings-switch" role="switch" aria-checked={preferences.motion} aria-labelledby="settings-motion-label" aria-describedby="settings-motion-description" onClick={() => toggle('motion')}><span /></button></div>
    <div className="settings-row"><div><h2 id="settings-notifications-label">Thông báo</h2><p id="settings-notifications-description">Nhận thông báo về địa điểm mới và xu hướng du lịch.</p></div><button type="button" className="settings-switch" role="switch" aria-checked={preferences.notifications} aria-labelledby="settings-notifications-label" aria-describedby="settings-notifications-description" onClick={() => toggle('notifications')}><span /></button></div>
    <section className="settings-security" aria-labelledby="settings-security-heading"><h2 id="settings-security-heading">Bảo mật</h2><div className="settings-security-item"><h3>Mật khẩu</h3><p>Cập nhật để bảo vệ tài khoản.</p><button type="button" className="settings-primary" onClick={() => setDialog('password')}>Đổi mật khẩu</button></div><div className="settings-security-item"><h3>Xóa tài khoản</h3><p>Xóa dữ liệu tài khoản trên trình duyệt này.</p><button type="button" className="settings-danger" onClick={() => setDialog('delete')}>Xóa tài khoản</button></div></section>
    <p className="settings-notice" role="status">{notice}</p>
  </section></main><SiteFooter />{dialog && <SecurityDialog mode={dialog} user={user} onClose={() => setDialog(null)} onSaved={setNotice} onDeleted={() => { logout(); navigate('/login', { replace: true }); }} />}</div>;
}
