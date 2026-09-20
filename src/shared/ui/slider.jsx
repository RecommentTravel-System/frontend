import { cn } from "~/shared/lib/cn";

export function Slider({ min = 960, max = 1920, step = 20, value, onChange, className = "" }) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cn(
        "w-full h-2 bg-gray-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00a8e8]",
        className
      )}
    />
  );
}
