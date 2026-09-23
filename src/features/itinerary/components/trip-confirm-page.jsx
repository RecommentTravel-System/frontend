import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "~/providers/i18n-provider";
import { AppHeader } from "~/shared/components";
import { LoginCard, RegisterCard } from "~/features/auth";

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

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isEditingPassengers, setIsEditingPassengers] = useState(false);

  // List of confirmed places from user itinerary
  const placesList =
    locationState.placesList && locationState.placesList.length > 0
      ? locationState.placesList
      : [
          {
            name: "Cộng Cà Phê Nhà Thờ",
            address: "27 Nhà Thờ, Hàng Trống, Hoàn Kiếm, Hà Nội",
            specs: "View ngắm trọn Nhà Thờ Lớn · Cà phê cốt dừa",
            rating: 5,
            score: "4.8",
            reviewCount: "1,120",
            tags: ["Cà phê", "Check-in"],
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuDubrmT6I6G76VzNEsQTpx3ruw3s_1pXTpTCgcdi6NFXIi0LfVD-xywPD8zQXY5ZPCwZ0dR2Zc6qCOHEAc-dBNhg2pVZqDAF5tw9UGTVmG6cXbN6nk9v4YbOSxxatTlRWVLfxi29jgDF9XC4aq2wGU5ajWXX6BK5_9f_5N4gGU7k_Pt3BLr5uMI7E3C800MX65XYlMqSgBwDTWDiOWCcmBN8W4ekvmsmvbX_XYSWdc"
          },
          {
            name: "Lăng Chủ Tịch Hồ Chí Minh",
            address: "Số 2 Hùng Vương, Ba Đình, Hà Nội",
            specs: "Công trình văn hóa lịch sử cấp quốc gia",
            rating: 5,
            score: "4.9",
            reviewCount: "12,000+",
            tags: ["Văn hóa", "Di tích"],
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuD1GUjDo_Yuq9J22vlCLsz0ggPVTjYqk_8O6No1rOzdTpmWXq6vbzxk7F-n5naZiM8giseBPmTbsKJQ5tsAN6Bt0bL0AYDlqYYWfwKzVNpVF3UqwRPCeG1_tZ1uJDDEDrmlMCYC9mv3wsGdLAIrNUqvI7bcwuWGIGP1E1fFcHDlcxeu2ndibpei06uDoUBWAwCHumy4PliVI6yxig2_RiEL4HUZ6jCkuDcVamLEmRw"
          }
        ];

  const handleConfirmClick = () => {
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
            passengerCount
          }
        });
      }, 1500);
    }, 1500);
  };

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans min-h-screen flex flex-col antialiased selection:bg-slate-200 relative">
      {/* AppHeader identical to homepage */}
      <AppHeader onLogin={() => setAuthModal("login")} />

      {/* BEGIN: StepperSection */}
      <section aria-label="Quy trình từng bước" className="w-full pt-6 pb-4">
        <div className="max-w-2xl mx-auto px-4">
          <div className="relative flex items-center justify-between">
            {/* Connecting Line Background */}
            <div className="absolute left-6 right-6 top-[15px] h-[1.5px] bg-[#002d54] dark:bg-sky-500 -z-0"></div>

            {/* Step 1: Nhập thông tin (Completed) */}
            <div className="flex flex-col items-center relative z-10 cursor-pointer" onClick={() => navigate("/trip/info")}>
              <div className="w-8 h-8 rounded-full bg-[#002d54] dark:bg-sky-500 text-white dark:text-slate-950 flex items-center justify-center font-bold text-sm shadow-sm">
                1
              </div>
              <span className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t("tripConfirm.stepper.step1")}
              </span>
            </div>

            {/* Step 2: Tạo lịch trình (Completed) */}
            <div className="flex flex-col items-center relative z-10 cursor-pointer" onClick={() => navigate("/trip/create")}>
              <div className="w-8 h-8 rounded-full bg-[#002d54] dark:bg-sky-500 text-white dark:text-slate-950 flex items-center justify-center font-bold text-sm shadow-sm">
                2
              </div>
              <span className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t("tripConfirm.stepper.step2")}
              </span>
            </div>

            {/* Step 3: Hoàn tất (Active / Solid Navy Larger) */}
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
      <main className="flex-grow w-full max-w-4xl mx-auto px-6 lg:px-8 py-6 space-y-6" data-purpose="page-main-content">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {t("tripConfirm.tripSummary.title")}
        </h1>

        {/* Sub-block 1: Your Trip */}
        <div className="space-y-3" data-purpose="your-trip-summary">
          <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            {t("tripConfirm.tripSummary.yourTrip")}
          </h2>

          {/* Trip Name Row */}
          <div className="flex items-baseline justify-between text-sm">
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                {t("tripConfirm.tripSummary.nameLabel")}
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
              {t("tripConfirm.tripSummary.edit")}
            </button>
          </div>

          {/* Dates Row */}
          <div className="flex items-baseline justify-between text-sm">
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                {t("tripConfirm.tripSummary.datesLabel")}
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
              {t("tripConfirm.tripSummary.edit")}
            </button>
          </div>
        </div>

        {/* Sub-block 2: Địa điểm */}
        <div className="space-y-3 pt-2" data-purpose="location-summary">
          <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            {t("tripConfirm.tripSummary.locationTitle")}
          </h2>

          {/* Location Row */}
          <div className="flex items-baseline justify-between text-sm">
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                {t("tripConfirm.tripSummary.locationLabel")}
              </span>
              {isEditingLocation ? (
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onBlur={() => setIsEditingLocation(false)}
                  autoFocus
                  className="text-xs text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded px-2 py-0.5 mt-0.5 outline-none"
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

          {/* Passenger Count Row */}
          <div className="flex items-baseline justify-between text-sm">
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                {t("tripConfirm.tripSummary.passengerLabel")}
              </span>
              {isEditingPassengers ? (
                <input
                  type="text"
                  value={passengerCount}
                  onChange={(e) => setPassengerCount(e.target.value)}
                  onBlur={() => setIsEditingPassengers(false)}
                  autoFocus
                  className="text-xs text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded px-2 py-0.5 mt-0.5 outline-none"
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

        {/* Selected Place Cards List */}
        <div className="space-y-4 pt-2">
          {placesList.map((place, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-5 shadow-xs relative overflow-hidden"
            >
              {/* Place Thumbnail Container */}
              <div className="w-full sm:w-56 h-44 sm:h-36 rounded-xl overflow-hidden flex-shrink-0 relative">
                <img alt={place.name} className="w-full h-full object-cover" src={place.image} />

                {/* Badge: Ưu đãi */}
                <span className="absolute top-2.5 left-2.5 bg-sky-400/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                  {t("tripConfirm.placeItem.discountBadge")}
                </span>

                {/* Favorite Heart Button */}
                <button
                  type="button"
                  className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 hover:text-red-500 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>

                {/* Carousel Pagination Dots */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white opacity-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white opacity-60" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white opacity-60" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white opacity-60" />
                </div>
              </div>

              {/* Details Column */}
              <div className="flex-grow min-w-0 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                        {place.name}
                      </h3>

                      {/* Star Rating */}
                      <div className="flex items-center text-amber-400 text-xs flex-shrink-0">
                        {Array.from({ length: place.rating || 5 }).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                    </div>

                    {/* Rating Badge & Reviews */}
                    <div className="flex items-center space-x-1.5 text-xs flex-shrink-0">
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 block">
                          {t("tripConfirm.placeItem.excellent")}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {place.reviewCount} {t("tripConfirm.placeItem.reviews")}
                        </span>
                      </div>
                      <span className="inline-flex items-center px-1.5 py-1 rounded text-xs font-bold bg-sky-100 text-sky-700 border border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800">
                        {place.score || "5.0"}
                      </span>
                    </div>
                  </div>

                  {/* Address line */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                    <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{place.address}</span>
                  </p>
                </div>

                {/* Specs Line */}
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {place.specs}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {place.tags?.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button: Confirm */}
        <div className="w-full flex justify-center pt-6 pb-8">
          <button
            type="button"
            onClick={handleConfirmClick}
            className="bg-[#002d54] hover:bg-[#001f3b] dark:bg-sky-500 dark:hover:bg-sky-600 dark:text-slate-950 text-white text-xs font-semibold py-3 px-8 rounded-xl shadow-xs transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#002d54] cursor-pointer min-w-[140px]"
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
            {/* Blue animated spinner */}
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
