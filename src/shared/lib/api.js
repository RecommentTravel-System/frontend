import { getLocalizedErrorMessage, getCurrentLanguage } from "./error-codes";

const BASE_URL = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, "");

export async function request(endpoint, options = {}) {
  if (!BASE_URL) {
    throw new Error("Chưa cấu hình VITE_API_URL. Vui lòng thêm URL backend vào môi trường build và triển khai lại frontend.");
  }
  const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const token = localStorage.getItem("wayvee_token");
  const lang = getCurrentLanguage();
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Accept-Language": lang,
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, {
      ...config,
      body: isFormData || typeof options.body === "string"
        ? options.body
        : options.body == null
          ? undefined
          : JSON.stringify(options.body)
    });
    let result = null;
    try {
      result = await response.json();
    } catch {
      result = {};
    }

    const isAuthEndpoint =
      endpoint.includes("/auth/login") ||
      endpoint.includes("/auth/signup") ||
      endpoint.includes("/auth/verify-email");

    // Check if token expired / unauthenticated on a protected endpoint
    const isUnauthenticated =
      !isAuthEndpoint &&
      (response.status === 401 ||
        result.code === 1006 ||
        result.code === 1007 ||
        (result.message &&
          typeof result.message === "string" &&
          (result.message.toLowerCase().includes("unauthenticated") ||
            result.message.toLowerCase().includes("jwt expired") ||
            result.message.toLowerCase().includes("token expired") ||
            result.message.toLowerCase().includes("hết hạn"))));

    if (isUnauthenticated) {
      if (token) {
        // Clear token and user from localStorage if token was present
        localStorage.removeItem("wayvee_token");
        localStorage.removeItem("wayvee_user");

        // Notify AuthProvider and other listeners
        window.dispatchEvent(
          new CustomEvent("wayvee:unauthorized", {
            detail: { endpoint, status: response.status, result }
          })
        );
      }

      const errorMessage =
        getLocalizedErrorMessage(result, lang) ||
        result.message ||
        (lang === "en"
          ? "Your session has expired. You have been logged out."
          : "Phiên đăng nhập đã hết hạn. Hệ thống đã tự động đăng xuất.");
      const error = new Error(errorMessage);
      error.status = response.status;
      error.code = result.code;
      error.errorCode = result.errorCode;
      error.response = result;
      error.isUnauthorized = true;
      throw error;
    }

    const isLoginEndpoint = endpoint.includes("/auth/login");
    const isEn = (lang || "").toLowerCase().startsWith("en");

    if (!response.ok || (result.code && result.code !== 1000 && result.code !== 200)) {
      let errorMessage = null;
      if (
        isLoginEndpoint &&
        (result.code === 1006 ||
          result.code === 1005 ||
          result.code === 1015 ||
          result.errorCode === "UNAUTHENTICATED" ||
          result.errorCode === "USER_NOT_EXISTED" ||
          result.errorCode === "PASSWORD_INCORRECT")
      ) {
        errorMessage = isEn
          ? "Incorrect username or password."
          : "Tên đăng nhập hoặc mật khẩu không chính xác.";
      } else {
        errorMessage =
          getLocalizedErrorMessage(result, lang) ||
          result.message ||
          `Request failed with status ${response.status}`;
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      error.code = result.code;
      error.errorCode = result.errorCode;
      error.response = result;
      throw error;
    }

    return result;
  } catch (err) {
    if (err.name === "TypeError" && err.message === "Failed to fetch") {
      const isEn = (getCurrentLanguage() || "").startsWith("en");
      throw new Error(
        isEn
          ? "Unable to connect to the server. Please check your network or backend."
          : "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại backend."
      );
    }
    throw err;
  }
}

export const api = {
  get: (endpoint, headers) => request(endpoint, { method: "GET", headers }),
  post: (endpoint, body, headers) =>
    request(endpoint, { method: "POST", body, headers }),
  put: (endpoint, body, headers) =>
    request(endpoint, { method: "PUT", body, headers }),
  patch: (endpoint, body, headers) =>
    request(endpoint, { method: "PATCH", body, headers }),
  delete: (endpoint, headers) => request(endpoint, { method: "DELETE", headers })
};

