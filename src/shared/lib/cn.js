/**
 * Combines class names cleanly
 * @param  {...any} classes
 * @returns {string}
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
