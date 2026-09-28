import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "~/providers/i18n-provider";
import { AppHeader } from "~/shared/components";

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
  if (!start || !end) return "";
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const nights = Math.max(0, diffDays - 1);
  return `${diffDays}N / ${nights}Đ`;
}

export function TripConfirmPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const locationState = useLocation().state || {};

  const [loadingStage, setLoadingStage] = useState(null); // null | "processing" | "confirming"

  // Form State (Read-only)
  const tripName = locationState.tripName || "Khám phá Cố đô Huế";
  const tripDates = locationState.tripDates || "15/08/2025 - 18/08/2025";
  const destination = locationState.destination || "Huế, Việt Nam";
  const passengerCount = locationState.passengerCount || 2;

  const parsedDates = useMemo(() => parseDateRange(tripDates), [tripDates]);
  const durationBadge = useMemo(() => {
    if (parsedDates.start && parsedDates.end) {
      return calculateDuration(parsedDates.start, parsedDates.end);
    }
    return "4N / 3Đ";
  }, [parsedDates]);

  // List of confirmed places from user itinerary
  const placesList =
    locationState.placesList && locationState.placesList.length > 0
      ? locationState.placesList
      : [
          {
            name: "Đại Nội Huế",
            address: "Phú Hậu, Thành phố Huế, Thừa Thiên Huế",
            specs: "Di tích lịch sử & Quần thể Hoàng thành triều Nguyễn",
            rating: 5,
            score: "4.8",
            reviewCount: "8,500+",
            tags: ["Di tích", "Văn hóa", "Di sản UNESCO"],
            image:
              "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80"
          },
          {
            name: "Cộng Cà Phê",
            address: "22 Bến Nghé, Phú Hội, Thành phố Huế",
            specs: "View ngắm phố đi bộ · Cà phê cốt dừa đặc trưng",
            rating: 5,
            score: "4.7",
            reviewCount: "1,120",
            tags: ["Cà phê", "Check-in", "Thư giãn"],
            image:
              "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80"
          }
        ];

  const handleConfirmClick = () => {
    setLoadingStage("processing");

    setTimeout(() => {
      setLoadingStage("confirming");

      setTimeout(() => {
        setLoadingStage(null);
        navigate("/trip/success", {
          state: {
            tripName,
            tripDates,
            destination,
            passengerCount,
            placesList
          }
        });
      }, 1200);
    }, 1200);
  };

  return (
    <div className="bg-[#f8fafc] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans min-h-screen flex flex-col antialiased selection:bg-[#00a3e0] selection:text-white">
      {/* App Header */}
      <AppHeader
        onLogin={() => navigate("/login", { state: { from: "/trip/confirm" } })}
        onRegister={() => navigate("/register", { state: { from: "/trip/confirm" } })}
      />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full" data-purpose="primary-flow-container">
        
        {/* BEGIN: StepperBar (Exact style & colors from Step 1 and Step 2) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-100 dark:border-slate-800 mb-8" data-purpose="progress-stepper">
          <div className="max-w-xl mx-auto flex items-center justify-between relative">
            {/* Connecting Background Lines */}
            <div className="absolute left-8 right-8 top-5 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-700 z-0"></div>
            <div className="absolute left-8 right-8 top-5 -translate-y-1/2 h-0.5 bg-[#00a3e0] z-0"></div>

            {/* Step 1 (Completed) */}
            <div
              className="relative z-10 flex flex-col items-center group cursor-pointer"
              onClick={() => navigate("/trip/info", { state: locationState })}
            >
              <div className="w-10 h-10 rounded-full bg-[#00a3e0] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-sky-100">
                1
              </div>
              <span className="mt-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 text-center">
                {t("tripInfo.stepper.step1", "1. Nhập thông tin")}
              </span>
            </div>

            {/* Step 2 (Completed) */}
            <div
              className="relative z-10 flex flex-col items-center group cursor-pointer"
              onClick={() =>
                navigate("/trip/create", {
                  state: {
                    ...locationState,
                    tripName,
                    tripDates,
                    destination,
                    passengerCount,
                    placesList
                  }
                })
              }
            >
              <div className="w-10 h-10 rounded-full bg-[#00a3e0] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-sky-100">
                2
              </div>
              <span className="mt-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 text-center">
                {t("tripInfo.stepper.step2", "2. Chọn địa điểm")}
              </span>
            </div>

            {/* Step 3 (Current Active Step) */}
            <div className="relative z-10 flex flex-col items-center group">
              <div className="w-10 h-10 rounded-full bg-[#00a3e0] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-sky-100 ring-4 ring-sky-50 dark:ring-sky-950">
                3
              </div>
              <span className="mt-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-white text-center">
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
              REVIEW & CONFIRM
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002d5b] dark:text-sky-300 tracking-tight">
            {t("tripConfirm.tripSummary.title", "Thông tin lịch trình")}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            Kiểm tra và xác nhận lại các chi tiết của chuyến đi trước khi lưu hành trình.
          </p>
        </div>

        {/* BEGIN: Trip Details Summary Card */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200 dark:border-slate-800 space-y-6 mb-6">
          {/* Card Section 1: CHUYẾN ĐI CỦA BẠN */}
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00a3e0]"></span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t("tripConfirm.tripSummary.yourTrip", "CHUYẾN ĐI CỦA BẠN")}
                </h2>
              </div>
              {durationBadge && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#e6f6fd] dark:bg-sky-950/60 text-[#00a3e0]">
                  {durationBadge}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tên chuyến đi */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-medium text-slate-400 block">
                  {t("tripConfirm.tripSummary.nameLabel", "Tên chuyến đi")}
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1 block">
                  {tripName}
                </span>
              </div>

              {/* Ngày đi - về */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-medium text-slate-400 block">
                  {t("tripConfirm.tripSummary.datesLabel", "Ngày đi - về")}
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1 block">
                  {tripDates}
                </span>
              </div>
            </div>
          </div>

          {/* Card Section 2: ĐỊA ĐIỂM & THÀNH VIÊN */}
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#00a3e0]"></span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("tripConfirm.tripSummary.locationTitle", "ĐỊA ĐIỂM")}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nơi đến */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-medium text-slate-400 block">
                  {t("tripConfirm.tripSummary.locationLabel", "Nơi đến")}
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1 block">
                  {destination}
                </span>
              </div>

              {/* Số lượng người */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-medium text-slate-400 block">
                  {t("tripConfirm.tripSummary.passengerLabel", "Số lượng người tham gia")}
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1 block">
                  {passengerCount} thành viên
                </span>
              </div>
            </div>
          </div>
        </section>
        {/* END: Trip Details Summary Card */}

        {/* Selected Place Cards Section */}
        <section className="space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00a3e0]"></span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                DANH SÁCH ĐỊA ĐIỂM ĐÃ LÊN LỊCH ({placesList.length})
              </h2>
            </div>
          </div>

          <div className="space-y-4">
            {placesList.map((place, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-5 shadow-xs hover:border-sky-200 dark:hover:border-slate-700 transition-all items-start sm:items-center"
              >
                {/* Place Thumbnail */}
                <div className="w-full sm:w-52 h-44 sm:h-36 rounded-xl overflow-hidden flex-shrink-0 relative bg-slate-100 dark:bg-slate-800">
                  <img
                    alt={place.name}
                    className="w-full h-full object-cover"
                    src={place.image || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80"}
                    loading="lazy"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-[#00a3e0] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                    {t("tripConfirm.placeItem.discountBadge", "Ưu đãi")}
                  </span>
                </div>

                {/* Place Info */}
                <div className="flex-grow min-w-0 flex flex-col justify-between space-y-2.5 w-full">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                            {place.name}
                          </h3>
                          {/* Star Rating */}
                          <div className="flex items-center text-amber-400 text-xs">
                            {Array.from({ length: place.rating || 5 }).map((_, i) => (
                              <span key={i}>★</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                          <span>📍</span>
                          <span className="truncate">{place.address}</span>
                        </p>
                      </div>

                      {/* Score Badge */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                          <span className="text-[11px] font-bold text-[#00a3e0] block">
                            {t("tripConfirm.placeItem.excellent", "Xuất sắc")}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {place.reviewCount || "1,000+"} đánh giá
                          </span>
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-extrabold bg-[#e6f6fd] dark:bg-sky-950 text-[#00a3e0] border border-sky-200 dark:border-sky-800">
                          {place.score || "4.8"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {place.specs && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {place.specs}
                    </p>
                  )}

                  {/* Tags */}
                  {place.tags && place.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {place.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e6f6fd] dark:bg-slate-800 text-[#00a3e0] dark:text-sky-300 border border-sky-100 dark:border-slate-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Action Buttons: Back & Complete */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-4 pb-12">
          <button
            type="button"
            onClick={() =>
              navigate("/trip/create", {
                state: {
                  ...locationState,
                  tripName,
                  tripDates,
                  destination,
                  passengerCount,
                  placesList
                }
              })
            }
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            ← Quay lại bước 2
          </button>

          <button
            type="button"
            onClick={handleConfirmClick}
            className="w-full sm:w-auto bg-[#00a3e0] hover:bg-[#008ec4] text-white text-xs sm:text-sm font-bold py-3.5 px-10 rounded-xl shadow-lg shadow-sky-100 dark:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>{t("tripConfirm.actions.confirm", "Xác nhận & Hoàn tất")}</span>
            <span>→</span>
          </button>
        </div>
      </main>

      {/* Loading Modal Overlay */}
      {loadingStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-xs w-full text-center shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="relative w-12 h-12 mx-auto mb-5">
              <div className="w-12 h-12 rounded-full border-4 border-slate-100 dark:border-slate-800 border-t-[#00a3e0] animate-spin" />
            </div>

            {loadingStage === "processing" ? (
              <>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t("tripConfirm.modals.processingTitle", "Đang xử lý lịch trình")}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                  {t("tripConfirm.modals.processingSubtitle", "Vui lòng đợi giây lát trong khi WAYVEE đồng bộ hành trình...")}
                </p>
              </>
            ) : (
              <>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t("tripConfirm.modals.confirmingTitle", "Hoàn tất chuyến đi")}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                  {t("tripConfirm.modals.confirmingSubtitle", "Đang lưu lịch trình vào bộ sưu tập của bạn...")}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
