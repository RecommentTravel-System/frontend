import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "~/providers/i18n-provider";
import { AppHeader } from "~/shared/components";
import { DateRangePicker } from "~/shared/components/date-range-picker";
import { LoginCard, RegisterCard } from "~/features/auth";
import { LocationMapModal } from "./location-map-modal";

function parseDateRange(dateStr) {
  if (!dateStr) return { start: null, end: null };
  const parts = dateStr.split("-").map((s) => s.trim());
  const parsePart = (str) => {
    if (!str) return null;
    const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const year = parseInt(match[3], 10);
      return new Date(year, month, day);
    }
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  };
  const start = parsePart(parts[0]);
  const end = parts[1] ? parsePart(parts[1]) : null;
  return { start, end };
}

function calculateDuration(start, end) {
  if (!start || !end) return "9 ngày 8 đêm";
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const nights = Math.max(0, diffDays - 1);
  return `${diffDays} ngày ${nights} đêm`;
}

const INITIAL_SAMPLE_PLACES = [
  {
    id: "sample-1",
    name: "Cộng Cà Phê Nhà Thờ",
    address: "27 Nhà Thờ, Hàng Trống, Hoàn Kiếm",
    category: "Cà phê & Check-in",
    icon: "local_cafe",
    duration: "~45 phút",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "sample-2",
    name: "Chùa Trấn Quốc",
    address: "Đường Thanh Niên, Yên Phụ, Tây Hồ",
    category: "Văn hóa tâm linh",
    icon: "temple_buddhist",
    duration: "~60 phút",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "sample-3",
    name: "Bún Chả Hương Liên",
    address: "24 Lê Văn Hưu, Phan Chu Trinh, Hai Bà Trưng",
    category: "Ẩm thực đặc sản",
    icon: "restaurant",
    duration: "~60 phút",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "sample-4",
    name: "Hồ Tây Sunset SUP Club",
    address: "292 Lạc Long Quân, Bưởi, Tây Hồ",
    category: "Trải nghiệm hoàng hôn",
    icon: "kayaking",
    duration: "~90 phút",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80"
  }
];

const PRESET_STYLES = [
  { id: "relax", labelKey: "tripInfo.styles.relax", defaultLabel: "Thư giãn", icon: "spa" },
  { id: "food", labelKey: "tripInfo.styles.food", defaultLabel: "Khám phá ẩm thực", icon: "restaurant" },
  { id: "checkin", labelKey: "tripInfo.styles.checkin", defaultLabel: "Check-in sống ảo", icon: "photo_camera" },
  { id: "culture", labelKey: "tripInfo.styles.culture", defaultLabel: "Văn hóa di sản", icon: "museum" },
  { id: "outdoor", labelKey: "tripInfo.styles.outdoor", defaultLabel: "Trải nghiệm ngoài trời", icon: "directions_walk" }
];

export function TripCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const locationState = useLocation().state || {};

  const [authModal, setAuthModal] = useState(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Form State
  const [tripName, setTripName] = useState(
    locationState.tripName || ""
  );
  const [tripDates, setTripDates] = useState(
    locationState.tripDates || ""
  );

  const initialDates = useMemo(() => parseDateRange(locationState.tripDates || ""), [locationState.tripDates]);
  const [startDate, setStartDate] = useState(initialDates.start);
  const [endDate, setEndDate] = useState(initialDates.end);

  const durationBadge = useMemo(() => {
    if (startDate && endDate) {
      return calculateDuration(startDate, endDate);
    }
    return "9 ngày 8 đêm";
  }, [startDate, endDate]);

  const [destinationInput, setDestinationInput] = useState(
    locationState.destination || ""
  );
  const [companions, setCompanions] = useState(
    locationState.companions || "friends"
  );
  const [memberCount, setMemberCount] = useState(
    locationState.passengerCount ? Number(locationState.passengerCount) : (locationState.memberCount ? Number(locationState.memberCount) : 2)
  );
  const [selectedStyles, setSelectedStyles] = useState(locationState.travelStyles || locationState.selectedStyles || []);
  const [selectedAction, setSelectedAction] = useState("itinerary"); // "itinerary" | "saved_only"

  const [isEditingName, setIsEditingName] = useState(false);

  // Places list
  const [placesList, setPlacesList] = useState(() => {
    if (locationState.placesList && locationState.placesList.length > 0) {
      return locationState.placesList;
    }
    return [];
  });

  const toggleStyle = (styleId) => {
    setSelectedStyles((prev) =>
      prev.includes(styleId)
        ? prev.filter((id) => id !== styleId)
        : [...prev, styleId]
    );
  };

  const handleAddDestinationPlace = () => {
    if (!destinationInput.trim()) return;
    const newPlace = {
      id: `place-${Date.now()}`,
      name: destinationInput.split(",")[0] || destinationInput,
      address: destinationInput,
      category: "Điểm đã chọn",
      duration: "~45 phút",
      image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80"
    };
    setPlacesList((prev) => [newPlace, ...prev]);
  };

  const handleRemovePlace = (placeId) => {
    setPlacesList((prev) => prev.filter((p) => p.id !== placeId));
  };

  const handleClearAll = () => {
    setPlacesList([]);
  };

  const handleQuickAdd = () => {
    navigate("/places", {
      state: {
        tripName,
        tripDates,
        destination: destinationInput,
        companions,
        passengerCount: memberCount,
        selectedStyles,
        placesList
      }
    });
  };

  // Option 1 Click: Sắp xếp lịch trình -> Chuyển ngay sang trang Timeline/Kanban Planner
  const handleSelectItineraryPlan = () => {
    setSelectedAction("itinerary");
    navigate("/trip/plan", {
      state: {
        tripName,
        tripDates,
        destination: destinationInput,
        companions,
        passengerCount: memberCount,
        selectedStyles,
        placesList
      }
    });
  };

  // Option 2 Click: Chỉ lưu địa điểm -> Ở lại Bước 2 và kích hoạt lựa chọn
  const handleSelectSavedOnly = () => {
    setSelectedAction("saved_only");
  };

  // Master Next Step Button
  const handleNextStep = () => {
    if (selectedAction === "itinerary") {
      navigate("/trip/plan", {
        state: {
          tripName,
          tripDates,
          destination: destinationInput,
          companions,
          passengerCount: memberCount,
          selectedStyles,
          placesList
        }
      });
    } else {
      navigate("/trip/confirm", {
        state: {
          tripName,
          tripDates,
          destination: destinationInput,
          companions,
          passengerCount: memberCount,
          selectedStyles,
          placesList
        }
      });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans min-h-screen flex flex-col antialiased selection:bg-sky-100 selection:text-[#00a3e0]">
      {/* AppHeader with Login & Register buttons when unauthenticated */}
      <AppHeader
        onLogin={() => setAuthModal("login")}
        onRegister={() => setAuthModal("register")}
      />

      {/* Main Content Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stepper Navigation (3 Bước) */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-100 dark:border-slate-800 max-w-3xl mx-auto">
          <div className="relative flex items-center justify-between">
            {/* Connecting Line Bar */}
            <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-slate-200 dark:bg-slate-700 -z-0">
              <div className="h-full bg-[#00a3e0] transition-all duration-500 w-1/2"></div>
            </div>

            {/* Step 1: Hoàn thành */}
            <div
              className="relative z-10 flex flex-col items-center group cursor-pointer"
              onClick={() => navigate("/trip/info", { state: { tripName, tripDates, destination: destinationInput, companions, passengerCount: memberCount } })}
            >
              <div className="w-10 h-10 rounded-full bg-[#002d5b] text-white flex items-center justify-center shadow-md text-sm font-bold">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                {t("tripCreate.stepper.step1", "1. Nhập thông tin")}
              </span>
            </div>

            {/* Step 2: Đang thực hiện (Active) */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#00a3e0] text-white ring-4 ring-sky-100 dark:ring-sky-950/60 flex items-center justify-center shadow-lg font-bold text-sm">
                2
              </div>
              <span className="mt-2 text-xs font-bold text-[#00a3e0]">
                {t("tripCreate.stepper.step2", "2. Chọn địa điểm")}
              </span>
            </div>

            {/* Step 3: Chưa hoàn thành */}
            <div className="relative z-10 flex flex-col items-center opacity-70">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center font-semibold text-sm">
                3
              </div>
              <span className="mt-2 text-xs font-medium text-slate-400">
                {t("tripCreate.stepper.step3", "3. Hoàn tất")}
              </span>
            </div>
          </div>
        </section>

        {/* Header Section Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002d5b] dark:text-sky-300 tracking-tight">
              {t("tripCreate.header.mainTitle", "Quản lý & Tùy chỉnh điểm dừng chân")}
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-0.5">
              {t("tripCreate.header.mainSubtitle", "Xem thông tin hành trình, thêm hoặc điều chỉnh danh sách điểm đến để WAYVEE lên lịch trình hoàn hảo nhất.")}
            </p>
          </div>
        </div>

        {/* 2 Column Master Layout (Left: Trip Info + Form | Right: Selected List) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Thông tin chuyến đi & Form nhập liệu (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Card 1: Thông tin chuyến đi */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200 dark:border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#00a3e0] to-[#002d5b]"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#00a3e0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#002d5b] dark:text-sky-300">
                    {t("tripCreate.tripSummary.yourTrip", "CHUYẾN ĐI CỦA BẠN")}
                  </h2>
                </div>
                <span className="text-xs font-semibold bg-[#e6f6fd] dark:bg-sky-950/60 text-[#00a3e0] px-2.5 py-1 rounded-full">
                  {t("tripInfo.tripSummary.defaultDuration", "9 ngày 8 đêm")}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/80 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
                {/* Tên chuyến đi */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-medium text-slate-400 block">
                      {t("tripCreate.tripSummary.nameLabel", "Tên chuyến đi")}
                    </span>
                    {isEditingName ? (
                      <input
                        type="text"
                        value={tripName}
                        placeholder={t("tripCreate.tripSummary.placeholderName", "Nhập tên chuyến đi...")}
                        onChange={(e) => setTripName(e.target.value)}
                        onBlur={() => setIsEditingName(false)}
                        autoFocus
                        className="text-sm font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-[#00a3e0] rounded px-2 py-0.5 outline-none mt-0.5 w-full"
                      />
                    ) : (
                      <p
                        onClick={() => setIsEditingName(true)}
                        className={`text-sm font-semibold mt-0.5 cursor-pointer ${tripName ? "text-slate-900 dark:text-white" : "text-slate-400 italic font-normal"}`}
                        id="tripNameDisplay"
                      >
                        {tripName || t("tripCreate.tripSummary.placeholderName", "Nhập tên chuyến đi...")}
                      </p>
                    )}
                  </div>
                  <button
                    className="text-[#00a3e0] hover:underline text-xs font-semibold flex items-center gap-1 ml-2 cursor-pointer"
                    onClick={() => setIsEditingName(!isEditingName)}
                    type="button"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                    {t("tripCreate.tripSummary.edit", "Chỉnh sửa")}
                  </button>
                </div>

                {/* Ngày đi - về */}
                <div className="flex justify-between items-start sm:border-l sm:border-slate-200 dark:sm:border-slate-700 sm:pl-4">
                  <div>
                    <span className="text-xs font-medium text-slate-400 block">
                      {t("tripCreate.tripSummary.datesLabel", "Ngày đi - về")}
                    </span>
                    {isEditingDates ? (
                      <input
                        type="text"
                        value={tripDates}
                        placeholder={t("tripCreate.tripSummary.placeholderDates", "VD: 16/07/2025 - 24/07/2025")}
                        onChange={(e) => setTripDates(e.target.value)}
                        onBlur={() => setIsEditingDates(false)}
                        autoFocus
                        className="text-sm font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-[#00a3e0] rounded px-2 py-0.5 outline-none mt-0.5 w-full"
                      />
                    ) : (
                      <p
                        onClick={() => setIsEditingDates(true)}
                        className={`text-sm font-semibold mt-0.5 cursor-pointer ${tripDates ? "text-slate-900 dark:text-white" : "text-slate-400 italic font-normal"}`}
                      >
                        {tripDates || t("tripCreate.tripSummary.placeholderDates", "Chọn ngày đi - về...")}
                      </p>
                    )}
                  </div>
                  <button
                    className="text-[#00a3e0] hover:underline text-xs font-semibold flex items-center gap-1 ml-2 cursor-pointer"
                    onClick={() => setIsEditingDates(!isEditingDates)}
                    type="button"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect height="18" rx="2" strokeWidth="2" width="18" x="3" y="4"></rect>
                      <line strokeWidth="2" x1="16" x2="16" y1="2" y2="6"></line>
                      <line strokeWidth="2" x1="8" x2="8" y1="2" y2="6"></line>
                    </svg>
                    {t("tripCreate.tripSummary.edit", "Chỉnh sửa")}
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2: Form Thêm & Chỉnh sửa địa điểm */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200 dark:border-slate-800 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-slate-800 flex items-center justify-center text-[#00a3e0]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {t("tripCreate.locationDetails.title", "Thông tin điểm đến")}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {t("tripCreate.locationDetails.subtitle", "Tìm kiếm điểm dừng chân và tùy chỉnh trải nghiệm phù hợp")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Input Đi đâu? */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>{t("tripCreate.locationDetails.destinationLabel", "Đi đâu? (Địa điểm, quán cafe, di tích...)")}</span>
                  <span
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          () => setDestinationInput("Khu phố 1, Phường Gò Vấp, Thành phố Hồ Chí Minh, 71422, Việt Nam"),
                          () => { }
                        );
                      }
                    }}
                    className="text-xs font-semibold text-[#00a3e0] cursor-pointer hover:underline flex items-center gap-1"
                  >
                    📍 {t("tripCreate.locationDetails.currentLocation", "Vị trí hiện tại")}
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    className="w-full pl-11 pr-28 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:border-[#00a3e0] focus:ring-2 focus:ring-[#00a3e0]/20 transition-all outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50"
                    id="destinationInput"
                    type="text"
                    placeholder={t("tripInfo.destinationDetails.destinationPlaceholderMap", "Bấm để chọn địa điểm trên bản đồ...")}
                    value={destinationInput}
                    readOnly
                    onClick={() => setIsMapModalOpen(true)}
                  />
                  <button
                    onClick={() => setIsMapModalOpen(true)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#e6f6fd] dark:bg-sky-950/60 text-[#00a3e0] hover:bg-sky-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-sky-200 dark:border-sky-800"
                    type="button"
                  >
                    {t("tripCreate.locationDetails.selectMap", "Chọn bản đồ")}
                  </button>
                </div>
              </div>

              {/* Row: Đi cùng ai? & Số lượng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Đi cùng ai */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t("tripCreate.locationDetails.companionsLabel", "Đi cùng ai?")}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </span>
                    <select
                      className="w-full pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:border-[#00a3e0] focus:ring-1 focus:ring-[#00a3e0] outline-none cursor-pointer"
                      value={companions}
                      onChange={(e) => setCompanions(e.target.value)}
                    >
                      <option value="friends">{t("tripInfo.companions.friends", "Bạn bè thân thiết")}</option>
                      <option value="family">{t("tripInfo.companions.family", "Gia đình")}</option>
                      <option value="couple">{t("tripInfo.companions.couple", "Cặp đôi / Người yêu")}</option>
                      <option value="solo">{t("tripInfo.companions.solo", "Đi một mình (Solo)")}</option>
                      <option value="colleagues">{t("tripInfo.companions.colleagues", "Đồng nghiệp")}</option>
                    </select>
                  </div>
                </div>

                {/* Số lượng người */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t("tripCreate.locationDetails.passengerCountLabel", "Số lượng thành viên")}
                  </label>
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5">
                    <span className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1 font-medium">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {t("tripCreate.locationDetails.memberPrefix", "Thành viên:")}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white flex items-center justify-center font-bold transition-all cursor-pointer border border-slate-200 dark:border-slate-600 shadow-2xs"
                        onClick={() => setMemberCount(Math.max(1, memberCount - 1))}
                        type="button"
                      >
                        -
                      </button>
                      <span className="font-bold text-[#00a3e0] w-5 text-center text-sm" id="memberCount">
                        {memberCount}
                      </span>
                      <button
                        className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white flex items-center justify-center font-bold transition-all cursor-pointer border border-slate-200 dark:border-slate-600 shadow-2xs"
                        onClick={() => setMemberCount(Math.min(50, memberCount + 1))}
                        type="button"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phong cách chuyến đi */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>{t("tripCreate.locationDetails.travelStyleLabel", "Phong cách & Sở thích chuyến đi")}</span>
                  <span className="text-xs text-slate-400 font-normal">
                    {t("tripCreate.locationDetails.selectedCount", "Đã chọn")} {selectedStyles.length}
                  </span>
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {PRESET_STYLES.map((style) => {
                    const isSelected = selectedStyles.includes(style.id);
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => toggleStyle(style.id)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${isSelected
                          ? "bg-[#00a3e0] text-white shadow-xs"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-[#00a3e0] hover:text-[#00a3e0]"
                          }`}
                      >
                        <span>{t(style.labelKey, style.defaultLabel)}</span>
                        {isSelected && <span className="text-xs">×</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Add Location to List Action */}
              <div className="pt-2">
                <button
                  className="w-full py-3 bg-[#002d5b] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#1e4069] transition-all shadow-xs active:scale-[0.99] cursor-pointer"
                  onClick={handleAddDestinationPlace}
                  type="button"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  {t("tripCreate.locationDetails.addCurrentLocation", "Thêm địa điểm này vào danh sách chọn")}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Danh sách địa điểm đã chọn (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200 dark:border-slate-800">
              {/* List Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {t("tripCreate.selectedPlaces.title", "DANH SÁCH ĐỊA ĐIỂM")}
                    </h3>
                    <span className="px-2 py-0.5 bg-[#00a3e0] text-white text-xs font-bold rounded-full">
                      {placesList.length} {t("tripCreate.selectedPlaces.points", "điểm")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {destinationInput.split(",")[0]}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                    title={t("tripCreate.selectedPlaces.clearAll", "Xóa tất cả")}
                    onClick={handleClearAll}
                    type="button"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Add Quick Location Button */}
              <button
                className="w-full my-3 py-2.5 px-4 border-2 border-dashed border-sky-300 dark:border-sky-800 hover:border-[#00a3e0] text-[#00a3e0] bg-sky-50/50 dark:bg-sky-950/20 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all hover:bg-sky-50 cursor-pointer"
                onClick={handleQuickAdd}
                type="button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                {t("tripCreate.selectedPlaces.addPlaceButton", "Thêm địa điểm nhanh")}
              </button>

              {/* Interactive Destination Cards List */}
              <div className="space-y-3 mt-2 max-h-[580px] overflow-y-auto pr-1">
                {placesList.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    <p className="font-semibold">{t("tripCreate.selectedPlaces.emptyTitle", "Chưa có địa điểm nào")}</p>
                    <p className="mt-1">{t("tripCreate.selectedPlaces.emptyDesc", "Bấm nút \"Thêm địa điểm nhanh\" bên trên để chọn địa điểm xung quanh!")}</p>
                  </div>
                ) : (
                  placesList.map((place, index) => (
                    <div
                      key={place.id || index}
                      className="group bg-slate-50 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 hover:border-[#00a3e0] rounded-xl p-3 shadow-2xs hover:shadow-md transition-all flex gap-3 relative"
                    >
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                        <img
                          alt={place.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          src={place.image || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80"}
                        />
                        <span className="absolute bottom-1 left-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs px-1.5 py-0.5 rounded text-[10px] font-bold text-[#00a3e0]">
                          #{index + 1}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {place.name}
                          </h4>
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors cursor-pointer"
                              title="Xóa địa điểm"
                              onClick={() => handleRemovePlace(place.id)}
                              type="button"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {place.address || place.description || destinationInput}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#e6f6fd] dark:bg-sky-950/60 text-[#00a3e0] px-2 py-0.5 rounded">
                            {place.category || "Điểm tham quan"}
                          </span>
                          <span className="text-xs text-slate-400">{place.duration || "~45 phút"}</span>
                        </div>
                      </div>

                      {/* Drag Handle */}
                      <div className="flex items-center text-slate-300 dark:text-slate-600 hover:text-slate-500 cursor-grab">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Hướng đi tiếp theo & Next Step Actions */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-slate-800 flex items-center justify-center text-[#00a3e0] text-xl">
              💡
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t("tripCreate.actionSelector.title", "Bạn muốn làm gì tiếp theo?")}
              </h2>
              <p className="text-xs text-slate-400">
                {t("tripCreate.actionSelector.subtitle", "Chọn phương thức lên kế hoạch phù hợp với thói quen du lịch của bạn")}
              </p>
            </div>
          </div>

          {/* 2 Choice Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Choice 1: Sắp xếp lịch trình / AI Planner (Recommended) */}
            <div
              onClick={handleSelectItineraryPlan}
              className={`group relative rounded-xl p-5 border-2 transition-all cursor-pointer ${
                selectedAction === "itinerary"
                  ? "border-[#00a3e0] bg-[#e6f6fd]/50 dark:bg-sky-950/30 ring-2 ring-[#00a3e0]/20"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-[#00a3e0]/60"
              }`}
            >
              <span className="absolute -top-3 right-4 px-2.5 py-0.5 bg-[#002d5b] text-white text-[11px] font-bold rounded-full shadow-xs flex items-center gap-1">
                ✨ {t("tripCreate.actionSelector.option1Badge", "KHUYÊN DÙNG")}
              </span>
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#00a3e0] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <h3 className="text-base font-bold text-[#002d5b] dark:text-sky-300 group-hover:text-[#00a3e0] transition-colors flex items-center justify-between">
                    <span>{t("tripCreate.actionSelector.option1Title", "Sắp xếp & Tùy chỉnh lịch trình")}</span>
                    {selectedAction === "itinerary" && (
                      <span className="text-[#00a3e0] text-sm">✓</span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed break-words">
                    {t("tripCreate.actionSelector.option1Desc", {count: placesList.length}, `Thuật toán thông minh tự động phân bổ ${placesList.length} địa điểm đã chọn theo từng ngày, tối ưu quãng đường đi và gợi ý giờ ghé thăm hợp lý nhất.`)}
                  </p>
                  <div className="pt-1.5">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#00a3e0] group-hover:translate-x-1 transition-transform">
                      {t("tripCreate.actionSelector.option1Link", "Mở trình sắp xếp lịch trình →")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Choice 2: Lưu danh sách chờ (Ở lại bước 2) */}
            <div
              onClick={handleSelectSavedOnly}
              className={`group relative rounded-xl p-5 border-2 transition-all cursor-pointer ${
                selectedAction === "saved_only"
                  ? "border-[#002d5b] dark:border-sky-500 bg-sky-50/50 dark:bg-sky-950/40 ring-2 ring-[#002d5b]/20"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-400"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#002d5b] dark:group-hover:text-white transition-colors flex items-center justify-between">
                    <span>{t("tripCreate.actionSelector.option2Title", "Chỉ lưu địa điểm vào danh sách chờ")}</span>
                    {selectedAction === "saved_only" && (
                      <span className="text-[#002d5b] dark:text-sky-400 text-sm font-bold">✓</span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed break-words">
                    {t("tripCreate.actionSelector.option2Desc", {tripName}, `Lưu các địa điểm bạn quan tâm vào bộ sưu tập '${tripName}' để bạn tự sắp xếp thủ công vào thời gian rảnh.`)}
                  </p>
                  <div className="pt-1.5">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:translate-x-1 transition-transform">
                      {t("tripCreate.actionSelector.option2Link", "Lưu danh sách & tiếp tục →")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Final Master Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full text-xs font-semibold transition-all cursor-pointer"
              onClick={() => navigate("/trip/info", { state: { tripName, tripDates, destination: destinationInput, companions, passengerCount: memberCount } })}
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t("tripCreate.actions.backStep1", "Quay lại Bước 1")}
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#00a3e0] hover:bg-[#008ec4] text-white rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                onClick={handleNextStep}
                type="button"
              >
                <span>{t("tripCreate.actions.nextStep", "Tiếp tục bước tiếp theo")}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footnote */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2025 WAYVEE Navigation Platform. Giữ bản quyền hành trình khám phá.</p>
          <div className="flex items-center gap-6">
            <a className="hover:text-[#00a3e0] transition-colors" href="#">{t("footer.terms", "Điều khoản")}</a>
            <a className="hover:text-[#00a3e0] transition-colors" href="#">{t("footer.privacy", "Chính sách bảo mật")}</a>
            <a className="hover:text-[#00a3e0] transition-colors" href="#">{t("footer.helpCenter", "Trung tâm trợ giúp")}</a>
          </div>
        </div>
      </footer>

      {/* Location Leaflet Map Modal */}
      {isMapModalOpen && (
        <LocationMapModal
          initialQuery={destinationInput}
          onClose={() => setIsMapModalOpen(false)}
          onConfirm={(selectedName) => {
            setDestinationInput(selectedName);
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
