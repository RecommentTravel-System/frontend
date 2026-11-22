/**
 * PWA Service Worker Registration
 * Handles registration, updates, and offline readiness
 */

export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Register on window load to avoid delaying critical page resources
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New content is available; please refresh.
                console.log('[PWA] Phiên bản mới đã sẵn sàng. Sẽ kích hoạt trong lần tải tiếp theo.');
              } else {
                // Content is cached for offline use.
                console.log('[PWA] Nội dung đã được lưu vào bộ nhớ cache ngoại tuyến.');
              }
            }
          });
        });
      })
      .catch((error) => {
        console.warn('[PWA] Service Worker registration failed:', error);
      });
  });
}
