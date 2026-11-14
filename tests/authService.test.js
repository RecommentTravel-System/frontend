import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { clearSession, readSession, registerAccount, startDemoSession } from '../src/auth/authService.js';

function storage() {
  const entries = new Map();
  return {
    getItem: key => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, String(value)),
    removeItem: key => entries.delete(key)
  };
}

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', { value: storage(), configurable: true });
});

test('readSession returns null when token or user is missing', () => {
  assert.equal(readSession(), null);
  localStorage.setItem('wayvee_token', 'sample-token');
  assert.equal(readSession(), null);
});

test('readSession parses saved user when token and user are both present', () => {
  const user = { email: 'user@example.com', fullName: 'Wayvee User' };
  localStorage.setItem('wayvee_token', 'sample-token');
  localStorage.setItem('wayvee_user', JSON.stringify(user));
  assert.deepEqual(readSession(), user);
});

test('clearSession removes wayvee_token and wayvee_user', () => {
  localStorage.setItem('wayvee_token', 'sample-token');
  localStorage.setItem('wayvee_user', JSON.stringify({ email: 'user@example.com' }));
  clearSession();
  assert.equal(localStorage.getItem('wayvee_token'), null);
  assert.equal(localStorage.getItem('wayvee_user'), null);
  assert.equal(readSession(), null);
});

test('startDemoSession sets demo user in storage and returns user', () => {
  const demo = startDemoSession();
  assert.equal(demo.email, 'demo@wayvee.vn');
  assert.equal(JSON.parse(localStorage.getItem('wayvee_user')).email, 'demo@wayvee.vn');
});

test('registerAccount validates email format and password length before calling API', async () => {
  await assert.rejects(
    registerAccount({ email: 'invalid-email', password: 'password123' }),
    /email hợp lệ/
  );
  await assert.rejects(
    registerAccount({ email: 'valid@example.com', password: '123' }),
    /ít nhất 6 ký tự/
  );
});
