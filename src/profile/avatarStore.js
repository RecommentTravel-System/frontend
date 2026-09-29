import { useSyncExternalStore } from 'react';
const eventName = 'wayvee-avatar-change';
const key = email => `wayvee-avatar:${email}`;
function read(email) {
  if (!email) return '';
  try { const value = localStorage.getItem(key(email)) || ''; return /^(https:\/\/|data:image\/(jpeg|png|webp);base64,)/.test(value) ? value : ''; } catch { return ''; }
}
function subscribe(callback) {
  window.addEventListener(eventName, callback);
  window.addEventListener('storage', callback);
  return () => { window.removeEventListener(eventName, callback); window.removeEventListener('storage', callback); };
}
export function useAvatar(email) { return useSyncExternalStore(subscribe, () => read(email)); }
export function saveAvatar(email, url) {
  if (url) localStorage.setItem(key(email), url);
  else localStorage.removeItem(key(email));
  window.dispatchEvent(new Event(eventName));
}
