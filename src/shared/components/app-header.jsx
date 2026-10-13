import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { useTranslation } from "~/providers/i18n-provider";
import { useAuth } from "~/providers/auth-provider";
import Avatar from "~/components/AccountAvatar.jsx";
import iconImg from "~/assets/icon.png";
import textImg from "~/assets/wayvee-text.png";
import textDarkImg from "~/assets/wayvee-text-dark.png";

export function WayveeLogo({ className = "" }) {
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 group ${className}`}>
      {/* Circular logo icon */}
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white shadow-sm flex items-center justify-center p-1.5 sm:p-2 border border-slate-100 dark:border-slate-800 transition-transform duration-200 group-hover:scale-105 shrink-0">
        <img
          src={iconImg}
          alt="Wayvee Icon"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Styled brand text matching exact proportion of the reference image */}
      <div className="flex items-center">
        <img
          src={textImg}
          alt="WAYVEE"
          className="h-[19px] sm:h-[21px] md:h-[23px] w-auto object-contain dark:hidden select-none transition-transform duration-200 group-hover:scale-[1.02]"
        />
        <img
          src={textDarkImg}
          alt="WAYVEE"
          className="h-[19px] sm:h-[21px] md:h-[23px] w-auto object-contain hidden dark:block select-none transition-transform duration-200 group-hover:scale-[1.02]"
        />
      </div>
    </div>
  );
}

export function AppHeader({ onLogin, onRegister }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (isAuthenticated) {
      setMenuOpen(true);
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setMenuOpen(false);
    }, 150);
  };

  const handleAvatarClick = () => {
    if (!isAuthenticated) {
      if (onLogin) onLogin();
    } else {
      setMenuOpen((prev) => !prev);
    }
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
 
  const role = user?.role || (Array.isArray(user?.roles) ? user?.roles[0] : null);
  const isAdmin =
    isAuthenticated &&
    Boolean(role) &&
    (String(role).toUpperCase() === "ADMIN" ||
     String(role).toUpperCase() === "ROLE_ADMIN" ||
     String(role).toUpperCase() === "SUPERADMIN");

  const menuItems = [
    ...(isAdmin
      ? [
          {
            id: "adminDashboard",
            label: t("userMenu.adminDashboard", "Trang Quản Trị (Admin)"),
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 flex-shrink-0 text-[#00a3e0]">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
            ),
            isAdminOption: true,
            onClick: () => {
              setMenuOpen(false);
              navigate("/admin");
            }
          }
        ]
      : []),
    {
      id: "personalData",
      label: t("userMenu.personalData"),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 flex-shrink-0">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      onClick: () => {
        setMenuOpen(false);
        navigate("/profile");
      }
    },
    {
      id: "payment",
      label: t("userMenu.payment"),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 flex-shrink-0">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      ),
      onClick: () => {
        setMenuOpen(false);
        navigate("/payment");
      }
    },
    {
      id: "trips",
      label: t("userMenu.trips"),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 flex-shrink-0">
          <path d="M6 20h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
          <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        </svg>
      ),
      onClick: () => {
        setMenuOpen(false);
        navigate("/saved-trips");
      }
    },
    {
      id: "wishLists",
      label: t("userMenu.wishLists"),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 flex-shrink-0">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
      onClick: () => {
        setMenuOpen(false);
        navigate("/favorites");
      }
    },
    {
      id: "reviews",
      label: t("userMenu.reviews"),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 flex-shrink-0">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <line x1="8" y1="9" x2="16" y2="9" />
          <line x1="8" y1="13" x2="14" y2="13" />
        </svg>
      ),
      onClick: () => {
        setMenuOpen(false);
        navigate("/reviews");
      }
    },
    {
      id: "logout",
      label: t("userMenu.logout"),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 flex-shrink-0">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      ),
      onClick: handleLogout
    }
  ];

  return (
    <header className="wayvee-container py-4 flex items-center justify-between border-b border-gray-100 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xs relative z-40">
      {/* Brand Logo matching exact homepage */}
      <Link to="/" className="flex items-center cursor-pointer">
        <WayveeLogo />
      </Link>

      {/* Right controls matching Image 2 */}
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeToggle />

        {/* Support headset icon */}
        <button
          type="button"
          aria-label="Support"
          title="Hỗ trợ"
          className="w-9 h-9 rounded-full border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors shadow-2xs"
        >
          <svg
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
          </svg>
        </button>

        {/* Auth section: Show Login & Register buttons when NOT authenticated; Show Avatar + Dropdown when authenticated */}
        {!isAuthenticated ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (onLogin) onLogin();
                else navigate("/login", { state: { from: location.pathname + location.search } });
              }}
              className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-[#00a3e0] dark:hover:text-[#00a3e0] hover:bg-sky-50 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-sky-200 dark:hover:border-slate-700 cursor-pointer"
            >
              {t("login", "Đăng nhập")}
            </button>
            <button
              type="button"
              onClick={() => {
                if (onRegister) onRegister();
                else navigate("/register", { state: { from: location.pathname + location.search } });
              }}
              className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#00a3e0] hover:bg-[#008ec4] transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              {t("register", "Đăng ký")}
            </button>
          </div>
        ) : (
          <div
            ref={menuRef}
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={handleAvatarClick}
              title={user?.fullName || "Tài khoản của bạn"}
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#00a3e0] shadow-xs cursor-pointer hover:scale-105 transition-transform flex items-center justify-center relative"
            >
              <Avatar name={user?.fullName} src={user?.avatarUrl || user?.avatar} />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
            </button>

            {/* User Menu Dropdown Popover */}
            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#111a2e] rounded-3xl p-3 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200 z-50"
                role="menu"
              >
                <div className="space-y-1">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={item.onClick}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-colors text-left cursor-pointer ${
                        item.isAdminOption
                          ? "bg-sky-50/80 dark:bg-sky-950/40 text-[#00a3e0] hover:bg-sky-100/90 dark:hover:bg-sky-900/50 mb-1 border border-sky-100 dark:border-sky-900/60"
                          : "text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/80"
                      }`}
                      role="menuitem"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <span className={item.isAdminOption ? "text-[#00a3e0]" : "text-slate-700 dark:text-slate-300"}>
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.isAdminOption && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-[#00a3e0] text-white shrink-0 shadow-2xs">
                          ADMIN
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}