import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { GlobalLoadingOverlay } from "~/shared/ui/global-loading-overlay";
import { subscribeHttpLoading } from "~/shared/lib/api";

const LoadingContext = createContext({
  showLoading: () => () => {},
  hideLoading: () => {},
  startLoading: () => {},
  stopLoading: () => {},
  isLoading: () => false,
  globalLoading: false,
  globalText: "",
  isLongRequest: false
});

/**
 * Global Loading Provider.
 * 
 * Rules:
 * 1. Single Source of Truth for app-wide loading (Search, Navigation, Critical Operations).
 * 2. Visual: Weayvee Logo + Orbiting Airplane + Contextual Message + Subtle Overlay.
 * 3. 250ms anti-flicker delay threshold. Fast operations (< 250ms) NEVER show the overlay.
 * 4. Reference counting: Supports concurrent tasks without premature dismissal or flickering.
 * 5. Watchdog monitors operations exceeding 5s to update status, and 15s fail-safe to prevent stuck loading.
 */
export function LoadingProvider({ children }) {
  const [activeTasks, setActiveTasks] = useState({});
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalText, setGlobalText] = useState("Đang xử lý...");
  const [isLongRequest, setIsLongRequest] = useState(false);

  const delayTimerRef = useRef(null);
  const longTimerRef = useRef(null);
  const failSafeTimerRef = useRef(null);

  useEffect(() => {
    const taskIds = Object.keys(activeTasks);
    const hasTasks = taskIds.length > 0;

    if (hasTasks) {
      const topTask = activeTasks[taskIds[taskIds.length - 1]];
      const taskText = topTask?.text || "Đang xử lý...";

      if (!delayTimerRef.current) {
        // 250ms anti-flicker delay threshold
        delayTimerRef.current = setTimeout(() => {
          setGlobalLoading(true);
          setGlobalText(taskText);
        }, 250);
      } else {
        // Update message if another task registered
        setGlobalText(taskText);
      }

      if (!longTimerRef.current) {
        // 5s long-request watchdog
        longTimerRef.current = setTimeout(() => {
          setIsLongRequest(true);
          setGlobalText("Quá trình này đang mất nhiều thời gian hơn dự kiến...");
        }, 5000);
      }

      if (!failSafeTimerRef.current) {
        // 15s absolute fail-safe to prevent stuck loading
        failSafeTimerRef.current = setTimeout(() => {
          console.warn("Global loading watchdog: Operation exceeded 15s fail-safe, releasing overlay.");
          setActiveTasks({});
        }, 15000);
      }
    } else {
      // Clear timers and reset
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }
      if (longTimerRef.current) {
        clearTimeout(longTimerRef.current);
        longTimerRef.current = null;
      }
      if (failSafeTimerRef.current) {
        clearTimeout(failSafeTimerRef.current);
        failSafeTimerRef.current = null;
      }

      setGlobalLoading(false);
      setGlobalText("Đang xử lý...");
      setIsLongRequest(false);
    }
  }, [activeTasks]);

  const startLoading = useCallback((id, options = {}) => {
    setActiveTasks((prev) => ({ ...prev, [id]: options }));
  }, []);

  const stopLoading = useCallback((id) => {
    setActiveTasks((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  /**
   * Helper to trigger global loading with message and auto-cleanup.
   * Usage:
   * const done = showLoading("Đang tìm kiếm...");
   * // when finished:
   * done();
   */
  const showLoading = useCallback((message = "Đang xử lý...", taskId = null) => {
    const id = taskId || `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    startLoading(id, { text: message });
    return () => stopLoading(id);
  }, [startLoading, stopLoading]);

  const hideLoading = useCallback((taskId) => {
    if (taskId) {
      stopLoading(taskId);
    } else {
      // Clear all if no specific id given
      setActiveTasks({});
    }
  }, [stopLoading]);

  const isLoading = useCallback((id) => {
    if (id) return Boolean(activeTasks[id]);
    return globalLoading;
  }, [activeTasks, globalLoading]);

  // Global HTTP listener for auto-detecting critical/long requests
  useEffect(() => {
    const unsubscribe = subscribeHttpLoading(({ type, id, options }) => {
      const isCritical = options?.globalLoading === true || Boolean(options?.loadingMessage);
      if (type === "start") {
        if (isCritical) {
          startLoading(id, { text: options.loadingMessage || "Đang tải dữ liệu..." });
        }
      } else if (type === "end") {
        stopLoading(id);
      }
    });

    return unsubscribe;
  }, [startLoading, stopLoading]);

  return (
    <LoadingContext.Provider
      value={{
        showLoading,
        hideLoading,
        startLoading,
        stopLoading,
        isLoading,
        globalLoading,
        globalText,
        isLongRequest
      }}
    >
      {/* Global Unified Airplane Orbit Loading Experience */}
      <GlobalLoadingOverlay
        isLoading={globalLoading}
        message={globalText}
        delay={0}
      />
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  return useContext(LoadingContext);
}
