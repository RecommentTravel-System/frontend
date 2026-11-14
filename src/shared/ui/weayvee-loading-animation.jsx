import { useId } from "react";
import "./weayvee-loading-animation.css";

/**
 * WeayveeLoadingAnimation
 *
 * Vector-based brand loading animation for Weayvee:
 * - 100% SVG Vector geometry (zero raster images, zero PNG/JPG dependencies)
 * - Brand Elements: Location Pin (Destination), Mountain Chevron (Route/Terrain),
 *   Flight Arc Trail (Journey), and Hero Airplane (Exploration/Vivu).
 * - Single Hero Motion: The brand mark materializes and activates its travel journey.
 * - Architecture: Pure presentational component, decoupled from overlay & loading state logic.
 * - Accessibility: aria-hidden="true", full reduced-motion & [data-motion="off"] support.
 *
 * @param {Object} props
 * @param {number|string} [props.size=136] - Display width/height in pixels
 * @param {boolean} [props.isStatic=false] - When true, renders completed static vector logo
 * @param {string} [props.className=""] - Optional wrapper CSS class
 */
export function WeayveeLoadingAnimation({
  size = 136,
  isStatic = false,
  className = ""
}) {
  const idPrefix = useId().replace(/:/g, "");
  const pinGradId = `wayvee-pin-grad-${idPrefix}`;
  const mountainDarkId = `wayvee-mtn-dark-${idPrefix}`;
  const mountainTealId = `wayvee-mtn-teal-${idPrefix}`;
  const pinMaskId = `wayvee-pin-mask-${idPrefix}`;

  return (
    <div
      className={`weayvee-vector-loader ${isStatic ? "is-static" : ""} ${className}`.trim()}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 160 160"
        width={size}
        height={size}
        className="weayvee-vector-svg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Outer Pin Cyan Gradient */}
          <linearGradient id={pinGradId} x1="24" y1="20" x2="136" y2="146" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--wayvee-pin-from)" />
            <stop offset="100%" stopColor="var(--wayvee-pin-to)" />
          </linearGradient>

          {/* Left Mountain Facet Gradient (Dark Navy) */}
          <linearGradient id={mountainDarkId} x1="45" y1="72" x2="100" y2="130" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--wayvee-mountain-dark-1)" />
            <stop offset="100%" stopColor="var(--wayvee-mountain-dark-2)" />
          </linearGradient>

          {/* Right Mountain Facet Gradient (Teal/Slate) */}
          <linearGradient id={mountainTealId} x1="80" y1="72" x2="115" y2="110" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--wayvee-mountain-teal-1)" />
            <stop offset="100%" stopColor="var(--wayvee-mountain-teal-2)" />
          </linearGradient>

          {/* Pin Cutout Mask: Hallows the center and opens the upper-right departure channel */}
          <mask id={pinMaskId}>
            <rect x="0" y="0" width="160" height="160" fill="#ffffff" />
            {/* Center aperture cutout */}
            <circle cx="80" cy="72" r="32" fill="#000000" />
            {/* Upper-right departure notch */}
            <polygon points="94,48 116,22 134,36 108,60" fill="#000000" />
          </mask>
        </defs>

        {/* ── Phase 3: Destination Beacon Echo ── */}
        <circle
          cx="80"
          cy="72"
          r="32"
          fill="none"
          stroke="var(--wayvee-beacon-color)"
          strokeWidth="2.5"
          className="weayvee-anim-beacon"
        />

        {/* ── Phase 1: Location Pin Body (Destination) ── */}
        <g className="weayvee-anim-pin">
          <path
            d="M80 18C49.07 18 24 43.07 24 74C24 103.5 67 137.5 77.2 145.2C78.9 146.5 81.1 146.5 82.8 145.2C93 137.5 136 103.5 136 74C136 43.07 110.93 18 80 18Z"
            fill={`url(#${pinGradId})`}
            mask={`url(#${pinMaskId})`}
          />
        </g>

        {/* ── Phase 1b: Mountain / Route Chevron (Terrain & Way) ── */}
        <g className="weayvee-anim-mountain">
          {/* Left Dark Navy Slope */}
          <path
            d="M45 110 L78 72 C79.2 70.6 80.8 70.6 82 72 L115 110 L98 128 L80 144 L62 128 Z"
            fill={`url(#${mountainDarkId})`}
          />
          {/* Right Teal Slope */}
          <path
            d="M80 72 L115 110 L98 128 L80 106 Z"
            fill={`url(#${mountainTealId})`}
          />
          {/* Central Peak Accent / Pin Tip */}
          <path
            d="M80 106 L98 128 L80 144 L62 128 Z"
            fill="var(--wayvee-mountain-tip)"
          />
        </g>

        {/* ── Phase 2: Flight Arc Path (Journey Swoosh) ── */}
        <path
          d="M62 76 C65 62 82 52 110 42 C125 36 135 28 140 22"
          pathLength="100"
          stroke="var(--wayvee-swoosh-stroke)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          className="weayvee-anim-swoosh"
        />

        {/* ── Phase 2b: Hero Airplane (Discovery / Vivu) ── */}
        <g className="weayvee-anim-plane">
          <path
            d="M12 2C11.45 2 11 2.45 11 3V7.5L3 11V13.5L11 11.5V17L8.5 18.5V20.5L12 19.5L15.5 20.5V18.5L13 17V11.5L21 13.5V11L13 7.5V3C13 2.45 12.55 2 12 2Z"
            fill="var(--wayvee-plane-fill)"
          />
        </g>
      </svg>
    </div>
  );
}

