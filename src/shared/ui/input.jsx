import { cn } from "~/shared/lib/cn";

export function Input({ label, error, className = "", ...props }) {
  return (
    <div className="w-full flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</label>}
      <input
        className={cn(
          "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-gray-400 text-sm outline-none transition-colors focus:border-[#00a8e8] focus:ring-2 focus:ring-[#00a8e8]/20",
          error && "border-rose-500 focus:ring-rose-500/20",
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-rose-500 font-medium">{error}</span>}
    </div>
  );
}
