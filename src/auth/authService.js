// Browser-only demo adapter. Replace with server requests for production authentication.
const ACCOUNTS_KEY = 'wayvee-demo-accounts';
const SESSION_KEY = 'wayvee-demo-session';
const normalizeEmail = (email) => email.trim().toLowerCase();

function accounts() {
  const value = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
  if (!Array.isArray(value)) throw new Error('Không đọc được dữ liệu tài khoản demo.');
  return value;
}

async function passwordHash(password, salt) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const result = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 100000, hash: 'SHA-256' }, key, 256);
  return Array.from(new Uint8Array(result), byte => byte.toString(16).padStart(2, '0')).join('');
}

export function readSession() {
  try {
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    if (session?.mode === 'flow-test' && session.email === 'demo@wayvee.test') return session;
    return typeof session?.email === 'string' && accounts().some(account => account.email === session.email) ? { email: session.email } : null;
  } catch { return null; }
}

export async function registerAccount({ email, password, confirmPassword }) {
  const normalized = normalizeEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw new Error('Vui lòng nhập email hợp lệ.');
  if (password.length < 8) throw new Error('Mật khẩu cần ít nhất 8 ký tự.');
  if (password !== confirmPassword) throw new Error('Mật khẩu xác nhận không khớp.');
  if (accounts().some(account => account.email === normalized)) throw new Error('Email này đã được đăng ký.');
  const salt = crypto.randomUUID();
  const hash = await passwordHash(password, salt);
  const current = accounts();
  if (current.some(account => account.email === normalized)) throw new Error('Email này đã được đăng ký.');
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...current, { email: normalized, salt, hash }]));
}

export async function loginAccount({ email, password }) {
  const account = accounts().find(item => item.email === normalizeEmail(email));
  if (!account || await passwordHash(password, account.salt) !== account.hash) throw new Error('Email hoặc mật khẩu không đúng.');
  const user = { email: account.email };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export function startDemoSession() {
  const user = { email: 'demo@wayvee.test', mode: 'flow-test' };
  // Keep the test flow usable even if browser storage is unavailable.
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(user)); } catch { /* In-memory session only. */ }
  return user;
}
export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}
