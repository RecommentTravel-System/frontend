import { useState } from "react";
import { useTranslation } from "~/providers/i18n-provider";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "~/shared/components";
import { LoginCard, RegisterCard } from "~/features/auth";

export function TripInfoPage({ initialData }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [authModal, setAuthModal] = useState(null);
  const [tripName, setTripName] = useState(initialData?.tripName || t("tripInfo.tripSummary.defaultName"));
  const [tripDates, setTripDates] = useState(initialData?.tripDates || t("tripInfo.tripSummary.defaultDates"));
  const [destination, setDestination] = useState(initialData?.destination || "");
  const [companions, setCompanions] = useState(initialData?.companions || "");
  const [passengerCount, setPassengerCount] = useState(initialData?.passengerCount || "");
  const [travelStyle, setTravelStyle] = useState(initialData?.travelStyle || "");

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDates, setIsEditingDates] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      tripName,
      tripDates,
      destination,
      companions,
      passengerCount,
      travelStyle
    };
    navigate("/trip/create", { state: formData });
  };

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans min-h-screen flex flex-col antialiased selection:bg-slate-200">
      {/* AppHeader matching Homepage */}
      <AppHeader onLogin={() => setAuthModal("login")} />

      {/* BEGIN: StepperSection */}
      <section aria-label="Quy trình từng bước" className="w-full pt-6 pb-4">
        <div className="max-w-2xl mx-auto px-4">
          <div className="relative flex items-center justify-between">
            {/* Connecting Line Background */}
            <div className="absolute left-6 right-6 top-[15px] h-[1.5px] bg-slate-300 dark:bg-slate-700 -z-0"></div>
            {/* Active Connecting Line */}
            <div className="absolute left-6 right-6 top-[15px] h-[1.5px] bg-slate-300 dark:bg-slate-700 -z-0"></div>

            {/* Step 1: Nhập thông tin (Active / Solid Navy) */}
            <div className="flex flex-col items-center relative z-10">
              <div className="w-10 h-10 -my-1 rounded-full bg-[#002d54] dark:bg-sky-500 text-white dark:text-slate-950 flex items-center justify-center font-bold text-base shadow-sm ring-4 ring-[#002d54]/20 dark:ring-sky-500/20">
                1
              </div>
              <span className="mt-1 text-xs font-extrabold text-[#002d54] dark:text-sky-400">
                {t("tripInfo.stepper.step1")}
              </span>
            </div>

            {/* Step 2: Tạo lịch trình (Inactive) */}
            <div className="flex flex-col items-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center font-semibold text-sm">
                2
              </div>
              <span className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                {t("tripInfo.stepper.step2")}
              </span>
            </div>

            {/* Step 3: Hoàn tất (Inactive) */}
            <div className="flex flex-col items-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center font-semibold text-sm">
                3
              </div>
              <span className="mt-2 text-xs font-normal text-slate-500 dark:text-slate-400">
                {t("tripInfo.stepper.step3")}
              </span>
            </div>
          </div>
        </div>
      </section>
      {/* END: StepperSection */}

      {/* BEGIN: MainContent */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 lg:px-12 py-6" data-purpose="booking-form-wizard">
        <form className="space-y-6 max-w-3xl mx-auto" onSubmit={handleSubmit}>
          {/* BEGIN: TripSummarySection */}
          <section className="space-y-4" data-purpose="trip-summary-details">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t("tripInfo.tripSummary.title")}
            </h1>
            <div className="pt-1 space-y-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">
                {t("tripInfo.tripSummary.yourTrip")}
              </span>
              <div className="space-y-3.5">
                {/* Tên Row */}
                <div className="flex items-baseline justify-between text-sm">
                  <div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                      {t("tripInfo.tripSummary.nameLabel")}
                    </span>
                    {isEditingName ? (
                      <input
                        type="text"
                        value={tripName}
                        onChange={(e) => setTripName(e.target.value)}
                        onBlur={() => setIsEditingName(false)}
                        autoFocus
                        className="text-xs text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded px-2 py-0.5 mt-0.5 outline-none"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{tripName}</span>
                    )}
                  </div>
                  <button
                    className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#002d54] dark:hover:text-sky-400 underline underline-offset-2 transition-colors cursor-pointer"
                    type="button"
                    onClick={() => setIsEditingName(!isEditingName)}
                  >
                    {t("tripInfo.tripSummary.edit")}
                  </button>
                </div>

                {/* Dates Row */}
                <div className="flex items-baseline justify-between text-sm">
                  <div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                      {t("tripInfo.tripSummary.datesLabel")}
                    </span>
                    {isEditingDates ? (
                      <input
                        type="text"
                        value={tripDates}
                        onChange={(e) => setTripDates(e.target.value)}
                        onBlur={() => setIsEditingDates(false)}
                        autoFocus
                        className="text-xs text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded px-2 py-0.5 mt-0.5 outline-none"
                      />
                    ) : (
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{tripDates}</span>
                    )}
                  </div>
                  <button
                    className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#002d54] dark:hover:text-sky-400 underline underline-offset-2 transition-colors cursor-pointer"
                    type="button"
                    onClick={() => setIsEditingDates(!isEditingDates)}
                  >
                    {t("tripInfo.tripSummary.edit")}
                  </button>
                </div>
              </div>
            </div>

            {/* Divider Line */}
            <div className="pt-2">
              <hr className="border-t border-slate-200 dark:border-slate-800" />
            </div>
          </section>
          {/* END: TripSummarySection */}

          {/* BEGIN: DestinationDetailsSection */}
          <section className="space-y-4 pt-1" data-purpose="destination-inputs">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {t("tripInfo.destinationDetails.title")}
            </h2>

            {/* Input Field: Đi đâu? */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-300" htmlFor="destination">
                {t("tripInfo.destinationDetails.destinationLabel")}
              </label>
              <input
                className="w-full px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#002d54] dark:focus:border-sky-500 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                id="destination"
                placeholder={t("tripInfo.destinationDetails.destinationPlaceholder")}
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>

            {/* Two Columns Row: Đi cùng ai? & Số lượng */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-300" htmlFor="companions">
                  {t("tripInfo.destinationDetails.companionsLabel")}
                </label>
                <input
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#002d54] dark:focus:border-sky-500 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                  id="companions"
                  placeholder={t("tripInfo.destinationDetails.companionsPlaceholder")}
                  type="text"
                  value={companions}
                  onChange={(e) => setCompanions(e.target.value)}
                />
              </div>

              {/* Right Column */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-300" htmlFor="passengerCount">
                  {t("tripInfo.destinationDetails.passengerCountLabel")}
                </label>
                <input
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#002d54] dark:focus:border-sky-500 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                  id="passengerCount"
                  placeholder={t("tripInfo.destinationDetails.passengerCountPlaceholder")}
                  type="text"
                  value={passengerCount}
                  onChange={(e) => setPassengerCount(e.target.value)}
                />
              </div>
            </div>

            {/* Input Field: Phong cách chuyến đi? */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-300" htmlFor="travelStyle">
                {t("tripInfo.destinationDetails.travelStyleLabel")}
              </label>
              <input
                className="w-full px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#002d54] dark:focus:border-sky-500 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                id="travelStyle"
                placeholder={t("tripInfo.destinationDetails.travelStylePlaceholder")}
                type="text"
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
              />
            </div>

            {/* Divider Line */}
            <div className="pt-4">
              <hr className="border-t border-slate-200 dark:border-slate-800" />
            </div>
          </section>
          {/* END: DestinationDetailsSection */}

          {/* BEGIN: ActionArea */}
          <div className="pt-4 flex justify-center" data-purpose="form-actions">
            <button
              className="bg-[#002d54] hover:bg-[#001f3b] dark:bg-sky-500 dark:hover:bg-sky-600 dark:text-slate-950 text-white text-xs font-semibold py-3 px-8 rounded-xl shadow-xs transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#002d54] cursor-pointer min-w-[140px]"
              type="submit"
            >
              {t("tripInfo.actions.nextStep")}
            </button>
          </div>
          {/* END: ActionArea */}
        </form>
      </main>
      {/* END: MainContent */}

      {/* Auth Modals */}
      {authModal === "login" && (
        <LoginCard
          onClose={() => setAuthModal(null)}
          onSubmit={() => setAuthModal(null)}
          onSignUp={() => setAuthModal("register")}
        />
      )}

      {authModal === "register" && (
        <RegisterCard
          onClose={() => setAuthModal(null)}
          onSubmit={() => setAuthModal(null)}
          onLogin={() => setAuthModal("login")}
        />
      )}
    </div>
  );
}
