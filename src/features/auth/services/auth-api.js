import { api } from "~/shared/lib/api";

export async function loginApi({ email, password }) {
  return await api.post("/api/auth/login", { email, password });
}

export async function signupApi({ email, password, fullName, phone }) {
  return await api.post("/api/auth/signup", {
    email,
    password,
    fullName: fullName || "",
    phone: phone || ""
  });
}

export async function verifyEmailApi({ email, otp }) {
  return await api.post("/api/auth/verify-email", { email, otp });
}

export async function resendOtpApi(email) {
  return await api.post("/api/auth/resend-otp", { email });
}

export async function logoutApi(token) {
  return await api.post("/api/auth/logout", { token });
}
