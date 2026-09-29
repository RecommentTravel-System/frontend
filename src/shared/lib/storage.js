/**
 * Safe LocalStorage wrapper for browser and SSR safety
 */
export const storage = {
  get(key, fallback = null) {
    if (typeof window === "undefined") return fallback;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      console.warn(`[storage] Error reading key "${key}":`, e);
      return fallback;
    }
  },

  set(key, value) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`[storage] Error writing key "${key}":`, e);
    }
  },

  remove(key) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[storage] Error removing key "${key}":`, e);
    }
  }
};
