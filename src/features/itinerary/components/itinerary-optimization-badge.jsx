export function ItineraryOptimizationBadge({ onOptimize }) {
  return (
    <div className="bg-gradient-to-r from-[#0b2545] to-[#062c4b] dark:from-[#111a2e] dark:to-[#1e293b] text-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-sky-500/20 shadow-md">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#00a8e8]/20 text-[#00a8e8] flex items-center justify-center font-extrabold text-lg shrink-0">
          ⚡
        </div>
        <div>
          <h4 className="font-bold text-sm sm:text-base">Tự động tối ưu thứ tự lịch trình</h4>
          <p className="text-xs text-slate-300">
            Sắp xếp vị trí thông minh theo khoảng cách địa lý và thời gian mở cửa
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onOptimize}
        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#00a8e8] hover:bg-sky-600 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer whitespace-nowrap"
      >
        Tối ưu ngay
      </button>
    </div>
  );
}
