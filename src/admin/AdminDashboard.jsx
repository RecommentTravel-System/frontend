import { useState, useEffect, useCallback, useRef } from "react";
import { AppHeader, AppFooter } from "~/shared/components";
import AdminDashboardRail from "./AdminDashboardRail";
import { getAnalyticsApi } from "~/features/analytics/services/analytics-api";

// ─── Helper: format VND currency ─────────────────────────────────────────────
function fmtVND(value) {
  if (!value && value !== 0) return "0 ₫";
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} tỷ ₫`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M ₫`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K ₫`;
  return `${value} ₫`;
}

function fmtNum(n) {
  if (!n && n !== 0) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// ─── SVG Line Chart ───────────────────────────────────────────────────────────
function LineChart({ data = [], color = "#00a3e0", label = "", height = 140 }) {
  const W = 600;
  const H = height;
  const PAD = { top: 16, right: 16, bottom: 28, left: 48 };

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
        Chưa có dữ liệu
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const maxV = Math.max(...values, 1);
  const minV = Math.min(...values, 0);
  const range = maxV - minV || 1;

  const xStep = (W - PAD.left - PAD.right) / Math.max(data.length - 1, 1);
  const yScale = (v) => PAD.top + ((maxV - v) / range) * (H - PAD.top - PAD.bottom);

  const points = data.map((d, i) => ({
    x: PAD.left + i * xStep,
    y: yScale(d.value),
    label: d.label,
    value: d.value,
  }));

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPath = [
    `M${points[0].x},${H - PAD.bottom}`,
    ...points.map((p) => `L${p.x},${p.y}`),
    `L${points[points.length - 1].x},${H - PAD.bottom}`,
    "Z",
  ].join(" ");

  // Y-axis labels (3 ticks)
  const yTicks = [minV, (minV + maxV) / 2, maxV];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height }}
      role="img"
      aria-label={label}
    >
      <defs>
        <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTicks.map((tick, i) => (
        <g key={i}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={yScale(tick)}
            y2={yScale(tick)}
            stroke="#e2e8f0"
            strokeWidth="1"
            strokeDasharray="4 3"
          />
          <text
            x={PAD.left - 6}
            y={yScale(tick) + 4}
            textAnchor="end"
            fontSize="9"
            fill="#94a3b8"
          >
            {maxV >= 1_000_000 ? `${(tick / 1_000_000).toFixed(0)}M` : Math.round(tick)}
          </text>
        </g>
      ))}

      {/* Area fill */}
      <path d={areaPath} fill={`url(#grad-${label})`} />

      {/* Line */}
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color} stroke="white" strokeWidth="1.5" />
      ))}

      {/* X-axis labels — show at most 8 */}
      {points
        .filter((_, i) =>
          data.length <= 8 || i % Math.ceil(data.length / 8) === 0
        )
        .map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={H - PAD.bottom + 14}
            textAnchor="middle"
            fontSize="9"
            fill="#94a3b8"
          >
            {p.label}
          </text>
        ))}
    </svg>
  );
}

// ─── SVG Bar Chart ────────────────────────────────────────────────────────────
function BarChart({ data = [], color = "#00a3e0", label = "", height = 140 }) {
  const W = 600;
  const H = height;
  const PAD = { top: 16, right: 16, bottom: 28, left: 48 };

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
        Chưa có dữ liệu
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const maxV = Math.max(...values, 1);
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const barW = Math.max(4, (chartW / data.length) * 0.6);
  const gap = chartW / data.length;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height }}
      role="img"
      aria-label={label}
    >
      {/* Y-axis tick */}
      <text x={PAD.left - 6} y={PAD.top + 4} textAnchor="end" fontSize="9" fill="#94a3b8">
        {maxV >= 1_000_000 ? `${(maxV / 1_000_000).toFixed(0)}M` : Math.round(maxV)}
      </text>
      <text x={PAD.left - 6} y={PAD.top + chartH / 2 + 4} textAnchor="end" fontSize="9" fill="#94a3b8">
        {maxV >= 1_000_000 ? `${(maxV / 2_000_000).toFixed(0)}M` : Math.round(maxV / 2)}
      </text>

      {/* Grid */}
      <line x1={PAD.left} x2={W - PAD.right} y1={PAD.top} y2={PAD.top} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 3" />
      <line x1={PAD.left} x2={W - PAD.right} y1={PAD.top + chartH / 2} y2={PAD.top + chartH / 2} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 3" />

      {data.map((d, i) => {
        const barH = (d.value / maxV) * chartH;
        const x = PAD.left + i * gap + gap / 2 - barW / 2;
        const y = PAD.top + chartH - barH;
        const show = data.length <= 8 || i % Math.ceil(data.length / 8) === 0;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx="3"
              fill={color}
              opacity="0.85"
            />
            {show && (
              <text
                x={x + barW / 2}
                y={H - PAD.bottom + 14}
                textAnchor="middle"
                fontSize="9"
                fill="#94a3b8"
              >
                {d.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, delta, deltaLabel, color, bgColor }) {
  const positive = delta >= 0;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">{label}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgColor}`}>{icon}</div>
      </div>
      <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</div>
      <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold">
        <span
          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${
            positive
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-500"
          }`}
        >
          {positive ? "▲" : "▼"} {Math.abs(delta)}
        </span>
        <span className="text-slate-400 font-normal">{deltaLabel}</span>
      </div>
    </div>
  );
}

// ─── Period Selector ──────────────────────────────────────────────────────────
const PERIODS = [
  { key: "day", label: "Theo ngày" },
  { key: "week", label: "Theo tuần" },
  { key: "month", label: "Theo tháng" },
];

// ─── Main AdminDashboard Component ───────────────────────────────────────────
export default function AdminDashboard() {
  const [period, setPeriod] = useState("month");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async (p) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAnalyticsApi(p);
      setAnalytics(data);
    } catch (err) {
      setError(err?.message || "Không thể tải dữ liệu phân tích.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(period);
  }, [period, fetchAnalytics]);

  const periodLabel =
    period === "day" ? "trong 30 ngày qua" : period === "week" ? "trong 12 tuần qua" : "trong 12 tháng qua";

  const revenueData = analytics?.revenueByPeriod || [];
  const usersData = analytics?.usersByPeriod || [];
  const tripsData = analytics?.tripsByPeriod || [];

  return (
    <div className="bg-[#f8fafc] min-h-screen text-slate-800 flex flex-col font-sans">
      <AppHeader />

      <div className="flex flex-1 relative">
        <AdminDashboardRail active="overview" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1550px] w-full mx-auto space-y-6">
          {/* ── Page Header ── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                <span>Admin Portal</span>
                <span className="text-slate-400">›</span>
                <span className="text-[#00a3e0]">Dashboard Tổng quan</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002d54] tracking-tight">
                Tổng quan Hệ thống
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Phân tích dữ liệu người dùng, chuyến đi và doanh thu — cập nhật theo thời gian thực từ CSDL.
              </p>
            </div>

            {/* Period Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 hidden sm:block">Xem theo:</span>
              <div className="flex bg-white border border-slate-200 rounded-xl p-0.5 shadow-sm" role="group" aria-label="Bộ lọc khoảng thời gian">
                {PERIODS.map((p) => (
                  <button
                    key={p.key}
                    id={`period-btn-${p.key}`}
                    type="button"
                    onClick={() => setPeriod(p.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      period === p.key
                        ? "bg-[#00a3e0] text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <button
                id="dashboard-refresh-btn"
                type="button"
                onClick={() => fetchAnalytics(period)}
                title="Làm mới dữ liệu"
                className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-[#00a3e0] hover:border-[#00a3e0] transition-all cursor-pointer shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M8 16H3v5" />
                </svg>
              </button>
            </div>
          </div>

          {/* ── Error Banner ── */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* ── Skeleton or KPI Cards ── */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
                  <div className="h-3 bg-slate-100 rounded w-1/2 mb-4" />
                  <div className="h-7 bg-slate-100 rounded w-2/3 mb-3" />
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <KpiCard
                label="Tổng người dùng"
                value={fmtNum(analytics?.totalUsers)}
                delta={analytics?.newUsersThisPeriod ?? 0}
                deltaLabel={`người mới ${periodLabel}`}
                icon={
                  <svg className="w-5 h-5 text-[#00a3e0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                }
                bgColor="bg-sky-50"
                color="#00a3e0"
              />
              <KpiCard
                label="Tổng chuyến đi"
                value={fmtNum(analytics?.totalTrips)}
                delta={analytics?.newTripsThisPeriod ?? 0}
                deltaLabel={`chuyến mới ${periodLabel}`}
                icon={
                  <svg className="w-5 h-5 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                }
                bgColor="bg-violet-50"
                color="#8b5cf6"
              />
              <KpiCard
                label="Doanh thu"
                value={fmtVND(analytics?.totalRevenue)}
                delta={analytics?.newRevenueThisPeriod > 0 ? "+" + fmtVND(analytics?.newRevenueThisPeriod) : 0}
                deltaLabel={`thu ${periodLabel}`}
                icon={
                  <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                }
                bgColor="bg-emerald-50"
                color="#10b981"
              />
              <KpiCard
                label="Thuê bao đang hoạt động"
                value={fmtNum(analytics?.activeSubscriptions)}
                delta={0}
                deltaLabel="subscription đang hiệu lực"
                icon={
                  <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                }
                bgColor="bg-amber-50"
                color="#f59e0b"
              />
            </div>
          )}

          {/* ── Charts ── */}
          {!loading && !error && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">Doanh thu theo thời gian</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{periodLabel} · chỉ giao dịch SUCCESS</p>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="Live" />
                </div>
                <LineChart
                  data={revenueData}
                  color="#10b981"
                  label="biểu đồ doanh thu"
                  height={160}
                />
                {revenueData.length === 0 && (
                  <p className="text-center text-xs text-slate-400 mt-2">Không có giao dịch trong khoảng thời gian này.</p>
                )}
              </div>

              {/* Users Chart */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">Người dùng mới theo thời gian</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{periodLabel}</p>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" title="Live" />
                </div>
                <LineChart
                  data={usersData}
                  color="#00a3e0"
                  label="biểu đồ người dùng mới"
                  height={160}
                />
                {usersData.length === 0 && (
                  <p className="text-center text-xs text-slate-400 mt-2">Không có người dùng mới trong khoảng thời gian này.</p>
                )}
              </div>

              {/* Trips Chart */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">Chuyến đi được tạo theo thời gian</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{periodLabel}</p>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-pulse" title="Live" />
                </div>
                <BarChart
                  data={tripsData}
                  color="#8b5cf6"
                  label="biểu đồ chuyến đi"
                  height={160}
                />
                {tripsData.length === 0 && (
                  <p className="text-center text-xs text-slate-400 mt-2">Không có chuyến đi mới trong khoảng thời gian này.</p>
                )}
              </div>

              {/* Quick Summary Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h2 className="text-sm font-bold text-slate-800 mb-4">Tóm tắt hoạt động</h2>
                <div className="space-y-3">
                  {[
                    {
                      icon: "👤",
                      label: "Tổng người dùng hệ thống",
                      value: fmtNum(analytics?.totalUsers),
                      color: "text-[#00a3e0]",
                    },
                    {
                      icon: "🗺️",
                      label: "Tổng chuyến đi đã tạo",
                      value: fmtNum(analytics?.totalTrips),
                      color: "text-violet-500",
                    },
                    {
                      icon: "💰",
                      label: "Tổng doanh thu ghi nhận",
                      value: fmtVND(analytics?.totalRevenue),
                      color: "text-emerald-500",
                    },
                    {
                      icon: "⭐",
                      label: "Thuê bao Premium đang hoạt động",
                      value: fmtNum(analytics?.activeSubscriptions),
                      color: "text-amber-500",
                    },
                    {
                      icon: "📈",
                      label: `Người dùng mới (${period === "day" ? "30 ngày" : period === "week" ? "12 tuần" : "12 tháng"})`,
                      value: fmtNum(analytics?.newUsersThisPeriod),
                      color: "text-[#00a3e0]",
                    },
                    {
                      icon: "🚀",
                      label: `Chuyến đi mới (${period === "day" ? "30 ngày" : period === "week" ? "12 tuần" : "12 tháng"})`,
                      value: fmtNum(analytics?.newTripsThisPeriod),
                      color: "text-violet-500",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{item.icon}</span>
                        <span className="text-xs text-slate-600 font-medium">{item.label}</span>
                      </div>
                      <span className={`text-sm font-extrabold ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Loading skeleton for charts */}
          {loading && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
                  <div className="h-3 bg-slate-100 rounded w-1/3 mb-2" />
                  <div className="h-2 bg-slate-100 rounded w-1/4 mb-6" />
                  <div className="h-36 bg-slate-50 rounded-xl" />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <AppFooter />
    </div>
  );
}
