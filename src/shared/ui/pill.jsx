import { cn } from "~/shared/lib/cn";

export function Pill({ children, active = false, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap cursor-pointer",
        active
          ? "bg-[#0b2545] dark:bg-sky-500 text-white dark:text-slate-950 border-[#0b2545] dark:border-sky-500 shadow-sm"
          : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700",
        className
      )}
    >
      {children}
    </button>
  );
}
