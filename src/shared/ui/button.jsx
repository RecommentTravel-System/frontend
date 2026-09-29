import { cn } from "~/shared/lib/cn";

export function Button({
  children,
  variant = "primary", // "primary" | "secondary" | "accent" | "outline" | "ghost" | "destructive"
  size = "md", // "sm" | "md" | "lg"
  fullWidth = false,
  className = "",
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

  const variants = {
    primary: "bg-[#0b2545] hover:bg-[#102f58] text-white shadow-sm dark:bg-sky-500 dark:hover:bg-sky-600 dark:text-slate-950",
    secondary: "bg-amber-500 hover:bg-amber-600 text-white shadow-sm",
    accent: "bg-[#00a8e8] hover:bg-sky-600 text-white shadow-sm",
    outline: "border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800",
    ghost: "bg-transparent text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800",
    destructive: "bg-rose-500 hover:bg-rose-600 text-white shadow-sm"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], fullWidth && "w-full", className)}
      {...props}
    >
      {children}
    </button>
  );
}
