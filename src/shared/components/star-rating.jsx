export function StarRating({ rating = "5.0", showText = true }) {
  return (
    <span className="inline-flex items-center gap-1 text-amber-500 text-xs font-semibold">
      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6L1.3 7.7l6.1-.6z" />
      </svg>
      {showText && <span>{rating}</span>}
    </span>
  );
}
