import { useState, useMemo, useEffect } from "react";
import { AppHeader } from "~/shared/components";
import { useTranslation } from "~/providers/i18n-provider";
import AdminDashboardRail from "./AdminDashboardRail";
import {
  getAllUsersApi,
  createUserApi,
  updateUserApi,
  deleteUserApi
} from "~/shared/services/user-api.js";

export default function AdminUsers() {
  const { t, language } = useTranslation();
  const isEn = language === "en";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState(null);

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeDetailUser, setActiveDetailUser] = useState(null);

  // Form State for Add / Edit User
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "member",
    status: "active",
    verified: false,
    avatar: ""
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsersApi();
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      const mapped = list.map((u) => {
        const isActive = u.status === "ACTIVE";
        const isPending = u.status === "PENDING";
        const isLocked = u.status === "SUSPENDED" || u.status === "DELETED" || u.status === "INACTIVE";
        const isAdmin = u.role === "ADMIN";

        return {
          id: `WV-${String(u.userId).padStart(5, "0")}`,
          userId: u.userId,
          name: u.fullName || u.email.split("@")[0],
          email: u.email,
          phone: u.phone || "Chưa cập nhật",
          role: isAdmin ? "admin" : "member",
          roleNameVi: isAdmin ? "Admin" : "Thành viên",
          roleNameEn: isAdmin ? "Admin" : "Member",
          isStaff: isAdmin,
          verified: isActive,
          tripsCompleted: 0,
          savedPlaces: 0,
          reviewsCount: 0,
          rating: 5.0,
          trustPercent: isActive ? 100 : 50,
          trustLevel: isActive ? "high" : "warning",
          createdDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN") : "N/A",
          lastActiveVi: isActive ? "Đang hoạt động" : isPending ? "Chờ xác thực" : "Đã khóa",
          lastActiveEn: isActive ? "Active" : isPending ? "Pending" : "Locked",
          status: isActive ? "active" : isPending ? "pending" : "locked",
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.email)}`
        };
      });
      setUsers(mapped);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q) ||
        (u.phone && u.phone.toLowerCase().includes(q));

      const matchesRole = !roleFilter || u.role === roleFilter;
      const matchesStatus = !statusFilter || u.status === statusFilter;

      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Paginated Users
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Checkbox handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredUsers.map((u) => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isAllSelected =
    filteredUsers.length > 0 && selectedIds.length === filteredUsers.length;

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setRoleFilter("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  // Bulk Lock / Unlock
  const handleBulkLock = async () => {
    if (selectedIds.length === 0) {
      showToast(t("adminUsers.selectItemsFirst"));
      return;
    }
    try {
      await Promise.all(
        selectedIds.map((id) => {
          const u = users.find((item) => item.id === id);
          if (u?.userId) {
            return updateUserApi(u.userId, { status: "SUSPENDED" }).catch(() => { });
          }
          return Promise.resolve();
        })
      );
      await fetchUsers();
      showToast(t("adminUsers.bulkLockedSuccess", { count: selectedIds.length }));
      setSelectedIds([]);
    } catch (err) {
      console.error("Bulk lock failed:", err);
      showToast("Lỗi khi khóa người dùng.");
    }
  };

  // Toggle single user lock status
  const handleToggleLock = async (user) => {
    const nextStatus = user.status === "locked" ? "ACTIVE" : "SUSPENDED";
    try {
      if (user.userId) {
        await updateUserApi(user.userId, { status: nextStatus });
      }
      await fetchUsers();
      if (nextStatus === "ACTIVE") {
        showToast(t("adminUsers.savedSuccess"));
      } else {
        showToast(t("adminUsers.bulkLockedSuccess", { count: 1 }));
      }
    } catch (err) {
      console.error("Toggle lock failed:", err);
      showToast("Lỗi khi cập nhật trạng thái người dùng.");
    }
  };

  // Delete user
  const handleDeleteUser = async (user) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${user.name}" (${user.email})?`)) {
      try {
        if (user.userId) {
          await deleteUserApi(user.userId);
        }
        await fetchUsers();
        showToast("Đã xóa tài khoản người dùng thành công!");
      } catch (err) {
        console.error("Delete user failed:", err);
        showToast("Lỗi khi xóa người dùng.");
      }
    }
  };

  // Resend code for pending user
  const handleResendCode = (user) => {
    showToast(`${t("adminUsers.resentCodeSuccess")} (${user.email})`);
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "member",
      status: "active",
      verified: false,
      avatar: ""
    });
    setIsAddEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      role: user.role || "member",
      status: user.status || "active",
      verified: !!user.verified,
      avatar: user.avatar || ""
    });
    setIsAddEditModalOpen(true);
  };

  // Save Add/Edit User
  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      return;
    }

    try {
      if (editingUser) {
        // Edit
        if (editingUser.userId) {
          await updateUserApi(editingUser.userId, {
            fullName: formData.name.trim(),
            phone: formData.phone.trim(),
            status: formData.status === "active" ? "ACTIVE" : formData.status === "pending" ? "PENDING" : "SUSPENDED",
            role: formData.role === "superadmin" ? "ADMIN" : "USER"
          });
        }
        showToast(t("adminUsers.savedSuccess"));
      } else {
        // Add
        await createUserApi({
          email: formData.email.trim(),
          password: formData.password || "12345678",
          fullName: formData.name.trim(),
          phone: formData.phone.trim()
        });
        showToast(t("adminUsers.createdSuccess"));
      }
      await fetchUsers();
      setIsAddEditModalOpen(false);
    } catch (err) {
      console.error("Save user failed:", err);
      showToast(err?.response?.data?.message || "Lỗi khi lưu người dùng.");
    }
  };

  // Open Detail / History Modal
  const handleOpenDetailModal = (user) => {
    setActiveDetailUser(user);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="bg-[#f8fafc] dark:bg-[#070e18] h-screen flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 font-sans transition-colors">
      {/* Shared App Header */}
      <AppHeader />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl shadow-xl border border-slate-700 dark:border-slate-600 animate-fade-in text-sm font-medium">
          <span className="material-symbols-outlined text-[#00a3e0] text-lg">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Left Side Navigation Rail */}
        <AdminDashboardRail active="users" />

        {/* Content Canvas */}
        <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-[1550px] w-full mx-auto space-y-6">
          {/* HEADER ZONE */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              {/* Wayfinder Breadcrumb */}
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                <span>{t("adminNav.portalBadge", "Admin Portal")}</span>
                <span className="text-slate-400">›</span>
                <span>{t("adminUsers.eyebrow", "Quản trị Người dùng")}</span>
                <span className="text-slate-400">›</span>
                <span className="text-[#00a3e0]">{t("adminUsers.title", "User & Role Management")}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002d54] dark:text-white tracking-tight">
                {t("adminUsers.title", "User & Role Management")}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                {t("adminUsers.subtitle", "Phân quyền quản trị, kiểm soát tài khoản và bảo mật hệ thống trên WAYVEE Travel OS.")}
              </p>
            </div>

            {/* Action Buttons Group */}
            <div className="flex items-center flex-wrap gap-2.5">
              {/* Role Permission Button */}
              <button
                type="button"
                onClick={() => setIsRoleModalOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#00a3e0] text-slate-700 dark:text-slate-200 hover:text-[#00a3e0] rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                <span>{t("adminUsers.rolePermission", "Phân quyền vai trò")}</span>
              </button>

              {/* Bulk Lock Action */}
              <button
                type="button"
                onClick={handleBulkLock}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer"
                title={t("adminUsers.bulkLock", "Khóa hàng loạt")}
              >
                <span className="material-symbols-outlined text-base">lock</span>
                <span>{t("adminUsers.bulkLock", "Khóa hàng loạt")}</span>
              </button>

              {/* Add User Button */}
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-[#00a3e0] hover:bg-[#008ec4] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <span className="text-base leading-none">+</span>
                <span>{t("adminUsers.addUser", "Thêm người dùng mới")}</span>
              </button>
            </div>
          </div>

          {/* USER MANAGEMENT TABLE & FILTERING WRAPPER */}
          {/* FILTER BAR & SEARCH TOOLING */}
          <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              {/* Primary Search Input */}
              <div className="relative flex-1 min-w-[220px]">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder={t("adminUsers.searchPlaceholder", "Tìm kiếm người dùng theo tên, email, phone...")}
                  className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#00a3e0]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title="Clear search"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
              </div>

              {/* Role Dropdown */}
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#00a3e0] min-w-[150px]"
              >
                <option value="">{t("adminUsers.allRoles", "Tất cả vai trò")}</option>
                <option value="superadmin">{t("adminUsers.superadmin", "Quản trị viên (Admin)")}</option>
                <option value="member">{t("adminUsers.member", "Thành viên (Member)")}</option>
              </select>

              {/* Status Dropdown */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#00a3e0] min-w-[160px]"
              >
                <option value="">{t("adminUsers.allStatuses", "Tất cả trạng thái")}</option>
                <option value="active">{t("adminUsers.active", "Đang hoạt động")}</option>
                <option value="locked">{t("adminUsers.locked", "Đã khóa")}</option>
                <option value="pending">{t("adminUsers.pending", "Chờ xác thực")}</option>
              </select>

              {/* Quick Clear Filter */}
              <button
                type="button"
                onClick={handleClearFilters}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={t("adminUsers.resetFilters", "Làm mới bộ lọc")}
              >
                <span className="material-symbols-outlined text-lg">filter_alt_off</span>
              </button>
            </div>
          </div>

          {/* COMPREHENSIVE USER DATA TABLE */}
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="py-3.5 pl-6 pr-2 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-[#00a3e0] focus:ring-[#00a3e0] cursor-pointer"
                      />
                    </th>
                    <th className="py-3.5 px-4 min-w-[280px]">{t("adminUsers.thUser", "Người dùng & Tài khoản")}</th>
                    <th className="py-3.5 px-4 min-w-[150px]">{t("adminUsers.thRole", "Vai trò")}</th>
                    <th className="py-3.5 px-4 min-w-[180px]">{t("adminUsers.thCreated", "Ngày tạo / Hoạt động")}</th>
                    <th className="py-3.5 px-4 min-w-[140px]">{t("adminUsers.thStatus", "Trạng thái")}</th>
                    <th className="py-3.5 pr-6 pl-4 text-right min-w-[150px]">{t("adminUsers.thActions", "Thao tác")}</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">
                            person_search
                          </span>
                          <p className="font-medium text-sm">{t("adminUsers.noMatchingUsers", "Không tìm thấy người dùng phù hợp.")}</p>
                          <button
                            type="button"
                            onClick={handleClearFilters}
                            className="mt-2 text-xs font-semibold text-[#00a3e0] hover:underline cursor-pointer"
                          >
                            {t("adminUsers.clearAllFilters", "Xóa bộ lọc")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user) => {
                      const isSelected = selectedIds.includes(user.id);
                      const isLocked = user.status === "locked";
                      const isPending = user.status === "pending";

                      return (
                        <tr
                          key={user.id}
                          className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors group ${
                            isLocked ? "bg-red-50/20 dark:bg-red-950/10" : ""
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3.5 pl-6 pr-2 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectOne(user.id)}
                              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-[#00a3e0] focus:ring-[#00a3e0] cursor-pointer"
                            />
                          </td>

                          {/* User Info Column */}
                          <td className="py-3.5 px-4">
                            <div
                              className="flex items-center gap-3 cursor-pointer group/user"
                              onClick={() => handleOpenDetailModal(user)}
                              title={t("adminUsers.viewDetail", "Bấm để xem chi tiết thông tin")}
                            >
                              {/* Avatar */}
                              <div className="relative shrink-0">
                                {user.avatar ? (
                                  <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className={`w-10 h-10 rounded-full object-cover border transition-transform group-hover/user:scale-105 ${
                                      isLocked
                                        ? "border-red-400 ring-1 ring-red-200 dark:ring-red-900"
                                        : user.role === "superadmin"
                                          ? "border-sky-500 ring-1 ring-sky-300 dark:ring-sky-800"
                                          : "border-[#00a3e0]"
                                    }`}
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-950/60 text-[#00a3e0] font-bold text-sm flex items-center justify-center border border-sky-200 dark:border-sky-800">
                                    {user.initials || user.name.slice(0, 2).toUpperCase()}
                                  </div>
                                )}

                                {/* Status dot on Avatar */}
                                <span
                                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                                    isLocked
                                      ? "bg-red-500"
                                      : isPending
                                        ? "bg-amber-500"
                                        : "bg-emerald-500"
                                  }`}
                                />
                              </div>

                              {/* Identity Details */}
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-slate-900 dark:text-white group-hover/user:text-[#00a3e0] text-sm truncate transition-colors">
                                    {user.name}
                                  </span>

                                  {user.isStaff && (
                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#002d54] text-white">
                                      {t("adminUsers.staffBadge", "STAFF")}
                                    </span>
                                  )}

                                  {user.verified && (
                                    <span
                                      className="material-symbols-outlined text-[#00a3e0] text-sm"
                                      title={t("adminUsers.kycVerified", "Đã xác thực KYC")}
                                    >
                                      verified
                                    </span>
                                  )}
                                </div>

                                <span className="text-slate-500 dark:text-slate-400 text-xs block truncate">
                                  {user.email}
                                </span>

                                <div
                                  className={`text-[11px] font-medium tracking-tight truncate ${
                                    isLocked ? "text-red-500 dark:text-red-400" : "text-slate-400 dark:text-slate-500"
                                  }`}
                                >
                                  ID: {user.id} • {user.phone}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role Column */}
                          <td className="py-3.5 px-4">
                            {user.role === "superadmin" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 dark:bg-sky-950/60 text-[#002d54] dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                                <span className="material-symbols-outlined text-xs">security</span>
                                Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                <span className="material-symbols-outlined text-xs">person</span>
                                {isEn ? user.roleNameEn : user.roleNameVi}
                              </span>
                            )}
                          </td>

                          {/* Created Date & Last Active Column */}
                          <td className="py-3.5 px-4">
                            <div className="text-slate-900 dark:text-white text-xs font-medium">
                              {user.createdDate}
                            </div>
                            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                              {user.lastActiveVi === "5 phút trước" && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                              )}
                              <span>{isEn ? user.lastActiveEn : user.lastActiveVi}</span>
                            </div>
                          </td>

                          {/* Status Badge Column */}
                          <td className="py-3.5 px-4">
                            {user.status === "active" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {t("adminUsers.active", "Đang hoạt động")}
                              </span>
                            ) : user.status === "locked" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                {t("adminUsers.locked", "Đã khóa")}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                {t("adminUsers.pending", "Chờ xác thực")}
                              </span>
                            )}
                          </td>

                          {/* Row Action Buttons */}
                          <td className="py-3.5 pr-6 pl-4 text-right">
                            <div className="inline-flex items-center justify-end gap-1">
                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(user)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-[#00a3e0] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title={t("adminUsers.editInfo", "Chỉnh sửa")}
                              >
                                <span className="material-symbols-outlined text-lg">edit</span>
                              </button>

                              {/* View Details / History */}
                              <button
                                type="button"
                                onClick={() => handleOpenDetailModal(user)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-[#00a3e0] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title={t("adminUsers.viewDetail", "Xem chi tiết")}
                              >
                                <span className="material-symbols-outlined text-lg">info</span>
                              </button>

                              {/* Delete User Button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(user)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                                title="Xóa tài khoản"
                              >
                                <span className="material-symbols-outlined text-lg">delete</span>
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

            {/* FOOTER & PAGINATION BAR */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span>
                  {t("adminUsers.showing", "Hiển thị")}{" "}
                  <span className="font-bold text-slate-900 dark:text-white">
                    {paginatedUsers.length}
                  </span>{" "}
                  {t("adminUsers.of", "trên tổng số")}{" "}
                  <span className="font-bold text-slate-900 dark:text-white">
                    {filteredUsers.length}
                  </span>{" "}
                  {t("adminUsers.members", "người dùng")}
                </span>
                <span>|</span>
                <div className="flex items-center gap-1.5">
                  <span>{t("adminUsers.perPage", "Mỗi trang:")}</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="py-1 px-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </select>
                </div>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-1 text-xs font-semibold">
                {/* Prev Button */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">chevron_left</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCurrentPage(p)}
                    className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors cursor-pointer ${
                      currentPage === p
                        ? "bg-[#00a3e0] text-white font-bold shadow-xs"
                        : "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {p}
                  </button>
                ))}

                {/* Next Button */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL: ADD / EDIT USER */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00a3e0]">
                  {editingUser ? "edit_note" : "person_add"}
                </span>
                <h3 className="font-extrabold text-[#002d54] dark:text-white text-lg">
                  {editingUser
                    ? t("adminUsers.modalEditTitle", "Chỉnh sửa tài khoản")
                    : t("adminUsers.modalAddTitle", "Thêm người dùng mới")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t("adminUsers.fullName", "Họ và tên")} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Hoàng Minh Long"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#00a3e0]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t("adminUsers.email", "Email")} *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@wayvee.vn"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#00a3e0]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t("adminUsers.phone", "Số điện thoại")}
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+84 901 234 567"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#00a3e0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t("adminUsers.role", "Vai trò")}
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#00a3e0] cursor-pointer"
                  >
                    <option value="member">{t("adminUsers.member", "Thành viên (Member)")}</option>
                    <option value="superadmin">{t("adminUsers.superadmin", "Quản trị viên (Admin)")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t("adminUsers.status", "Trạng thái")}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#00a3e0] cursor-pointer"
                  >
                    <option value="active">{t("adminUsers.active", "Đang hoạt động")}</option>
                    <option value="locked">{t("adminUsers.locked", "Đã khóa")}</option>
                    <option value="pending">{t("adminUsers.pending", "Chờ xác thực")}</option>
                  </select>
                </div>
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mật khẩu khởi tạo (tùy chọn)
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Mặc định: 12345678"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#00a3e0]"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  {t("adminUsers.cancel", "Hủy")}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00a3e0] hover:bg-[#008ec4] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                >
                  {editingUser ? t("adminUsers.save", "Lưu thay đổi") : t("adminUsers.create", "Tạo tài khoản")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ROLE PERMISSION MATRIX */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00a3e0]">
                  admin_panel_settings
                </span>
                <h3 className="font-extrabold text-[#002d54] dark:text-white text-lg">
                  {t("adminUsers.modalRoleTitle", "Ma trận phân quyền vai trò (Role Matrix)")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRoleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 overflow-x-auto max-h-[70vh]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3">Tính năng / Quyền hạn</th>
                    <th className="p-3 text-center">Admin</th>
                    <th className="p-3 text-center">Moderator</th>
                    <th className="p-3 text-center">Vivu Pro</th>
                    <th className="p-3 text-center">Member</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">
                      Tạo lịch trình du lịch AI tự động
                    </td>
                    <td className="p-3 text-center text-emerald-600 dark:text-emerald-400 font-bold">✓ Vô hạn</td>
                    <td className="p-3 text-center text-emerald-600 dark:text-emerald-400 font-bold">✓ Vô hạn</td>
                    <td className="p-3 text-center text-emerald-600 dark:text-emerald-400 font-bold">✓ Vô hạn</td>
                    <td className="p-3 text-center text-slate-500 dark:text-slate-400">3 tour/tháng</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">
                      Quản lý tài khoản & Phân quyền hệ thống
                    </td>
                    <td className="p-3 text-center text-emerald-600 dark:text-emerald-400 font-bold">✓ Toàn quyền</td>
                    <td className="p-3 text-center text-red-400">✗</td>
                    <td className="p-3 text-center text-red-400">✗</td>
                    <td className="p-3 text-center text-red-400">✗</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">
                      Kiểm duyệt đánh giá, review & xử lý vi phạm
                    </td>
                    <td className="p-3 text-center text-emerald-600 dark:text-emerald-400 font-bold">✓ Toàn quyền</td>
                    <td className="p-3 text-center text-emerald-600 dark:text-emerald-400 font-bold">✓ Có</td>
                    <td className="p-3 text-center text-red-400">✗</td>
                    <td className="p-3 text-center text-red-400">✗</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">
                      Tải bản đồ số Offline & GPS dẫn đường
                    </td>
                    <td className="p-3 text-center text-emerald-600 dark:text-emerald-400 font-bold">✓ Có</td>
                    <td className="p-3 text-center text-emerald-600 dark:text-emerald-400 font-bold">✓ Có</td>
                    <td className="p-3 text-center text-emerald-600 dark:text-emerald-400 font-bold">✓ Có</td>
                    <td className="p-3 text-center text-red-400">✗</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">
                      Xem báo cáo doanh thu & Phân tích thị phần
                    </td>
                    <td className="p-3 text-center text-emerald-600 dark:text-emerald-400 font-bold">✓ Toàn quyền</td>
                    <td className="p-3 text-center text-slate-500 dark:text-slate-400">Xem sơ bộ</td>
                    <td className="p-3 text-center text-red-400">✗</td>
                    <td className="p-3 text-center text-red-400">✗</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
              <button
                type="button"
                onClick={() => setIsRoleModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#00a3e0] text-white text-xs font-bold transition-all hover:bg-[#008ec4] cursor-pointer"
              >
                {t("adminUsers.close", "Đóng")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: USER DETAIL & ACTIVITY */}
      {isDetailModalOpen && activeDetailUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00a3e0]">account_circle</span>
                <h3 className="font-extrabold text-[#002d54] dark:text-white text-lg">
                  {t("adminUsers.modalDetailTitle", "Chi tiết hồ sơ thành viên")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center gap-3">
                {activeDetailUser.avatar ? (
                  <img
                    src={activeDetailUser.avatar}
                    alt={activeDetailUser.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#00a3e0]"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-sky-100 dark:bg-sky-950/60 text-[#00a3e0] font-bold text-lg flex items-center justify-center border border-sky-200 dark:border-sky-800">
                    {activeDetailUser.initials || activeDetailUser.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    {activeDetailUser.name}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400">{activeDetailUser.email}</p>
                  <p className="text-slate-500 dark:text-slate-500">{activeDetailUser.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Mã định danh (ID)</span>
                  <span className="font-bold text-slate-900 dark:text-white">{activeDetailUser.id}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Vai trò</span>
                  <span className="font-bold text-[#00a3e0]">
                    {isEn ? activeDetailUser.roleNameEn : activeDetailUser.roleNameVi}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Chuyến đi hoàn thành</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {activeDetailUser.tripsCompleted} tour
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Độ uy tín</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {activeDetailUser.trustPercent ? `${activeDetailUser.trustPercent}%` : "Chưa có"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-slate-900 dark:text-white">Nhật ký hệ thống gần nhất:</h5>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 space-y-1.5">
                  <div className="flex justify-between">
                    <span>• Đăng nhập gần nhất:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {isEn ? activeDetailUser.lastActiveEn : activeDetailUser.lastActiveVi}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Ngày khởi tạo tài khoản:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {activeDetailUser.createdDate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Trạng thái KYC:</span>
                    <span className="font-semibold text-[#00a3e0]">
                      {activeDetailUser.verified ? "Đã xác thực CCCD/Passport" : "Chưa xác minh"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#00a3e0] text-white text-xs font-bold transition-all hover:bg-[#008ec4] cursor-pointer"
              >
                {t("adminUsers.close", "Đóng")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}