import { useState } from "react";
import { useTranslation } from "~/providers/i18n-provider";
import { DateRangePicker } from "~/shared/components/date-range-picker";
import { NumericInput } from "~/shared/components/numeric-input";

export function HeroPlanner({ onPlannerSubmit }) {
  const { t } = useTranslation();
  const [destination, setDestination] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
    rangeString: ""
  });
  const [passengerCount, setPassengerCount] = useState("");
  const [tripType, setTripType] = useState("");

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (onPlannerSubmit) {
      onPlannerSubmit({
        destination: destination || "Huế",
        tripDates: dateRange.rangeString || "16/07/2025 - 24/07/2025",
        passengerCount: passengerCount || "2",
        travelStyle: tripType || "Thư giãn, Khám phá"
      });
    }
  };

  return (
    <section className="wayvee-container py-4 sm:py-6 relative overflow-visible z-20">
      <div className="relative rounded-3xl shadow-md min-h-[420px] sm:min-h-[460px] flex items-end sm:items-center overflow-visible">
        {/* Background image & gradient overlay container with overflow-hidden */}
        <div
          className="absolute inset-0 rounded-3xl overflow-hidden bg-cover bg-center -z-0"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1400&q=85)"
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        </div>

        {/* Content container with overflow-visible so popovers/calendar can float outside freely */}
        <div className="relative w-full px-4 sm:px-8 py-8 text-center z-10 overflow-visible">
          <h1 className="text-white text-2xl sm:text-4xl font-extrabold max-w-2xl mx-auto mb-6 sm:mb-8 leading-tight tracking-tight drop-shadow-md">
            {t("hero.title")}
          </h1>

          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-[#111a2e] rounded-3xl sm:rounded-full shadow-2xl max-w-5xl mx-auto p-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-slate-800 text-left overflow-visible border border-white/20 relative z-30"
          >
            {/* Destination Field (3 cols) */}
            <div className="px-5 py-2.5 lg:col-span-3 flex flex-col justify-center">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                {t("hero.destination")}
              </p>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={t("hero.destinationPlaceholder")}
                className="w-full text-sm font-medium text-slate-900 dark:text-slate-100 bg-transparent outline-none placeholder-gray-400 dark:placeholder-slate-500"
              />
            </div>

            {/* Date Range Picker (Check-in & Check-out) (5 cols) */}
            <div className="lg:col-span-5 relative flex flex-col justify-center overflow-visible">
              <DateRangePicker
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onChange={(res) => setDateRange(res)}
                checkInLabel={t("hero.departDate") || "Ngày đi"}
                checkOutLabel={t("hero.returnDate") || "Ngày về"}
                startPlaceholder="16/07/2025"
                endPlaceholder="24/07/2025"
                dateFormat="DD/MM/YYYY"
              />
            </div>

            {/* Guests / Numeric Person Count Field (2 cols) */}
            <div className="px-5 py-2.5 lg:col-span-2 flex flex-col justify-center">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                {t("tripInfo.destinationDetails.passengerCountLabel") || "Số người"}
              </p>
              <NumericInput
                value={passengerCount}
                onChange={setPassengerCount}
                placeholder="2 người"
                className="w-full text-sm font-medium text-slate-900 dark:text-slate-100 bg-transparent outline-none placeholder-gray-400 dark:placeholder-slate-500"
              />
            </div>

            {/* Submit Button (2 cols) */}
            <div className="p-1 sm:col-span-2 lg:col-span-2 flex items-center justify-center">
              <button
                type="submit"
                className="w-full h-full min-h-[46px] rounded-2xl sm:rounded-full bg-[#0b2545] dark:bg-sky-500 text-white dark:text-slate-950 font-bold text-sm px-5 py-3 hover:bg-[#102f58] dark:hover:bg-sky-600 transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{t("hero.createButton")}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
