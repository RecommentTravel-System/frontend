import { cn } from "~/shared/lib/cn";

export function Badge({ children, variant = "primary", className = "" }) {
  const variants = {
    primary: "bg-[#0b2545]/10 text-[#0b2545] dark:bg-sky-500/20 dark:text-sky-300",
    amber: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
    cyan: "bg-[#00a8e8]/10 text-[#00a8e8] dark:bg-[#00a8e8]/20 dark:text-sky-300",
    rose: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
  };

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold", variants[variant], className)}>
      {children}
    </span>
  );
}
