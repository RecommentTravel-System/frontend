import { useId, useState } from 'react';
import { useAuth } from '../auth/useAuth.js';
import { useAvatar } from '../profile/avatarStore.js';
import './AccountLayout.css';
export default function Avatar({ name, large = false, src }) {
  const clipId = useId();
  const { user } = useAuth();
  const saved = useAvatar(user?.email);
  const url = src === undefined ? saved : src;
  const [failed, setFailed] = useState('');
  if (url && url !== failed) return <span className={`profile-avatar${large ? ' profile-avatar-large' : ''}`}><img src={url} alt={`Ảnh đại diện ${name}`} onError={() => setFailed(url)} /></span>;
  return <span className={`profile-avatar${large ? ' profile-avatar-large' : ''}`} aria-label={`Ảnh đại diện ${name}`}><svg viewBox="0 0 80 80" aria-hidden="true"><defs><clipPath id={clipId}><circle cx="40" cy="40" r="40" /></clipPath></defs><g clipPath={`url(#${clipId})`}><path fill="#eed2af" d="M0 0h80v80H0z"/><path fill="#80553c" d="M17 56V31C17 2 62 2 63 31v25Z"/><path fill="#9bd5bd" d="M7 80c0-31 66-31 66 0"/><path fill="#f4c9a8" d="M33 47h14v16H33z"/><ellipse cx="40" cy="33" rx="17" ry="23" fill="#f7d2b4"/><path fill="#80553c" d="M21 32C18 9 56 0 59 30 45 27 39 17 37 15c-2 9-8 14-16 17"/><path d="M31 34h2m14 0h2" stroke="#543c32" strokeWidth="3" strokeLinecap="round"/><path d="M34 44q6 6 12 0" fill="white" stroke="#bb806d" strokeWidth="1.5"/></g></svg></span>;
}
