import { useState } from "react";
import { useTranslation } from "~/providers/i18n-provider";
import { useNavigate, useLocation } from "react-router-dom";
import { AppHeader, NumericInput } from "~/shared/components";
import { LoginCard, RegisterCard } from "~/features/auth";
import { LocationMapModal } from "./location-map-modal";
import { api } from "~/shared/lib/api";
import "../styles/itinerary-ui.css";

export function TripInfoPage({ initialData }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state || {};

  const [authModal, setAuthModal] = useState(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [tripName, setTripName] = useState(
    initialData?.tripName || locationState.tripName || t("tripInfo.tripSummary.defaultName") || "Chuyến đi A"
  );
  const [tripDates, setTripDates] = useState(
    initialData?.tripDates || locationState.tripDates || t("tripInfo.tripSummary.defaultDates") || "16/07/2025 - 24/07/2025"
  );
  const [destination, setDestination] = useState(
    initialData?.destination || locationState.destination || ""
  );
  const [companions, setCompanions] = useState(
    initialData?.companions || locationState.companions || ""
  );
  const [passengerCount, setPassengerCount] = useState(
    initialData?.passengerCount || locationState.passengerCount || ""
  );
  const [travelStyle, setTravelStyle] = useState(
    initialData?.travelStyle || locationState.travelStyle || ""
  );

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDates, setIsEditingDates] = useState(false);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!tripName || !tripName.trim()) {
      newErrors.tripName = t("tripInfo.validation.tripNameRequired", "Vui lòng nhập tên chuyến đi");
    }
    if (!tripDates || !tripDates.trim()) {
      newErrors.tripDates = t("tripInfo.validation.tripDatesRequired", "Vui lòng nhập ngày đi - về");
    }
    if (!destination || !destination.trim()) {
      newErrors.destination = t("tripInfo.validation.destinationRequired", "Vui lòng nhập điểm đến của bạn");
    }
    if (!companions || !companions.trim()) {
      newErrors.companions = t("tripInfo.validation.companionsRequired", "Vui lòng nhập thông tin bạn đi cùng ai");
    }
    if (!passengerCount || !passengerCount.trim()) {
      newErrors.passengerCount = t("tripInfo.validation.passengerCountRequired", "Vui lòng nhập số lượng người");
    }
    if (!travelStyle || !travelStyle.trim()) {
      newErrors.travelStyle = t("tripInfo.validation.travelStyleRequired", "Vui lòng nhập phong cách chuyến đi");
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Frontend validation
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const formData = {
      tripName: tripName.trim(),
      tripDates: tripDates.trim(),
      destination: destination.trim(),
      companions: companions.trim(),
      passengerCount: passengerCount.trim(),
      travelStyle: travelStyle.trim()
    };

    try {
      // 2. Backend validation API call: POST /api/v1/trips/validate
      await api.post("/api/v1/trips/validate", formData);
      navigate("/trip/create", { state: formData });
    } catch (err) {
      console.warn("Backend validation or network error:", err.message);
      // If backend returned error message
      setErrors({ general: err.message || "Không thể xác thực thông tin với máy chủ" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="itinerary-step-page trip-info-page bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans min-h-screen flex flex-col antialiased selection:bg-slate-200">
      {/* AppHeader matching Homepage */}
      <AppHeader
        onLogin={() => setAuthModal("login")}
        onRegister={() => setAuthModal("register")}
      />

      {/* BEGIN: StepperSection */}
      <section aria-label="Quy trình từng bước" className="wizard-stepper trip-stepper w-full pt-6 pb-4">
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
      <main className="trip-info-main flex-grow w-full max-w-7xl mx-auto px-6 lg:px-12 py-6" data-purpose="booking-form-wizard">
        <form className="space-y-6 max-w-3xl mx-auto" onSubmit={handleSubmit}>
          {/* BEGIN: TripSummarySection */}
          <section className="trip-summary space-y-4" data-purpose="trip-summary-details">
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
          <section className="trip-destination-details space-y-4 pt-1" data-purpose="destination-inputs">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {t("tripInfo.destinationDetails.title")}
            </h2>

            {/* General Error Banner */}
            {errors.general && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <span>⚠️</span>
                <span>{errors.general}</span>
              </div>
            )}

            {/* Input Field: Đi đâu? */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-300" htmlFor="destination">
                  {t("tripInfo.destinationDetails.destinationLabel")} <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsMapModalOpen(true)}
                  className="text-xs font-semibold text-[#002d54] dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>🗺️</span>
                  <span>Chọn trên bản đồ Leaflet</span>
                </button>
              </div>

              <div className="relative">
                <input
                  className={`w-full pl-3.5 pr-10 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 bg-white dark:bg-slate-900 border rounded-xl outline-none transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer ${errors.destination
                      ? "border-rose-500 focus:border-rose-600 dark:border-rose-500"
                      : "border-slate-200 dark:border-slate-800 focus:border-[#002d54] dark:focus:border-sky-500"
                    }`}
                  id="destination"
                  placeholder={t("tripInfo.destinationDetails.destinationPlaceholder")}
                  type="text"
                  value={destination}
                  onClick={() => setIsMapModalOpen(true)}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    clearError("destination");
                  }}
                />
                <button
                  type="button"
                  onClick={() => setIsMapModalOpen(true)}
                  title="Mở bản đồ Leaflet chọn địa điểm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-[#002d54] dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  📍
                </button>
              </div>
              {errors.destination && (
                <p className="text-[11px] text-rose-500 font-medium">{errors.destination}</p>
              )}
            </div>

            {/* Two Columns Row: Đi cùng ai? & Số lượng */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-300" htmlFor="companions">
                  {t("tripInfo.destinationDetails.companionsLabel")} <span className="text-rose-500">*</span>
                </label>
                <input
                  className={`w-full px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 bg-white dark:bg-slate-900 border rounded-xl outline-none transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${errors.companions
                      ? "border-rose-500 focus:border-rose-600 dark:border-rose-500"
                      : "border-slate-200 dark:border-slate-800 focus:border-[#002d54] dark:focus:border-sky-500"
                    }`}
                  id="companions"
                  type="text"
                  value={companions}
                  onChange={(e) => {
                    setCompanions(e.target.value);
                    clearError("companions");
                  }}
                />
                {errors.companions && (
                  <p className="text-[11px] text-rose-500 font-medium">{errors.companions}</p>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-300" htmlFor="passengerCount">
                  {t("tripInfo.destinationDetails.passengerCountLabel")} <span className="text-rose-500">*</span>
                </label>
                <NumericInput
                  className={`w-full px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 bg-white dark:bg-slate-900 border rounded-xl outline-none transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${errors.passengerCount
                      ? "border-rose-500 focus:border-rose-600 dark:border-rose-500"
                      : "border-slate-200 dark:border-slate-800 focus:border-[#002d54] dark:focus:border-sky-500"
                    }`}
                  id="passengerCount"
                  placeholder={t("tripInfo.destinationDetails.passengerCountPlaceholder")}
                  value={passengerCount}
                  onChange={(val) => {
                    setPassengerCount(val);
                    clearError("passengerCount");
                  }}
                  showSteppers={true}
                />
                {errors.passengerCount && (
                  <p className="text-[11px] text-rose-500 font-medium">{errors.passengerCount}</p>
                )}
              </div>
            </div>

            {/* Input Field: Phong cách chuyến đi? */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-300" htmlFor="travelStyle">
                {t("tripInfo.destinationDetails.travelStyleLabel")} <span className="text-rose-500">*</span>
              </label>
              <input
                className={`w-full px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 bg-white dark:bg-slate-900 border rounded-xl outline-none transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${errors.travelStyle
                    ? "border-rose-500 focus:border-rose-600 dark:border-rose-500"
                    : "border-slate-200 dark:border-slate-800 focus:border-[#002d54] dark:focus:border-sky-500"
                  }`}
                id="travelStyle"
                placeholder={t("tripInfo.destinationDetails.travelStylePlaceholder")}
                type="text"
                value={travelStyle}
                onChange={(e) => {
                  setTravelStyle(e.target.value);
                  clearError("travelStyle");
                }}
              />
              {errors.travelStyle && (
                <p className="text-[11px] text-rose-500 font-medium">{errors.travelStyle}</p>
              )}
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
              disabled={isSubmitting}
              className="bg-[#002d54] hover:bg-[#001f3b] dark:bg-sky-500 dark:hover:bg-sky-600 dark:text-slate-950 text-white text-xs font-semibold py-3 px-8 rounded-xl shadow-xs transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#002d54] cursor-pointer min-w-[140px] disabled:opacity-60"
              type="submit"
            >
              {isSubmitting ? "Đang kiểm tra..." : t("tripInfo.actions.nextStep")}
            </button>
          </div>
          {/* END: ActionArea */}
        </form>
      </main>
      {/* END: MainContent */}

      {/* Location Leaflet Map Pop-Up Modal */}
      {isMapModalOpen && (
        <LocationMapModal
          initialQuery={destination}
          onClose={() => setIsMapModalOpen(false)}
          onConfirm={(selectedName, coords) => {
            setDestination(selectedName);
            clearError("destination");
            setIsMapModalOpen(false);
          }}
        />
      )}

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
