import { useState } from "react";
import { useTranslation } from "~/providers/i18n-provider";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "~/shared/components";
import { LoginCard, RegisterCard } from "~/features/auth";
import { LocationMapModal } from "./location-map-modal";
import { api } from "~/shared/lib/api";

const PRESET_STYLES = [
  { id: "relax", labelKey: "tripInfo.styles.relax", defaultLabel: "Thư giãn" },
  { id: "food", labelKey: "tripInfo.styles.food", defaultLabel: "Khám phá ẩm thực" },
  { id: "checkin", labelKey: "tripInfo.styles.checkin", defaultLabel: "Check-in sống ảo" },
  { id: "culture", labelKey: "tripInfo.styles.culture", defaultLabel: "Văn hóa di sản" },
  { id: "outdoor", labelKey: "tripInfo.styles.outdoor", defaultLabel: "Trải nghiệm ngoài trời" }
];

export function TripInfoPage({ initialData }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [authModal, setAuthModal] = useState(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const [tripName, setTripName] = useState(
    initialData?.tripName || ""
  );
  const [tripDates, setTripDates] = useState(
    initialData?.tripDates || ""
  );
  const [destination, setDestination] = useState(
    initialData?.destination || ""
  );
  const [companions, setCompanions] = useState(initialData?.companions || "friends");
  const [memberCount, setMemberCount] = useState(
    initialData?.passengerCount ? Number(initialData.passengerCount) : 2
  );
  const [selectedStyles, setSelectedStyles] = useState(initialData?.travelStyles || []);
  const [customStyle, setCustomStyle] = useState("");

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDates, setIsEditingDates] = useState(false);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleStyle = (styleId) => {
    setSelectedStyles((prev) =>
      prev.includes(styleId)
        ? prev.filter((id) => id !== styleId)
        : [...prev, styleId]
    );
    clearError("travelStyle");
  };

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
    if (!memberCount || memberCount < 1) {
      newErrors.passengerCount = t("tripInfo.validation.passengerCountRequired", "Vui lòng nhập số lượng người");
    }
    if (selectedStyles.length === 0 && !customStyle.trim()) {
      newErrors.travelStyle = t("tripInfo.validation.travelStyleRequired", "Vui lòng chọn hoặc nhập phong cách chuyến đi");
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

    const chosenStyleLabels = selectedStyles.map((id) => {
      const found = PRESET_STYLES.find((s) => s.id === id);
      return found ? t(found.labelKey, found.defaultLabel) : id;
    });
    if (customStyle.trim()) {
      chosenStyleLabels.push(customStyle.trim());
    }

    const formData = {
      tripName: tripName.trim(),
      tripDates: tripDates.trim(),
      destination: destination.trim(),
      companions: companions.trim(),
      passengerCount: String(memberCount),
      travelStyle: chosenStyleLabels.join(", ")
    };

    try {
      await api.post("/api/v1/trips/validate", formData);
      navigate("/trip/create", { state: formData });
    } catch (err) {
      console.warn("Backend validation or network fallback:", err.message);
      // Navigate to step 2 with data
      navigate("/trip/create", { state: formData });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans min-h-screen flex flex-col antialiased selection:bg-sky-100 selection:text-[#00a3e0]">
      {/* Main AppHeader with Login & Register when unauthenticated */}
      <AppHeader
        onLogin={() => setAuthModal("login")}
        onRegister={() => setAuthModal("register")}
      />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full" data-purpose="primary-flow-container">
        {/* BEGIN: StepperBar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-100 dark:border-slate-800 mb-8" data-purpose="progress-stepper">
          <div className="max-w-xl mx-auto flex items-center justify-between relative">
            {/* Connecting Background Lines */}
            <div className="absolute left-8 right-8 top-5 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-700 z-0"></div>
            <div className="absolute left-8 w-1/4 top-5 -translate-y-1/2 h-0.5 bg-[#00a3e0] z-0"></div>

            {/* Step 1 (Current Active Step) */}
            <div className="relative z-10 flex flex-col items-center group cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-[#00a3e0] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-sky-100 dark:shadow-none ring-4 ring-sky-50 dark:ring-sky-950/40">
                1
              </div>
              <span className="mt-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-white text-center">
                {t("tripInfo.stepper.step1", "1. Nhập thông tin")}
              </span>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-slate-400 group">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center font-semibold text-sm">
                2
              </div>
              <span className="mt-2 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 text-center">
                {t("tripInfo.stepper.step2", "2. Chọn địa điểm")}
              </span>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-slate-400 group">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400 flex items-center justify-center font-semibold text-sm">
                3
              </div>
              <span className="mt-2 text-xs sm:text-sm font-medium text-slate-400 text-center">
                {t("tripInfo.stepper.step3", "3. Hoàn tất")}
              </span>
            </div>
          </div>
        </div>
        {/* END: StepperBar */}

        {/* Section Heading & Subtitle */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#00a3e0] bg-[#e6f6fd] dark:bg-sky-950/60 px-3 py-1 rounded-full">
              PLAN WITH INTENTION
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002d5b] dark:text-sky-300 tracking-tight">
            {t("tripInfo.pageHeading", "Khởi tạo thông tin lịch trình")}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            {t("tripInfo.pageSubtitle", "Nhập thông tin cơ bản về chuyến đi để WAYVEE cá nhân hóa trải nghiệm tối ưu nhất.")}
          </p>
        </div>

        {/* Form Section */}
        <form className="space-y-6" onSubmit={handleSubmit} data-purpose="trip-creation-form">
          {/* BEGIN: TripSummaryCard (Card 1) */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all" data-purpose="trip-metadata-card">
            {/* Header row of Card 1 */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00a3e0]"></span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t("tripInfo.tripSummary.yourTrip", "CHUYẾN ĐI CỦA BẠN")}
                </h3>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#e6f6fd] dark:bg-sky-950/60 text-[#00a3e0]">
                {t("tripInfo.tripSummary.defaultDuration", "9 ngày 8 đêm")}
              </span>
            </div>

            {/* Body Grid of Card 1 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Left: Big Title / Category */}
              <div className="md:col-span-4">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {t("tripInfo.tripSummary.title", "Thông tin lịch trình")}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t("tripInfo.tripSummary.subtitle", "Khung thời gian & định danh hành trình")}
                </p>
              </div>

              {/* Right: Trip Name & Date Details */}
              <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Trip Name Item */}
                <div className="bg-slate-50/80 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-100 dark:border-slate-700/60 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {t("tripInfo.tripSummary.nameLabel", "Tên chuyến đi")}
                    </span>
                    <button
                      className="text-xs font-semibold text-[#00a3e0] hover:underline flex items-center gap-1 cursor-pointer"
                      type="button"
                      onClick={() => setIsEditingName(!isEditingName)}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                      </svg>
                      {t("tripInfo.tripSummary.edit", "Chỉnh sửa")}
                    </button>
                  </div>
                  {isEditingName ? (
                    <input
                      type="text"
                      value={tripName}
                      placeholder={t("tripInfo.tripSummary.placeholderName", "Nhập tên chuyến đi...")}
                      onChange={(e) => {
                        setTripName(e.target.value);
                        clearError("tripName");
                      }}
                      onBlur={() => setIsEditingName(false)}
                      autoFocus
                      className="text-sm font-bold text-[#002d5b] dark:text-sky-300 bg-white dark:bg-slate-900 border border-[#00a3e0] rounded px-2 py-0.5 outline-none w-full"
                    />
                  ) : (
                    <div
                      onClick={() => setIsEditingName(true)}
                      className={`text-base font-bold cursor-pointer ${tripName ? "text-[#002d5b] dark:text-sky-300" : "text-slate-400 italic font-normal text-sm"}`}
                    >
                      {tripName || t("tripInfo.tripSummary.placeholderName", "Nhập tên chuyến đi (VD: Khám phá Huế)...")}
                    </div>
                  )}
                  {errors.tripName && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.tripName}</p>
                  )}
                </div>

                {/* Date Range Item */}
                <div className="bg-slate-50/80 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-100 dark:border-slate-700/60 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {t("tripInfo.tripSummary.datesLabel", "Ngày đi - về")}
                    </span>
                    <button
                      className="text-xs font-semibold text-[#00a3e0] hover:underline flex items-center gap-1 cursor-pointer"
                      type="button"
                      onClick={() => setIsEditingDates(!isEditingDates)}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect height="18" rx="2" strokeWidth="2" width="18" x="3" y="4"></rect>
                        <line strokeWidth="2" x1="16" x2="16" y1="2" y2="6"></line>
                        <line strokeWidth="2" x1="8" x2="8" y1="2" y2="6"></line>
                      </svg>
                      {t("tripInfo.tripSummary.edit", "Chỉnh sửa")}
                    </button>
                  </div>
                  {isEditingDates ? (
                    <input
                      type="text"
                      value={tripDates}
                      placeholder={t("tripInfo.tripSummary.placeholderDates", "VD: 16/07/2025 - 24/07/2025")}
                      onChange={(e) => {
                        setTripDates(e.target.value);
                        clearError("tripDates");
                      }}
                      onBlur={() => setIsEditingDates(false)}
                      autoFocus
                      className="text-sm font-bold text-[#002d5b] dark:text-sky-300 bg-white dark:bg-slate-900 border border-[#00a3e0] rounded px-2 py-0.5 outline-none w-full"
                    />
                  ) : (
                    <div
                      onClick={() => setIsEditingDates(true)}
                      className={`text-base font-bold cursor-pointer ${tripDates ? "text-[#002d5b] dark:text-sky-300" : "text-slate-400 italic font-normal text-sm"}`}
                    >
                      {tripDates || t("tripInfo.tripSummary.placeholderDates", "Chọn ngày đi - về...")}
                    </div>
                  )}
                  {errors.tripDates && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.tripDates}</p>
                  )}
                </div>
              </div>
            </div>
          </section>
          {/* END: TripSummaryCard */}

          {/* BEGIN: LocationInformationCard (Card 2) */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-200 dark:border-slate-800" data-purpose="location-details-card">
            {/* Header of Location Card */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#002d5b] dark:text-sky-300 tracking-tight">
                  {t("tripInfo.destinationDetails.title", "Thông tin địa điểm")}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t("tripInfo.destinationDetails.subtitle", "Tùy chỉnh mục tiêu điểm xuất phát, thành viên và gu trải nghiệm")}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Destination Field */}
              <div data-purpose="destination-input-group">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200" htmlFor="destination-input">
                    {t("tripInfo.destinationDetails.destinationLabel", "Đi đâu?")} <span className="text-rose-500">*</span>
                  </label>                  
                </div>

                {/* Input Container with Location Pin Icon */}
                <div className="relative rounded-xl shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                  </div>
                  <input
                    className="w-full pl-10 pr-12 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-[#00a3e0] focus:ring-2 focus:ring-[#00a3e0]/20 transition-all outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    id="destination-input"
                    placeholder={t("tripInfo.destinationDetails.destinationPlaceholderMap", "Bấm để chọn địa điểm trên bản đồ...")}
                    type="text"
                    value={destination}
                    readOnly
                    onClick={() => setIsMapModalOpen(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setIsMapModalOpen(true);
                      }
                    }}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                      <path clipRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" fillRule="evenodd"></path>
                    </svg>
                  </div>
                </div>
                {errors.destination && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.destination}</p>
                )}
              </div>

              {/* Two Column Row: Companions & Member Count */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5" data-purpose="companions-and-count">
                {/* Companions Dropdown */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2" htmlFor="companion-select">
                    {t("tripInfo.destinationDetails.companionsLabel", "Đi cùng ai?")} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                      </svg>
                    </div>
                    <select
                      className="w-full pl-11 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 focus:border-[#00a3e0] focus:ring-2 focus:ring-[#00a3e0]/20 transition-all appearance-none cursor-pointer outline-none"
                      id="companion-select"
                      value={companions}
                      onChange={(e) => {
                        setCompanions(e.target.value);
                        clearError("companions");
                      }}
                    >
                      <option value="friends">{t("tripInfo.companions.friends", "Bạn bè thân thiết")}</option>
                      <option value="family">{t("tripInfo.companions.family", "Gia đình")}</option>
                      <option value="couple">{t("tripInfo.companions.couple", "Cặp đôi / Người yêu")}</option>
                      <option value="solo">{t("tripInfo.companions.solo", "Đi một mình (Solo)")}</option>
                      <option value="colleagues">{t("tripInfo.companions.colleagues", "Đồng nghiệp")}</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                      </svg>
                    </div>
                  </div>
                  {errors.companions && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.companions}</p>
                  )}
                </div>

                {/* Stepper / Count Input */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                    {t("tripInfo.destinationDetails.passengerCountLabel", "Số lượng thành viên")} <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center justify-between w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                      </svg>
                      {t("tripInfo.destinationDetails.memberCountPrefix", "Thành viên:")}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        aria-label="Giảm 1 thành viên"
                        className="w-7 h-7 rounded-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-200 flex items-center justify-center font-bold hover:bg-slate-100 dark:hover:bg-slate-600 active:scale-95 transition shadow-2xs cursor-pointer"
                        type="button"
                        onClick={() => setMemberCount(Math.max(1, memberCount - 1))}
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold text-slate-800 dark:text-slate-100 text-sm">
                        {memberCount}
                      </span>
                      <button
                        aria-label="Tăng 1 thành viên"
                        className="w-7 h-7 rounded-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-200 flex items-center justify-center font-bold hover:bg-slate-100 dark:hover:bg-slate-600 active:scale-95 transition shadow-2xs cursor-pointer"
                        type="button"
                        onClick={() => setMemberCount(Math.min(50, memberCount + 1))}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {errors.passengerCount && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.passengerCount}</p>
                  )}
                </div>
              </div>

              {/* Trip Style / Preferences */}
              <div data-purpose="trip-style-section">
                <div className="flex items-center justify-between mb-2.5">
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                    {t("tripInfo.destinationDetails.travelStyleLabel", "Phong cách & Sở thích chuyến đi?")} <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs font-semibold text-slate-400">
                    {t("tripInfo.destinationDetails.selectedCount", "Đã chọn:")}{" "}
                    <strong className="text-[#00a3e0]">{selectedStyles.length}</strong>
                  </span>
                </div>

                {/* Tags List */}
                <div className="flex flex-wrap gap-2.5 mb-3" id="style-tags-container">
                  {PRESET_STYLES.map((style) => {
                    const isSelected = selectedStyles.includes(style.id);
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => toggleStyle(style.id)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer ${isSelected
                            ? "bg-[#00a3e0] text-white border border-[#00a3e0] shadow-xs hover:bg-[#008ec4]"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-[#00a3e0] hover:text-[#00a3e0]"
                          }`}
                      >
                        <span>{t(style.labelKey, style.defaultLabel)}</span>
                        {isSelected && (
                          <span className="text-white/80 hover:text-white font-bold text-sm leading-none">
                            ×
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Optional Custom Tag Input */}
                <input
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-[#00a3e0] focus:ring-1 focus:ring-[#00a3e0] transition outline-none text-slate-800 dark:text-slate-100"
                  placeholder={t("tripInfo.destinationDetails.travelStylePlaceholder", "Nhập thêm sở thích khác (ví dụ: Cà phê ngắm cảnh, Chụp ảnh film...)")}
                  type="text"
                  value={customStyle}
                  onChange={(e) => {
                    setCustomStyle(e.target.value);
                    clearError("travelStyle");
                  }}
                />
                {errors.travelStyle && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.travelStyle}</p>
                )}
              </div>
            </div>
          </section>
          {/* END: LocationInformationCard */}

          {/* BEGIN: ActionButtonsFooter */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4" data-purpose="form-actions">


            {/* Primary Submit Button */}
            <button
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full text-sm font-bold text-white bg-[#002d5b] hover:bg-[#1e4069] shadow-lg shadow-slate-900/10 active:scale-[0.98] transition-all order-1 sm:order-2 group cursor-pointer disabled:opacity-70"
              id="btn-next-step"
              type="submit"
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? "Đang xử lý..." : t("tripInfo.actions.nextStep", "Bước tiếp theo")}</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </button>
          </div>
          {/* END: ActionButtonsFooter */}
        </form>
      </main>

      {/* Main Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-sky-100 dark:border-slate-800 py-6 mt-12" data-purpose="main-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© 2025 WAYVEE Navigation Platform. Giữ bản quyền hành trình khám phá.</p>
          <div className="flex items-center gap-6">
            <a className="hover:text-[#00a3e0] transition-colors" href="#">{t("footer.terms", "Điều khoản")}</a>
            <a className="hover:text-[#00a3e0] transition-colors" href="#">{t("footer.privacy", "Chính sách bảo mật")}</a>
            <a className="hover:text-[#00a3e0] transition-colors" href="#">{t("footer.helpCenter", "Trung tâm trợ giúp")}</a>
          </div>
        </div>
      </footer>

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
