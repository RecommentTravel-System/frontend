import { useState, useEffect } from "react";

/**
 * Custom hook to prevent loading indicator flickers.
 * 
 * Rules:
 * 1. If an async task completes in < delay (default 250ms), loading state is NEVER shown.
 * 2. If the task exceeds delay, `visible` becomes true.
 * 3. Supports gradual status updates for long requests (> 2.5s, > 5s).
 * 
 * @param {boolean} isLoading - Active state of the operation
 * @param {object} options - Configuration options
 * @returns {{ visible: boolean, text: string, isLong: boolean, isTimeout: boolean }}
 */
export function useDelayedLoading(isLoading, options = {}) {
  const {
    delay = 250,
    initialText = "",
    longText = "Đang xử lý...",
    timeoutText = "Quá trình này đang mất nhiều thời gian hơn dự kiến...",
    longThreshold = 2500,
    timeoutThreshold = 5500
  } = options;

  const [visible, setVisible] = useState(false);
  const [text, setText] = useState(initialText);
  const [isLong, setIsLong] = useState(false);
  const [isTimeout, setIsTimeout] = useState(false);
  const [prevLoading, setPrevLoading] = useState(isLoading);

  if (prevLoading !== isLoading) {
    setPrevLoading(isLoading);
    if (!isLoading) {
      setVisible(false);
      setIsLong(false);
      setIsTimeout(false);
      setText(initialText);
    }
  }

  useEffect(() => {
    if (!isLoading) return;

    // Anti-flicker threshold: Only show loading if task exceeds delay
    const delayTimer = setTimeout(() => {
      setVisible(true);
    }, delay);

    // Long request stage (> 2.5s)
    const longTimer = setTimeout(() => {
      setIsLong(true);
      if (longText) setText(longText);
    }, longThreshold);

    // Timeout watchdog stage (> 5.5s)
    const timeoutTimer = setTimeout(() => {
      setIsTimeout(true);
      if (timeoutText) setText(timeoutText);
    }, timeoutThreshold);

    return () => {
      clearTimeout(delayTimer);
      clearTimeout(longTimer);
      clearTimeout(timeoutTimer);
    };
  }, [isLoading, delay, initialText, longText, timeoutText, longThreshold, timeoutThreshold]);

  return { visible, text, isLong, isTimeout };
}
