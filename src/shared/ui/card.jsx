import { cn } from "~/shared/lib/cn";

export function Card({ children, className = "", hover = false, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white dark:bg-[#111a2e] border border-gray-200/80 dark:border-slate-800/80 shadow-sm p-4 transition-all duration-200",
        hover && "hover:shadow-md hover:-translate-y-0.5 hover:border-gray-300 dark:hover:border-slate-700",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
