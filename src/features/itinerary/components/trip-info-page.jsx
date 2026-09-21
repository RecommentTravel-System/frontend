import { useState } from "react";
import { useTranslation } from "~/providers/i18n-provider";
import { useNavigate, useLocation } from "react-router-dom";
import { AppHeader, AppFooter } from "~/shared/components";
import { LoginCard, RegisterCard } from "~/features/auth";
import { LocationMapModal } from "./location-map-modal";
import { api } from "~/shared/lib/api";
import "../styles/itinerary-ui.css";

const PREFERENCE_STYLES = [
  { id: "relax", labelKey: "tripInfo.styles.relax", defaultLabel: "Thư giãn" },
  { id: "food", labelKey: "tripInfo.styles.food", defaultLabel: "Khám phá ẩm thực" },
  { id: "checkin", labelKey: "tripInfo.styles.checkin", defaultLabel: "Check-in sống ảo" },
  { id: "culture", labelKey: "tripInfo.styles.culture", defaultLabel: "Văn hóa di sản" },
  { id: "outdoor", labelKey: "tripInfo.styles.outdoor", defaultLabel: "Trải nghiệm ngoài trời" }
];

export function TripInfoPage({ initialData }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state || {};

  const [authModal, setAuthModal] = useState(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const [tripName, setTripName] = useState(
    initialData?.tripName || locationState.tripName || t("tripInfo.defaultName") || "Chuyến đi Hà Nội - Sài Gòn"
  );
  const [tripDates, setTripDates] = useState(
    initialData?.tripDates || locationState.tripDates || t("tripInfo.defaultDates") || "16/07/2025 - 24/07/2025"
  );
  const [destination, setDestination] = useState(
    initialData?.destination || locationState.destination || "Khu phố 1, Phường Gò Vấp, Thành phố Hồ Chí Minh, 71422, Việt Nam"
  );
  const [companions, setCompanions] = useState(
    initialData?.companions || locationState.companions || "friends"
  );
  const [passengerCount, setPassengerCount] = useState(() => {
    const count = parseInt(initialData?.passengerCount || locationState.passengerCount, 10);
    return isNaN(count) || count < 1 ? 2 : count;
  });

  // Selected Style Tags
  const [selectedStyles, setSelectedStyles] = useState(() => {
    if (Array.isArray(locationState.selectedStyles)) return locationState.selectedStyles;
    if (typeof locationState.travelStyle === "string" && locationState.travelStyle) {
      return locationState.travelStyle.split(",").map((s) => s.trim());
    }
    return ["relax", "food"];
  });
  const [customStyle, setCustomStyle] = useState("");

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

  const toggleStyle = (styleId) => {
    setSelectedStyles((prev) => {
      const updated = prev.includes(styleId) ? prev.filter((id) => id !== styleId) : [...prev, styleId];
      if (updated.length > 0) clearError("travelStyle");
      return updated;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!tripName || !tripName.trim()) {
      newErrors.tripName = t("tripInfo.validation.tripNameRequired");
    }
    if (!tripDates || !tripDates.trim()) {
      newErrors.tripDates = t("tripInfo.validation.tripDatesRequired");
    }
    if (!destination || !destination.trim()) {
      newErrors.destination = t("tripInfo.validation.destinationRequired");
    }
    if (!companions) {
      newErrors.companions = t("tripInfo.validation.companionsRequired");
    }
    if (passengerCount < 1) {
      newErrors.passengerCount = t("tripInfo.validation.passengerCountRequired");
    }
    if (selectedStyles.length === 0 && !customStyle.trim()) {
      newErrors.travelStyle = t("tripInfo.validation.travelStyleRequired");
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const stylesCombined = [
      ...selectedStyles,
      ...(customStyle.trim() ? [customStyle.trim()] : [])
    ];

    const formData = {
      tripName: tripName.trim(),
      tripDates: tripDates.trim(),
      destination: destination.trim(),
      companions: companions,
      passengerCount: String(passengerCount),
      travelStyle: stylesCombined.join(", "),
      selectedStyles: stylesCombined
    };

    try {
      await api.post("/api/v1/trips/validate", formData);
      navigate("/trip/create", {
        state: {
          ...locationState,
          ...formData
        }
      });
    } catch (err) {
      console.warn("Backend validation or network error:", err.message);
      // Even if mock/offline, continue with client state
      navigate("/trip/create", {
        state: {
          ...locationState,
          ...formData
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="itinerary-step-page trip-info-page bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans min-h-screen flex flex-col justify-between antialiased selection:bg-sky-100 selection:text-[#00a3e0]">
      {/* AppHeader (Matching Shared Component Standard) */}
      <AppHeader
        onLogin={() => setAuthModal("login")}
        onRegister={() => setAuthModal("register")}
      />

      {/* BEGIN: MainContent */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full" data-purpose="primary-flow-container">
        {/* BEGIN: StepperBar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 mb-8" data-purpose="progress-stepper">
          <div className="max-w-xl mx-auto flex items-center justify-between relative">
            {/* Connecting Background Lines */}
            <div className="absolute left-8 right-8 top-5 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-800 z-0"></div>
            <div className="absolute left-8 w-1/4 top-5 -translate-y-1/2 h-0.5 bg-[#00a3e0] dark:bg-sky-500 z-0"></div>

            {/* Step 1 (Current Active Step) */}
            <div className="relative z-10 flex flex-col items-center group cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-[#00a3e0] dark:bg-sky-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-sky-100 ring-4 ring-sky-50 dark:ring-sky-950">
                1
              </div>
              <span className="mt-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-white text-center">
                {t("tripInfo.stepper.step1")}
              </span>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-slate-400 group">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center font-semibold text-sm">
                2
              </div>
              <span className="mt-2 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 text-center">
                {t("tripInfo.stepper.step2")}
              </span>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-slate-400 group">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400 flex items-center justify-center font-semibold text-sm">
                3
              </div>
              <span className="mt-2 text-xs sm:text-sm font-medium text-slate-400 text-center">
                {t("tripInfo.stepper.step3")}
              </span>
            </div>
          </div>
        </div>
        {/* END: StepperBar */}
        {/* Form Section Wrap */}
        <form className="space-y-6" data-purpose="trip-creation-form" onSubmit={handleSubmit}>
          {/* General Error Banner */}
          {errors.general && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{errors.general}</span>
            </div>
          )}

          {/* BEGIN: TripSummaryCard (Card 1) */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all" data-purpose="trip-metadata-card">
            {/* Header row of Card 1 */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00a3e0]"></span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t("tripInfo.yourTrip")}
                </h3>
              </div>
              {/* Trip duration badge */}
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#e6f6fd] dark:bg-sky-950 text-[#00a3e0] dark:text-sky-300">
                {tripDates || t("tripInfo.defaultDuration")}
              </span>
            </div>

            {/* Body Grid of Card 1 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Left: Big Title / Category */}
              <div className="md:col-span-4">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {t("tripInfo.summaryTitle")}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t("tripInfo.summarySubtitle")}
                </p>
              </div>

              {/* Right: Trip Name & Date Details */}
              <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Trip Name Item */}
                <div className="bg-slate-50/80 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {t("tripInfo.nameLabel")}
                    </span>
                    <button
                      className="text-xs font-semibold text-[#00a3e0] dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                      type="button"
                      onClick={() => setIsEditingName(!isEditingName)}
                    >
                      <span>✏️</span>
                      <span>{t("tripInfo.edit")}</span>
                    </button>
                  </div>
                  {isEditingName ? (
                    <input
                      type="text"
                      value={tripName}
                      onChange={(e) => {
                        setTripName(e.target.value);
                        clearError("tripName");
                      }}
                      onBlur={() => setIsEditingName(false)}
                      autoFocus
                      className="text-sm font-bold text-[#002d5b] dark:text-white border border-slate-300 dark:border-slate-600 rounded px-2 py-0.5 mt-0.5 outline-none bg-white dark:bg-slate-900"
                    />
                  ) : (
                    <div className="text-base font-bold text-[#002d5b] dark:text-white truncate">
                      {tripName}
                    </div>
                  )}
                  {errors.tripName && (
                    <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.tripName}</p>
                  )}
                </div>

                {/* Date Range Item */}
                <div className="bg-slate-50/80 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {t("tripInfo.datesLabel")}
                    </span>
                    <button
                      className="text-xs font-semibold text-[#00a3e0] dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                      type="button"
                      onClick={() => setIsEditingDates(!isEditingDates)}
                    >
                      <span>📅</span>
                      <span>{t("tripInfo.edit")}</span>
                    </button>
                  </div>
                  {isEditingDates ? (
                    <input
                      type="text"
                      value={tripDates}
                      onChange={(e) => {
                        setTripDates(e.target.value);
                        clearError("tripDates");
                      }}
                      onBlur={() => setIsEditingDates(false)}
                      autoFocus
                      className="text-sm font-bold text-[#002d5b] dark:text-white border border-slate-300 dark:border-slate-600 rounded px-2 py-0.5 mt-0.5 outline-none bg-white dark:bg-slate-900"
                    />
                  ) : (
                    <div className="text-base font-bold text-[#002d5b] dark:text-white">
                      {tripDates}
                    </div>
                  )}
                  {errors.tripDates && (
                    <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.tripDates}</p>
                  )}
                </div>
              </div>
            </div>
          </section>
          {/* END: TripSummaryCard */}

          {/* BEGIN: LocationInformationCard (Card 2) */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200 dark:border-slate-800" data-purpose="location-details-card">
            {/* Header of Location Card */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#002d5b] dark:text-white tracking-tight">
                  {t("tripInfo.locationTitle")}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t("tripInfo.locationSubtitle")}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Destination Field */}
              <div data-purpose="destination-input-group">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200" htmlFor="destination-input">
                    {t("tripInfo.destinationLabel")} <span className="text-rose-500">*</span>
                  </label>
                </div>

                {/* Map-only destination selector */}
                <button
                  className={`relative w-full rounded-xl shadow-2xs text-left cursor-pointer focus:border-[#00a3e0] focus:ring-2 focus:ring-[#00a3e0]/20 transition-all outline-none ${
                    errors.destination
                      ? "border border-rose-500"
                      : "border border-slate-200 dark:border-slate-700"
                  }`}
                  onClick={() => setIsMapModalOpen(true)}
                  type="button"
                  aria-label={t("tripInfo.leafletMapBtn")}
                >
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <span className={`block w-full pl-10 pr-12 py-3 rounded-xl text-sm font-medium bg-white dark:bg-slate-800 ${destination ? "text-slate-800 dark:text-slate-100" : "text-slate-400"}`}>
                    {destination || t("tripInfo.destinationPlaceholder")}
                  </span>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                      <path clipRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" fillRule="evenodd" />
                    </svg>
                  </div>
                </button>
                {errors.destination && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.destination}</p>
                )}
              </div>

              {/* Two Column Row: Companions & Member Count */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5" data-purpose="companions-and-count">
                {/* Companions Dropdown */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2" htmlFor="companion-select">
                    {t("tripInfo.companionsLabel")} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <select
                      className="w-full pl-11 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 focus:border-[#00a3e0] focus:ring-2 focus:ring-[#00a3e0]/20 transition-all outline-none cursor-pointer appearance-none"
                      id="companion-select"
                      value={companions}
                      onChange={(e) => {
                        setCompanions(e.target.value);
                        clearError("companions");
                      }}
                    >
                      <option value="friends">{t("tripInfo.companions.friends")}</option>
                      <option value="family">{t("tripInfo.companions.family")}</option>
                      <option value="couple">{t("tripInfo.companions.couple")}</option>
                      <option value="solo">{t("tripInfo.companions.solo")}</option>
                      <option value="colleagues">{t("tripInfo.companions.colleagues")}</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Stepper / Count Input */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                    {t("tripInfo.passengerCountLabel")} <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center justify-between w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{t("tripInfo.memberCountPrefix")}</span>
                    </span>
                    <div className="flex items-center gap-3">
                      {/* Decrement button */}
                      <button
                        aria-label="Giảm 1 thành viên"
                        className="w-7 h-7 rounded-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-200 flex items-center justify-center font-bold hover:bg-slate-100 dark:hover:bg-slate-600 active:scale-95 transition shadow-2xs cursor-pointer"
                        id="btn-decrement"
                        type="button"
                        onClick={() => setPassengerCount((prev) => Math.max(1, prev - 1))}
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold text-slate-800 dark:text-white text-sm" id="member-count">
                        {passengerCount}
                      </span>
                      {/* Increment button */}
                      <button
                        aria-label="Tăng 1 thành viên"
                        className="w-7 h-7 rounded-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-200 flex items-center justify-center font-bold hover:bg-slate-100 dark:hover:bg-slate-600 active:scale-95 transition shadow-2xs cursor-pointer"
                        id="btn-increment"
                        type="button"
                        onClick={() => setPassengerCount((prev) => prev + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trip Style / Preferences */}
              <div data-purpose="trip-style-section">
                <div className="flex items-center justify-between mb-2.5">
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                    {t("tripInfo.stylesLabel")} <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs font-semibold text-slate-400">
                    {t("tripInfo.selectedCount")}{" "}
                    <strong className="text-[#00a3e0] dark:text-sky-400" id="selected-tags-counter">
                      {selectedStyles.length + (customStyle.trim() ? 1 : 0)}
                    </strong>
                  </span>
                </div>

                {/* Tags List */}
                <div className="flex flex-wrap gap-2.5 mb-3" id="style-tags-container">
                  {PREFERENCE_STYLES.map((pref) => {
                    const isSelected = selectedStyles.includes(pref.id);
                    return (
                      <button
                        key={pref.id}
                        type="button"
                        onClick={() => toggleStyle(pref.id)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#00a3e0] text-white border border-[#00a3e0] shadow-xs hover:bg-[#008ec4]"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-[#00a3e0] hover:text-[#00a3e0]"
                        }`}
                      >
                        <span>{t(pref.labelKey) || pref.defaultLabel}</span>
                        {isSelected && <span className="text-white/80 font-bold text-xs">×</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Optional Custom Tag Input */}
                <input
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-[#00a3e0] focus:ring-1 focus:ring-[#00a3e0] transition outline-none text-slate-800 dark:text-slate-100"
                  placeholder={t("tripInfo.customStylePlaceholder")}
                  type="text"
                  value={customStyle}
                  onChange={(e) => {
                    setCustomStyle(e.target.value);
                    if (e.target.value.trim()) clearError("travelStyle");
                  }}
                />
                {errors.travelStyle && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.travelStyle}</p>
                )}
              </div>
            </div>
          </section>
          {/* END: LocationInformationCard */}

          {/* BEGIN: ActionButtonsFooter */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4" data-purpose="form-actions">
            

            {/* Primary Submit Button */}
            <button
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full text-sm font-bold text-white bg-[#002d5b] hover:bg-[#1e4069] dark:bg-sky-500 dark:hover:bg-sky-600 dark:text-slate-950 shadow-lg shadow-slate-900/10 active:scale-[0.98] transition-all order-1 sm:order-2 group cursor-pointer disabled:opacity-60"
              id="btn-next-step"
              type="submit"
            >
              <span>{isSubmitting ? "..." : t("tripInfo.actions.nextStep")}</span>
              <span>→</span>
            </button>
          </div>
          {/* END: ActionButtonsFooter */}
        </form>
      </main>
      {/* END: MainContent */}

      {/* Location Leaflet Map Pop-Up Modal */}
      {isMapModalOpen && (
        <LocationMapModal
          initialQuery={destination}
          onClose={() => setIsMapModalOpen(false)}
          onConfirm={(selectedName) => {
            setDestination(selectedName);
            clearError("destination");
            setIsMapModalOpen(false);
          }}
        />
      )}

      {/* Footer */}
      <AppFooter />

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
