import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "~/providers/i18n-provider";
import { AppHeader, NumericInput } from "~/shared/components";
import { LoginCard, RegisterCard } from "~/features/auth";
import "../styles/itinerary-ui.css";

export function TripConfirmPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const locationState = useLocation().state || {};

  const [authModal, setAuthModal] = useState(null);
  const [loadingStage, setLoadingStage] = useState(null); // null | "processing" | "confirming"

  // Form State
  const [tripName, setTripName] = useState(locationState.tripName || t("tripConfirm.tripSummary.defaultName"));
  const [tripDates, setTripDates] = useState(locationState.tripDates || t("tripConfirm.tripSummary.defaultDates"));
  const [destination, setDestination] = useState(locationState.destination || t("tripConfirm.tripSummary.defaultLocation"));
  const [passengerCount, setPassengerCount] = useState(locationState.passengerCount || t("tripConfirm.tripSummary.defaultPassengers"));
  const [companions] = useState(locationState.companions || "");
  const [travelStyle] = useState(locationState.travelStyle || "");

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isEditingPassengers, setIsEditingPassengers] = useState(false);

  // Places and Schedule State
  const placesList = locationState.placesList || [];
  const actionChoice = locationState.actionChoice || "saved_only";
  const daysSchedule = locationState.daysSchedule || {};

  const hasDaysAssigned = Object.values(daysSchedule).some((list) => list && list.length > 0);
  const isItineraryMode = actionChoice === "itinerary" && hasDaysAssigned;

  const handleCreateItineraryNow = () => {
    navigate("/trip/create", {
      state: {
        tripName,
        tripDates,
        destination,
        companions,
        passengerCount,
        travelStyle,
        placesList,
        actionChoice: "itinerary",
        daysSchedule
      }
    });
  };

  const handleConfirmClick = () => {
    // Save to localStorage so "Lịch trình của tôi" can pick it up
    try {
      const existingRaw = localStorage.getItem("wayvee_custom_trips");
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const newTrip = {
        id: `trip-${Date.now()}`,
        title: tripName,
        destination: destination,
        image: placesList[0]?.image || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80",
        status: "ongoing",
        confirmed: true,
        start: new Date().toISOString().split("T")[0],
        end: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
        time: "08:00 – 18:00",
        duration: tripDates || "3N / 2Đ",
        guests: Number(passengerCount) || 2,
        summary: `${passengerCount || 2} người · ${travelStyle || "Du lịch tự túc"}`,
        description: `Chuyến đi ${destination} với ${placesList.length} địa điểm được chọn.`,
        places: placesList.map((p) => p.name),
        placesList: placesList,
        hasItinerary: isItineraryMode,
        daysSchedule: daysSchedule,
        amenities: ["WiFi", "Máy lạnh", "Check-in", "Bản đồ số"]
      };
      localStorage.setItem("wayvee_custom_trips", JSON.stringify([newTrip, ...existing]));
    } catch (e) {
      console.warn("Could not save custom trip to storage", e);
    }

    // Stage 1: Processing
    setLoadingStage("processing");

    setTimeout(() => {
      // Stage 2: Confirming
      setLoadingStage("confirming");

      setTimeout(() => {
        // Complete -> Navigate to Success Page
        setLoadingStage(null);
        navigate("/trip/success", {
          state: {
            tripName,
            tripDates,
            destination,
            passengerCount,
            placesCount: placesList.length,
            isItineraryMode
          }
        });
      }, 1200);
    }, 1200);
  };

  return (
    <div className="itinerary-step-page trip-confirm-page bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans min-h-screen flex flex-col antialiased selection:bg-slate-200 relative">
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
            <div className="absolute left-6 right-6 top-[15px] h-[1.5px] bg-[#002d54] dark:bg-sky-500 -z-0"></div>

            {/* Step 1: Nhập thông tin (Completed) */}
            <div
              className="flex flex-col items-center relative z-10 cursor-pointer"
              onClick={() =>
                navigate("/trip/info", {
                  state: { tripName, tripDates, destination, companions, passengerCount, travelStyle }
                })
              }
            >
              <div className="w-8 h-8 rounded-full bg-[#002d54] dark:bg-sky-500 text-white dark:text-slate-950 flex items-center justify-center font-bold text-sm shadow-sm">
                1
              </div>
              <span className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t("tripConfirm.stepper.step1")}
              </span>
            </div>

            {/* Step 2: Chọn địa điểm (Completed) */}
            <div
              className="flex flex-col items-center relative z-10 cursor-pointer"
              onClick={() =>
                navigate("/trip/create", {
                  state: { tripName, tripDates, destination, companions, passengerCount, travelStyle, placesList, actionChoice, daysSchedule }
                })
              }
            >
              <div className="w-8 h-8 rounded-full bg-[#002d54] dark:bg-sky-500 text-white dark:text-slate-950 flex items-center justify-center font-bold text-sm shadow-sm">
                2
              </div>
              <span className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t("tripConfirm.stepper.step2")}
              </span>
            </div>

            {/* Step 3: Hoàn tất (Active) */}
            <div className="flex flex-col items-center relative z-10">
              <div className="w-10 h-10 -my-1 rounded-full bg-[#002d54] dark:bg-sky-500 text-white dark:text-slate-950 flex items-center justify-center font-bold text-base shadow-sm ring-4 ring-[#002d54]/20 dark:ring-sky-500/20">
                3
              </div>
              <span className="mt-1 text-xs font-extrabold text-[#002d54] dark:text-sky-400">
                {t("tripConfirm.stepper.step3")}
              </span>
            </div>
          </div>
        </div>
      </section>
      {/* END: StepperSection */}

      {/* BEGIN: MainContent */}
      <main className="wizard-main flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6" data-purpose="page-main-content">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t("tripConfirm.tripSummary.title")}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kiểm tra thông tin trước khi xác nhận chuyến đi
            </p>
          </div>

          {/* Mode Status Pill */}
          <div className="self-start sm:self-auto">
            {isItineraryMode ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                <span>✨</span>
                <span>{t("tripConfirm.itineraryModeBadge")}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <span>📍</span>
                <span>{t("tripConfirm.savedOnlyBadge")}</span>
              </span>
            )}
          </div>
        </div>

        {/* Sub-block 1: Your Trip */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            {t("tripConfirm.tripSummary.yourTrip")}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Trip Name */}
            <div className="flex items-baseline justify-between text-sm p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                  {t("tripConfirm.tripSummary.nameLabel")}
                </span>
                {isEditingName ? (
                  <input
                    type="text"
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    onBlur={() => setIsEditingName(false)}
                    autoFocus
                    className="text-xs text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded px-2 py-0.5 mt-0.5 outline-none bg-white dark:bg-slate-900"
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
                {t("tripConfirm.tripSummary.edit")}
              </button>
            </div>

            {/* Dates */}
            <div className="flex items-baseline justify-between text-sm p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                  {t("tripConfirm.tripSummary.datesLabel")}
                </span>
                {isEditingDates ? (
                  <input
                    type="text"
                    value={tripDates}
                    onChange={(e) => setTripDates(e.target.value)}
                    onBlur={() => setIsEditingDates(false)}
                    autoFocus
                    className="text-xs text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded px-2 py-0.5 mt-0.5 outline-none bg-white dark:bg-slate-900"
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
                {t("tripConfirm.tripSummary.edit")}
              </button>
            </div>

            {/* Destination */}
            <div className="flex items-baseline justify-between text-sm p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                  {t("tripConfirm.tripSummary.locationLabel")}
                </span>
                {isEditingLocation ? (
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    onBlur={() => setIsEditingLocation(false)}
                    autoFocus
                    className="text-xs text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded px-2 py-0.5 mt-0.5 outline-none bg-white dark:bg-slate-900"
                  />
                ) : (
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{destination}</span>
                )}
              </div>
              <button
                className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#002d54] dark:hover:text-sky-400 underline underline-offset-2 transition-colors cursor-pointer"
                type="button"
                onClick={() => setIsEditingLocation(!isEditingLocation)}
              >
                {t("tripConfirm.tripSummary.edit")}
              </button>
            </div>

            {/* Passengers */}
            <div className="flex items-baseline justify-between text-sm p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                  {t("tripConfirm.tripSummary.passengerLabel")}
                </span>
                {isEditingPassengers ? (
                  <NumericInput
                    value={passengerCount}
                    onChange={(val) => setPassengerCount(val)}
                    onBlur={() => setIsEditingPassengers(false)}
                    autoFocus
                    className="text-xs text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded px-2 py-0.5 mt-0.5 outline-none bg-white dark:bg-slate-900"
                  />
                ) : (
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{passengerCount}</span>
                )}
              </div>
              <button
                className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#002d54] dark:hover:text-sky-400 underline underline-offset-2 transition-colors cursor-pointer"
                type="button"
                onClick={() => setIsEditingPassengers(!isEditingPassengers)}
              >
                {t("tripConfirm.tripSummary.edit")}
              </button>
            </div>
          </div>
        </div>

        {/* Saved Only Notice Banner */}
        {!isItineraryMode && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Bạn đang lưu {placesList.length} địa điểm cho chuyến đi này
                </h4>
                <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                  Các địa điểm chưa được phân chia theo ngày. Bạn có thể tạo lịch trình chi tiết bất cứ lúc nào trong trang "Lịch trình của tôi".
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreateItineraryNow}
              className="px-4 py-2 bg-[#002d54] dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-bold rounded-xl whitespace-nowrap cursor-pointer hover:opacity-90 transition-opacity"
            >
              {t("tripConfirm.createItineraryCta")}
            </button>
          </div>
        )}

        {/* If Itinerary Mode: Show Day by Day Plan */}
        {isItineraryMode ? (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>📅</span>
              <span>Lịch trình theo từng ngày</span>
            </h3>

            {Object.entries(daysSchedule).map(([dayNum, placeIds]) => {
              const dayPlaces = (placeIds || [])
                .map((id) => placesList.find((p) => (p.osmId || p.id) === id))
                .filter(Boolean);

              if (dayPlaces.length === 0) return null;

              return (
                <div
                  key={dayNum}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <span className="text-xs font-bold text-[#002d54] dark:text-sky-400 bg-sky-50 dark:bg-sky-950 px-2.5 py-1 rounded-lg">
                      Ngày {dayNum} ({dayPlaces.length} địa điểm)
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {dayPlaces.map((place, idx) => (
                      <div
                        key={place.osmId || place.id || idx}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                      >
                        <div className="w-6 h-6 rounded-md bg-[#002d54] dark:bg-sky-500 text-white dark:text-slate-950 flex items-center justify-center font-bold text-xs shrink-0">
                          {idx + 1}
                        </div>
                        {place.image && (
                          <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                            <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="min-w-0 flex-grow">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {place.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {place.location || place.address}
                          </p>
                        </div>
                        {place.rating && (
                          <span className="text-xs font-bold text-amber-500 shrink-0">
                            ★ {place.rating}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Saved Places Cards List */
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Danh sách {placesList.length} địa điểm đã chọn
            </h3>
            {placesList.map((place, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-5 shadow-xs relative overflow-hidden"
              >
                {/* Place Thumbnail Container */}
                {place.image && (
                  <div className="w-full sm:w-48 h-36 sm:h-32 rounded-xl overflow-hidden flex-shrink-0 relative">
                    <img alt={place.name} className="w-full h-full object-cover" src={place.image} />
                    <span className="absolute top-2.5 left-2.5 bg-sky-400/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                      {t("tripConfirm.placeItem.discountBadge")}
                    </span>
                  </div>
                )}

                {/* Details Column */}
                <div className="flex-grow min-w-0 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                          {place.name}
                        </h4>

                        {place.rating && (
                          <div className="flex items-center text-amber-400 text-xs flex-shrink-0">
                            {Array.from({ length: Math.min(5, Math.floor(place.rating)) }).map((_, i) => (
                              <span key={i}>★</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {place.score && (
                        <span className="inline-flex items-center px-1.5 py-1 rounded text-xs font-bold bg-sky-100 text-sky-700 border border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800">
                          {place.score}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                      <span>📍</span>
                      <span>{place.location || place.address || destination}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      Địa điểm khám phá
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Button: Confirm */}
        <div className="w-full flex justify-center pt-6 pb-8">
          <button
            type="button"
            onClick={handleConfirmClick}
            className="bg-[#002d54] hover:bg-[#001f3b] dark:bg-sky-500 dark:hover:bg-sky-600 dark:text-slate-950 text-white text-xs font-semibold py-3 px-8 rounded-xl shadow-xs transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#002d54] cursor-pointer min-w-[160px]"
          >
            {t("tripConfirm.actions.confirm")}
          </button>
        </div>
      </main>
      {/* END: MainContent */}

      {/* Loading Modal Overlay */}
      {loadingStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-xs w-full text-center shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="relative w-12 h-12 mx-auto mb-5">
              <div className="w-12 h-12 rounded-full border-4 border-slate-100 dark:border-slate-800 border-t-[#002d54] dark:border-t-sky-400 animate-spin" />
            </div>

            {loadingStage === "processing" ? (
              <>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t("tripConfirm.modals.processingTitle")}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                  {t("tripConfirm.modals.processingSubtitle")}
                </p>
              </>
            ) : (
              <>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t("tripConfirm.modals.confirmingTitle")}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                  {t("tripConfirm.modals.confirmingSubtitle")}
                </p>
              </>
            )}
          </div>
        </div>
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
