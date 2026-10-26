import { api } from "~/shared/lib/api";

/**
 * Fetch analytics data from the backend.
 * @param {"day"|"week"|"month"} period - The grouping period for chart data
 * @returns {Promise<AnalyticsSummaryResponse>}
 */
export async function getAnalyticsApi(period = "month") {
  const result = await api.get(`/api/admin/analytics?period=${period}`);
  return result.data;
}

/**
 * Fetch paginated list of all payments with optional status and search filters (Admin).
 */
export async function getAdminPaymentsApi({ page = 0, size = 10, status, search } = {}) {
  const params = new URLSearchParams();
  params.append("page", page);
  params.append("size", size);
  if (status && status !== "ALL") params.append("status", status);
  if (search && search.trim()) params.append("search", search.trim());

  const result = await api.get(`/api/admin/payments?${params.toString()}`);
  return result.data;
}

/**
 * Fetch revenue & transaction summary statistics (Admin).
 */
export async function getAdminPaymentSummaryApi() {
  const result = await api.get(`/api/admin/payments/summary`);
  return result.data;
}

/**
 * Force sync payment status directly with payOS.
 */
export async function syncPaymentStatusApi(paymentId) {
  const result = await api.post(`/api/admin/payments/${paymentId}/sync`);
  return result.data;
}

