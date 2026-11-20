import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "~/providers/i18n-provider";
import { useAuth } from "~/providers/auth-provider";
import iconImg from "~/assets/icon.png";
import textImg from "~/assets/wayvee-text.png";
import textDarkImg from "~/assets/wayvee-text-dark.png";

/**
 * Startup / Splash Screen for Desktop & Web App
 * 
 * Flow:
 * 1. Cold start / window open: Brand logo smoothly reveals (opacity 0->1, scale 0.95->1).
 * 2. Runs app initialization tasks in parallel (session restore, profile refresh, asset preload).
 * 3. Enforces an optimal minimum duration (900-1100ms) for polished feel without keeping user waiting.
 * 4. Once initialization completes and min duration passes:
 *    - Signals onReady() so main page fades in behind
 *    - Fades out overlay (opacity 1->0, scale 1.02)
 *    - Calls onFinish() to unmount completely from DOM.
 * 5. Fail-safe: If network or backend stalls > 6s, switches to an actionable error state (Retry / Continue).
 * 6. Accessibility: Instant transition if prefers-reduced-motion or data-motion="off".
 */
export function SplashScreen({ onReady, onFinish, minDuration = 1000, maxTimeout = 6000 }) {
  const { t } = useTranslation();
  const { refreshUser } = useAuth();

  const [phase, setPhase] = useState("initializing"); // "initializing" | "ready" | "exiting" | "error"
  const [statusText, setStatusText] = useState(() => t("splash.starting", "Đang khởi động Wayvee..."));
  const [errorMessage, setErrorMessage] = useState("");

  const startTimeRef = useRef(Date.now());
  const failSafeTimerRef = useRef(null);

  // Check if user prefers reduced motion
  const isReducedMotion = useCallback(() => {
    if (typeof window === "undefined") return false;
    const mediaReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dataMotionOff = document.documentElement.dataset.motion === "off";
    return mediaReduced || dataMotionOff;
  }, []);

  // Smooth exit transition
  const triggerExitTransition = useCallback(() => {
    // 1. Alert parent that app is ready (main page fades in)
    if (onReady) onReady();
    setPhase("exiting");

    const exitDuration = isReducedMotion() ? 0 : 280;
    setTimeout(() => {
      if (onFinish) onFinish();
    }, exitDuration);
  }, [onReady, onFinish, isReducedMotion]);

  // Execute actual app initialization tasks
  const runInitialization = useCallback(async () => {
    startTimeRef.current = Date.now();
    setPhase("initializing");
    setErrorMessage("");
    setStatusText(t("splash.starting", "Đang khởi động Wayvee..."));

    // Task 1: Check localStorage and restore session if authenticated
    const sessionPromise = (async () => {
      try {
        const token = localStorage.getItem("wayvee_token");
        if (token && refreshUser) {
          setStatusText(t("splash.syncing", "Đang đồng bộ phiên đăng nhập..."));
          await Promise.race([
            refreshUser(),
            new Promise((res) => setTimeout(res, 3500)) // Cap profile sync to 3.5s
          ]);
        }
      } catch (err) {
        console.warn("Startup session check warning:", err);
      }
    })();

    // Task 2: Preload critical brand assets into browser memory
    const assetPreloadPromise = (async () => {
      try {
        const preload = (src) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = img.onerror = resolve;
            img.src = src;
          });
        await Promise.all([
          preload(iconImg),
          preload(textImg),
          preload(textDarkImg)
        ]);
      } catch {
        // Non-blocking
      }
    })();

    // Run tasks in parallel
    try {
      await Promise.all([sessionPromise, assetPreloadPromise]);

      // Calculate remaining time for minimum duration threshold
      const elapsed = Date.now() - startTimeRef.current;
      const targetMinDuration = isReducedMotion() ? 0 : minDuration;
      const remainingTime = Math.max(0, targetMinDuration - elapsed);

      setStatusText(t("splash.ready", "Sẵn sàng!"));

      setTimeout(() => {
        if (failSafeTimerRef.current) clearTimeout(failSafeTimerRef.current);
        triggerExitTransition();
      }, remainingTime);
    } catch (err) {
      console.error("Initialization error:", err);
      setErrorMessage(err?.message || "Không thể tải cấu hình ứng dụng.");
      setPhase("error");
    }
  }, [t, refreshUser, minDuration, isReducedMotion, triggerExitTransition]);

  // Fail-safe timeout watchdog
  useEffect(() => {
    failSafeTimerRef.current = setTimeout(() => {
      if (phase === "initializing") {
        setPhase("error");
        setErrorMessage(t("splash.timeout", "Quá trình khởi động mất nhiều thời gian hơn dự kiến. Máy chủ backend có thể đang bận hoặc mạng chậm."));
      }
    }, maxTimeout);

    runInitialization();

    return () => {
      if (failSafeTimerRef.current) clearTimeout(failSafeTimerRef.current);
    };
  }, []); // Run on mount

  const handleRetry = () => {
    runInitialization();
  };

  const handleBypass = () => {
    triggerExitTransition();
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Khởi động ứng dụng Wayvee"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none bg-gradient-to-b from-[#f8fafc] to-[#eef2f6] dark:from-[#0b1220] dark:to-[#070d18] transition-all duration-300 ${
        phase === "exiting" ? "opacity-0 scale-[1.02] pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Background ambient lighting - subtle, performant radial blur */}
      <div
        className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-sky-200/40 dark:bg-sky-500/10 blur-3xl pointer-events-none -translate-y-6"
        aria-hidden="true"
      />

      {/* Main Brand & Status Content */}
      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
        {/* Brand Icon with Clean Depth */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-center p-3 sm:p-4 mb-4 transition-transform duration-300 animate-splash-logo">
          <img
            src={iconImg}
            alt="Wayvee"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Brand Text Logo */}
        <div className="flex items-center justify-center h-8 sm:h-9 mb-1.5 animate-splash-logo">
          <img
            src={textImg}
            alt="WAYVEE"
            className="h-6 sm:h-7 w-auto object-contain dark:hidden"
          />
          <img
            src={textDarkImg}
            alt="WAYVEE"
            className="h-6 sm:h-7 w-auto object-contain hidden dark:block"
          />
        </div>

        {/* Tagline */}
        <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">
          {t("splash.tagline", "Lập & Tối ưu lịch trình thông minh")}
        </p>

        {/* Conditional States: Initializing vs Error */}
        {phase !== "error" ? (
          <div className="flex flex-col items-center space-y-3 w-full">
            {/* Subtle Indeterminate Progress Track */}
            <div
              className="w-36 h-1 bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden relative shadow-inner"
              aria-hidden="true"
            >
              <div className="h-full w-14 bg-gradient-to-r from-[#00a8e8] via-sky-400 to-[#0b2545] dark:to-sky-200 rounded-full animate-splash-progress" />
            </div>

            {/* Subtle Status Label */}
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-tight animate-fade-in">
              {statusText}
            </p>
          </div>
        ) : (
          /* Fail-Safe Error Panel */
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-lg w-full space-y-3 animate-modal-enter text-left">
            <div className="flex items-start gap-2.5">
              <span className="text-amber-500 text-lg leading-none shrink-0 mt-0.5">⚠️</span>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {t("splash.errorTitle", "Khởi động chậm hơn dự kiến")}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {errorMessage || t("splash.errorDefault", "Không thể hoàn tất kết nối dữ liệu. Bạn có thể thử lại hoặc tiếp tục vào ứng dụng.")}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleRetry}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
              >
                {t("splash.retry", "Thử lại")}
              </button>
              <button
                type="button"
                onClick={handleBypass}
                className="px-3.5 py-1.5 rounded-lg bg-[#0b2545] dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-bold hover:bg-[#102f58] dark:hover:bg-sky-400 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                {t("splash.continue", "Vào ứng dụng")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

