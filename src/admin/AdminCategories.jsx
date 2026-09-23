import { useState, useMemo, useEffect } from "react";
import { AppHeader, AppFooter } from "~/shared/components";
import { useTranslation } from "~/providers/i18n-provider";
import AdminDashboardRail from "./AdminDashboardRail";
import {
  getAllCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi
} from "~/features/categories/services/category-api";
import "./AdminCategories.css";

const PRESET_COLORS = [
  { name: "Cyan", hex: "#00A3E0" },
  { name: "Navy", hex: "#003366" },
  { name: "Emerald", hex: "#10B981" },
  { name: "Amber", hex: "#F59E0B" },
  { name: "Purple", hex: "#9333EA" }
];

export default function AdminCategories() {
  const { t, currentLanguage } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [hierarchyFilter, setHierarchyFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'grid'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    nameVi: "",
    nameEn: "",
    slug: "",
    icon: "category",
    colorHex: "#00A3E0",
    hierarchy: "parent",
    parentName: "",
    description: "",
    active: true,
    featured: false
  });

  const [notice, setNotice] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getAllCategoriesApi();
      if (res && res.data && Array.isArray(res.data)) {
        const mapped = res.data.map((item, index) => ({
          id: item.categoryId || index + 1,
          categoryId: item.categoryId,
          nameVi: item.name || "",
          nameEn: item.name || "",
          code: item.code || `cat-${index + 1}`,
          slug: item.code ? `/${item.code}` : `/cat-${index + 1}`,
          icon: item.iconUrl || "category",
          iconBg: "bg-sky-500/10 text-[#00a3e0] border-sky-200",
          colorName: "Electric Cyan (#00A3E0)",
          colorHex: "#00A3E0",
          hierarchy: "parent",
          parentName: null,
          placesCount: 0,
          progressPercent: 100,
          active: true,
          featured: false,
          tag: item.osmKey ? `${item.osmKey}=${item.osmValue}` : "WAYVEE",
          tagColor: "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300",
          description: item.description || ""
        }));
        setCategories(mapped);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Load from backend on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const q = query.toLowerCase().trim();
      const matchSearch =
        !q ||
        cat.nameVi.toLowerCase().includes(q) ||
        cat.nameEn.toLowerCase().includes(q) ||
        cat.slug.toLowerCase().includes(q) ||
        (cat.description && cat.description.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && cat.active) ||
        (statusFilter === "inactive" && !cat.active);

      const matchHierarchy =
        hierarchyFilter === "all" ||
        (hierarchyFilter === "parent" && cat.hierarchy === "parent") ||
        (hierarchyFilter === "sub" && cat.hierarchy === "sub");

      return matchSearch && matchStatus && matchHierarchy;
    });
  }, [categories, query, statusFilter, hierarchyFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / pageSize) || 1;
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCategories.slice(start, start + pageSize);
  }, [filteredCategories, currentPage, pageSize]);

  // Open drawer for adding
  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      nameVi: "",
      nameEn: "",
      slug: "",
      icon: "explore",
      colorHex: "#00A3E0",
      hierarchy: "parent",
      parentName: "",
      description: "",
      active: true,
      featured: false
    });
    setDrawerOpen(true);
  };

  // Open drawer for editing
  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      nameVi: cat.nameVi,
      nameEn: cat.nameEn || "",
      slug: cat.slug || `/${cat.code}`,
      icon: cat.icon || "category",
      colorHex: cat.colorHex || "#00A3E0",
      hierarchy: cat.hierarchy || "parent",
      parentName: cat.parentName || "",
      description: cat.description || "",
      active: cat.active ?? true,
      featured: cat.featured ?? false
    });
    setDrawerOpen(true);
  };

  // Toggle active status
  const handleToggleActive = (id) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, active: !cat.active } : cat))
    );
    setNotice(t("adminCategories.statusToggleSuccess", "Đã cập nhật trạng thái hiển thị danh mục!"));
    setTimeout(() => setNotice(""), 3000);
  };

  // Delete category
  const handleDelete = async (cat) => {
    const confirmMsg = t("adminCategories.deleteConfirm", {
      name: currentLanguage === "en" ? cat.nameEn || cat.nameVi : cat.nameVi
    });
    if (window.confirm(confirmMsg)) {
      try {
        const catId = cat.categoryId || cat.id;
        if (catId) {
          await deleteCategoryApi(catId);
        }
        await fetchCategories();
        setNotice(t("adminCategories.deleteSuccess", "Đã xóa danh mục thành công!"));
      } catch (err) {
        console.error("Delete category failed:", err);
        setNotice("Lỗi khi xóa danh mục.");
      }
      setTimeout(() => setNotice(""), 3000);
    }
  };

  // Save drawer form
  const handleSaveDrawer = async (e) => {
    e.preventDefault();
    if (!formData.nameVi.trim() || !formData.slug.trim()) {
      alert("Vui lòng điền đủ tên danh mục và mã slug!");
      return;
    }

    try {
      if (editingCategory) {
        // Update backend
        const catId = editingCategory.categoryId || editingCategory.id;
        if (catId) {
          await updateCategoryApi(catId, {
            name: formData.nameVi,
            code: formData.slug.replace(/^\//, ""),
            description: formData.description,
            iconUrl: formData.icon
          });
        }
      } else {
        // Create backend
        await createCategoryApi({
          name: formData.nameVi,
          code: formData.slug.replace(/^\//, ""),
          description: formData.description,
          iconUrl: formData.icon
        });
      }
      await fetchCategories();
      setDrawerOpen(false);
      setNotice(t("adminCategories.saveSuccess", "Đã lưu thông tin danh mục thành công!"));
    } catch (err) {
      console.error("Save category failed:", err);
      setNotice("Lỗi khi lưu danh mục.");
    }
    setTimeout(() => setNotice(""), 3000);
  };

  // KPIs
  const totalCount = categories.length;
  const parentCount = categories.filter((c) => c.hierarchy === "parent").length;
  const subCount = totalCount - parentCount;
  const featuredCount = categories.filter((c) => c.featured).length;
  const totalPlaces = categories.reduce((sum, c) => sum + (c.placesCount || 0), 0);

  return (
    <div className="bg-[#f8fafc] dark:bg-[#070e18] min-h-screen text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors">
      <AppHeader />

      {/* Main Container with Admin Dashboard Sidebar Rail */}
      <div className="flex flex-1 relative">
        <AdminDashboardRail active="categories" />

        {/* Main Working Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1550px] w-full mx-auto space-y-6">
          {/* Breadcrumb & Top Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              {/* Wayfinder Breadcrumb */}
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                <span>{t("adminNav.portalBadge", "Admin Portal")}</span>
                <span className="text-slate-400">›</span>
                <span>{t("adminCategories.breadcrumbHierarchy", "Hệ thống phân cấp")}</span>
                <span className="text-slate-400">›</span>
                <span className="text-[#00a3e0]">{t("adminCategories.breadcrumbCategories", "Quản lý Danh mục")}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002d54] dark:text-white tracking-tight">
                {t("adminCategories.title", "Quản lý Danh mục Trải nghiệm")}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                {t("adminCategories.subtitle", "Cấu hình và phân loại hệ thống địa điểm, gắn thẻ phong cách du lịch trên WAYVEE Travel OS.")}
              </p>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center flex-wrap gap-2.5">
              <button
                type="button"
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#00a3e0] text-slate-700 dark:text-slate-200 hover:text-[#00a3e0] rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-2xs"
              >
                <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16" />
                </svg>
                <span>{t("adminCategories.reorder", "Sắp xếp thứ tự")}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-[#00a3e0] hover:bg-[#008ec4] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <span className="text-base leading-none">+</span>
                <span>{t("adminCategories.addNew", "Thêm danh mục mới")}</span>
              </button>
            </div>
          </div>

          {/* Feedback Toast Notification */}
          {notice && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm font-medium flex items-center gap-2 animate-in fade-in duration-200">
              <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{notice}</span>
            </div>
          )}

          {/* Summary KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Card 1: Tổng danh mục */}
            <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  {t("adminCategories.kpiTotal", "Tổng danh mục")}
                </span>
                <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-[#00a3e0] flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalCount}</span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                  {t("adminCategories.kpiActive", "Đang kích hoạt")}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center space-x-1">
                <span className="text-[#00a3e0]">✓</span>
                <span>
                  {t("adminCategories.kpiTotalDesc", { parent: parentCount, sub: subCount })}
                </span>
              </p>
            </div>

            {/* Card 2: Danh mục nổi bật */}
            <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  {t("adminCategories.kpiFeatured", "Danh mục nổi bật")}
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </div>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {String(featuredCount).padStart(2, "0")}
                </span>
                <span className="text-xs font-bold text-[#002d54] dark:text-sky-300 bg-sky-100 dark:bg-sky-950/60 px-2.5 py-0.5 rounded-full">
                  {t("adminCategories.kpiFeaturedTag", "Trang chủ App")}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center space-x-1">
                <span className="text-[#00a3e0]">⚡</span>
                <span>{t("adminCategories.kpiFeaturedDesc", "Hiển thị trên dải Quick-Filter")}</span>
              </p>
            </div>

            {/* Card 3: Tổng địa điểm gắn tag */}
            <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  {t("adminCategories.kpiPlaces", "Tổng địa điểm gắn tag")}
                </span>
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {totalPlaces.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-0.5 rounded-full">
                  {t("adminCategories.kpiPlacesInc", { count: 420 })}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center space-x-1">
                <span className="text-blue-500">📍</span>
                <span>{t("adminCategories.kpiPlacesDesc", "Phủ 63 tỉnh thành du lịch")}</span>
              </p>
            </div>

            {/* Card 4: Tỷ lệ phủ tag chuẩn */}
            <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  {t("adminCategories.kpiAccuracy", "Tỷ lệ phủ tag chuẩn")}
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                  </svg>
                </div>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">99.4%</span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                  {t("adminCategories.kpiAccurateTag", "Chính xác")}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center space-x-1">
                <span className="text-amber-500">⚠</span>
                <span>{t("adminCategories.kpiAccuracyWarning", { count: 74 })}</span>
              </p>
            </div>
          </div>

          {/* Filter Bar & Search Tooling */}
          <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              {/* Search text field */}
              <div className="relative flex-1 min-w-[220px]">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("adminCategories.searchPlaceholder", "Tìm kiếm tên danh mục, mã slug...")}
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#00a3e0]"
                />
              </div>

              {/* Status Dropdown */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#00a3e0] min-w-[150px]"
              >
                <option value="all">{t("adminCategories.allStatus", "Tất cả trạng thái")}</option>
                <option value="active">{t("adminCategories.statusActive", "Đang hiển thị")}</option>
                <option value="inactive">{t("adminCategories.statusInactive", "Đang ẩn")}</option>
              </select>

              {/* Hierarchy Dropdown */}
              <select
                value={hierarchyFilter}
                onChange={(e) => setHierarchyFilter(e.target.value)}
                className="px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#00a3e0] min-w-[160px]"
              >
                <option value="all">{t("adminCategories.allHierarchy", "Tất cả nhóm phân cấp")}</option>
                <option value="parent">{t("adminCategories.parentGroup", "Nhóm chính (Parent)")}</option>
                <option value="sub">{t("adminCategories.subCategory", "Danh mục con (Sub-category)")}</option>
              </select>
            </div>

            {/* Right View Toggles */}
            <div className="flex items-center space-x-2 self-end md:self-auto">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  viewMode === "table"
                    ? "bg-[#00a3e0]/15 text-[#00a3e0] border-[#00a3e0]/40 font-bold"
                    : "border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                title={t("adminCategories.tableView", "Chế độ xem dạng bảng")}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M3 15h18M9 3v18" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[#00a3e0]/15 text-[#00a3e0] border-[#00a3e0]/40 font-bold"
                    : "border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                title={t("adminCategories.gridView", "Chế độ xem dạng thẻ")}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Categories Data Table / Grid */}
          {viewMode === "table" ? (
            <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th className="py-3.5 pl-6 pr-2 w-12 text-center">{t("adminCategories.thOrder", "Thứ tự")}</th>
                      <th className="py-3.5 px-4 min-w-[280px]">{t("adminCategories.thName", "Tên danh mục & Icon nhận diện")}</th>
                      <th className="py-3.5 px-4 min-w-[150px]">{t("adminCategories.thHierarchy", "Cấp độ phân cấp")}</th>
                      <th className="py-3.5 px-4 min-w-[140px]">{t("adminCategories.thScale", "Quy mô địa điểm")}</th>
                      <th className="py-3.5 px-4 min-w-[140px]">{t("adminCategories.thColor", "Mã màu nhận diện")}</th>
                      <th className="py-3.5 px-4 min-w-[130px]">{t("adminCategories.thStatus", "Trạng thái")}</th>
                      <th className="py-3.5 pr-6 pl-4 text-right min-w-[150px]">{t("adminCategories.thActions", "Thao tác")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                    {paginatedCategories.length > 0 ? (
                      paginatedCategories.map((cat, idx) => (
                        <tr key={cat.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          {/* Order & Drag */}
                          <td className="py-4 pl-6 pr-2 text-center">
                            <div className="flex items-center justify-center space-x-1 text-slate-400">
                              <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-[#00a3e0] text-xs flex items-center justify-center font-bold">
                                {(currentPage - 1) * pageSize + idx + 1}
                              </span>
                            </div>
                          </td>

                          {/* Category Name & Icon */}
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3.5">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${cat.iconBg}`}
                                style={{ color: cat.colorHex }}
                              >
                                <span className="font-bold text-lg">
                                  {cat.icon === "local_cafe"
                                    ? "☕"
                                    : cat.icon === "museum"
                                    ? "🏛️"
                                    : cat.icon === "restaurant"
                                    ? "🍽️"
                                    : cat.icon === "kayaking"
                                    ? "🛶"
                                    : cat.icon === "hotel"
                                    ? "🏨"
                                    : "🏷️"}
                                </span>
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                                  <span>{currentLanguage === "en" ? cat.nameEn || cat.nameVi : cat.nameVi}</span>
                                  {cat.tag && (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.tagColor}`}>
                                      {cat.tag}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-400 mt-0.5 flex items-center space-x-1.5 font-mono">
                                  <span className="text-[#00a3e0]">{cat.slug}</span>
                                  <span>•</span>
                                  <span className="font-sans text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                                    {cat.nameEn}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Hierarchy */}
                          <td className="py-4 px-4">
                            {cat.hierarchy === "parent" ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 text-[#00a3e0] border border-[#00a3e0]/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00a3e0] mr-1.5"></span>
                                {t("adminCategories.parentGroup", "Nhóm chính (Parent)")}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                <span className="mr-1 text-slate-400">↳</span>
                                {t("adminCategories.subOf", { parent: cat.parentName || "Chung" })}
                              </span>
                            )}
                          </td>

                          {/* Location Scale */}
                          <td className="py-4 px-4">
                            <div className="flex items-baseline space-x-1">
                              <span className="text-sm font-bold text-slate-900 dark:text-white">
                                {cat.placesCount.toLocaleString()}
                              </span>
                              <span className="text-xs text-slate-400">địa điểm</span>
                            </div>
                            <div className="w-24 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${cat.progressPercent || 50}%`,
                                  backgroundColor: cat.colorHex || "#00a3e0"
                                }}
                              />
                            </div>
                          </td>

                          {/* Color Identification */}
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <span
                                className="w-3.5 h-3.5 rounded-full ring-2 ring-slate-200 dark:ring-slate-700 shadow-2xs"
                                style={{ backgroundColor: cat.colorHex }}
                              />
                              <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                                {cat.colorHex}
                              </span>
                            </div>
                          </td>

                          {/* Status Toggle */}
                          <td className="py-4 px-4">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={cat.active}
                                onChange={() => handleToggleActive(cat.id)}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00a3e0]"></div>
                              <span className="ml-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {cat.active
                                  ? t("adminCategories.statusActive", "Hiển thị")
                                  : t("adminCategories.statusInactive", "Ẩn")}
                              </span>
                            </label>
                          </td>

                          {/* Action buttons */}
                          <td className="py-4 pr-6 pl-4 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(cat)}
                                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-[#00a3e0] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title={t("adminCategories.editTooltip", "Chỉnh sửa")}
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(cat)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                                title={t("adminCategories.deleteTooltip", "Xóa")}
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
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                          Không có danh mục nào phù hợp với điều kiện tìm kiếm.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer / Pagination */}
              <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {t("adminCategories.showing", "Hiển thị")}{" "}
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {filteredCategories.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{" "}
                    {Math.min(currentPage * pageSize, filteredCategories.length)}
                  </span>{" "}
                  {t("adminCategories.of", "trên tổng số")}{" "}
                  <span className="font-bold text-slate-800 dark:text-slate-200">{filteredCategories.length}</span>{" "}
                  {t("adminCategories.categoriesUnit", "danh mục trải nghiệm")}
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                  >
                    ‹
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        currentPage === page
                          ? "bg-[#00a3e0] text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginatedCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${cat.iconBg}`}>
                        <span className="text-xl">
                          {cat.icon === "local_cafe"
                            ? "☕"
                            : cat.icon === "museum"
                            ? "🏛️"
                            : cat.icon === "restaurant"
                            ? "🍽️"
                            : cat.icon === "kayaking"
                            ? "🛶"
                            : "🏨"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#00a3e0] hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {currentLanguage === "en" ? cat.nameEn || cat.nameVi : cat.nameVi}
                    </h3>
                    <p className="text-xs font-mono text-[#00a3e0] mt-0.5">{cat.slug}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                      {cat.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {cat.placesCount.toLocaleString()} địa điểm
                    </span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded-full ${
                        cat.active
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {cat.active ? "Hiển thị" : "Ẩn"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Right Side Drawer Modal: Thêm / Sửa */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full sm:w-[480px] bg-white dark:bg-[#0c1626] h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#00a3e0] text-white flex items-center justify-center font-bold text-sm">
                  +
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingCategory
                      ? t("adminCategories.drawerEditTitle", "Chỉnh sửa danh mục")
                      : t("adminCategories.drawerAddTitle", "Thêm danh mục mới")}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t("adminCategories.drawerSubtitle", "Khai báo thông số taxonomy cho WAYVEE OS")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Drawer Body Form */}
            <form onSubmit={handleSaveDrawer} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Tên tiếng Việt */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  {t("adminCategories.labelNameVi", "Tên danh mục")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nameVi}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      nameVi: val,
                      slug: prev.slug || `/${val.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
                    }));
                  }}
                  placeholder={t("adminCategories.placeholderNameVi", "VD: Trải nghiệm ẩm thực biển")}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 text-sm rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#00a3e0]"
                />
              </div>

              {/* Tên tiếng Anh & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    {t("adminCategories.labelNameEn", "Tên tiếng Anh (EN)")}
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder={t("adminCategories.placeholderNameEn", "VD: Beach Dining & Seafood")}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 text-sm rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#00a3e0]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    {t("adminCategories.labelSlug", "Mã định danh Slug")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder={t("adminCategories.placeholderSlug", "VD: /am-thuc-bien")}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 text-sm font-mono text-[#00a3e0] rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#00a3e0]"
                  />
                </div>
              </div>

              {/* Icon & Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    {t("adminCategories.labelIcon", "Biểu tượng (Icon)")}
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="local_cafe, restaurant..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#00a3e0]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    {t("adminCategories.labelColor", "Màu nhận diện")}
                  </label>
                  <div className="flex items-center space-x-2 pt-1.5">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setFormData({ ...formData, colorHex: c.hex })}
                        className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                          formData.colorHex === c.hex
                            ? "ring-2 ring-offset-2 ring-[#00a3e0] scale-110"
                            : "hover:scale-105"
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Hierarchy */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  {t("adminCategories.labelParent", "Danh mục cha (Hierarchy Level)")}
                </label>
                <select
                  value={formData.hierarchy === "parent" ? "none" : formData.parentName || "sub"}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "none") {
                      setFormData({ ...formData, hierarchy: "parent", parentName: "" });
                    } else {
                      setFormData({ ...formData, hierarchy: "sub", parentName: val });
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 text-sm rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#00a3e0]"
                >
                  <option value="none">{t("adminCategories.parentNone", "-- Là nhóm chính độc lập (Parent) --")}</option>
                  <option value="Thể thao Biển & Ngoài trời">Thể thao Biển & Ngoài trời</option>
                  <option value="Khám phá văn hóa bản địa">Khám phá văn hóa bản địa</option>
                  <option value="Nghỉ dưỡng & Wellness">Nghỉ dưỡng & Wellness</option>
                </select>
              </div>

              {/* Mô tả ngắn */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  {t("adminCategories.labelDesc", "Mô tả ngắn hiển thị Wayfinder")}
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t("adminCategories.placeholderDesc", "Nhập tóm tắt mô tả phong cách trải nghiệm...")}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 text-sm rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#00a3e0]"
                />
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {t("adminCategories.labelPublic", "Kích hoạt hiển thị công khai")}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {t("adminCategories.descPublic", "Cho phép người dùng tra cứu trên bộ lọc")}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00a3e0]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {t("adminCategories.labelFeatured", "Đánh dấu Danh mục nổi bật (Featured)")}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {t("adminCategories.descFeatured", "Ghim lên thanh Quick Bar trang chủ")}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00a3e0]"></div>
                  </label>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {t("adminCategories.btnCancel", "Hủy bỏ")}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00a3e0] hover:bg-[#008ec4] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  {t("adminCategories.btnSave", "Lưu danh mục")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AppFooter />
    </div>
  );
}
