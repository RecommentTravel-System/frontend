import { cn } from "~/shared/lib/cn";

/**
 * Reusable Skeleton loader component for asynchronous data states.
 * Uses a subtle gradient shimmer animation that respects reduced-motion.
 */
export function Skeleton({ className = "", ...props }) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-xl select-none pointer-events-none",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

