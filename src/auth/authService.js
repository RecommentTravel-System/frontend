import { signupApi, loginApi, verifyEmailApi, resendOtpApi } from '~/features/auth/services/auth-api';

const SESSION_TOKEN_KEY = 'wayvee_token';
const SESSION_USER_KEY = 'wayvee_user';

export function readSession() {
  try {
    const userStr = localStorage.getItem(SESSION_USER_KEY);
    const token = localStorage.getItem(SESSION_TOKEN_KEY);
    if (!token || !userStr) return null;
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export async function registerAccount({ email, password, fullName = '', phone = '' }) {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error('Vui lòng nhập email hợp lệ.');
  }
  if (password.length < 6) {
    throw new Error('Mật khẩu cần ít nhất 6 ký tự.');
  }
  return await signupApi({ email: normalized, password, fullName, phone });
}

export async function verifyEmailOtp({ email, otp }) {
  const normalized = email.trim().toLowerCase();
  return await verifyEmailApi({ email: normalized, otp: otp.trim() });
}

export async function resendAccountOtp(email) {
  const normalized = email.trim().toLowerCase();
  return await resendOtpApi(normalized);
}

export async function loginAccount({ email, password }) {
  const normalized = email.trim().toLowerCase();
  const response = await loginApi({ email: normalized, password });
  if (response.data) {
    const { accessToken, userResponse } = response.data;
    if (accessToken) {
      localStorage.setItem(SESSION_TOKEN_KEY, accessToken);
    }
    if (userResponse) {
      localStorage.setItem(SESSION_USER_KEY, JSON.stringify(userResponse));
      return userResponse;
    }
  }
  return { email: normalized };
}

export function clearSession() {
  localStorage.removeItem(SESSION_TOKEN_KEY);
  localStorage.removeItem(SESSION_USER_KEY);
}

export async function changeAccountPassword(user, currentPassword, newPassword) {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Mật khẩu mới cần ít nhất 6 ký tự.');
  }
  return true;
}

export async function deleteLocalAccount(user, currentPassword) {
  clearSession();
  if (user?.email) {
    try {
      localStorage.removeItem(`wayvee-profile:${user.email}`);
      localStorage.removeItem(`wayvee-favorites:${user.email}`);
      localStorage.removeItem(`wayvee-reviews:${user.email}`);
      localStorage.removeItem(`wayvee-settings:${user.email}`);
      localStorage.removeItem(`wayvee-tours:${user.email}`);
    } catch {
      // ignore
    }
  }
  return true;
}

export function startDemoSession() {
  const demoUser = {
    email: 'demo@wayvee.vn',
    fullName: 'Demo User',
    role: 'USER',
    mode: 'flow-test'
  };
  localStorage.setItem(SESSION_USER_KEY, JSON.stringify(demoUser));
  return demoUser;
}
