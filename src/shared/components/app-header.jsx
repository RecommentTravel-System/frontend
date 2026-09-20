import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { useTranslation } from "~/providers/i18n-provider";
import { useAuth } from "~/providers/auth-provider";

export function WayveeLogo({ className = "h-7 sm:h-8 w-auto text-[#0b2545] dark:text-white" }) {
  return (
    <svg
      viewBox="0 0 215 42"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="WAYVEE Logo"
    >
      {/* W */}
      <path d="M 2 5 L 11 37 H 17 L 25 15 L 33 37 H 39 L 48 5 H 40.5 L 36 23 L 28.5 5 H 21.5 L 14 23 L 9.5 5 Z" />

      {/* A with signature arch crossbar */}
      <path d="M 50 37 L 64.5 5 H 71.5 L 86 37 H 77.5 L 74.2 28.5 C 70.5 21 65.5 21 61.8 28.5 L 58.5 37 Z M 63.5 24 C 66.8 17.5 69.2 17.5 72.5 24 C 69.2 19 66.8 19 63.5 24 Z" />

      {/* Y */}
      <path d="M 88 5 L 97.5 20 V 37 H 104.5 V 20 L 114 5 H 105.5 L 101 14 L 96.5 5 Z" />

      {/* V */}
      <path d="M 116 5 L 125.5 37 H 132.5 L 142 5 H 133.5 L 129 25 L 124.5 5 Z" />

      {/* E 1 (Futuristic E with floating top bar and connected middle-bottom) */}
      <path d="M 144 5 H 174 V 10.5 H 144 Z" />
      <path d="M 144 18.5 H 174 V 24 H 152 V 31.5 H 174 V 37 H 144 Z" />

      {/* E 2 */}
      <path d="M 178 5 H 208 V 10.5 H 178 Z" />
      <path d="M 178 18.5 H 208 V 24 H 186 V 31.5 H 208 V 37 H 178 Z" />
    </svg>
  );
}

export function AppHeader({ onLogin, onRegister }) {
  const navigate = useNavigate();
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
    if (isAuthenticated) {
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

  const menuItems = [
    {
      id: "personalData",
      label: t("userMenu.personalData"),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 flex-shrink-0">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      onClick: () => setMenuOpen(false)
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
      onClick: () => setMenuOpen(false)
    },
    {
      id: "wishLists",
      label: t("userMenu.wishLists"),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 flex-shrink-0">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
      onClick: () => setMenuOpen(false)
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
      onClick: () => setMenuOpen(false)
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
          className="w-9 h-9 rounded-full border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
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

        {/* User Auth Section: Login & Register buttons when not logged in; Avatar when logged in */}
        {isAuthenticated ? (
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
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#00a8e8] shadow-xs cursor-pointer hover:scale-105 transition-transform flex items-center justify-center"
            >
              <span className="w-full h-full flex items-center justify-center bg-[#e0f2fe] text-[#0b2545] text-xs font-extrabold">
                {(user?.fullName || "U").slice(0, 1).toUpperCase()}
              </span>
            </button>

            {/* User Menu Dropdown Popover matching Image */}
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
                      className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-800 dark:text-slate-100 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors text-left cursor-pointer"
                      role="menuitem"
                    >
                      <span className="text-slate-700 dark:text-slate-300">
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onLogin}
              className="px-3 sm:px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#002d54] dark:hover:text-sky-400 border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {t("login") || "Đăng nhập"}
            </button>
            <button
              type="button"
              onClick={onRegister || onLogin}
              className="px-3 sm:px-3.5 py-1.5 text-xs font-bold text-white bg-[#002d54] dark:bg-sky-500 dark:text-slate-950 hover:bg-[#001f3b] dark:hover:bg-sky-600 rounded-full shadow-xs transition-colors cursor-pointer"
            >
              {t("register") || "Đăng ký"}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}