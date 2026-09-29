import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Emulate Vite's build-time environment replacement while exercising the real wrapper.
const source = await readFile(new URL('../src/shared/lib/api.js', import.meta.url), 'utf8');
async function client(env) {
  const transformed = source.replaceAll('import.meta.env', JSON.stringify(env));
  return import(`data:text/javascript;base64,${Buffer.from(transformed).toString('base64')}`);
}
const origin = 'https://backend-0xea.onrender.com';
// Node has no browser storage or window; each test temporarily supplies their behavior.
globalThis.localStorage = {};
globalThis.window = {};

test('all HTTP methods use Render without an inherited context path and preserve Bearer JWT', async t => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, ...options });
    return { ok: true, status: 200, json: async () => ({ code: 1000, data: {} }) };
  });
  t.mock.property(globalThis, 'localStorage', { getItem: () => 'test-token' });
  const { api } = await client({ VITE_API_URL: ` ${origin}/// ` });
  await api.post('/api/auth/login', { email: 'test@example.com', password: 'test-only' });
  await api.get('/api/admin/users');
  await api.put('/api/v1/categories/1', { name: 'New name' });
  await api.patch('/api/v1/trips/1/itinerary/confirm');
  await api.delete('/api/v1/favorites/1');
  await api.get('api/location/reverse?lat=16&lng=107');
  assert.equal(calls[0].url, `${origin}/api/auth/login`);
  assert.deepEqual(calls.map(call => call.method), ['POST', 'GET', 'PUT', 'PATCH', 'DELETE', 'GET']);
  for (const call of calls) {
    assert.ok(call.url.startsWith(`${origin}/api/`));
    assert.equal(call.headers.Authorization, 'Bearer test-token');
    assert.ok(!call.url.includes('/wayvee/'));
  }
  assert.equal(JSON.parse(calls[2].body).name, 'New name');
});

test('multipart upload uses the same backend, retaining FormData and automatic content type', async t => {
  t.mock.property(globalThis, 'localStorage', { getItem: () => 'test-token' });
  const body = new FormData();
  body.append('file', new Blob(['test'], { type: 'image/png' }), 'test.png');
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, `${origin}/api/v1/locations/images`);
    assert.equal(options.body, body);
    assert.equal(options.headers['Content-Type'], undefined);
    assert.equal(options.headers.Authorization, 'Bearer test-token');
    return { ok: true, json: async () => ({ code: 1000 }) };
  });
  const { api } = await client({ VITE_API_URL: origin });
  await api.post('/api/v1/locations/images', body);
});

test('missing environment configuration never falls back to localhost or the frontend host', async t => {
  const fetch = t.mock.method(globalThis, 'fetch');
  const { api } = await client({});
  await assert.rejects(api.get('/api/admin/users'), /VITE_API_URL/);
  assert.equal(fetch.mock.callCount(), 0);
});

test('expired protected sessions still clear the existing token and notify the auth provider', async t => {
  const removed = [];
  const events = [];
  t.mock.property(globalThis, 'localStorage', { getItem: () => 'expired-token', removeItem: key => removed.push(key) });
  t.mock.property(globalThis, 'window', { dispatchEvent: event => events.push(event.type) });
  t.mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 401, json: async () => ({ message: 'Unauthenticated' }) }));
  const { api } = await client({ VITE_API_URL: origin });
  await assert.rejects(api.get('/api/admin/users'), error => error.isUnauthorized === true);
  assert.deepEqual(removed, ['wayvee_token', 'wayvee_user']);
  assert.deepEqual(events, ['wayvee:unauthorized']);
});
