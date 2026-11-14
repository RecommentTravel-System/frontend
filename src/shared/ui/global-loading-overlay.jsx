import { useState, useEffect, useRef, useCallback } from "react";
import { WeayveeLoadingAnimation } from "./weayvee-loading-animation";
import "./global-loading-overlay.css";

/**
 * GlobalLoadingOverlay
 * 
 * Unified brand loading experience for Wayvee:
 * - 100% SVG Vector brand identity motion (WeayveeLoadingAnimation)
 * - Zero raster image dependencies (no PNG/JPG/screenshots)
 * - Subtle translucent backdrop with light blur
 * - Contextual message ("Đang tìm kiếm...", "Đang mở trang...", "Đang xử lý...")
 * - 250ms anti-flicker delay threshold
 * - 200ms exit transition (fade + slight scale)
 * - Accessibility: aria-live="polite", aria-busy="true", role="status", reduced-motion support
 */
export function GlobalLoadingOverlay({
  isLoading = false,
  message = "Đang xử lý...",
  submessage = null,
  delay = 250,
  className = ""
}) {
  // Phases: "idle" | "delaying" | "visible" | "exiting"
  const [phase, setPhase] = useState("idle");
  const delayTimerRef = useRef(null);
  const exitTimerRef = useRef(null);

  const isReducedMotion = useCallback(() => {
    if (typeof window === "undefined") return false;
    const mediaReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dataMotionOff = document.documentElement.dataset.motion === "off";
    return mediaReduced || dataMotionOff;
  }, []);

  useEffect(() => {
    // Clear any pending timers
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }

    if (isLoading) {
      if (delay <= 0 || isReducedMotion()) {
        // Immediate appearance
        setPhase("visible");
      } else {
        // Anti-flicker delay threshold (200-300ms)
        setPhase("delaying");
        delayTimerRef.current = setTimeout(() => {
          setPhase("visible");
        }, delay);
      }
    } else {
      // Transition out
      if (phase === "visible" || phase === "delaying") {
        if (isReducedMotion() || phase === "delaying") {
          setPhase("idle");
        } else {
          setPhase("exiting");
          exitTimerRef.current = setTimeout(() => {
            setPhase("idle");
          }, 200);
        }
      } else {
        setPhase("idle");
      }
    }

    return () => {
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, [isLoading, delay, isReducedMotion]);

  // If completely idle, unmount from DOM completely
  if (phase === "idle" || phase === "delaying") {
    return null;
  }

  const isVisible = phase === "visible";
  const isExiting = phase === "exiting";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={message}
      className={`wayvee-global-loading-overlay ${isVisible ? "is-visible" : ""} ${isExiting ? "is-exiting" : ""} ${className}`.trim()}
    >
      <div className="wayvee-loading-stage">
        {/* Weayvee Vector Brand Motion (No Raster Assets) */}
        <WeayveeLoadingAnimation size={140} isStatic={isReducedMotion()} />

        {/* Subtle Contextual Loading Message */}
        <div className="wayvee-loading-message-box">
          <p className="wayvee-loading-message-primary">
            {message}
          </p>
          {submessage && (
            <p className="wayvee-loading-message-sub">
              {submessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

