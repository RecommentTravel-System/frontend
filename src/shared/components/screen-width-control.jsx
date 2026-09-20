import { useState } from "react";
import { useLayout } from "~/providers/layout-provider";
import { CONTAINER_WIDTH_PRESETS, LAYOUT_DENSITY_PRESETS } from "~/shared/config/layout-presets";
import { Button } from "~/shared/ui/button";
import { Slider } from "~/shared/ui/slider";
import { Badge } from "~/shared/ui/badge";

export function ScreenWidthControl() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    config,
    setMode,
    setCustomWidth,
    setDensity,
    toggleAutoAdapt,
    resetLayout,
    effectiveWidthPx
  } = useLayout();

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title="Tùy chỉnh độ rộng màn hình giao diện"
        aria-label="Tùy chỉnh độ rộng màn hình"
        className="h-9 px-3 rounded-full border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
        <span className="hidden sm:inline">Khung hình:</span>
        <span className="text-[#00a8e8] font-bold">{config.autoAdapt ? "Auto" : `${effectiveWidthPx}px`}</span>
      </button>

      {/* Floating Modal Customizer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#111a2e] text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950 text-[#00a8e8] flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-base">Tùy chỉnh Độ rộng Giao diện</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tối ưu cho từng loại màn hình thiết bị</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 text-lg"
              >
                ×
              </button>
            </div>

            {/* Current Effective Status */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-3.5 mb-5 flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Độ rộng đang áp dụng:</span>
              <Badge variant="cyan" className="text-xs font-bold px-3 py-1">
                {typeof effectiveWidthPx === "number" ? `${effectiveWidthPx}px` : effectiveWidthPx}
              </Badge>
            </div>

            {/* Switch: Auto Adaptation */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800 mb-5">
              <div>
                <p className="text-xs font-bold">Tự động Thích ứng (Auto Responsive)</p>
                <p className="text-[11px] text-gray-500">Tự co giãn theo màn hình thiết bị đang dùng</p>
              </div>
              <button
                type="button"
                onClick={toggleAutoAdapt}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  config.autoAdapt ? "bg-[#00a8e8]" : "bg-gray-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`block w-5 h-5 bg-white rounded-full transition-transform transform ${
                    config.autoAdapt ? "translate-x-5.5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Presets List */}
            <div className={`space-y-4 ${config.autoAdapt ? "opacity-50 pointer-events-none" : ""}`}>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Chế độ độ rộng Khung hình:</p>
              <div className="grid grid-cols-2 gap-2">
                {CONTAINER_WIDTH_PRESETS.map((preset) => {
                  const isActive = !config.autoAdapt && config.mode === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setMode(preset.id)}
                      className={`p-2.5 rounded-xl text-left border text-xs font-medium transition-all ${
                        isActive
                          ? "bg-[#0b2545] dark:bg-sky-500 text-white dark:text-slate-950 border-[#0b2545] dark:border-sky-500 shadow-sm"
                          : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-gray-300"
                      }`}
                    >
                      <p className="font-bold">{preset.label}</p>
                      <p className="text-[10px] opacity-80 truncate">{preset.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Custom Slider (when custom mode selected) */}
              {config.mode === "custom" && !config.autoAdapt && (
                <div className="bg-sky-50/50 dark:bg-sky-950/30 p-3.5 rounded-2xl border border-sky-100 dark:border-sky-900 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span>Kích thước tùy chọn:</span>
                    <span className="text-[#00a8e8]">{config.customWidth}px</span>
                  </div>
                  <Slider
                    min={960}
                    max={1920}
                    step={20}
                    value={config.customWidth}
                    onChange={(val) => setCustomWidth(val)}
                  />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>960px (Laptop nhỏ)</span>
                    <span>1920px (Monitor 4K)</span>
                  </div>
                </div>
              )}

              {/* Density Options */}
              <div className="pt-2">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Mật độ lề trang (Padding):</p>
                <div className="grid grid-cols-3 gap-2">
                  {LAYOUT_DENSITY_PRESETS.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDensity(d.id)}
                      className={`py-1.5 px-2 rounded-xl text-center border text-xs font-medium ${
                        config.density === d.id
                          ? "bg-[#00a8e8] text-white border-[#00a8e8]"
                          : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-5 mt-5 border-t border-gray-100 dark:border-slate-800">
              <button
                type="button"
                onClick={resetLayout}
                className="text-xs text-gray-500 hover:text-slate-900 dark:hover:text-slate-100 font-medium underline"
              >
                Khôi phục mặc định
              </button>
              <Button variant="primary" size="sm" onClick={() => setIsOpen(false)}>
                Hoàn tất
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
