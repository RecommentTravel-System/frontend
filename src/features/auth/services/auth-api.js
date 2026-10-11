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

export async function uploadAvatarApi(file) {
  const formData = new FormData();
  formData.append("file", file);
  return await api.post("/api/auth/me/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
}

export async function removeAvatarApi() {
  return await api.delete("/api/auth/me/avatar");
}

export async function getMyProfileApi() {
  return await api.get("/api/auth/me");
}
