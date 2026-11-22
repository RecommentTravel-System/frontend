import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('PWA: manifest.webmanifest exists and complies with PWABuilder standards', () => {
  const manifestPath = path.join(rootDir, 'public', 'manifest.webmanifest');
  assert.ok(fs.existsSync(manifestPath), 'manifest.webmanifest must exist in public/');

  const raw = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(raw);

  assert.equal(manifest.name, 'WAYVEE - Nền tảng du lịch & lịch trình thông minh');
  assert.equal(manifest.short_name, 'WAYVEE');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, '/?source=pwa');
  assert.equal(manifest.scope, '/');
  assert.equal(manifest.theme_color, '#00a3e0');
  assert.equal(manifest.background_color, '#ffffff');

  // Icons validation
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 8, 'Must have comprehensive icon set');
  const has192 = manifest.icons.some((i) => i.sizes === '192x192');
  const has512 = manifest.icons.some((i) => i.sizes === '512x512');
  const hasMaskable = manifest.icons.some((i) => i.purpose === 'maskable');
  assert.ok(has192, 'Must include 192x192 icon');
  assert.ok(has512, 'Must include 512x512 icon');
  assert.ok(hasMaskable, 'Must include maskable icon');

  // Check all icons exist on filesystem
  for (const icon of manifest.icons) {
    const iconFile = path.join(rootDir, 'public', icon.src);
    assert.ok(fs.existsSync(iconFile), `Icon file ${icon.src} must exist`);
    assert.ok(fs.statSync(iconFile).size > 0, `Icon file ${icon.src} cannot be empty`);
  }

  // Screenshots validation
  assert.ok(Array.isArray(manifest.screenshots) && manifest.screenshots.length >= 2, 'Must have wide & narrow screenshots');
  for (const ss of manifest.screenshots) {
    const ssFile = path.join(rootDir, 'public', ss.src);
    assert.ok(fs.existsSync(ssFile), `Screenshot file ${ss.src} must exist`);
    assert.ok(fs.statSync(ssFile).size > 0, `Screenshot file ${ss.src} cannot be empty`);
  }
});

test('PWA: Service Worker sw.js exists with secure cache bypass for APIs and Auth', () => {
  const swPath = path.join(rootDir, 'public', 'sw.js');
  assert.ok(fs.existsSync(swPath), 'sw.js must exist in public/');

  const swContent = fs.readFileSync(swPath, 'utf8');
  assert.ok(swContent.includes("addEventListener('fetch'"), 'Must handle fetch event');
  assert.ok(swContent.includes("addEventListener('install'"), 'Must handle install event');
  assert.ok(swContent.includes("addEventListener('activate'"), 'Must handle activate event');

  // Security check: Must bypass /api/ and payos
  assert.ok(swContent.includes('/api') || swContent.includes('api'), 'Must explicitly bypass API requests');
  assert.ok(swContent.includes('payos'), 'Must bypass PayOS payment requests');
  assert.ok(swContent.includes('/offline.html'), 'Must reference offline.html fallback');
});

test('PWA: index.html contains necessary PWA meta tags and link rel=manifest', () => {
  const indexPath = path.join(rootDir, 'index.html');
  const indexContent = fs.readFileSync(indexPath, 'utf8');

  assert.ok(indexContent.includes('rel="manifest"'), 'Must have rel="manifest"');
  assert.ok(indexContent.includes('/manifest.webmanifest'), 'Must reference /manifest.webmanifest');
  assert.ok(indexContent.includes('theme-color'), 'Must have theme-color meta tag');
  assert.ok(indexContent.includes('apple-mobile-web-app-capable'), 'Must have iOS PWA capability meta tag');
  assert.ok(indexContent.includes('msapplication-TileImage'), 'Must have Windows tile meta tag');
});

test('PWA: offline.html exists with user-friendly retry button', () => {
  const offlinePath = path.join(rootDir, 'public', 'offline.html');
  assert.ok(fs.existsSync(offlinePath), 'offline.html must exist in public/');

  const offlineContent = fs.readFileSync(offlinePath, 'utf8');
  assert.ok(offlineContent.includes('WAYVEE'), 'Must contain brand name');
  assert.ok(offlineContent.includes('reload()'), 'Must contain retry mechanism');
});
