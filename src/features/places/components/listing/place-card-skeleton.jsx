import { Skeleton } from "~/shared/ui/skeleton";

/**
 * Skeleton placeholder for PlaceCard in both 'list' and 'grid' layouts.
 * Provides instant layout stability and subtle shimmer feedback while loading.
 */
export function PlaceCardSkeleton({ variant = "list" }) {
  if (variant === "list") {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Skeleton className="w-full sm:w-48 h-36 rounded-xl shrink-0" />
        <div className="flex-1 w-full space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1.5 w-1/2">
              <Skeleton className="h-5 w-3/4 rounded-md" />
              <Skeleton className="h-3 w-1/3 rounded-md" />
            </div>
            <Skeleton className="h-5 w-10 rounded-md" />
          </div>
          <Skeleton className="h-3.5 w-2/3 rounded-md" />
          <div className="pt-2 flex justify-end">
            <Skeleton className="h-8 w-28 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
      <Skeleton className="w-full h-44 rounded-none" />
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-3/4 rounded-md" />
          <Skeleton className="h-5 w-8 rounded-md" />
        </div>
        <Skeleton className="h-3 w-1/3 rounded-md" />
        <Skeleton className="h-3.5 w-full rounded-md" />
        <div className="pt-2">
          <Skeleton className="h-8 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

