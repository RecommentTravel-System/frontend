import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { AppHeader } from "~/shared/components";
import { useTranslation } from "~/providers/i18n-provider";
import AdminDashboardRail from "./AdminDashboardRail";
import {
  getAdminPaymentsApi,
  getAdminPaymentSummaryApi,
  syncPaymentStatusApi,
  getAnalyticsApi,
} from "~/features/analytics/services/analytics-api";

// ─── Format Currency VND ──────────────────────────────────────────────────────
function fmtVND(value) {
  if (!value && value !== 0) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

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
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

// ─── Status Badge Definition ──────────────────────────────────────────────────
const STATUS_CONFIG = {
  PAID: {
    label: "Chuyển tiền thành công",
    shortLabel: "Thành công",
    pillClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    dotClass: "bg-emerald-500",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  SUCCESS: {
    label: "Chuyển tiền thành công",
    shortLabel: "Thành công",
    pillClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    dotClass: "bg-emerald-500",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  FAILED: {
    label: "Chuyển tiền thất bại",
    shortLabel: "Thất bại",
    pillClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    dotClass: "bg-rose-500",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
  },
  PENDING: {
    label: "Đang chờ thanh toán",
    shortLabel: "Đang chờ",
    pillClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    dotClass: "bg-amber-500 animate-pulse",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  CANCELLED: {
    label: "Đã hủy giao dịch",
    shortLabel: "Đã hủy",
    pillClass: "bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    dotClass: "bg-slate-400",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      </svg>
    ),
  },
};

// ─── Mini SVG Chart for Revenue ───────────────────────────────────────────────
function RevenueTrendChart({ data = [], height = 130 }) {
  const W = 640;
  const H = height;
  const PAD = { top: 16, right: 16, bottom: 24, left: 52 };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-28 text-slate-400 text-xs">
        Chưa có dữ liệu biến động
      </div>
    );
  }

  const values = data.map((d) => d.value || 0);
  const maxV = Math.max(...values, 100000);
  const minV = Math.min(...values, 0);
  const range = maxV - minV || 1;

  const xStep = (W - PAD.left - PAD.right) / Math.max(data.length - 1, 1);
  const yScale = (v) => PAD.top + ((maxV - v) / range) * (H - PAD.top - PAD.bottom);

  const points = data.map((d, i) => ({
    x: PAD.left + i * xStep,
    y: yScale(d.value || 0),
    label: d.label,
    value: d.value || 0,
  }));

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPath = [
    `M${points[0].x},${H - PAD.bottom}`,
    ...points.map((p) => `L${p.x},${p.y}`),
    `L${points[points.length - 1].x},${H - PAD.bottom}`,
    "Z",
  ].join(" ");

  const yTicks = [minV, (minV + maxV) / 2, maxV];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} role="img" aria-label="Biểu đồ doanh thu">
      <defs>
        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {yTicks.map((tick, i) => (
        <g key={i}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={yScale(tick)}
            y2={yScale(tick)}
            stroke="#f1f5f9"
            className="dark:stroke-slate-800"
            strokeWidth="1"
            strokeDasharray="4 3"
          />
          <text
            x={PAD.left - 6}
            y={yScale(tick) + 3}
            textAnchor="end"
            fontSize="9"
            className="fill-slate-400 dark:fill-slate-500 font-mono"
          >
            {tick >= 1_000_000 ? `${(tick / 1_000_000).toFixed(1)}M` : tick >= 1000 ? `${Math.round(tick / 1000)}k` : Math.round(tick)}
          </text>
        </g>
      ))}

      {/* Area */}
      <path d={areaPath} fill="url(#revGrad)" />

      {/* Line */}
      <polyline
        points={polyline}
        fill="none"
        stroke="#10b981"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
      ))}

      {/* Labels */}
      {points.map((p, i) => {
        if (data.length > 10 && i % 2 !== 0 && i !== data.length - 1) return null;
        return (
          <text
            key={i}
            x={p.x}
            y={H - 6}
            textAnchor="middle"
            fontSize="9"
            className="fill-slate-400 dark:fill-slate-500 font-medium"
          >
            {p.label}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Main AdminRevenue Component ──────────────────────────────────────────────
export default function AdminRevenue() {
  const { t } = useTranslation();

  // State
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    monthRevenue: 0,
    failedAmount: 0,
    totalCount: 0,
    successCount: 0,
    failedCount: 0,
    cancelledCount: 0,
    pendingCount: 0,
    successRate: 0,
    averageOrderValue: 0,
  });

  const [chartPeriod, setChartPeriod] = useState("month");
  const [chartSeries, setChartSeries] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  // Modal & Toast
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [syncingId, setSyncingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Copy helper
  const [copiedCode, setCopiedCode] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(String(text));
    setCopiedCode(text);
    showToast(`Đã sao chép mã: ${text}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // ─── Fetch Summary & Chart ──────────────────────────────────────────────────
  const fetchSummary = useCallback(async () => {
    try {
      const sumData = await getAdminPaymentSummaryApi();
      if (sumData) {
        setSummary(sumData);
      }
    } catch (err) {
      console.warn("Could not fetch payment summary from BE:", err);
    }
  }, []);

  const fetchChart = useCallback(async (period) => {
    try {
      const res = await getAnalyticsApi(period);
      if (res && res.revenueByPeriod) {
        setChartSeries(res.revenueByPeriod);
      }
    } catch (err) {
      console.warn("Could not fetch analytics chart:", err);
    }
  }, []);

  // ─── Fetch Payments Table ───────────────────────────────────────────────────
  const fetchPayments = useCallback(async () => {
    setLoadingPayments(true);
    try {
      const res = await getAdminPaymentsApi({
        page,
        size: pageSize,
        status: statusFilter,
        search: appliedSearch,
      });

      if (res) {
        setPayments(res.content || []);
        setTotalPages(res.totalPages || 1);
        setTotalElements(res.totalElements || 0);
      }
    } catch (err) {
      console.warn("Could not fetch payments list from BE:", err);
    } finally {
      setLoadingPayments(false);
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, appliedSearch]);

  // Initial load
  useEffect(() => {
    fetchSummary();
    fetchChart(chartPeriod);
  }, [fetchSummary, fetchChart, chartPeriod]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Debounced search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    setAppliedSearch(searchQuery);
  };

  // Sync payment with PayOS
  const handleSyncPayment = async (paymentId) => {
    setSyncingId(paymentId);
    try {
      const updated = await syncPaymentStatusApi(paymentId);
      showToast("Đã đồng bộ trạng thái giao dịch với PayOS!");
      fetchSummary();
      fetchPayments();
      if (selectedPayment && selectedPayment.paymentId === paymentId) {
        setSelectedPayment(updated);
      }
    } catch (err) {
      showToast("Không thể đồng bộ với PayOS. Vui lòng kiểm tra lại kết nối.");
    } finally {
      setSyncingId(null);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!payments.length) {
      showToast("Không có dữ liệu giao dịch để xuất");
      return;
    }

    const headers = [
      "Mã đơn hàng",
      "Mã giao dịch ngân hàng",
      "Khách hàng",
      "Email",
      "Số điện thoại",
      "Gói dịch vụ",
      "Số tiền (VND)",
      "Phương thức",
      "Trạng thái",
      "Thời gian thanh toán",
      "Thời gian tạo",
    ];

    const rows = payments.map((p) => {
      const statusText =
        p.status === "PAID" || p.status === "SUCCESS"
          ? "Thành công"
          : p.status === "FAILED"
            ? "Thất bại"
            : p.status === "PENDING"
              ? "Đang chờ"
              : p.status === "CANCELLED"
                ? "Đã hủy"
                : p.status;

      return [
        `#${p.orderCode || p.paymentId}`,
        p.transactionCode || "",
        `"${p.userFullName || ""}"`,
        p.userEmail || "",
        p.userPhone || "",
        `"${p.planName || ""}"`,
        p.amount || 0,
        p.paymentMethod || "PAYOS",
        statusText,
        p.paidAt ? fmtDateTime(p.paidAt) : "",
        p.createdAt ? fmtDateTime(p.createdAt) : "",
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `BaoCao_DoanhThu_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Đã tải xuống file báo cáo doanh thu CSV thành công!");
  };

  // Calculated rate
  const successPercent = summary.totalCount > 0 ? ((summary.successCount / summary.totalCount) * 100).toFixed(1) : 0;
  const failurePercent = summary.totalCount > 0 ? (((summary.failedCount + summary.cancelledCount) / summary.totalCount) * 100).toFixed(1) : 0;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <AppHeader />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Rail */}
        <AdminDashboardRail active="revenue" />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* ─── Breadcrumb & Header ─────────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                <span>Admin Portal</span>
                <span>›</span>
                <span className="text-[#00a3e0] font-bold">Báo cáo & Doanh thu</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                <span>Báo Cáo Doanh Thu & Chuyển Tiền</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Theo dõi chi tiết dòng tiền vào, thống kê tỷ lệ chuyển tiền thành công hay thất bại và đối soát giao dịch.
              </p>
            </div>

            {/* Top Action Buttons */}
            <div className="flex items-center gap-2.5 shrink-0">

              <button
                type="button"
                onClick={() => {
                  fetchSummary();
                  fetchChart(chartPeriod);
                  fetchPayments();
                  showToast("Đã làm mới dữ liệu báo cáo!");
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#00a3e0] hover:bg-[#0089bd] text-white shadow-sm transition-all active:scale-95"
                title="Làm mới dữ liệu từ máy chủ"
              >
                <svg className={`w-4 h-4 ${loadingPayments ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                <span>Làm mới</span>
              </button>
            </div>
          </div>

          {/* ─── 4 Top KPI Cards ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Tổng Doanh Thu Thành Công */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Doanh Thu Thực Nhận
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-100 dark:border-emerald-900/50">
                  ₫
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {fmtVND(summary.totalRevenue)}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
                <span>Hôm nay: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{fmtVND(summary.todayRevenue)}</strong></span>
                <span>Tháng này: <strong className="text-slate-700 dark:text-slate-300 font-bold">{fmtVND(summary.monthRevenue)}</strong></span>
              </div>
            </div>

            {/* Card 2: Chuyển tiền thành công */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Chuyển Tiền Thành Công
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                  {fmtNum(summary.successCount)}
                </span>
                <span className="text-xs text-slate-400 font-medium">/ {summary.totalCount} đơn</span>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  <span>Tỷ lệ thành công</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{successPercent}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, summary.successRate || 0))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Card 3: Chuyển tiền thất bại / Hủy */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-rose-300 dark:hover:border-rose-700/60 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Chuyển Tiền Thất Bại / Hủy
                </span>
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-900/50">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                  {fmtNum(summary.failedCount + summary.cancelledCount)}
                </span>
                <span className="text-xs text-slate-400 font-medium">giao dịch</span>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  <span>Tỷ lệ rớt: <strong className="text-rose-600 dark:text-rose-400">{failurePercent}%</strong></span>
                  <span>Mất: <strong className="text-rose-600 dark:text-rose-400">{fmtVND(summary.failedAmount)}</strong></span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, failurePercent))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Card 4: Đang chờ thanh toán */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-amber-300 dark:hover:border-amber-700/60 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Đang Chờ Quét Mã QR
                </span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/50">
                  <svg className="w-5 h-5 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                  {fmtNum(summary.pendingCount)}
                </span>
                <span className="text-xs text-slate-400 font-medium">chờ thanh toán</span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
                <span>Giá trị đơn TB (AOV):</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{fmtVND(summary.averageOrderValue)}</span>
              </div>
            </div>
          </div>

          {/* ─── Visual Charts & Status Breakdown ────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Chart: Doanh thu theo thời gian */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Biểu Đồ Doanh Thu Thành Công</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
                      VND
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Xu hướng tiền vào theo chu kỳ thời gian</p>
                </div>
                <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl text-xs font-semibold">
                  {["day", "week", "month"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setChartPeriod(p)}
                      className={`px-3 py-1 rounded-lg transition-all ${chartPeriod === p
                        ? "bg-white dark:bg-[#00a3e0] text-slate-900 dark:text-white shadow-xs font-bold"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                        }`}
                    >
                      {p === "day" ? "Theo ngày" : p === "week" ? "Theo tuần" : "Theo tháng"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-2">
                <RevenueTrendChart data={chartSeries} height={150} />
              </div>
            </div>

            {/* Card: Phân tích Trạng Thái Chuyển Tiền */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Tỷ Lệ Chuyển Tiền
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Phân bổ chất lượng giao dịch thanh toán</p>

                {/* Segmented bar */}
                <div className="mt-4 mb-4">
                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                    <div
                      className="bg-emerald-500 transition-all duration-500"
                      style={{ width: `${summary.totalCount ? (summary.successCount / summary.totalCount) * 100 : 0}%` }}
                      title={`Thành công: ${summary.successCount} đơn`}
                    />
                    <div
                      className="bg-rose-500 transition-all duration-500"
                      style={{ width: `${summary.totalCount ? (summary.failedCount / summary.totalCount) * 100 : 0}%` }}
                      title={`Thất bại: ${summary.failedCount} đơn`}
                    />
                    <div
                      className="bg-amber-500 transition-all duration-500"
                      style={{ width: `${summary.totalCount ? (summary.pendingCount / summary.totalCount) * 100 : 0}%` }}
                      title={`Đang chờ: ${summary.pendingCount} đơn`}
                    />
                    <div
                      className="bg-slate-400 transition-all duration-500"
                      style={{ width: `${summary.totalCount ? (summary.cancelledCount / summary.totalCount) * 100 : 0}%` }}
                      title={`Đã hủy: ${summary.cancelledCount} đơn`}
                    />
                  </div>
                </div>

                {/* List Breakdown */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Chuyển tiền thành công</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">{summary.successCount} đơn</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">({successPercent}%)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Chuyển tiền thất bại</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-rose-700 dark:text-rose-400">{summary.failedCount} đơn</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">
                        ({summary.totalCount ? ((summary.failedCount / summary.totalCount) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Đang chờ quét QR</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-amber-700 dark:text-amber-400">{summary.pendingCount} đơn</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">
                        ({summary.totalCount ? ((summary.pendingCount / summary.totalCount) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Khách đã hủy</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-600 dark:text-slate-400">{summary.cancelledCount} đơn</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">
                        ({summary.totalCount ? ((summary.cancelledCount / summary.totalCount) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Detailed Transactions Report Table ─────────────────────────── */}
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Table Header Controls */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Lịch Sử Giao Dịch Chuyển Tiền</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {totalElements} bản ghi
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Toàn bộ lịch sử nạp gói & giao dịch chuyển tiền qua cổng ngân hàng
                  </p>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-72">
                    <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Tìm mã đơn, tên, email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00a3e0]/30 focus:border-[#00a3e0] transition-all"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setAppliedSearch("");
                          setPage(0);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-0.5"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all shrink-0"
                  >
                    Tìm
                  </button>
                </form>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
                {[
                  { id: "ALL", label: "Tất cả", count: summary.totalCount },
                  { id: "PAID", label: "Thành công", count: summary.successCount, dot: "bg-emerald-500" },
                  { id: "FAILED", label: "Thất bại", count: summary.failedCount, dot: "bg-rose-500" },
                  { id: "PENDING", label: "Đang chờ", count: summary.pendingCount, dot: "bg-amber-500" },
                  { id: "CANCELLED", label: "Đã hủy", count: summary.cancelledCount, dot: "bg-slate-400" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setStatusFilter(tab.id);
                      setPage(0);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${statusFilter === tab.id
                      ? "bg-[#00a3e0] text-white shadow-xs font-bold"
                      : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                  >
                    {tab.dot && <span className={`w-2 h-2 rounded-full ${tab.dot}`} />}
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === tab.id
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                        }`}
                    >
                      {tab.count || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Mã Đơn / Mã GD</th>
                    <th className="py-3 px-4">Khách Hàng</th>
                    <th className="py-3 px-4">Gói Dịch Vụ</th>
                    <th className="py-3 px-4">Số Tiền</th>
                    <th className="py-3 px-4">Cổng TT</th>
                    <th className="py-3 px-4">Trạng Thái Chuyển Tiền</th>
                    <th className="py-3 px-4">Thời Gian</th>
                    <th className="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {loadingPayments ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <svg className="w-6 h-6 animate-spin text-[#00a3e0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="23 4 23 10 17 10" />
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                          </svg>
                          <span>Đang tải danh sách giao dịch...</span>
                        </div>
                      </td>
                    </tr>
                  ) : payments.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xl">
                            🧾
                          </div>
                          <span className="font-semibold text-slate-600 dark:text-slate-300">Không tìm thấy giao dịch nào</span>
                          <span className="text-xs text-slate-400">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => {
                      const cfg = STATUS_CONFIG[p.status] || {
                        label: p.status,
                        shortLabel: p.status,
                        pillClass: "bg-slate-100 text-slate-700 border-slate-200",
                        dotClass: "bg-slate-400",
                        icon: null,
                      };

                      const isSuccess = p.status === "PAID" || p.status === "SUCCESS";
                      const isFailed = p.status === "FAILED";
                      const isPending = p.status === "PENDING";

                      return (
                        <tr
                          key={p.paymentId}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                        >
                          {/* Order Code */}
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                            <div className="flex items-center gap-1.5">
                              <span>#{p.orderCode || p.paymentId}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(p.orderCode || p.paymentId)}
                                className="text-slate-400 hover:text-[#00a3e0] transition-colors p-0.5 rounded"
                                title="Sao chép mã đơn"
                              >
                                {copiedCode === (p.orderCode || p.paymentId) ? (
                                  <span className="text-emerald-500 font-bold text-[10px]">✓</span>
                                ) : (
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                  </svg>
                                )}
                              </button>
                            </div>
                            {p.transactionCode && (
                              <div className="text-[10px] text-slate-400 font-normal">
                                GD: {p.transactionCode}
                              </div>
                            )}
                          </td>

                          {/* Customer */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-950/70 text-[#00a3e0] font-bold text-xs flex items-center justify-center shrink-0 border border-sky-200 dark:border-sky-800/60 overflow-hidden relative">
                                {p.userAvatarUrl ? (
                                  <img
                                    src={p.userAvatarUrl}
                                    alt=""
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                    className="w-full h-full object-cover"
                                  />
                                ) : null}
                                <span className={p.userAvatarUrl ? "absolute inset-0 flex items-center justify-center -z-10" : ""}>
                                  {(p.userFullName || "U").slice(0, 1).toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[130px]">
                                  {p.userFullName || "Khách vãng lai"}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate max-w-[130px]">
                                  {p.userEmail || "—"}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Plan */}
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-sky-50 dark:bg-sky-950/50 text-[#00a3e0] border border-sky-200 dark:border-sky-900/60">
                              {p.planName || "Gói Premium"}
                            </span>
                          </td>

                          {/* Amount */}
                          <td className="py-3.5 px-4 font-bold">
                            <span
                              className={
                                isSuccess
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : isFailed
                                    ? "text-rose-500 line-through"
                                    : "text-slate-800 dark:text-slate-200"
                              }
                            >
                              {fmtVND(p.amount)}
                            </span>
                          </td>

                          {/* Method */}
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              {p.paymentMethod || "PAYOS"}
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.pillClass}`}
                            >
                              <span className={`w-2 h-2 rounded-full ${cfg.dotClass}`} />
                              <span>{cfg.label}</span>
                            </span>
                          </td>

                          {/* Time */}
                          <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px]">
                            {fmtDateTime(p.paidAt || p.createdAt)}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {isPending && (
                                <button
                                  type="button"
                                  onClick={() => handleSyncPayment(p.paymentId)}
                                  disabled={syncingId === p.paymentId}
                                  className="p-1.5 text-xs rounded-lg border border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors disabled:opacity-50"
                                  title="Đồng bộ ngay với PayOS xem tiền đã vào chưa"
                                >
                                  {syncingId === p.paymentId ? (
                                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                      <polyline points="23 4 23 10 17 10" />
                                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                                    </svg>
                                  ) : (
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <polyline points="23 4 23 10 17 10" />
                                      <polyline points="1 20 1 14 7 14" />
                                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                                    </svg>
                                  )}
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => setSelectedPayment(p)}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all active:scale-95"
                              >
                                Chi tiết
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>Hiển thị</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(0);
                  }}
                  className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>trên tổng số <strong>{totalElements}</strong> giao dịch</span>
              </div>

              <div className="flex items-center gap-1 self-center sm:self-auto">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                  disabled={page === 0}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                >
                  Trước
                </button>
                <span className="px-3 py-1.5 font-bold text-slate-800 dark:text-slate-200">
                  Trang {page + 1} / {totalPages || 1}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ─── Detail Invoice Modal ───────────────────────────────────────────── */}
      {selectedPayment && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedPayment(null)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 relative overflow-hidden space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#00a3e0] mb-0.5">
                  HÓA ĐƠN GIAO DỊCH
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Mã đơn #{selectedPayment.orderCode || selectedPayment.paymentId}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all"
              >
                ✕
              </button>
            </div>

            {/* Status Highlight Banner */}
            {(() => {
              const cfg = STATUS_CONFIG[selectedPayment.status] || STATUS_CONFIG.PENDING;
              const isPaid = selectedPayment.status === "PAID" || selectedPayment.status === "SUCCESS";
              const isFailed = selectedPayment.status === "FAILED";

              return (
                <div
                  className={`p-4 rounded-2xl border flex items-center gap-3.5 ${isPaid
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                    : isFailed
                      ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200"
                      : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200"
                    }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isPaid
                      ? "bg-emerald-500 text-white"
                      : isFailed
                        ? "bg-rose-500 text-white"
                        : "bg-amber-500 text-white"
                      }`}
                  >
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-extrabold text-sm">{cfg.label}</div>
                    <div className="text-xs opacity-85 mt-0.5">
                      {isPaid
                        ? "Tiền đã được chuyển vào tài khoản hệ thống và gói đã được kích hoạt thành công."
                        : isFailed
                          ? "Giao dịch không thành công hoặc người dùng đã hủy trước khi thanh toán."
                          : "Giao dịch đang chờ khách hàng quét mã QR qua ngân hàng."}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Details Grid */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Số tiền chuyển</span>
                <span className="text-base font-black text-slate-900 dark:text-white">
                  {fmtVND(selectedPayment.amount)}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Gói thuê bao</span>
                <span className="font-bold text-[#00a3e0]">{selectedPayment.planName || "Gói Cá Nhân"}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Khách hàng</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedPayment.userFullName || "Khách vãng lai"}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Email khách hàng</span>
                <span className="font-mono text-slate-600 dark:text-slate-300">
                  {selectedPayment.userEmail || "—"}
                </span>
              </div>

              {selectedPayment.userPhone && (
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Số điện thoại</span>
                  <span className="font-mono text-slate-600 dark:text-slate-300">
                    {selectedPayment.userPhone}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Mã giao dịch ngân hàng</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {selectedPayment.transactionCode || "Chưa có"}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Phương thức thanh toán</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {selectedPayment.paymentMethod || "payOS"} (QR Code Ngân Hàng)
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Thời gian tạo đơn</span>
                <span className="text-slate-600 dark:text-slate-300">
                  {fmtDateTime(selectedPayment.createdAt)}
                </span>
              </div>

              {selectedPayment.paidAt && (
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Thời gian tiền vào (Paid At)</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {fmtDateTime(selectedPayment.paidAt)}
                  </span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              {selectedPayment.status === "PENDING" ? (
                <button
                  type="button"
                  onClick={() => handleSyncPayment(selectedPayment.paymentId)}
                  disabled={syncingId === selectedPayment.paymentId}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-all flex items-center gap-2"
                >
                  <svg className={`w-3.5 h-3.5 ${syncingId === selectedPayment.paymentId ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                  <span>Đồng bộ PayOS ngay</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 transition-all active:scale-95"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Toast Feedback ─────────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-xl border border-slate-700 dark:border-slate-200 flex items-center gap-2.5 animate-slide-up">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
