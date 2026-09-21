import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "~/providers/i18n-provider";
import { AppHeader, AppFooter } from "~/shared/components";
import { LoginCard, RegisterCard } from "~/features/auth";
import { LocationMapModal } from "./location-map-modal";
import { ItineraryBuilder } from "./itinerary-builder";
import { SavedLocationsSummary } from "./saved-locations-summary";
import "../styles/itinerary-ui.css";

const PREFERENCE_STYLES = [
  { id: "relax", labelKey: "tripInfo.styles.relax", defaultLabel: "Thư giãn" },
  { id: "food", labelKey: "tripInfo.styles.food", defaultLabel: "Khám phá ẩm thực" },
  { id: "checkin", labelKey: "tripInfo.styles.checkin", defaultLabel: "Check-in sống ảo" },
  { id: "culture", labelKey: "tripInfo.styles.culture", defaultLabel: "Văn hóa di sản" },
  { id: "outdoor", labelKey: "tripInfo.styles.outdoor", defaultLabel: "Trải nghiệm ngoài trời" }
];

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
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Form State
  const [tripName, setTripName] = useState(
    locationState.tripName || t("tripCreate.tripSummary.defaultName") || "Chuyến đi Hà Nội - Sài Gòn"
  );
  const [tripDates, setTripDates] = useState(
    locationState.tripDates || t("tripCreate.tripSummary.defaultDates") || "16/07/2025 - 24/07/2025"
  );
  const [destination, setDestination] = useState(
    locationState.destination || "Khu phố 1, Phường Gò Vấp, Thành phố Hồ Chí Minh, 71422, Việt Nam"
  );
  const [companions, setCompanions] = useState(locationState.companions || "friends");
  const [passengerCount, setPassengerCount] = useState(() => {
    const count = parseInt(locationState.passengerCount, 10);
    return isNaN(count) || count < 1 ? 2 : count;
  });

  // Selected Styles State
  const [selectedStyles, setSelectedStyles] = useState(() => {
    if (Array.isArray(locationState.selectedStyles)) return locationState.selectedStyles;
    if (typeof locationState.travelStyle === "string" && locationState.travelStyle) {
      return locationState.travelStyle.split(",").map((s) => s.trim());
    }
    return ["relax", "food"];
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDates, setIsEditingDates] = useState(false);

  // Selected places pool - initialize from state or defaults
  const [placesList, setPlacesList] = useState(() => {
    if (locationState.placesList && locationState.placesList.length > 0) {
      return locationState.placesList;
    }
    return [
      {
        id: "p-1",
        name: "Cộng Cà Phê Nhà Thờ",
        location: "27 Nhà Thờ, Hàng Trống, Hoàn Kiếm",
        category: "Cà phê & Check-in",
        duration: "~45 phút",
        rating: 4.8,
        score: "4.8",
        image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=400&q=80"
      },
      {
        id: "p-2",
        name: "Chùa Trấn Quốc",
        location: "Đường Thanh Niên, Yên Phụ, Tây Hồ",
        category: "Văn hóa tâm linh",
        duration: "~60 phút",
        rating: 4.9,
        score: "4.9",
        image: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=400&q=80"
      },
      {
        id: "p-3",
        name: "Bún Chả Hương Liên",
        location: "24 Lê Văn Hưu, Phan Chu Trinh, Hai Bà Trưng",
        category: "Ẩm thực đặc sản",
        duration: "~60 phút",
        rating: 4.7,
        score: "4.7",
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80"
      },
      {
        id: "p-4",
        name: "Hồ Tây Sunset SUP Club",
        location: "292 Lạc Long Quân, Bưởi, Tây Hồ",
        category: "Trải nghiệm hoàng hôn",
        duration: "~90 phút",
        rating: 4.9,
        score: "4.9",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80"
      }
    ];
  });

  // User Action Choice: 'itinerary' | 'saved_only' | null
  const [actionChoice, setActionChoice] = useState(() => {
    return locationState.actionChoice || "itinerary";
  });

  // Days Schedule: { [dayNumber]: [placeId1, placeId2, ...] }
  const [daysSchedule, setDaysSchedule] = useState(() => {
    return locationState.daysSchedule || {};
  });

  // Toggle style preference
  const toggleStyle = (styleId) => {
    setSelectedStyles((prev) =>
      prev.includes(styleId) ? prev.filter((id) => id !== styleId) : [...prev, styleId]
    );
  };

  // Add place from current input
  const handleAddCurrentLocation = () => {
    if (!destination.trim()) return;
    const newPlace = {
      id: `place-${Date.now()}`,
      name: destination.split(",")[0] || destination,
      location: destination,
      category: "Điểm tham quan",
      duration: "~60 phút",
      rating: 5.0,
      score: "5.0",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
    };
    setPlacesList((prev) => [...prev, newPlace]);
  };

  const handleAddPlaceQuick = () => {
    navigate("/places", {
      state: {
        tripName,
        tripDates,
        destination,
        companions,
        passengerCount,
        travelStyle: selectedStyles.join(", "),
        selectedStyles,
        placesList,
        actionChoice,
        daysSchedule
      }
    });
  };

  const handleRemovePlace = (placeId) => {
    setPlacesList((prev) => prev.filter((p) => p.id !== placeId && p.osmId !== placeId));

    // Also remove from scheduled days
    setDaysSchedule((prevSchedule) => {
      const updated = {};
      Object.entries(prevSchedule).forEach(([day, ids]) => {
        updated[day] = ids.filter((id) => id !== placeId);
      });
      return updated;
    });
  };

  const handleClearAllPlaces = () => {
    if (window.confirm(t("tripCreate.selectedPlaces.confirmClear") || "Bạn có chắc chắn muốn xóa tất cả địa điểm đã chọn?")) {
      setPlacesList([]);
      setDaysSchedule({});
    }
  };

  const handleNextStep = () => {
    navigate("/trip/confirm", {
      state: {
        tripName,
        tripDates,
        destination,
        companions,
        passengerCount,
        travelStyle: selectedStyles.join(", "),
        selectedStyles,
        placesList,
        actionChoice: actionChoice || (placesList.length > 0 ? "saved_only" : null),
        daysSchedule: actionChoice === "itinerary" ? daysSchedule : {}
      }
    });
  };

  return (
    <div className="itinerary-step-page trip-create-page bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans min-h-screen flex flex-col justify-between antialiased selection:bg-[#e6f6fd] selection:text-[#00a3e0]">
      {/* AppHeader (Matching Shared Component Standard) */}
      <AppHeader
        onLogin={() => setAuthModal("login")}
        onRegister={() => setAuthModal("register")}
      />

      {/* Main Content Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stepper Navigation (3 Bước) */}
        <section aria-label="Quy trình từng bước" className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 max-w-3xl mx-auto">
          <div className="max-w-xl mx-auto flex items-center justify-between relative">
            {/* Connecting Background Lines */}
            <div className="absolute left-8 right-8 top-5 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-800 z-0"></div>
            <div className="absolute left-8 w-1/2 top-5 -translate-y-1/2 h-0.5 bg-[#00a3e0] dark:bg-sky-500 z-0 transition-all duration-500"></div>

            {/* Step 1: Hoàn thành / Click to return */}
            <div
              className="relative z-10 flex flex-col items-center group cursor-pointer"
              onClick={() =>
                navigate("/trip/info", {
                  state: { tripName, tripDates, destination, companions, passengerCount, selectedStyles, placesList, actionChoice, daysSchedule }
                })
              }
            >
              <div className="w-10 h-10 rounded-full bg-[#002d5b] dark:bg-sky-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-slate-200 dark:shadow-none hover:bg-[#00a3e0] transition-colors">
                ✓
              </div>
              <span className="mt-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 text-center">
                {t("tripCreate.stepper.step1")}
              </span>
            </div>

            {/* Step 2: Đang thực hiện (Active) */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#00a3e0] dark:bg-sky-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-sky-100 ring-4 ring-sky-50 dark:ring-sky-950">
                2
              </div>
              <span className="mt-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-white text-center">
                {t("tripCreate.stepper.step2")}
              </span>
            </div>

            {/* Step 3: Chưa hoàn thành */}
            <div className="relative z-10 flex flex-col items-center text-slate-400 group">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400 flex items-center justify-center font-semibold text-sm">
                3
              </div>
              <span className="mt-2 text-xs sm:text-sm font-medium text-slate-400 text-center">
                {t("tripCreate.stepper.step3")}
              </span>
            </div>
          </div>
        </section>

        {/* Header Section Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#00a3e0] bg-[#e6f6fd] dark:bg-sky-950/60 px-3 py-1 rounded-full">
                {t("tripInfo.planWithIntention") || "PLAN WITH INTENTION"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002d5b] dark:text-sky-400 tracking-tight">
              {t("tripCreate.header.mainTitle")}
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
              {t("tripCreate.header.mainSubtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#e6f6fd] dark:bg-sky-950/70 text-[#00a3e0] dark:text-sky-300 border border-sky-100 dark:border-sky-900">
              <span className="w-2 h-2 rounded-full bg-[#00a3e0] animate-pulse"></span>
              {t("tripCreate.header.syncingBadge")}
            </span>
          </div>
        </div>

        {/* 2 Column Master Layout (Left: Trip Info + Form | Right: Selected List) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Thông tin chuyến đi & Form nhập liệu (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Card 1: Thông tin chuyến đi */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00a3e0]"></span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t("tripCreate.tripSummary.yourTrip")}
                  </h3>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#e6f6fd] dark:bg-sky-950 text-[#00a3e0] dark:text-sky-300">
                  {tripDates || "9 ngày 8 đêm"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tên chuyến đi */}
                <div className="bg-slate-50/80 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {t("tripCreate.tripSummary.nameLabel")}
                    </span>
                    <button
                      className="text-xs font-semibold text-[#00a3e0] hover:underline flex items-center gap-1 cursor-pointer"
                      onClick={() => setIsEditingName(!isEditingName)}
                      type="button"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      {t("tripCreate.tripSummary.edit")}
                    </button>
                  </div>
                  {isEditingName ? (
                    <input
                      type="text"
                      value={tripName}
                      onChange={(e) => setTripName(e.target.value)}
                      onBlur={() => setIsEditingName(false)}
                      autoFocus
                      className="text-sm font-bold text-[#002d5b] dark:text-white border border-[#00a3e0] rounded-lg px-2 py-1 outline-none bg-white dark:bg-slate-900"
                    />
                  ) : (
                    <div className="text-base font-bold text-[#002d5b] dark:text-white truncate">
                      {tripName}
                    </div>
                  )}
                </div>

                {/* Ngày đi - về */}
                <div className="bg-slate-50/80 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {t("tripCreate.tripSummary.datesLabel")}
                    </span>
                    <button
                      className="text-xs font-semibold text-[#00a3e0] hover:underline flex items-center gap-1 cursor-pointer"
                      onClick={() => setIsEditingDates(!isEditingDates)}
                      type="button"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2"></line>
                        <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2"></line>
                      </svg>
                      {t("tripCreate.tripSummary.edit")}
                    </button>
                  </div>
                  {isEditingDates ? (
                    <input
                      type="text"
                      value={tripDates}
                      onChange={(e) => setTripDates(e.target.value)}
                      onBlur={() => setIsEditingDates(false)}
                      autoFocus
                      className="text-sm font-bold text-[#002d5b] dark:text-white border border-[#00a3e0] rounded-lg px-2 py-1 outline-none bg-white dark:bg-slate-900"
                    />
                  ) : (
                    <div className="text-base font-bold text-[#002d5b] dark:text-white truncate">
                      {tripDates}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Card 2: Form Thêm & Chỉnh sửa địa điểm */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#002d5b] dark:text-white tracking-tight">
                    {t("tripCreate.locationDetails.title")}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {t("tripCreate.locationDetails.subtitle")}
                  </p>
                </div>
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#e6f6fd] dark:bg-sky-950 text-[#00a3e0]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
              </div>

              {/* Input Đi đâu? */}
              <div data-purpose="destination-input-group">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200" htmlFor="destinationInput">
                    {t("tripCreate.locationDetails.destinationLabel")} <span className="text-rose-500">*</span>
                  </label>
                  <button
                    onClick={() => setIsMapModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#00a3e0] bg-[#e6f6fd] dark:bg-sky-950/70 hover:bg-sky-100 dark:hover:bg-sky-900 rounded-full border border-sky-200 dark:border-sky-800 transition-colors shadow-2xs cursor-pointer"
                    type="button"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon>
                      <line strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="8" x2="8" y1="2" y2="18"></line>
                      <line strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="16" x2="16" y1="6" y2="22"></line>
                    </svg>
                    <span>{t("tripCreate.locationDetails.selectMap")}</span>
                  </button>
                </div>
                <button
                  className="relative w-full rounded-xl shadow-2xs text-left cursor-pointer border border-slate-200 dark:border-slate-700 focus:border-[#00a3e0] focus:ring-2 focus:ring-[#00a3e0]/20 transition-all outline-none"
                  onClick={() => setIsMapModalOpen(true)}
                  type="button"
                  aria-label={t("tripCreate.locationDetails.selectMap")}
                >
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <span className={`block w-full pl-10 pr-12 py-3 rounded-xl text-sm font-medium bg-white dark:bg-slate-800 ${destination ? "text-slate-800 dark:text-slate-100" : "text-slate-400"}`}>
                    {destination || t("tripCreate.locationDetails.destinationPlaceholder") || "Chọn địa điểm trên bản đồ..."}
                  </span>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                      <path clipRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" fillRule="evenodd" />
                    </svg>
                  </div>
                </button>
              </div>

              {/* Row: Đi cùng ai? & Số lượng */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5" data-purpose="companions-and-count">
                {/* Đi cùng ai */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2" htmlFor="companion-select">
                    {t("tripCreate.locationDetails.companionsLabel")} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <select
                      id="companion-select"
                      value={companions}
                      onChange={(e) => setCompanions(e.target.value)}
                      className="w-full pl-11 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 focus:border-[#00a3e0] focus:ring-2 focus:ring-[#00a3e0]/20 transition-all appearance-none cursor-pointer outline-none"
                    >
                      <option value="friends">{t("tripInfo.companions.options.friends")}</option>
                      <option value="family">{t("tripInfo.companions.options.family")}</option>
                      <option value="couple">{t("tripInfo.companions.options.couple")}</option>
                      <option value="solo">{t("tripInfo.companions.options.solo")}</option>
                      <option value="colleagues">{t("tripInfo.companions.options.colleagues")}</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Số lượng người */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                    {t("tripCreate.locationDetails.passengerCountLabel")} <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center justify-between w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {t("tripCreate.locationDetails.memberPrefix")}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        className="w-7 h-7 rounded-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-200 flex items-center justify-center font-bold hover:bg-slate-100 dark:hover:bg-slate-600 active:scale-95 transition shadow-2xs cursor-pointer"
                        onClick={() => setPassengerCount((prev) => Math.max(1, prev - 1))}
                        type="button"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold text-slate-800 dark:text-slate-100 text-sm" id="memberCount">
                        {passengerCount}
                      </span>
                      <button
                        className="w-7 h-7 rounded-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-200 flex items-center justify-center font-bold hover:bg-slate-100 dark:hover:bg-slate-600 active:scale-95 transition shadow-2xs cursor-pointer"
                        onClick={() => setPassengerCount((prev) => prev + 1)}
                        type="button"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phong cách chuyến đi */}
              <div data-purpose="trip-style-section">
                <div className="flex items-center justify-between mb-2.5">
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                    {t("tripCreate.locationDetails.travelStyleLabel")} <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs font-semibold text-slate-400">
                    {t("tripCreate.locationDetails.selectedCount")}: <strong className="text-[#00a3e0]">{selectedStyles.length}</strong>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5 mb-3">
                  {PREFERENCE_STYLES.map((pref) => {
                    const isSelected = selectedStyles.includes(pref.id);
                    const label = t(pref.labelKey) || pref.defaultLabel;
                    return (
                      <button
                        key={pref.id}
                        type="button"
                        onClick={() => toggleStyle(pref.id)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#00a3e0] text-white border border-[#00a3e0] shadow-xs hover:bg-[#008ec4]"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-[#00a3e0] hover:text-[#00a3e0]"
                        }`}
                      >
                        <span>{label}</span>
                        {isSelected && <span className="text-white/80 hover:text-white font-bold text-sm leading-none">×</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Add Location to List Action */}
              <div className="pt-2">
                <button
                  onClick={handleAddCurrentLocation}
                  className="w-full py-3 bg-[#002d5b] hover:bg-[#1e4069] dark:bg-sky-600 dark:hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] cursor-pointer"
                  type="button"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>{t("tripCreate.locationDetails.addCurrentLocation")}</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Danh sách địa điểm đã chọn (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              {/* List Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      {t("tripCreate.selectedPlaces.title")}
                    </h3>
                    <span className="px-2 py-0.5 bg-[#00a3e0] text-white text-[11px] font-bold rounded-full">
                      {placesList.length} {t("tripCreate.selectedPlaces.points")}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[220px]">
                    {destination.split(",").slice(0, 2).join(",")}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleAddPlaceQuick}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:text-[#00a3e0] hover:bg-[#e6f6fd] dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title={t("tripCreate.selectedPlaces.addPlaceButton")}
                    type="button"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={handleClearAllPlaces}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-colors cursor-pointer"
                    title={t("tripCreate.selectedPlaces.clearAll")}
                    type="button"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Add Quick Location Button */}
              <button
                onClick={handleAddPlaceQuick}
                className="w-full my-3 py-2.5 px-4 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-[#00a3e0] text-[#00a3e0] bg-[#e6f6fd]/50 dark:bg-slate-800/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all hover:bg-[#e6f6fd] dark:hover:bg-slate-800 cursor-pointer"
                type="button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>{t("tripCreate.selectedPlaces.addPlaceButton")}</span>
              </button>

              {/* Interactive Destination Cards List */}
              <div className="space-y-3 mt-2 max-h-[480px] overflow-y-auto pr-1">
                {placesList.length === 0 ? (
                  <div className="text-center py-10 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                    <div className="w-10 h-10 rounded-full bg-[#e6f6fd] dark:bg-sky-950 text-[#00a3e0] mx-auto flex items-center justify-center text-lg">
                      📍
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t("tripCreate.selectedPlaces.emptyTitle")}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {t("tripCreate.selectedPlaces.emptyDesc")}
                    </p>
                  </div>
                ) : (
                  placesList.map((place, index) => {
                    const placeId = place.osmId || place.id;
                    return (
                      <div
                        key={placeId}
                        className="group bg-slate-50/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#00a3e0] rounded-xl p-3 shadow-2xs hover:shadow-md transition-all flex gap-3 relative"
                      >
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                          <img
                            alt={place.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            src={place.image || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"}
                          />
                          <span className="absolute bottom-1 left-1 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 px-1.5 py-0.5 rounded text-[10px] font-bold text-[#00a3e0] shadow-xs">
                            #{index + 1}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {place.name}
                            </h4>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleRemovePlace(placeId)}
                                className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded transition-colors cursor-pointer text-xs"
                                title="Xóa địa điểm"
                                type="button"
                              >
                                ✕
                              </button>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {place.location || place.address}
                          </p>

                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-[#e6f6fd] dark:bg-sky-950 text-[#00a3e0] dark:text-sky-300 px-2 py-0.5 rounded">
                              <span>📍</span>
                              <span>{place.category || "Điểm tham quan"}</span>
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              {place.duration || "~45 phút"}
                            </span>
                          </div>
                        </div>

                        {/* Drag Handle Indicator */}
                        <div className="flex items-center text-slate-400 hover:text-slate-600 cursor-grab shrink-0 text-xs">
                          ⋮⋮
                        </div>
                      </div>
                    );
                  })
                )}
              </div>            
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Hướng đi tiếp theo & Next Step Actions */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e6f6fd] dark:bg-sky-950 flex items-center justify-center text-[#00a3e0] text-xl">
              💡
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#002d5b] dark:text-white">
                {t("tripCreate.actionSelector.title")}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("tripCreate.actionSelector.subtitle")}
              </p>
            </div>
          </div>

          {/* 2 Choice Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Choice 1: AI Planner (Recommended) */}
            <div
              onClick={() => setActionChoice("itinerary")}
              className={`group relative rounded-xl p-5 border-2 transition-all cursor-pointer ${
                actionChoice === "itinerary"
                  ? "border-[#00a3e0] dark:border-sky-500 bg-[#e6f6fd]/40 dark:bg-sky-950/40 ring-4 ring-[#00a3e0]/10 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300"
              }`}
            >
              <span className="absolute -top-3 right-4 px-2.5 py-0.5 bg-[#002d5b] dark:bg-sky-600 text-white text-[10px] font-bold rounded-full shadow-sm flex items-center gap-1">
                <span>✨</span>
                <span>{t("tripCreate.actionSelector.option1Badge")}</span>
              </span>

              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#00a3e0] text-white flex items-center justify-center text-xl shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  ⚡
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-[#002d5b] dark:text-sky-400 group-hover:text-[#00a3e0] transition-colors">
                    {t("tripCreate.actionSelector.option1Title")}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t("tripCreate.actionSelector.option1Desc", { count: placesList.length })}
                  </p>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#00a3e0] dark:text-sky-400 group-hover:translate-x-1 transition-transform">
                      {t("tripCreate.actionSelector.option1Link")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Choice 2: Lưu danh sách chờ */}
            <div
              onClick={() => setActionChoice("saved_only")}
              className={`group rounded-xl p-5 border-2 transition-all cursor-pointer ${
                actionChoice === "saved_only"
                  ? "border-[#002d5b] dark:border-sky-500 bg-[#e6f6fd]/40 dark:bg-sky-950/40 ring-4 ring-[#002d5b]/10 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#e6f6fd] dark:bg-slate-700 text-[#002d5b] dark:text-sky-300 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                  🔖
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-[#002d5b] dark:group-hover:text-sky-400 transition-colors">
                    {t("tripCreate.actionSelector.option2Title")}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {t("tripCreate.actionSelector.option2Desc", { tripName })}
                  </p>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#002d5b] dark:text-sky-400 group-hover:translate-x-1 transition-transform">
                      {t("tripCreate.actionSelector.option2Link")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conditional Sub-View based on user choice */}
          {actionChoice === "itinerary" && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-300">
              <ItineraryBuilder
                placesList={placesList}
                daysSchedule={daysSchedule}
                onScheduleChange={setDaysSchedule}
                onAddMorePlaces={handleAddPlaceQuick}
                onRemovePlaceFromList={handleRemovePlace}
              />
            </div>
          )}

          {actionChoice === "saved_only" && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-300">
              <SavedLocationsSummary
                destination={destination}
                placesList={placesList}
                onCreateItineraryNow={() => setActionChoice("itinerary")}
                onExploreMore={handleAddPlaceQuick}
                onRemovePlace={handleRemovePlace}
              />
            </div>
          )}

          {/* Final Master Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() =>
                navigate("/trip/info", {
                  state: { tripName, tripDates, destination, companions, passengerCount, selectedStyles, placesList, actionChoice, daysSchedule }
                })
              }
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer"
              type="button"
            >
              <span>←</span>
              <span>{t("tripCreate.actions.backStep1")}</span>
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleNextStep}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#002d5b] hover:bg-[#1e4069] text-white rounded-full text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                type="button"
              >
                <span>{t("tripCreate.actions.nextStep")}</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Map Modal Dialog */}
      {isMapModalOpen && (
        <LocationMapModal
          initialQuery={destination}
          onClose={() => setIsMapModalOpen(false)}
          onConfirm={(selectedName) => {
            setDestination(selectedName);
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
