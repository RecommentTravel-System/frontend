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
    <div className="flex flex-col min-h-screen bg-[#f1fbff] text-[#051f25]">
      {/* Shared App Header */}
      <AppHeader />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-[#002d54] text-white rounded-xl shadow-xl border border-white/20 animate-fade-in text-sm font-medium">
          <span className="material-symbols-outlined text-[#81cfff] text-lg">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-1 relative">
        {/* Left Side Navigation Rail */}
        <AdminDashboardRail active="users" />

        {/* Content Canvas */}
        <main className="flex-1 min-w-0 p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* HEADER ZONE */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#cee7f0] shadow-sm">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#00658d] uppercase mb-1">
                <span className="material-symbols-outlined text-base">manage_accounts</span>
                <span>{t("adminUsers.eyebrow")}</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-[#051f25]">
                {t("adminUsers.title")}
              </h1>
              <p className="text-sm text-[#3e4850] mt-1">
                {t("adminUsers.subtitle")}
              </p>
            </div>

            {/* Action Buttons Group (Export Button Removed as Requested) */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Add User Button */}
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#00a3e0] hover:bg-[#008bc0] text-white text-xs font-bold uppercase tracking-wider transition-all duration-150 ease-in-out shadow-sm active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">person_add</span>
                {t("adminUsers.addUser")}
              </button>

              {/* Role Permission Button */}
              <button
                type="button"
                onClick={() => setIsRoleModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#3a5f94] text-[#3a5f94] hover:bg-[#d9f2fb]/60 text-xs font-semibold tracking-wide transition-all duration-150 ease-in-out cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                {t("adminUsers.rolePermission")}
              </button>

              {/* Bulk Lock Action */}
              <button
                type="button"
                onClick={handleBulkLock}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border border-red-200 text-[#ba1a1a] hover:bg-red-50 text-xs font-semibold transition-all duration-150 ease-in-out cursor-pointer"
                title={t("adminUsers.bulkLock")}
              >
                <span className="material-symbols-outlined text-lg">lock</span>
                {t("adminUsers.bulkLock")}
              </button>
            </div>
          </div>

          {/* USER MANAGEMENT TABLE & FILTERING WRAPPER */}
          <section className="bg-white rounded-2xl border border-[#cee7f0] shadow-sm overflow-hidden flex flex-col">
            {/* FILTER & TOOLBAR BAR */}
            <div className="p-5 border-b border-[#cee7f0] bg-[#f8fdff] flex flex-col gap-4">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* Primary Search Input with Clear Button */}
                <div className="relative flex-1 max-w-xl">
                  <span className="material-symbols-outlined absolute left-3.5 top-3 text-[#6e7881] text-xl pointer-events-none">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder={t("adminUsers.searchPlaceholder")}
                    className="w-full pl-11 pr-10 py-2.5 text-sm bg-white border border-[#cee7f0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a3e0]/30 focus:border-[#00a3e0] text-[#051f25] placeholder-[#6e7881] shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-3 text-[#6e7881] hover:text-[#051f25] cursor-pointer"
                      title="Clear search"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  )}
                </div>

                {/* Filter Dropdowns Cluster */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Dropdown: Vai trò / Role */}
                  <div className="relative">
                    <select
                      value={roleFilter}
                      onChange={(e) => {
                        setRoleFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="appearance-none pl-3.5 pr-8 py-2 text-xs font-semibold bg-white border border-[#cee7f0] rounded-xl text-[#051f25] focus:outline-none focus:border-[#00a3e0] cursor-pointer"
                    >
                      <option value="">{t("adminUsers.allRoles")}</option>
                      <option value="superadmin">{t("adminUsers.superadmin")}</option>

                      <option value="member">{t("adminUsers.member")}</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2 top-2.5 text-[#6e7881] pointer-events-none text-base">
                      expand_more
                    </span>
                  </div>

                  {/* Dropdown: Trạng thái / Status */}
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="appearance-none pl-3.5 pr-8 py-2 text-xs font-semibold bg-white border border-[#cee7f0] rounded-xl text-[#051f25] focus:outline-none focus:border-[#00a3e0] cursor-pointer"
                    >
                      <option value="">{t("adminUsers.allStatuses")}</option>
                      <option value="active">{t("adminUsers.active")}</option>
                      <option value="locked">{t("adminUsers.locked")}</option>
                      <option value="pending">{t("adminUsers.pending")}</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2 top-2.5 text-[#6e7881] pointer-events-none text-base">
                      expand_more
                    </span>
                  </div>

                  {/* Quick Refresh / Clear Filter Button */}
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="p-2 border border-[#cee7f0] rounded-xl text-[#3e4850] hover:bg-[#d9f2fb]/60 hover:text-[#00658d] transition-colors cursor-pointer"
                    title={t("adminUsers.resetFilters")}
                  >
                    <span className="material-symbols-outlined text-lg">filter_alt_off</span>
                  </button>
                </div>
              </div>

              {/* Active Filter Tags / Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="font-semibold text-[#6e7881] uppercase tracking-wider">
                  {t("adminUsers.appliedFilters")}
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#d9f2fb] text-[#00354b] border border-[#cee7f0]">
                  {t("adminUsers.allSystem")} ({filteredUsers.length})
                </span>

                {statusFilter && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#d9f2fb] text-[#00354b] border border-[#cee7f0]">
                    {t("adminUsers.statusFilterPrefix")}{" "}
                    {statusFilter === "active"
                      ? t("adminUsers.active")
                      : statusFilter === "locked"
                        ? t("adminUsers.locked")
                        : t("adminUsers.pending")}
                    <button
                      type="button"
                      onClick={() => setStatusFilter("")}
                      className="hover:text-red-500 ml-0.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </span>
                )}

                {roleFilter && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#d9f2fb] text-[#00354b] border border-[#cee7f0]">
                    {t("adminUsers.roleFilterPrefix")} {roleFilter.toUpperCase()}
                    <button
                      type="button"
                      onClick={() => setRoleFilter("")}
                      className="hover:text-red-500 ml-0.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </span>
                )}

                {(searchQuery || roleFilter || statusFilter) && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="text-xs font-bold text-[#00658d] hover:underline ml-1 cursor-pointer"
                  >
                    {t("adminUsers.clearAllFilters")}
                  </button>
                )}
              </div>
            </div>

            {/* COMPREHENSIVE USER DATA TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#e2f7ff]/70 text-[#3e4850] text-[11px] font-bold uppercase tracking-wider border-b border-[#cee7f0]">
                    <th className="p-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-[#cee7f0] text-[#00a3e0] focus:ring-[#00a3e0] cursor-pointer"
                      />
                    </th>
                    <th className="py-4 px-4 min-w-[240px]">{t("adminUsers.thUser")}</th>
                    <th className="py-4 px-3 min-w-[150px]">{t("adminUsers.thRole")}</th>
                    <th className="py-4 px-3 min-w-[190px]">{t("adminUsers.thCreated")}</th>
                    <th className="py-4 px-3 min-w-[130px]">{t("adminUsers.thStatus")}</th>
                    <th className="py-4 px-4 text-right min-w-[140px]">{t("adminUsers.thActions")}</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#cee7f0]/50 text-xs">
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#6e7881]">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-4xl text-[#bdc8d1]">
                            person_search
                          </span>
                          <p className="font-medium text-sm">{t("adminUsers.noMatchingUsers")}</p>
                          <button
                            type="button"
                            onClick={handleClearFilters}
                            className="mt-2 text-xs font-semibold text-[#00658d] hover:underline"
                          >
                            {t("adminUsers.clearAllFilters")}
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
                          className={`hover:bg-[#d9f2fb]/30 transition-colors group ${isLocked ? "bg-red-50/20" : ""
                            }`}
                        >
                          {/* Checkbox */}
                          <td className="p-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectOne(user.id)}
                              className="w-4 h-4 rounded border-[#cee7f0] text-[#00a3e0] focus:ring-[#00a3e0] cursor-pointer"
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
                                    className={`w-10 h-10 rounded-full object-cover border transition-transform group-hover/user:scale-105 ${isLocked
                                      ? "border-red-400 ring-1 ring-red-200"
                                      : user.role === "superadmin"
                                        ? "border-[#3a5f94] ring-1 ring-[#3a5f94]"
                                        : "border-[#00a3e0]"
                                      }`}
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-[#d3ecf5] text-[#00658d] font-bold text-sm flex items-center justify-center border border-[#cee7f0]">
                                    {user.initials || user.name.slice(0, 2).toUpperCase()}
                                  </div>
                                )}

                                {/* Status dot on Avatar */}
                                <span
                                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white ${isLocked
                                    ? "bg-[#ba1a1a]"
                                    : isPending
                                      ? "bg-[#3a5f94]"
                                      : "bg-[#00aaab]"
                                    }`}
                                />
                              </div>

                              {/* Identity Details */}
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-[#051f25] group-hover/user:text-[#00a3e0] text-sm truncate transition-colors">
                                    {user.name}
                                  </span>

                                  {user.isStaff && (
                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#3a5f94] text-white">
                                      {t("adminUsers.staffBadge")}
                                    </span>
                                  )}

                                  {user.verified && (
                                    <span
                                      className="material-symbols-outlined text-[#00658d] text-sm"
                                      title={t("adminUsers.kycVerified")}
                                    >
                                      verified
                                    </span>
                                  )}

                                  {user.hasViolation && (
                                    <span
                                      className="material-symbols-outlined text-[#ba1a1a] text-sm"
                                      title="Cảnh báo vi phạm"
                                    >
                                      report
                                    </span>
                                  )}
                                </div>

                                <span className="text-[#3e4850] text-xs block truncate">
                                  {user.email}
                                </span>

                                <div
                                  className={`text-[11px] font-medium tracking-tight truncate ${isLocked ? "text-[#ba1a1a]" : "text-[#6e7881]"
                                    }`}
                                >
                                  ID: {user.id} • {user.phone}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role Column */}
                          <td className="py-3.5 px-3">
                            {user.role === "superadmin" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#3a5f94] text-white shadow-xs">
                                <span className="material-symbols-outlined text-xs">security</span>
                                Admin
                              </span>
                            )  : user.role === "pro" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#d9f2fb] text-[#00354b] border border-[#00a3e0]/40">
                                <span className="material-symbols-outlined text-xs text-[#00658d]">
                                  diamond
                                </span>
                                {isEn ? user.roleNameEn : user.roleNameVi}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#d3ecf5] text-[#3e4850] border border-[#cee7f0]">
                                <span className="material-symbols-outlined text-xs">person</span>
                                {isEn ? user.roleNameEn : user.roleNameVi}
                              </span>
                            )}
                          </td>

                          {/* Created Date & Last Active Column */}
                          <td className="py-3.5 px-3">
                            <div className="text-[#051f25] text-xs font-medium">
                              {user.createdDate}
                            </div>
                            <div className="text-xs text-[#006a6a] font-semibold flex items-center gap-1 mt-0.5">
                              {user.lastActiveVi === "5 phút trước" && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#006a6a] animate-ping" />
                              )}
                              <span>{isEn ? user.lastActiveEn : user.lastActiveVi}</span>
                            </div>
                          </td>

                          {/* Status Badge Column */}
                          <td className="py-3.5 px-3">
                            {user.status === "active" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#d9f2fb] text-[#006a6a] border border-[#006a6a]/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#006a6a]" />
                                {t("adminUsers.active")}
                              </span>
                            ) : user.status === "locked" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-[#93000a] border border-red-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
                                {t("adminUsers.locked")}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#d5e3ff] text-[#001b3c] border border-[#3a5f94]/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#3a5f94]" />
                                {t("adminUsers.pending")}
                              </span>
                            )}
                          </td>

                          {/* Row Action Buttons */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              {/* If Pending: show Resend Code */}
                              {isPending && (
                                <button
                                  type="button"
                                  onClick={() => handleResendCode(user)}
                                  className="p-1.5 rounded-lg hover:bg-[#d9f2fb] text-[#00658d] text-xs font-bold px-2 border border-[#00658d]/30 cursor-pointer"
                                  title={t("adminUsers.resendCode")}
                                >
                                  {t("adminUsers.resendCode")}
                                </button>
                              )}

                              {/* If Locked: show Unlock Button */}
                              {isLocked && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleLock(user)}
                                  className="p-1.5 rounded-lg hover:bg-[#d9f2fb] text-[#006a6a] text-xs font-bold px-2 border border-[#006a6a]/30 cursor-pointer"
                                  title={t("adminUsers.unlock")}
                                >
                                  {t("adminUsers.unlock")}
                                </button>
                              )}

                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(user)}
                                className="p-1.5 rounded-lg hover:bg-[#d9f2fb] text-[#3e4850] hover:text-[#00658d] transition-colors cursor-pointer"
                                title={t("adminUsers.editInfo")}
                              >
                                <span className="material-symbols-outlined text-lg">edit</span>
                              </button>

                              {/* View Details / History */}
                              <button
                                type="button"
                                onClick={() => handleOpenDetailModal(user)}
                                className="p-1.5 rounded-lg hover:bg-[#d9f2fb] text-[#3e4850] hover:text-[#00658d] transition-colors cursor-pointer"
                                title={
                                  user.role === "moderator"
                                    ? t("adminUsers.viewAudit")
                                    : user.hasViolation
                                      ? t("adminUsers.viewViolation")
                                      : t("adminUsers.viewHistory")
                                }
                              >
                                <span className="material-symbols-outlined text-lg">
                                  {user.hasViolation ? "info" : "history"}
                                </span>
                              </button>

                              {/* Lock / Unlock Toggle Button */}
                              {!isPending && !isLocked && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleLock(user)}
                                  className="p-1.5 rounded-lg hover:bg-amber-50 text-[#3e4850] hover:text-amber-600 transition-colors cursor-pointer"
                                  title={t("adminUsers.lockAccount")}
                                >
                                  <span className="material-symbols-outlined text-lg">block</span>
                                </button>
                              )}

                              {/* Delete User Button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(user)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-[#3e4850] hover:text-[#ba1a1a] transition-colors cursor-pointer"
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
            <div className="p-4 border-t border-[#cee7f0] bg-[#f8fdff] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs text-[#3e4850]">
                <span>
                  {t("adminUsers.showing")}{" "}
                  <span className="font-bold text-[#051f25]">
                    {paginatedUsers.length}
                  </span>{" "}
                  {t("adminUsers.of")}{" "}
                  <span className="font-bold text-[#051f25]">
                    {filteredUsers.length}
                  </span>{" "}
                  {t("adminUsers.members")}
                </span>
                <span className="text-[#6e7881]">|</span>
                <div className="flex items-center gap-1.5">
                  <span>{t("adminUsers.perPage")}</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="py-1 px-2 text-xs bg-white border border-[#cee7f0] rounded text-[#051f25] focus:outline-none cursor-pointer"
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
                  className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#cee7f0] bg-white text-[#051f25] hover:bg-[#d9f2fb] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">chevron_left</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCurrentPage(p)}
                    className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors cursor-pointer ${currentPage === p
                      ? "bg-[#00658d] text-white font-bold shadow-xs"
                      : "border border-[#cee7f0] bg-white text-[#051f25] hover:bg-[#d9f2fb]"
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
                  className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#cee7f0] bg-white text-[#051f25] hover:bg-[#d9f2fb] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">chevron_right</span>
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* MODAL: ADD / EDIT USER */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#cee7f0] shadow-2xl overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between p-5 border-b border-[#cee7f0] bg-[#f8fdff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00658d]">
                  {editingUser ? "edit_note" : "person_add"}
                </span>
                <h3 className="font-extrabold text-[#051f25] text-lg">
                  {editingUser
                    ? t("adminUsers.modalEditTitle")
                    : t("adminUsers.modalAddTitle")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddEditModalOpen(false)}
                className="p-1 rounded-lg text-[#6e7881] hover:bg-slate-100 hover:text-[#051f25] cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#051f25] mb-1">
                  {t("adminUsers.fullName")} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Hoàng Minh Long"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#cee7f0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a3e0]/30 focus:border-[#00a3e0]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#051f25] mb-1">
                    {t("adminUsers.email")} *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@wayvee.vn"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#cee7f0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a3e0]/30 focus:border-[#00a3e0]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#051f25] mb-1">
                    {t("adminUsers.phone")}
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+84 901 234 567"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#cee7f0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a3e0]/30 focus:border-[#00a3e0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#051f25] mb-1">
                    {t("adminUsers.role")}
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#cee7f0] rounded-xl focus:outline-none focus:border-[#00a3e0] cursor-pointer"
                  >
                    <option value="member">{t("adminUsers.member", "Thành viên (Member)")}</option>
                    <option value="superadmin">{t("adminUsers.superadmin", "Quản trị viên (Admin)")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#051f25] mb-1">
                    {t("adminUsers.status")}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#cee7f0] rounded-xl focus:outline-none focus:border-[#00a3e0] cursor-pointer"
                  >
                    <option value="active">{t("adminUsers.active")}</option>
                    <option value="locked">{t("adminUsers.locked")}</option>
                    <option value="pending">{t("adminUsers.pending")}</option>
                  </select>
                </div>
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-bold text-[#051f25] mb-1">
                    Mật khẩu khởi tạo (tùy chọn)
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Mặc định: 12345678"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#cee7f0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a3e0]/30 focus:border-[#00a3e0]"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#cee7f0]">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#3e4850] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  {t("adminUsers.cancel")}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00a3e0] hover:bg-[#008bc0] text-white text-xs font-bold uppercase tracking-wider transition-all duration-150 shadow-sm cursor-pointer"
                >
                  {editingUser ? t("adminUsers.save") : t("adminUsers.create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ROLE PERMISSION MATRIX */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-[#cee7f0] shadow-2xl overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between p-5 border-b border-[#cee7f0] bg-[#f8fdff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00658d]">
                  admin_panel_settings
                </span>
                <h3 className="font-extrabold text-[#051f25] text-lg">
                  {t("adminUsers.modalRoleTitle")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRoleModalOpen(false)}
                className="p-1 rounded-lg text-[#6e7881] hover:bg-slate-100 hover:text-[#051f25] cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 overflow-x-auto max-h-[70vh]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#e2f7ff] text-[#051f25] font-bold uppercase tracking-wider border-b border-[#cee7f0]">
                    <th className="p-3">Tính năng / Quyền hạn</th>
                    <th className="p-3 text-center">Admin</th>
                    <th className="p-3 text-center">Moderator</th>
                    <th className="p-3 text-center">Vivu Pro</th>
                    <th className="p-3 text-center">Member</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#cee7f0]">
                  <tr>
                    <td className="p-3 font-semibold text-[#051f25]">
                      Tạo lịch trình du lịch AI tự động
                    </td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ Vô hạn</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ Vô hạn</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ Vô hạn</td>
                    <td className="p-3 text-center text-slate-500">3 tour/tháng</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-[#051f25]">
                      Quản lý tài khoản & Phân quyền hệ thống
                    </td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ Toàn quyền</td>
                    <td className="p-3 text-center text-red-400">✗</td>
                    <td className="p-3 text-center text-red-400">✗</td>
                    <td className="p-3 text-center text-red-400">✗</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-[#051f25]">
                      Kiểm duyệt đánh giá, review & xử lý vi phạm
                    </td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ Toàn quyền</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ Có</td>
                    <td className="p-3 text-center text-red-400">✗</td>
                    <td className="p-3 text-center text-red-400">✗</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-[#051f25]">
                      Tải bản đồ số Offline & GPS dẫn đường
                    </td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ Có</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ Có</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ Có</td>
                    <td className="p-3 text-center text-red-400">✗</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-[#051f25]">
                      Xem báo cáo doanh thu & Phân tích thị phần
                    </td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ Toàn quyền</td>
                    <td className="p-3 text-center text-slate-500">Xem sơ bộ</td>
                    <td className="p-3 text-center text-red-400">✗</td>
                    <td className="p-3 text-center text-red-400">✗</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end p-4 border-t border-[#cee7f0] bg-[#f8fdff]">
              <button
                type="button"
                onClick={() => setIsRoleModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#00658d] text-white text-xs font-bold transition-all hover:bg-[#004e6d] cursor-pointer"
              >
                {t("adminUsers.close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: USER DETAIL & ACTIVITY */}
      {isDetailModalOpen && activeDetailUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#cee7f0] shadow-2xl overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between p-5 border-b border-[#cee7f0] bg-[#f8fdff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00658d]">account_circle</span>
                <h3 className="font-extrabold text-[#051f25] text-lg">
                  {t("adminUsers.modalDetailTitle")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1 rounded-lg text-[#6e7881] hover:bg-slate-100 hover:text-[#051f25] cursor-pointer"
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
                  <div className="w-14 h-14 rounded-full bg-[#d3ecf5] text-[#00658d] font-bold text-lg flex items-center justify-center border border-[#cee7f0]">
                    {activeDetailUser.initials || activeDetailUser.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-base text-[#051f25]">
                    {activeDetailUser.name}
                  </h4>
                  <p className="text-[#3e4850]">{activeDetailUser.email}</p>
                  <p className="text-[#6e7881]">{activeDetailUser.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#f1fbff] rounded-xl border border-[#cee7f0]">
                <div>
                  <span className="text-[#6e7881] block">Mã định danh (ID)</span>
                  <span className="font-bold text-[#051f25]">{activeDetailUser.id}</span>
                </div>
                <div>
                  <span className="text-[#6e7881] block">Vai trò</span>
                  <span className="font-bold text-[#00658d]">
                    {isEn ? activeDetailUser.roleNameEn : activeDetailUser.roleNameVi}
                  </span>
                </div>
                <div>
                  <span className="text-[#6e7881] block">Chuyến đi hoàn thành</span>
                  <span className="font-bold text-[#051f25]">
                    {activeDetailUser.tripsCompleted} tour
                  </span>
                </div>
                <div>
                  <span className="text-[#6e7881] block">Độ uy tín</span>
                  <span className="font-bold text-emerald-600">
                    {activeDetailUser.trustPercent ? `${activeDetailUser.trustPercent}%` : "Chưa có"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-[#051f25]">Nhật ký hệ thống gần nhất:</h5>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[#3e4850] space-y-1.5">
                  <div className="flex justify-between">
                    <span>• Đăng nhập gần nhất:</span>
                    <span className="font-semibold text-[#006a6a]">
                      {isEn ? activeDetailUser.lastActiveEn : activeDetailUser.lastActiveVi}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Ngày khởi tạo tài khoản:</span>
                    <span className="font-semibold text-[#051f25]">
                      {activeDetailUser.createdDate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Trạng thái KYC:</span>
                    <span className="font-semibold text-[#00658d]">
                      {activeDetailUser.verified ? "Đã xác thực CCCD/Passport" : "Chưa xác minh"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end p-4 border-t border-[#cee7f0] bg-[#f8fdff]">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#00658d] text-white text-xs font-bold transition-all hover:bg-[#004e6d] cursor-pointer"
              >
                {t("adminUsers.close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Beacon */}
      <aside className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() =>
            showToast("Wayfinder Admin Assistant: Sẵn sàng hỗ trợ quản lý tài khoản và phân quyền.")
          }
          className="w-12 h-12 p-3 rounded-full bg-[#00a3e0] hover:bg-[#00aaab] text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 active:scale-95 group relative cursor-pointer"
          title="Wayfinder OS Assistant"
        >
          <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">
            support_agent
          </span>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#56f9f9] ring-2 ring-white animate-pulse" />
        </button>
      </aside>
    </div>
  );
}