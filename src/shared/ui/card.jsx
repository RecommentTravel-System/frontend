import { forwardRef } from "react";
import { cn } from "~/shared/lib/cn";

export const Card = forwardRef(function Card(
  {
    children,
    variant = "default", // "default" | "glass" | "elevated" | "interactive" | "bordered" | "flat"
    hover = false,
    className = "",
    ...props
  },
  ref
) {
  const variantStyles = {
    default:
      "bg-white dark:bg-[#111a2e] border border-slate-200/80 dark:border-slate-800/80 shadow-xs",
    glass:
      "bg-white/80 dark:bg-[#111a2e]/80 backdrop-blur-md border border-white/40 dark:border-slate-800/80 shadow-md",
    elevated:
      "bg-white dark:bg-[#111a2e] border border-slate-100 dark:border-slate-800 shadow-md",
    interactive:
      "bg-white dark:bg-[#111a2e] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-lg hover:-translate-y-1 hover:border-sky-300 dark:hover:border-sky-700/60 cursor-pointer active:scale-[0.99]",
    bordered:
      "bg-white dark:bg-[#0c1424] border-2 border-slate-200 dark:border-slate-800 shadow-none",
    flat:
      "bg-slate-50 dark:bg-slate-900/60 border border-transparent shadow-none",
  };

  const hoverEffect =
    hover && variant !== "interactive"
      ? "hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-700"
      : "";

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl p-5 transition-all duration-200",
        variantStyles[variant] || variantStyles.default,
        hoverEffect,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
