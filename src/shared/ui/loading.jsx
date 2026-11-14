import { cn } from "~/shared/lib/cn";

/**
 * Minimalist, high-performance SVG Spinner.
 * Runs on GPU transform: rotate with zero layout shift.
 */
export function Spinner({
  size = "md", // "sm" | "md" | "lg"
  variant = "primary", // "primary" | "cyan" | "white"
  className = "",
  ...props
}) {
  const sizeStyles = {
    sm: "w-3.5 h-3.5 border-[2px]",
    md: "w-5 h-5 border-[2.5px]",
    lg: "w-8 h-8 border-[3px]"
  };

  const variantStyles = {
    primary: "border-slate-200 dark:border-slate-700 border-t-[#0b2545] dark:border-t-sky-400",
    cyan: "border-sky-100 dark:border-sky-950 border-t-[#00a8e8] dark:border-t-sky-400",
    white: "border-white/20 border-t-white"
  };

  return (
    <div
      role="status"
      aria-label="đang tải..."
      className={cn(
        "rounded-full animate-spin shrink-0 select-none pointer-events-none",
        sizeStyles[size] || sizeStyles.md,
        variantStyles[variant] || variantStyles.primary,
        className
      )}
      {...props}
    />
  );
}

/**
 * Global Top-Bar Progress Indicator.
 * Pinned at the very top of the window (height: 2.5px).
 * Indeterminate gliding gradient, zero layout shift, non-blocking.
 */
export function TopBarProgress({ active = false, className = "" }) {
  if (!active) return null;

  return (
    <div
      role="progressbar"
      aria-busy="true"
      aria-label="đang xử lý..."
      className={cn(
        "fixed top-0 left-0 right-0 h-[2.5px] z-[9999] overflow-hidden pointer-events-none bg-transparent animate-fade-in",
        className
      )}
    >
      <div className="h-full w-32 bg-gradient-to-r from-[#00a8e8] via-sky-400 to-[#0b2545] dark:to-sky-200 rounded-full animate-splash-progress" />
    </div>
  );
}

/**
 * Container / Section Loading Overlay.
 * For blocking specific cards, panels, or modal areas during critical operations.
 */
export function LoadingOverlay({
  active = false,
  message = "đang xử lý...",
  submessage,
  onCancel,
  className = ""
}) {
  if (!active) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "absolute inset-0 z-30 flex flex-col items-center justify-center p-4 rounded-inherit bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs transition-opacity animate-fade-in",
        className
      )}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl flex items-center gap-3 max-w-sm animate-modal-enter">
        <Spinner size="md" variant="cyan" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
            {message}
          </p>
          {submessage && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-snug">
              {submessage}
            </p>
          )}
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer shrink-0"
            title="Hủy tác vụ"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Compact Inline Loading.
 * Designed for inside search inputs, filter bars, and button labels.
 */
export function InlineLoading({ text = "", variant = "cyan", className = "" }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium animate-fade-in", className)}>
      <Spinner size="sm" variant={variant} />
      {text && <span className="truncate">{text}</span>}
    </span>
  );
}
