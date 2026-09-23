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
