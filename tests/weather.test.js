import test from 'node:test';
import assert from 'node:assert/strict';
import { createWeatherHandler } from '../server/weather.js';
import weather from '../api/weather.js';

async function request(handler, url = '/api/weather?city=hanoi', method = 'GET') {
  const result = { headers: {} };
  await handler({ url, method }, {
    set statusCode(status) { result.status = status; },
    setHeader(key, value) { result.headers[key] = value; },
    end(value) { result.body = JSON.parse(value); },
  }, () => { result.next = true; });
  return result;
}
test('Vercel entry returns JSON 503 without server configuration', async () => {
  const saved = process.env.PUBLIC_OPENWEATHER_API_KEY;
  delete process.env.PUBLIC_OPENWEATHER_API_KEY;
  try {
    const result = await request(weather);
    assert.equal(result.status, 503);
    assert.match(result.body.error, /PUBLIC_OPENWEATHER_API_KEY/);
  } finally { if (saved !== undefined) process.env.PUBLIC_OPENWEATHER_API_KEY = saved; }
});
test('current and forecast use metric data, cache calls and do not expose key', async () => {
  let calls = 0;
  const handler = createWeatherHandler({ PUBLIC_OPENWEATHER_API_KEY: 'private-test-key' }, async url => {
    calls++;
    assert.match(url, /units=metric/);
    const item = { dt: 1800000000, main: { temp: 28.6 }, weather: [{ id: 800, icon: '01d' }] };
    return { ok: true, json: async () => url.includes('/forecast?') ? { list: [item] } : item };
  });
  const results = await Promise.all([request(handler), request(handler)]);
  assert.equal(calls, 1);
  assert.equal(results[0].body.temp, 29);
  assert.ok(!JSON.stringify(results).includes('private-test-key'));
  assert.equal((await request(handler, '/api/weather?city=hanoi&type=forecast')).body.list.length, 1);
  assert.equal((await request(handler, '/api/weather?city=unknown')).status, 400);
  assert.equal((await request(handler, '/api/weather?city=hanoi', 'POST')).status, 405);
});
test('upstream auth and quota errors become JSON errors', async () => {
  for (const status of [401, 429]) {
    const handler = createWeatherHandler({ PUBLIC_OPENWEATHER_API_KEY: 'test' }, async () => ({ ok: false, status }));
    assert.equal((await request(handler)).status, status === 429 ? 429 : 502);
  }
});
