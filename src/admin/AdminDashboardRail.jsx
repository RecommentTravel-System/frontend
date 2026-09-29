import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "~/providers/i18n-provider";

// ─── Nav Items ────────────────────────────────────────────────────────────────
const navItems = [
  {
    id: "overview",
    labelKey: "adminNav.overview",
    label: "Dashboard Tổng quan",
    path: "/admin",
    badge: null,
    trailingDot: true,
    icon: (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
        <rect x="3" y="3" width="8" height="8" rx="1.5" />
        <rect x="13" y="3" width="8" height="8" rx="1.5" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" />
        <rect x="13" y="13" width="8" height="8" rx="1.5" />
      </svg>
    ),
  },
  {
    id: "users",
    labelKey: "adminNav.users",
    label: "Quản lý Người dùng",
    path: "/admin/users",
    badge: null,
    trailingDot: true,
    icon: (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: "categories",
    labelKey: "adminNav.categories",
    label: "Quản lý Danh mục",
    path: "/admin/categories",
    badge: null,
    trailingDot: true,
    icon: (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l-5.5 9h11z" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <circle cx="17.5" cy="17.5" r="3.5" />
      </svg>
    ),
  },
  {
    id: "reviews",
    labelKey: "adminNav.reviews",
    label: "Kiểm duyệt Đánh giá",
    path: "/admin/reviews",
    badge: null,
    trailingDot: true,
    icon: (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <line x1="9" y1="10" x2="15" y2="10" />
        <line x1="9" y1="14" x2="13" y2="14" />
      </svg>
    ),
  },
  {
    id: "revenue",
    labelKey: "adminNav.revenue",
    label: "Báo cáo & Doanh thu",
    path: "/admin",
    badge: null,
    trailingDot: true,
    icon: (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
        <polyline points="3 8 9 2 15 8 21 2" />
      </svg>
    ),
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminDashboardRail({ active }) {
  const { t } = useTranslation();
  const location = useLocation();

  // Determine active item from prop or URL
  const resolveActive = (item) => {
    if (active) return item.id === active;
    if (item.path === "/admin") return location.pathname === "/admin" || location.pathname === "/admin/dashboard";
    return location.pathname.startsWith(item.path);
  };

  return (
    <aside
      className="hidden md:flex flex-col w-[220px] shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] h-full overflow-hidden transition-colors select-none group/rail"
      aria-label="Admin navigation"
    >
      {/* Brand strip */}
      <div className="shrink-0 flex items-center gap-2.5 px-5 py-5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="w-8 h-8 rounded-xl bg-[#00a3e0] flex items-center justify-center shadow-sm">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <div className="text-[13px] font-extrabold text-[#002d54] dark:text-white tracking-tight leading-none">WAYVEE</div>
          <div className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">{t("adminNav.portalBadge", "Admin Portal")}</div>
        </div>
      </div>

      {/* Section label */}
      <div className="shrink-0 px-5 pt-4 pb-1.5">
        <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {t("adminNav.mainMenu", "Menu chính")}
        </span>
      </div>

      {/* Nav items container with hover-only scrollbar */}
      <nav className="flex-1 overflow-y-auto px-2.5 pb-4 space-y-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-transparent group-hover/rail:[&::-webkit-scrollbar-thumb]:bg-slate-300 dark:group-hover/rail:[&::-webkit-scrollbar-thumb]:bg-slate-700 group-hover/rail:[scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full transition-all">
        {navItems.map((item) => {
          const isActive = resolveActive(item);
          return (
            <Link
              key={item.id}
              to={item.path}
              id={`admin-nav-${item.id}`}
              className={`
                group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all
                ${isActive
                  ? "bg-[#e8f6fd] dark:bg-sky-950/60 text-[#00a3e0] font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                }
              `}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Active bar indicator */}
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-[#00a3e0]"
                  aria-hidden="true"
                />
              )}

              {/* Icon */}
              <span
                className={`shrink-0 transition-colors ${
                  isActive ? "text-[#00a3e0]" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                }`}
              >
                {item.icon}
              </span>

              {/* Label */}
              <span className="flex-1 truncate">{item.labelKey ? t(item.labelKey, item.label) : item.label}</span>

              {/* Badge */}
              {item.badge}

              {/* Active trailing dot */}
              {item.trailingDot && isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#00a3e0] shrink-0" aria-hidden="true" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer User Info */}
      <div className="shrink-0 px-4 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#00a3e0]/10 dark:bg-sky-950/60 flex items-center justify-center text-[#00a3e0] text-xs font-bold">A</div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate">Admin</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{t("adminNav.roleAdmin", "Quản trị viên")}</div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Online" />
        </div>
      </div>
    </aside>
  );
}
