import { forwardRef } from "react";
import { cn } from "~/shared/lib/cn";

  export const Button = forwardRef(function Button(
    {
      children,
      variant = "primary", // "primary" | "secondary" | "accent" | "outline" | "ghost" | "destructive" | "glass" | "subtle"
      size = "md", // "xs" | "sm" | "md" | "lg" | "xl"
      fullWidth = false,
      loading = false,
      disabled = false,
      leftIcon = null,
      rightIcon = null,
      className = "",
      type = "button",
      ...props
    },
    ref
  ) {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed active:scale-[0.98]";

    const variants = {
    primary:
        "bg-[#0b2545] hover:bg-[#102f58] text-white shadow-sm hover:shadow-md dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950 dark:shadow-sky-500/20",
      secondary:
        "bg-amber-500 hover:bg-amber-600 text-white shadow-sm hover:shadow-md dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950",
      accent:
        "bg-[#00a8e8] hover:bg-[#0092ca] text-white shadow-sm hover:shadow-md hover:shadow-sky-500/20 active:bg-[#007da8]",
      outline:
        "border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs",
      ghost:
        "bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 active:bg-slate-200/60 dark:active:bg-slate-800",
      destructive:
        "bg-rose-500 hover:bg-rose-600 text-white shadow-sm hover:shadow-md active:bg-rose-700 focus-visible:ring-rose-500",
      glass:
        "bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/40 text-slate-900 dark:text-white hover:bg-white/90 dark:hover:bg-slate-800/90 shadow-sm",
      subtle:
        "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-100 dark:border-sky-800/40",
    };

    const sizes = {
    xs: "px-2.5 py-1 text-xs rounded-lg gap-1.5",
      sm: "px-3.5 py-1.5 text-xs rounded-lg gap-1.5",
      md: "px-4 py-2 text-sm rounded-xl gap-2",
      lg: "px-6 py-2.5 text-base rounded-xl gap-2.5",
      xl: "px-7 py-3 text-lg rounded-2xl gap-3",
    };

    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading}
        className={cn(
          baseStyles,
          variants[variant] || variants.primary,
          sizes[size] || sizes.md,
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin -ml-1 mr-1 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          leftIcon && <span className="inline-flex shrink-0 items-center">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className="inline-flex shrink-0 items-center">{rightIcon}</span>
        )}
      </button>
    );
});
