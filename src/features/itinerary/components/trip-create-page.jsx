import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "~/providers/i18n-provider";
import { AppHeader, NumericInput } from "~/shared/components";
import { LoginCard, RegisterCard } from "~/features/auth";
import "../styles/itinerary-ui.css";

export function TripCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const locationState = useLocation().state || {};

  // Guard: redirect to Step 1 if required info is missing
  useEffect(() => {
    const hasRequiredData = locationState.tripName && locationState.destination;
    if (!hasRequiredData) {
      navigate("/trip/info", { replace: true });
    }
  }, [locationState, navigate]);

  const [authModal, setAuthModal] = useState(null);

  // Form State — No hardcoded fallbacks; Step 1 validation guarantees values
  const [tripName, setTripName] = useState(locationState.tripName || "");
  const [tripDates, setTripDates] = useState(locationState.tripDates || "");
  const [destination, setDestination] = useState(locationState.destination || "");
  const [companions, setCompanions] = useState(locationState.companions || "");
  const [passengerCount, setPassengerCount] = useState(locationState.passengerCount || "");
  const [travelStyle, setTravelStyle] = useState(locationState.travelStyle || "");

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDates, setIsEditingDates] = useState(false);

  // Hotel/Place list state - initialized strictly from locationState (NO mock data)
  const [placesList, setPlacesList] = useState(() => {
    return locationState.placesList || [];
  });

  const handleAddPlace = () => {
    navigate("/places", {
      state: {
        tripName,
        tripDates,
        destination,
        companions,
        passengerCount,
        travelStyle,
        placesList
      }
    });
  };

  const handleRemovePlace = (placeId) => {
    setPlacesList((prev) => prev.filter((p) => p.id !== placeId && p.osmId !== placeId));
  };

  const handleNextStep = () => {
    navigate("/trip/confirm", {
      state: {
        tripName,
        tripDates,
        destination,
        companions,
        passengerCount,
        travelStyle,
        placesList
      }
    });
  };

  return (
    <div className="itinerary-step-page trip-create-page bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans min-h-screen flex flex-col antialiased selection:bg-slate-200">
      {/* AppHeader identical to homepage */}
      <AppHeader
        onLogin={() => setAuthModal("login")}
        onRegister={() => setAuthModal("register")}
      />

      {/* BEGIN: StepperSection */}
      <section aria-label="Quy trình từng bước" className="wizard-stepper w-full pt-6 pb-4">
        <div className="max-w-2xl mx-auto px-4">
          <div className="relative flex items-center justify-between">
            {/* Connecting Line Background */}
            <div className="absolute left-6 right-6 top-[15px] h-[1.5px] bg-slate-300 dark:bg-slate-700 -z-0"></div>
            {/* Active Connecting Line (Step 1 to Step 2) */}
            <div className="absolute left-6 right-1/2 top-[15px] h-[1.5px] bg-[#002d54] dark:bg-sky-500 -z-0"></div>

            {/* Step 1: Nhập thông tin (Completed / Solid Navy) */}
            <div className="flex flex-col items-center relative z-10 cursor-pointer" onClick={() => navigate("/trip/info")}>
              <div className="w-8 h-8 rounded-full bg-[#002d54] dark:bg-sky-500 text-white dark:text-slate-950 flex items-center justify-center font-bold text-sm shadow-sm">
                1
              </div>
              <span className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t("tripCreate.stepper.step1")}
              </span>
            </div>

            {/* Step 2: Tạo lịch trình (Active / Solid Navy Larger) */}
            <div className="flex flex-col items-center relative z-10">
              <div className="w-10 h-10 -my-1 rounded-full bg-[#002d54] dark:bg-sky-500 text-white dark:text-slate-950 flex items-center justify-center font-bold text-base shadow-sm ring-4 ring-[#002d54]/20 dark:ring-sky-500/20">
                2
              </div>
              <span className="mt-1 text-xs font-extrabold text-[#002d54] dark:text-sky-400">
                {t("tripCreate.stepper.step2")}
              </span>
            </div>

            {/* Step 3: Hoàn tất (Inactive / Light Gray) */}
            <div className="flex flex-col items-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center font-semibold text-sm">
                3
              </div>
              <span className="mt-2 text-xs font-normal text-slate-500 dark:text-slate-400">
                {t("tripCreate.stepper.step3")}
              </span>
            </div>
          </div>
        </div>
      </section>
      {/* END: StepperSection */}

      {/* BEGIN: MainContent */}
      <main className="wizard-main flex-grow w-full max-w-7xl mx-auto px-6 lg:px-12 py-6" data-purpose="page-main-content">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column: Form & Trip Details (7 cols) */}
          <section aria-labelledby="trip-info-heading" className="lg:col-span-7 space-y-6">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight" id="trip-info-heading">
              {t("tripCreate.tripSummary.title")}
            </h1>

            {/* Sub-block: Your Trip Summary */}
            <div className="space-y-3" data-purpose="your-trip-summary">
              <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {t("tripCreate.tripSummary.yourTrip")}
              </h2>

              {/* Trip Name Row */}
              <div className="flex items-baseline justify-between text-sm">
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                    {t("tripCreate.tripSummary.nameLabel")}
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
                  {t("tripCreate.tripSummary.edit")}
                </button>
              </div>

              {/* Dates Row */}
              <div className="flex items-baseline justify-between text-sm">
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                    {t("tripCreate.tripSummary.datesLabel")}
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
                  {t("tripCreate.tripSummary.edit")}
                </button>
              </div>
            </div>

            <hr className="border-t border-slate-200 dark:border-slate-800 my-4" />

            {/* Sub-block: Location & Preferences Form */}
            <div className="space-y-4" data-purpose="location-details-form">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t("tripCreate.locationDetails.title")}
              </h2>

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                {/* Input: Đi đâu? */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-300" htmlFor="destination">
                    {t("tripCreate.locationDetails.destinationLabel")}
                  </label>
                  <input
                    className="w-full px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#002d54] dark:focus:border-sky-500 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                    id="destination"
                    name="destination"
                    placeholder={t("tripCreate.locationDetails.destinationPlaceholder")}
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>

                {/* Two-column row: Đi cùng ai? & Số lượng */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Input: Đi cùng ai? */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-300" htmlFor="companions">
                      {t("tripCreate.locationDetails.companionsLabel")}
                    </label>
                    <input
                      className="w-full px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#002d54] dark:focus:border-sky-500 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                      id="companions"
                      name="companions"
                      placeholder={t("tripCreate.locationDetails.companionsPlaceholder")}
                      type="text"
                      value={companions}
                      onChange={(e) => setCompanions(e.target.value)}
                    />
                  </div>

                  {/* Input: Số lượng */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-300" htmlFor="guest-count">
                      {t("tripCreate.locationDetails.passengerCountLabel")}
                    </label>
                    <NumericInput
                      className="w-full px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#002d54] dark:focus:border-sky-500 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                      id="guest-count"
                      name="guest-count"
                      placeholder={t("tripCreate.locationDetails.passengerCountPlaceholder")}
                      value={passengerCount}
                      onChange={(val) => setPassengerCount(val)}
                      showSteppers={true}
                    />
                  </div>
                </div>

                {/* Input: Phong cách chuyến đi? */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-300" htmlFor="trip-style">
                    {t("tripCreate.locationDetails.travelStyleLabel")}
                  </label>
                  <input
                    className="w-full px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#002d54] dark:focus:border-sky-500 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                    id="trip-style"
                    name="trip-style"
                    placeholder={t("tripCreate.locationDetails.travelStylePlaceholder")}
                    type="text"
                    value={travelStyle}
                    onChange={(e) => setTravelStyle(e.target.value)}
                  />
                </div>
              </form>
            </div>

            <hr className="border-t border-slate-200 dark:border-slate-800 mt-6" />
          </section>

          {/* Right Column: Accommodation / Destination Selection Cards (5 cols) */}
          <aside aria-label="Danh sách khách sạn đã chọn" className="lg:col-span-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.04)] space-y-4">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {t("tripCreate.selectedPlaces.title")}
              </h3>

              {placesList.length === 0 ? (
                <div className="text-center py-8 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                  <div className="w-10 h-10 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 mx-auto flex items-center justify-center text-lg">
                    📍
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t("tripCreate.selectedPlaces.emptyTitle") || "Chưa có địa điểm nào"}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t("tripCreate.selectedPlaces.emptyDesc") || "Bấm nút \"Thêm địa điểm\" bên dưới để chọn địa điểm xung quanh!"}
                  </p>
                </div>
              ) : (
                placesList.map((place) => (
                  <article key={place.id} className="flex items-center space-x-3.5 pb-2 border-b border-slate-100 dark:border-slate-800 last:border-0" data-purpose="hotel-item">
                    {/* Hotel Thumbnail */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative border border-slate-100 dark:border-slate-800">
                      <img alt={place.name} className="w-full h-full object-cover" src={place.image} />
                    </div>

                    {/* Hotel Details */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {place.name}
                        </h4>
                        {/* Star Rating */}
                        <div aria-label={`${place.rating} sao`} className="flex items-center text-amber-400 text-xs ml-1 flex-shrink-0">
                          {Array.from({ length: place.rating }).map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>
                      </div>

                      {/* Location */}
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{place.location}</p>

                      {/* Reviews & Score Badge + Remove */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-1.5">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-700 border border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800">
                            {place.score}
                          </span>
                          <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400">
                            {t("tripCreate.selectedPlaces.excellent")}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {place.reviewCount} {t("tripCreate.selectedPlaces.reviews")}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePlace(place.id)}
                          className="text-slate-400 hover:text-rose-500 text-xs p-1 transition-colors cursor-pointer"
                          title="Xóa khỏi danh sách"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </article>
                )))}

              {/* Button: Thêm địa điểm */}
              <button
                className="w-full py-2.5 px-4 mt-2 border border-slate-300 dark:border-slate-700 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                type="button"
                onClick={handleAddPlace}
              >
                <svg className="w-4 h-4 stroke-current stroke-2" fill="none" viewBox="0 0 24 24">
                  <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
                <span>{t("tripCreate.selectedPlaces.addPlaceButton")}</span>
              </button>
            </div>
          </aside>
        </div>

        {/* BEGIN: BottomActionSection */}
        <div className="w-full flex justify-center mt-12 mb-8">
          <button
            className="bg-[#002d54] hover:bg-[#001f3b] dark:bg-sky-500 dark:hover:bg-sky-600 dark:text-slate-950 text-white text-xs font-semibold py-3 px-8 rounded-xl shadow-xs transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#002d54] cursor-pointer min-w-[140px]"
            type="button"
            onClick={handleNextStep}
          >
            {t("tripCreate.actions.nextStep")}
          </button>
        </div>
        {/* END: BottomActionSection */}
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
