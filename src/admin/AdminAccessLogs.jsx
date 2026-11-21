import { useState, useEffect, useMemo, useCallback } from "react";
import { AppHeader } from "~/shared/components";
import { useTranslation } from "~/providers/i18n-provider";
import AdminDashboardRail from "./AdminDashboardRail";
import {
  getAdminAccessLogsApi,
  getAdminTrafficStatsApi,
  deleteAccessLogApi,
} from "~/shared/services/access-log-api";

// ─── Format Helpers ────────────────────────────────────────────────────────────
function fmtNum(n) {
  if (!n && n !== 0) return "0";
  return new Intl.NumberFormat("vi-VN").format(n);
}

function fmtDateTime(isoString) {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function fmtDateShort(isoString) {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    return `${d.getDate()}/${d.getMonth() + 1}`;
  } catch {
    return "";
  }
}

// ─── SVG Traffic Area & Line Chart ───────────────────────────────────────────
function TrafficAreaChart({ data = [], height = 180 }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const W = 720;
  const H = height;
  const PAD = { top: 20, right: 24, bottom: 28, left: 44 };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-44 text-slate-400 text-xs">
        Chưa có dữ liệu lưu lượng truy cập
      </div>
    );
  }

  const visits = data.map((d) => d.visits || 0);
  const visitors = data.map((d) => d.uniqueVisitors || 0);
  const maxV = Math.max(...visits, ...visitors, 10);
  const range = maxV || 1;

  const xStep = (W - PAD.left - PAD.right) / Math.max(data.length - 1, 1);
  const yScale = (v) => PAD.top + ((maxV - v) / range) * (H - PAD.top - PAD.bottom);

  const pointsVisits = data.map((d, i) => ({
    x: PAD.left + i * xStep,
    y: yScale(d.visits || 0),
    data: d,
  }));

  const pointsVisitors = data.map((d, i) => ({
    x: PAD.left + i * xStep,
    y: yScale(d.uniqueVisitors || 0),
    data: d,
  }));

  const visitsPolyline = pointsVisits.map((p) => `${p.x},${p.y}`).join(" ");
  const visitorsPolyline = pointsVisitors.map((p) => `${p.x},${p.y}`).join(" ");

  const visitsArea = [
    `M${pointsVisits[0].x},${H - PAD.bottom}`,
    ...pointsVisits.map((p) => `L${p.x},${p.y}`),
    `L${pointsVisits[pointsVisits.length - 1].x},${H - PAD.bottom}`,
    "Z",
  ].join(" ");

  const yTicks = [0, Math.round(maxV / 2), maxV];

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full overflow-visible"
        style={{ height }}
        role="img"
        aria-label="Biểu đồ lưu lượng truy cập"
      >
        <defs>
          <linearGradient id="visitsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {yTicks.map((tick, i) => {
          const y = yScale(tick);
          return (
            <g key={i}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y}
                y2={y}
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
                strokeWidth="1"
                strokeDasharray={i === 0 ? "none" : "3,3"}
              />
              <text
                x={PAD.left - 8}
                y={y + 3}
                textAnchor="end"
                className="text-[10px] fill-slate-400 dark:fill-slate-500 font-mono"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* X axis labels */}
        {data.map((d, i) => {
          // Show every 2nd or 3rd label if too many items
          const showLabel = data.length <= 14 || i % Math.ceil(data.length / 10) === 0 || i === data.length - 1;
          if (!showLabel) return null;
          const x = PAD.left + i * xStep;
          return (
            <text
              key={i}
              x={x}
              y={H - PAD.bottom + 16}
              textAnchor="middle"
              className="text-[10px] fill-slate-400 dark:fill-slate-500 font-mono"
            >
              {fmtDateShort(d.date) || d.date}
            </text>
          );
        })}

        {/* Visits Area & Line */}
        <path d={visitsArea} fill="url(#visitsGrad)" />
        <polyline
          points={visitsPolyline}
          fill="none"
          stroke="#0284c7"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Visitors Line */}
        <polyline
          points={visitorsPolyline}
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeDasharray="4,4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points & interaction */}
        {pointsVisits.map((p, i) => (
          <g key={i} className="cursor-pointer">
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredPoint === i ? 5 : 3}
              fill="#0284c7"
              stroke="#ffffff"
              strokeWidth="2"
              className="transition-all duration-150"
            />
            <circle
              cx={pointsVisitors[i].x}
              cy={pointsVisitors[i].y}
              r={hoveredPoint === i ? 4 : 2.5}
              fill="#10b981"
              stroke="#ffffff"
              strokeWidth="1.5"
              className="transition-all duration-150"
            />
            {/* Transparent hover target */}
            <rect
              x={p.x - xStep / 2}
              y={PAD.top}
              width={xStep}
              height={H - PAD.top - PAD.bottom}
              fill="transparent"
              onMouseEnter={() => setHoveredPoint(i)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          </g>
        ))}
      </svg>

      {/* Floating Tooltip */}
      {hoveredPoint !== null && pointsVisits[hoveredPoint] && (
        <div
          className="absolute z-10 pointer-events-none transform -translate-x-1/2 -translate-y-full bg-slate-900/95 dark:bg-slate-800 text-white rounded-lg shadow-xl px-3 py-2 text-xs border border-slate-700 backdrop-blur-sm transition-all"
          style={{
            left: `${(pointsVisits[hoveredPoint].x / W) * 100}%`,
            top: `${(pointsVisits[hoveredPoint].y / H) * 100}%`,
            marginTop: "-8px",
          }}
        >
          <div className="font-semibold text-slate-300 pb-1 border-b border-slate-700/60 mb-1">
            {pointsVisits[hoveredPoint].data.date}
          </div>
          <div className="flex items-center gap-2 text-sky-300">
            <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
            <span>Lượt truy cập:</span>
            <span className="font-bold text-white">
              {fmtNum(pointsVisits[hoveredPoint].data.visits)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-emerald-300 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span>Khách duy nhất:</span>
            <span className="font-bold text-white">
              {fmtNum(pointsVisits[hoveredPoint].data.uniqueVisitors)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Device Icon Helper ────────────────────────────────────────────────────────
function DeviceIcon({ device = "" }) {
  const d = String(device).toLowerCase();
  if (d.includes("mobile") || d.includes("phone")) {
    return (
      <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    );
  }
  if (d.includes("tablet") || d.includes("ipad")) {
    return (
      <svg className="w-4 h-4 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

// ─── Main AdminAccessLogs Component ───────────────────────────────────────────
export default function AdminAccessLogs() {
  const { t } = useTranslation();

  // State: Filter & Pagination
  const [period, setPeriod] = useState("month");
  const [page, setPage] = useState(0);
  const [pageSize] = useState(15);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // State: Data
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Traffic Summary Stats
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await getAdminTrafficStatsApi({ period });
      if (res && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.warn("Could not fetch traffic stats from BE:", err);
    } finally {
      setLoadingStats(false);
    }
  }, [period]);

  // Fetch Access Logs List
  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const res = await getAdminAccessLogsApi({
        page,
        size: pageSize,
        keyword: appliedKeyword,
        deviceType: deviceFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      if (res && res.data) {
        setLogs(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      console.warn("Could not fetch access logs from BE:", err);
    } finally {
      setLoadingLogs(false);
    }
  }, [page, pageSize, appliedKeyword, deviceFilter, startDate, endDate]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Handle Search Submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    setAppliedKeyword(searchKeyword.trim());
  };

  // Handle Delete Log
  const handleDeleteLog = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bản ghi nhật ký truy cập này không?")) return;
    try {
      await deleteAccessLogApi(id);
      showToast("Đã xóa bản ghi nhật ký truy cập thành công!");
      fetchLogs();
      fetchStats();
      if (selectedLog && selectedLog.id === id) {
        setSelectedLog(null);
      }
    } catch (err) {
      showToast("Không thể xóa bản ghi: " + (err.message || "Lỗi hệ thống"));
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!logs || logs.length === 0) {
      showToast("Không có dữ liệu để xuất file CSV!");
      return;
    }

    const headers = [
      "ID",
      "Thời gian",
      "Địa chỉ IP",
      "Đường dẫn (Path)",
      "Tiêu đề trang",
      "Thiết bị",
      "Trình duyệt",
      "Hệ điều hành",
      "Người dùng",
      "Email",
      "Mã HTTP",
    ];

    const rows = logs.map((log) => [
      log.id,
      `"${fmtDateTime(log.createdAt)}"`,
      `"${log.ipAddress || ""}"`,
      `"${log.path || ""}"`,
      `"${(log.pageTitle || "").replace(/"/g, '""')}"`,
      `"${log.deviceType || ""}"`,
      `"${log.browser || ""}"`,
      `"${log.operatingSystem || ""}"`,
      `"${log.userFullName || "Khách vãng lai"}"`,
      `"${log.userEmail || ""}"`,
      log.statusCode || 200,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `LichSuTruyCap_Wayvee_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Đã xuất file báo cáo lưu lượng truy cập CSV thành công!");
  };

  // Calculate percentages for device breakdown
  const totalDeviceVisits = useMemo(() => {
    if (!stats || !stats.deviceCounts) return 0;
    return Object.values(stats.deviceCounts).reduce((acc, c) => acc + c, 0);
  }, [stats]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <AppHeader />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Rail */}
        <AdminDashboardRail active="access-logs" />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* ─── Breadcrumb & Header ─────────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                <span>Admin Portal</span>
                <span>›</span>
                <span className="text-[#00a3e0] font-bold">Lịch sử truy cập</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                <span>Lịch sử & Lưu lượng truy cập</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mr-1.5 animate-pulse" />
                  Real-time Tracking
                </span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Giám sát lưu lượng người dùng, phân tích thiết bị, trang được xem nhiều nhất và lịch sử các phiên truy cập.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  fetchStats();
                  fetchLogs();
                  showToast("Đã làm mới dữ liệu lịch sử truy cập!");
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-sm"
                title="Làm mới dữ liệu"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 4v6h-6" />
                  <path d="M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                <span>Làm mới</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#00a3e0] hover:bg-[#0092c8] rounded-lg transition-colors shadow-sm shadow-sky-500/20"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Xuất CSV</span>
              </button>
            </div>
          </div>

          {/* ─── KPI Cards ───────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Today Visits */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Lượt truy cập hôm nay</span>
                <span className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {fmtNum(stats?.todayVisits ?? 0)}
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
                  ↑ Hôm nay
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Lượt xem trang được ghi nhận từ 00:00
              </p>
            </div>

            {/* Unique Visitors */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Khách truy cập duy nhất</span>
                <span className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {fmtNum(stats?.uniqueVisitors ?? 0)}
                </span>
                <span className="text-xs text-sky-600 dark:text-sky-400 font-medium">
                  IPs phân biệt
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Được lọc theo địa chỉ IP thực tế
              </p>
            </div>

            {/* Total Page Views */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tổng số lượt xem</span>
                <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {fmtNum(stats?.totalVisits ?? totalElements)}
                </span>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                  Lượt xem tích lũy
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Toàn bộ các tuyến đường và hành trình
              </p>
            </div>

            {/* Top Device */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Thiết bị chủ yếu</span>
                <span className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats?.topDevice || "Desktop"}
                </span>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                  {totalDeviceVisits > 0 && stats?.deviceCounts?.[stats?.topDevice]
                    ? `${Math.round((stats.deviceCounts[stats.topDevice] / totalDeviceVisits) * 100)}%`
                    : "—"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Nền tảng người dùng truy cập nhiều nhất
              </p>
            </div>
          </div>

          {/* ─── Traffic Visual Chart & Top Pages Grid ──────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Traffic Trend Chart (Span 2) */}
            <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Biểu đồ lưu lượng truy cập theo ngày
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Tương quan giữa tổng lượt xem trang và số lượng khách truy cập duy nhất
                    </p>
                  </div>

                  {/* Period Switcher */}
                  <div className="inline-flex items-center p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium">
                    {[
                      { id: "week", label: "7 ngày qua" },
                      { id: "month", label: "30 ngày qua" },
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setPeriod(btn.id)}
                        className={`px-3 py-1 rounded-md transition-all ${
                          period === btn.id
                            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-6 mt-4 mb-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-sky-500 inline-block" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Lượt truy cập (Page Views)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-1 rounded-full bg-emerald-500 inline-block border-b-2 border-emerald-500" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Khách duy nhất (Unique Visitors)</span>
                  </div>
                </div>

                {/* Chart Graphic */}
                <div className="mt-2">
                  <TrafficAreaChart data={stats?.dailyTraffic || []} height={190} />
                </div>
              </div>
            </div>

            {/* Top Visited Pages & Device Distribution */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                  Trang được truy cập nhiều nhất
                </h3>

                <div className="mt-4 space-y-3.5">
                  {(!stats?.topPages || stats.topPages.length === 0) ? (
                    <div className="text-center py-8 text-xs text-slate-400">
                      Chưa có thống kê trang
                    </div>
                  ) : (
                    stats.topPages.slice(0, 5).map((pageItem, idx) => {
                      const maxPageCount = Math.max(...stats.topPages.map((p) => p.count), 1);
                      const percent = Math.round((pageItem.count / maxPageCount) * 100);

                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[190px]" title={pageItem.path}>
                              {pageItem.path === "/" ? "Trang chủ (/)" : pageItem.path}
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {fmtNum(pageItem.count)} <span className="text-[10px] text-slate-400 font-normal">lượt</span>
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-sky-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Device breakdown chips */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  Phân bố thiết bị
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {["Desktop", "Mobile", "Tablet"].map((dev) => {
                    const count = stats?.deviceCounts?.[dev] || 0;
                    const pct = totalDeviceVisits > 0 ? Math.round((count / totalDeviceVisits) * 100) : 0;
                    return (
                      <div
                        key={dev}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750 text-center"
                      >
                        <div className="flex justify-center mb-1">
                          <DeviceIcon device={dev} />
                        </div>
                        <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                          {dev}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {pct}% ({count})
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ─── Detailed Access Logs Table ─────────────────────────────────── */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Nhật ký chi tiết các phiên truy cập
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tìm kiếm và theo dõi chi tiết từng request, địa chỉ IP, URL, thiết bị và thời gian truy cập
                </p>
              </div>

              {/* Filter controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="Tìm theo IP, đường dẫn, người dùng..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00a3e0]"
                  />
                  <svg
                    className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </form>

                {/* Device Type Select */}
                <select
                  value={deviceFilter}
                  onChange={(e) => {
                    setDeviceFilter(e.target.value);
                    setPage(0);
                  }}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00a3e0]"
                >
                  <option value="">Tất cả thiết bị</option>
                  <option value="Desktop">Desktop</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Tablet">Tablet</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Thời gian</th>
                    <th className="px-4 py-3">Địa chỉ IP</th>
                    <th className="px-4 py-3">Trang truy cập</th>
                    <th className="px-4 py-3">Thiết bị & Nền tảng</th>
                    <th className="px-4 py-3">Người dùng</th>
                    <th className="px-4 py-3 text-center">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {loadingLogs ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                        <div className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4 animate-spin text-[#00a3e0]" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span>Đang tải nhật ký truy cập...</span>
                        </div>
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                        Không tìm thấy bản ghi truy cập nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr
                        key={log.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Timestamp */}
                        <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {fmtDateTime(log.createdAt)}
                        </td>

                        {/* IP Address */}
                        <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300 font-medium">
                          {log.ipAddress || "127.0.0.1"}
                        </td>

                        {/* Path & Title */}
                        <td className="px-4 py-3 max-w-xs truncate">
                          <div className="font-semibold text-slate-900 dark:text-slate-100 font-mono text-[11px]">
                            {log.path || "/"}
                          </div>
                          {log.pageTitle && (
                            <div className="text-[11px] text-slate-400 truncate">
                              {log.pageTitle}
                            </div>
                          )}
                        </td>

                        {/* Device & OS */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <DeviceIcon device={log.deviceType} />
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {log.deviceType || "Desktop"}
                            </span>
                            <span className="text-slate-400 text-[10px]">
                              ({log.browser || "Chrome"} • {log.operatingSystem || "Windows"})
                            </span>
                          </div>
                        </td>

                        {/* User / Anonymous */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {log.userFullName || log.userEmail ? (
                            <div>
                              <div className="font-semibold text-sky-600 dark:text-sky-400">
                                {log.userFullName || "Thành viên"}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {log.userEmail}
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              Khách vãng lai
                            </span>
                          )}
                        </td>

                        {/* Status Code */}
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-mono">
                            {log.statusCode || 200} OK
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => setSelectedLog(log)}
                              className="p-1 rounded text-slate-500 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
                              title="Xem chi tiết"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteLog(log.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Xóa bản ghi"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Hiển thị trang <span className="font-semibold text-slate-900 dark:text-white">{page + 1}</span> /{" "}
                <span className="font-semibold text-slate-900 dark:text-white">{totalPages}</span> (Tổng cộng{" "}
                <span className="font-semibold text-slate-900 dark:text-white">{fmtNum(totalElements)}</span> bản ghi)
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(p - 1, 0))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-750 font-medium transition-colors"
                >
                  Trang trước
                </button>
                <button
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-750 font-medium transition-colors"
                >
                  Trang tiếp
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ─── Detail Modal ────────────────────────────────────────────────────── */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                  <DeviceIcon device={selectedLog.deviceType} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Chi tiết phiên truy cập #{selectedLog.id}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono">
                    {fmtDateTime(selectedLog.createdAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400 block mb-1">Địa chỉ IP</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {selectedLog.ipAddress || "127.0.0.1"}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400 block mb-1">Mã trạng thái</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedLog.statusCode || 200} OK
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 space-y-2">
                <div>
                  <span className="text-slate-400 block mb-0.5">URL Truy cập</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white break-all">
                    {selectedLog.path || "/"}
                  </span>
                </div>
                {selectedLog.pageTitle && (
                  <div>
                    <span className="text-slate-400 block mb-0.5">Tiêu đề trang</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {selectedLog.pageTitle}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Thiết bị:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedLog.deviceType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Trình duyệt:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedLog.browser}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Hệ điều hành:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedLog.operatingSystem}</span>
                </div>
                {selectedLog.userEmail && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400">Tài khoản:</span>
                    <span className="font-semibold text-sky-600 dark:text-sky-400">
                      {selectedLog.userFullName} ({selectedLog.userEmail})
                    </span>
                  </div>
                )}
              </div>

              {selectedLog.userAgent && (
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400 block mb-1">User Agent Header</span>
                  <p className="font-mono text-[10px] text-slate-600 dark:text-slate-400 break-all leading-relaxed">
                    {selectedLog.userAgent}
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Toast Feedback ──────────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900/95 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold rounded-xl shadow-xl border border-slate-800 dark:border-slate-200 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <svg className="w-4 h-4 text-emerald-400 dark:text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
