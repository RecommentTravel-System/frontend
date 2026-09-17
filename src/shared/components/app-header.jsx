import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";

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

export function AppHeader({ onLogin }) {
  return (
    <header className="wayvee-container py-4 flex items-center justify-between border-b border-gray-100 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xs">
      {/* Brand Logo matching exact screenshot */}
      <div className="flex items-center cursor-pointer">
        <WayveeLogo />
      </div>

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

        {/* User avatar button matching Image 2 */}
        <button
          type="button"
          onClick={onLogin}
          title="Đăng nhập / Tài khoản"
          className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#00a8e8] shadow-xs cursor-pointer hover:scale-105 transition-transform"
        >
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
            alt="User avatar"
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </header>
  );
}