import { useSyncExternalStore } from 'react';
const eventName = 'wayvee-preferences-change';
const defaults = { motion: true, notifications: true };
export const preferencesKey = email => `wayvee-settings:${email}`;
function snapshot(email) {
  if (!email) return '';
  try { return localStorage.getItem(preferencesKey(email)) || ''; } catch { return ''; }
}
function subscribe(callback) {
  window.addEventListener(eventName, callback);
  window.addEventListener('storage', callback);
  return () => { window.removeEventListener(eventName, callback); window.removeEventListener('storage', callback); };
}
export function usePreferences(email) {
  const raw = useSyncExternalStore(subscribe, () => snapshot(email));
  let data;
  try { data = JSON.parse(raw); } catch { data = {}; }
  const preferences = Object.fromEntries(Object.entries(defaults).map(([key, value]) => [key, typeof data?.[key] === 'boolean' ? data[key] : value]));
  function update(key, value) {
    localStorage.setItem(preferencesKey(email), JSON.stringify({ ...preferences, [key]: value }));
    window.dispatchEvent(new Event(eventName));
  }
  return [preferences, update];
}
