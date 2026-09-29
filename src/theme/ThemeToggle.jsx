import { useSyncExternalStore } from 'react';

const key = 'wayvee-theme';
function initialTheme() {
  try { const saved = localStorage.getItem(key); if (saved === 'dark' || saved === 'light') return saved; } catch { /* Use system preference. */ }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
let theme = initialTheme();
document.documentElement.dataset.theme = theme;
function subscribe(callback) {
  const sync = event => {
    if (event.type === 'storage' && event.key !== key && event.key !== null) return;
    if (event.type === 'storage') theme = initialTheme();
    document.documentElement.dataset.theme = theme;
    callback();
  };
  window.addEventListener('wayvee-theme-change', sync);
  window.addEventListener('storage', sync);
  return () => { window.removeEventListener('wayvee-theme-change', sync); window.removeEventListener('storage', sync); };
}
export default function ThemeToggle({ floating = false }) {
  const current = useSyncExternalStore(subscribe, () => theme);
  function toggle() {
    theme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem(key, theme); } catch { /* Keep the choice for this tab. */ }
    window.dispatchEvent(new Event('wayvee-theme-change'));
  }
  return <button type="button" className={`theme-toggle${floating ? ' theme-toggle-floating' : ''}`} onClick={toggle} aria-label={current === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'} aria-pressed={current === 'dark'} title={current === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">{current === 'dark' ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2" /></> : <path d="M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z" />}</svg></button>;
}
