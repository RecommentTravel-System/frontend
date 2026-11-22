/**
 * WAYVEE Service Worker
 * Production-ready for PWA & Microsoft Store
 *
 * Cache Strategy:
 * - NEVER cache API requests (Auth, PayOS, Trips, Reviews, Uploads).
 * - Navigation: Network-first, fallback to /index.html (SPA routing), then /offline.html.
 * - Static Assets: Stale-while-revalidate for fast startup and offline access.
 */

const CACHE_VERSION = 'wayvee-pwa-v1.0.0';
const STATIC_CACHE = `wayvee-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `wayvee-runtime-${CACHE_VERSION}`;

// Pre-cache core shell resources
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/favicon.png',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-512x512.png',
  '/icons/windows-square-44.png',
  '/icons/windows-store-50.png',
  '/icons/windows-square-150.png',
  '/icons/windows-splash-300.png'
];

// URLs/Domains that must NEVER be cached (strictly Network-Only)
const BYPASS_CACHE_PATTERNS = [
  /\/api\//i,
  /\/v1\//i,
  /payos/i,
  /cloudinary\.com/i,
  /nominatim/i,
  /overpass/i,
  /googleapis\.com/i,
  /identitytoolkit/i,
  /securetoken/i,
  /firestore/i,
  /firebase/i,
  /socket\.io/i,
  /hot-update/i
];

// Helper: Determine if request should bypass SW cache
function shouldBypassCache(url, request) {
  // Only handle GET requests in SW cache
  if (request.method !== 'GET') {
    return true;
  }
  // Check against bypass patterns
  const urlString = url.href;
  for (const pattern of BYPASS_CACHE_PATTERNS) {
    if (pattern.test(urlString)) {
      return true;
    }
  }
  return false;
}

// ─── Install Event ─────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(PRECACHE_URLS).catch((err) => {
          console.warn('[SW] Some precache assets could not be cached immediately:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// ─── Activate Event ───────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== RUNTIME_CACHE) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// ─── Fetch Event ──────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Bypass any non-GET or API / Auth requests completely
  if (shouldBypassCache(url, request)) {
    return; // Pass through to network directly
  }

  // 2. Navigation requests (HTML page navigation for SPA)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Cache the fresh index.html if valid
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put('/index.html', responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback: try cached index.html for SPA router, then offline.html
          const cachedIndex = await caches.match('/index.html');
          if (cachedIndex) return cachedIndex;

          const cachedOffline = await caches.match('/offline.html');
          if (cachedOffline) return cachedOffline;

          return new Response('Ngoại tuyến. Vui lòng kết nối mạng.', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        })
    );
    return;
  }

  // 3. Same-origin Static Assets (scripts, stylesheets, fonts, images)
  const isStaticAsset =
    url.origin === self.location.origin &&
    (/\.(?:js|css|png|jpg|jpeg|svg|webp|ico|woff2?|ttf|eot)$/i.test(url.pathname) ||
      url.pathname.startsWith('/assets/') ||
      url.pathname.startsWith('/icons/') ||
      url.pathname.startsWith('/screenshots/'));

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 4. Fallback for all other GET requests: Network first with cache fallback
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        return networkResponse;
      })
      .catch(() => caches.match(request))
  );
});

// ─── Listen for Skip Waiting ──────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
