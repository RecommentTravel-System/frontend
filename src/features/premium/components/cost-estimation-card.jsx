import { Card } from "~/shared/ui/card";
import { Badge } from "~/shared/ui/badge";

export function CostEstimationCard({ isPremium = true }) {
  const costs = [
    { label: "Di chuyển", amount: "300,000 VND" },
    { label: "Ăn uống", amount: "600,000 VND" },
    { label: "Vui chơi", amount: "400,000 VND" },
    { label: "Chỗ ở", amount: "1,000,000 VND" }
  ];

  return (
    <Card className="border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-white to-sky-500/5 dark:from-amber-950/20 dark:via-[#111a2e] dark:to-sky-950/20 p-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xl">👑</span>
          <h3 className="font-extrabold text-base text-[#0b2545] dark:text-white">
            Ước tính Chi phí Chuyến đi (Premium)
          </h3>
        </div>
        <Badge variant="amber" className="px-3 py-1 text-xs">
          Premium Feature
        </Badge>
      </div>

      {isPremium ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {costs.map((c) => (
              <div
                key={c.label}
                className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-gray-200/60 dark:border-slate-800"
              >
                <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-0.5">{c.label}</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{c.amount}</p>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-200/80 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
              Tổng chi phí sơ bộ ước tính:
            </span>
            <span className="text-lg font-extrabold text-[#00a8e8]">≈ 2,300,000 VND</span>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Nâng cấp gói Premium để mở khóa tính năng tự động tính toán tổng chi phí ước tính dựa trên lịch trình.
          </p>
          <button
            type="button"
            className="px-5 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition-colors shadow-xs"
          >
            Nâng cấp Premium ngay ⭐
          </button>
        </div>
      )}
    </Card>
  );
}
