const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/wayvee";

export async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const token = localStorage.getItem("wayvee_token");
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
        result.message || "Phiên đăng nhập đã hết hạn. Hệ thống đã tự động đăng xuất.";
      const error = new Error(errorMessage);
      error.status = response.status;
      error.code = result.code;
      error.response = result;
      error.isUnauthorized = true;
      throw error;
    }

    if (!response.ok || (result.code && result.code !== 1000 && result.code !== 200)) {
      const errorMessage = result.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.code = result.code;
      error.response = result;
      throw error;
    }

    return result;
  } catch (err) {
    if (err.name === "TypeError" && err.message === "Failed to fetch") {
      throw new Error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại backend.");
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

