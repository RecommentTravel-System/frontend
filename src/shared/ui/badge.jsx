import { cn } from "~/shared/lib/cn";

export function Badge({
  children,
  variant = "primary", // "primary" | "secondary" | "accent" | "amber" | "cyan" | "rose" | "emerald" | "slate" | "outline"
  size = "md", // "sm" | "md" | "lg"
  dot = false,
  className = "",
  ...props
}) {
  const variants = {
    primary:
      "bg-sky-50 dark:bg-sky-950/50 text-[#00a8e8] dark:text-sky-300 border border-sky-100 dark:border-sky-800/50",
    secondary:
      "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800/40",
    accent:
      "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-800/40",
    amber:
      "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800/40",
    cyan:
      "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-100 dark:border-cyan-800/40",
    rose:
      "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-800/40",
    emerald:
      "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40",
    slate:
      "bg-slate-100 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60",
    outline:
      "bg-transparent text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px] font-medium gap-1",
    md: "px-2.5 py-0.5 text-xs font-semibold gap-1.5",
    lg: "px-3 py-1 text-sm font-semibold gap-2",
  };

  const dotColors = {
    primary: "bg-[#00a8e8]",
    secondary: "bg-amber-500",
    accent: "bg-teal-500",
    amber: "bg-amber-500",
    cyan: "bg-cyan-500",
    rose: "bg-rose-500",
    emerald: "bg-emerald-500",
    slate: "bg-slate-400",
    outline: "bg-slate-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full leading-none transition-colors",
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors[variant] || "bg-current")}
        />
      )}
      {children}
    </span>
  );
}
