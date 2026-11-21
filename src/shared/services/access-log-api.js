import { api } from "../lib/api.js";

const LOCAL_STORAGE_KEY = "wayvee_access_logs_local";

function getLocalLogs() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalLog(entry) {
  try {
    const current = getLocalLogs();
    const newEntry = {
      ...entry,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    const updated = [newEntry, ...current].slice(0, 100);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return newEntry;
  } catch {
    return entry;
  }
}

/**
 * Record a page visit in the backend access log.
 * @param {{ path: string, pageTitle?: string, referrer?: string, statusCode?: number }} data
 */
export async function recordAccessLogApi(data) {
  try {
    const res = await api.post("/api/access-logs/record", data);
    return res;
  } catch {
    // Non-blocking fallback for dev / offline
    saveLocalLog({
      path: data.path,
      pageTitle: data.pageTitle,
      deviceType: /Mobile|Android|iP(hone|od)/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
      browser: "Chrome",
      operatingSystem: "Windows",
      statusCode: 200,
    });
    return { success: true };
  }
}

/**
 * Get paginated access logs for admin.
 * @param {{ page?: number, size?: number, keyword?: string, deviceType?: string, startDate?: string, endDate?: string }} params
 */
export async function getAdminAccessLogsApi(params = {}) {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set("page", params.page);
  if (params.size !== undefined) query.set("size", params.size);
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.deviceType) query.set("deviceType", params.deviceType);
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);

  const endpoint = `/api/admin/access-logs${query.toString() ? `?${query.toString()}` : ""}`;
  return api.get(endpoint);
}

/**
 * Get aggregated traffic statistics for admin dashboard.
 * @param {{ period?: "day" | "week" | "month" | "year" }} params
 */
export async function getAdminTrafficStatsApi(params = {}) {
  const query = new URLSearchParams();
  if (params.period) query.set("period", params.period);

  const endpoint = `/api/admin/access-logs/stats${query.toString() ? `?${query.toString()}` : ""}`;
  return api.get(endpoint);
}

/**
 * Delete an access log record (Admin only).
 * @param {number|string} id
 */
export async function deleteAccessLogApi(id) {
  return api.delete(`/api/admin/access-logs/${id}`);
}
