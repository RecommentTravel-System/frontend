import { cn } from "~/shared/lib/cn";
import { Button } from "./button";

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = "",
  children,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl bg-slate-50/60 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 animate-fade-in",
        className
      )}
    >
      {icon ? (
        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700/80 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 transition-transform hover:scale-105 duration-200">
          {icon}
        </div>
      ) : (
        <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-[#00a8e8] dark:text-sky-400 flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12h8" />
          </svg>
        </div>
      )}

      {title && (
        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 mb-1.5">
          {title}
        </h3>
      )}

      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {children}

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          {actionLabel && onAction && (
            <Button variant="accent" size="md" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="outline" size="md" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
