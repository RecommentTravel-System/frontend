import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { clearSession, loginAccount, readSession, registerAccount } from '../src/auth/authService.js';

function storage() {
  const entries = new Map();
  return { getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, String(value)), removeItem: key => entries.delete(key) };
}

const credentials = { email: 'traveler@example.com', password: 'WayveeDemo123!', confirmPassword: 'WayveeDemo123!' };
beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', { value: storage(), configurable: true });
  Object.defineProperty(globalThis, 'sessionStorage', { value: storage(), configurable: true });
});

test('registration does not authenticate and does not store the plain password', async () => {
  await registerAccount(credentials);
  assert.equal(readSession(), null);
  assert.ok(!localStorage.getItem('wayvee-demo-accounts').includes(credentials.password));
});

test('only matching credentials create a session; logout removes it', async () => {
  await registerAccount(credentials);
  await assert.rejects(loginAccount({ ...credentials, password: 'wrong' }), /không đúng/);
  await assert.rejects(loginAccount({ ...credentials, email: 'unknown@example.com' }), /không đúng/);
  assert.equal(readSession(), null);
  const user = await loginAccount({ ...credentials, email: ' TRAVELER@EXAMPLE.COM ' });
  assert.deepEqual(user, { email: credentials.email });
  assert.deepEqual(readSession(), user);
  clearSession();
  assert.equal(readSession(), null);
});

test('registration rejects duplicates, invalid email and invalid passwords', async () => {
  await registerAccount(credentials);
  await assert.rejects(registerAccount({ ...credentials, email: 'TRAVELER@example.com' }), /đã được đăng ký/);
  await assert.rejects(registerAccount({ ...credentials, email: 'bad' }), /hợp lệ/);
  await assert.rejects(registerAccount({ ...credentials, password: 'short' }), /8 ký tự/);
  await assert.rejects(registerAccount({ ...credentials, confirmPassword: 'different' }), /không khớp/);
});

test('broken or unknown persisted sessions are treated as signed out', () => {
  sessionStorage.setItem('wayvee-demo-session', 'invalid JSON');
  assert.equal(readSession(), null);
  sessionStorage.setItem('wayvee-demo-session', JSON.stringify({ email: credentials.email }));
  assert.equal(readSession(), null);
});

test('storage failures never return a successful login', async () => {
  await registerAccount(credentials);
  sessionStorage.setItem = () => { throw new Error('Storage unavailable'); };
  await assert.rejects(loginAccount(credentials), /Storage unavailable/);
  assert.equal(readSession(), null);
});
