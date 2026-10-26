import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "~/providers/i18n-provider";
import { AppHeader, AppFooter } from "~/shared/components";
import { useAuth } from "~/providers/auth-provider";
import { checkFavorite, addFavorite, removeFavoriteByOsmId } from "~/shared/services/favorite-api";
import { getPlaceById } from "../services/places-api";
import { getReviewsByOsmId, getReviewSummary, createReview } from "~/shared/services/review-api";

const CATEGORY_NAMES = {
  vi: {
    RESTAURANT: "Quán ăn",
    CAFE: "Quán cà phê",
    FAST_FOOD: "Thức ăn nhanh",
    BAR: "Quán bar / Pub",
    HOTEL: "Khách sạn / Lưu trú",
    ATTRACTION: "Điểm tham quan",
    SHOPPING: "Mua sắm",
    ENTERTAINMENT: "Khu vui chơi",
    OTHER: "Địa điểm"
  },
  en: {
    RESTAURANT: "Restaurant",
    CAFE: "Café",
    FAST_FOOD: "Fast Food",
    BAR: "Bar / Pub",
    HOTEL: "Hotel / Lodging",
    ATTRACTION: "Attraction",
    SHOPPING: "Shopping",
    ENTERTAINMENT: "Entertainment",
    OTHER: "Place"
  }
};

const DEFAULT_AMENITIES = {
  vi: {
    CAFE: [
      "Specialty Coffee",
      "Wi-Fi tốc độ cao",
      "Không gian yên tĩnh",
      "Ổ cắm điện",
      "Máy lạnh / Điều hòa",
      "Bàn lớn làm việc",
      "Chỗ để xe máy / ô tô",
      "Thanh toán thẻ & QR Code"
    ],
    RESTAURANT: [
      "Ẩm thực đặc sắc",
      "Không gian dùng bữa thoải mái",
      "Máy lạnh / Điều hòa",
      "Thanh toán thẻ & ví điện tử",
      "Chỗ để xe",
      "Thân thiện gia đình & nhóm",
      "Phục vụ mang về (Takeaway)",
      "Wi-Fi miễn phí"
    ],
    ATTRACTION: [
      "Điểm tham quan & Khám phá",
      "Khu vực check-in & Chụp ảnh",
      "Thân thiện gia đình & Trẻ em",
      "Bãi đỗ xe rộng rãi",
      "Không gian thoáng đãng",
      "Khu vực hướng dẫn / Thuyết minh"
    ],
    BAR: [
      "Đồ uống & Cocktail",
      "Âm nhạc giải trí",
      "Không gian thư giãn về đêm",
      "Thanh toán thẻ linh hoạt",
      "Chỗ ngồi quầy bar & Bàn nhóm",
      "Phục vụ đồ ăn nhẹ"
    ],
    HOTEL: [
      "Phòng nghỉ tiện nghi",
      "Wi-Fi tốc độ cao miễn phí",
      "Dịch vụ lễ tân hỗ trợ",
      "Điều hòa nhiệt độ",
      "Dọn phòng hàng ngày",
      "Chỗ để xe an toàn"
    ],
    SHOPPING: [
      "Mua sắm đa dạng mặt hàng",
      "Thanh toán thẻ / Chuyển khoản",
      "Không gian máy lạnh",
      "Chỗ để xe thuận tiện",
      "Nhân viên tư vấn hỗ trợ"
    ],
    ENTERTAINMENT: [
      "Hoạt động vui chơi giải trí",
      "Không gian trải nghiệm",
      "Phù hợp nhóm bạn & gia đình",
      "Khu vực nghỉ ngơi",
      "Chỗ gửi xe an ninh"
    ],
    OTHER: [
      "Tiện ích dịch vụ",
      "Thanh toán linh hoạt",
      "Chỗ để xe",
      "Không gian sạch sẽ"
    ]
  },
  en: {
    CAFE: [
      "Specialty Coffee",
      "High-speed Wi-Fi",
      "Quiet atmosphere",
      "Power outlets",
      "Air conditioning",
      "Large work tables",
      "Parking space",
      "Card & QR payment"
    ],
    RESTAURANT: [
      "Distinctive cuisine",
      "Comfortable dining space",
      "Air conditioning",
      "Card & E-wallet payment",
      "Parking space",
      "Family & group friendly",
      "Takeaway service",
      "Free Wi-Fi"
    ],
    ATTRACTION: [
      "Sightseeing & Discovery",
      "Photo check-in spot",
      "Family & kids friendly",
      "Spacious parking",
      "Open-air ambiance",
      "Tour guide / Info desk"
    ],
    BAR: [
      "Drinks & Cocktails",
      "Music & Entertainment",
      "Nightlife relaxation",
      "Flexible card payment",
      "Bar counter & group seating",
      "Snacks available"
    ],
    HOTEL: [
      "Comfortable rooms",
      "Free high-speed Wi-Fi",
      "Reception assistance",
      "Air conditioning",
      "Daily housekeeping",
      "Secure parking"
    ],
    SHOPPING: [
      "Wide variety of goods",
      "Card / Transfer payment",
      "Air-conditioned interior",
      "Convenient parking",
      "Supportive staff"
    ],
    ENTERTAINMENT: [
      "Fun & Recreational activities",
      "Immersive experience",
      "Group & family friendly",
      "Rest area",
      "Guarded parking"
    ],
    OTHER: [
      "Service amenities",
      "Flexible payment",
      "Parking space",
      "Clean environment"
    ]
  }
};

function formatReviewDate(dateStr, isEn) {
  if (!dateStr) return isEn ? "Recently" : "Gần đây";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return String(dateStr);
  }
}

export function PlaceDetailPage() {
  const { t, language } = useTranslation();
  const isEn = (language || "").startsWith("en");

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialPlace = location.state?.place || null;
  const tripState = location.state?.tripState || {};
  const { isAuthenticated } = useAuth();

  const [place, setPlace] = useState(
    initialPlace || {
      id,
      osmId: id,
      name: `Địa điểm #${id}`,
      address: "",
      categoryCode: "ATTRACTION"
    }
  );
  const [loading, setLoading] = useState(!initialPlace);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showFullAmenities, setShowFullAmenities] = useState(false);

  // Reviews state (real data from Backend)
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAllReviewsModal, setShowAllReviewsModal] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState({});

  // Review Form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [newAnonymous, setNewAnonymous] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // Selected places synced from /places
  const [selectedPlacesList, setSelectedPlacesList] = useState(
    () => location.state?.placesList || []
  );

  const placeOsmId = place?.osmId || place?.id || id;
  const isAdded = selectedPlacesList.some(
    (p) => String(p.osmId || p.id) === String(placeOsmId)
  );

  const handleToggleAdd = () => {
    setSelectedPlacesList((prev) => {
      const exists = prev.some((p) => String(p.osmId || p.id) === String(placeOsmId));
      if (exists) {
        return prev.filter((p) => String(p.osmId || p.id) !== String(placeOsmId));
      } else {
        const newPlaceItem = {
          id: placeOsmId,
          osmId: place.osmId || place.id || id,
          name: place.name || `Địa điểm #${placeOsmId}`,
          location: place.address || (isEn ? "Tourist spot" : "Khu vực du lịch"),
          rating: place.rating,
          score: place.rating ? Number(place.rating).toFixed(1) : undefined,
          reviewCount: place.reviewCount,
          image: place.imageUrl || null
        };
        return [...prev, newPlaceItem];
      }
    });
  };

  const handleGoBack = () => {
    if (location.state?.returnUrl) {
      navigate(location.state.returnUrl, {
        state: {
          ...(location.state.returnState || {}),
          ...tripState,
          placesList: selectedPlacesList
        }
      });
    } else {
      navigate(-1);
    }
  };

  // Load favorite status
  useEffect(() => {
    if (!isAuthenticated || !placeOsmId) {
      setIsFavorite(false);
      return;
    }
    let cancelled = false;
    checkFavorite(placeOsmId)
      .then((res) => {
        if (!cancelled) {
          setIsFavorite(res?.data === true || res === true);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, placeOsmId]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location.pathname + location.search } });
      return;
    }
    if (favLoading || !placeOsmId) return;
    setFavLoading(true);
    try {
      if (isFavorite) {
        await removeFavoriteByOsmId(placeOsmId);
        setIsFavorite(false);
      } else {
        await addFavorite({
          osmId: Number(placeOsmId) || placeOsmId,
          placeName: place?.name || `Địa điểm #${placeOsmId}`,
          latitude: Number(place?.latitude || place?.lat) || 0,
          longitude: Number(place?.longitude || place?.lng || place?.lon) || 0
        });
        setIsFavorite(true);
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    } finally {
      setFavLoading(false);
    }
  };

  // Fetch real place details from Backend
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!initialPlace) setLoading(true);
      try {
        const data = await getPlaceById(id);
        if (isMounted && data) {
          setPlace((prev) => ({ ...(prev || {}), ...data }));
        }
      } catch (err) {
        console.warn("Could not load place details from API:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [id, initialPlace]);

  // Fetch real reviews from Backend
  const loadReviewsData = useCallback(async () => {
    if (!placeOsmId) return;
    setReviewsLoading(true);
    try {
      const [reviewsRes, summaryRes] = await Promise.allSettled([
        getReviewsByOsmId(placeOsmId),
        getReviewSummary(placeOsmId)
      ]);
      if (reviewsRes.status === "fulfilled" && reviewsRes.value?.data) {
        const list = Array.isArray(reviewsRes.value.data) ? reviewsRes.value.data : [];
        setReviewsList(list);
      }
      if (summaryRes.status === "fulfilled" && summaryRes.value?.data) {
        setReviewSummary(summaryRes.value.data);
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  }, [placeOsmId]);

  useEffect(() => {
    loadReviewsData();
  }, [loadReviewsData]);

  // Handle Review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location.pathname + location.search } });
      return;
    }
    if (!newComment.trim()) {
      setReviewError(isEn ? "Please enter your review comment." : "Vui lòng nhập nội dung đánh giá.");
      return;
    }
    setSubmittingReview(true);
    setReviewError("");
    try {
      await createReview({
        osmId: Number(placeOsmId) || placeOsmId,
        placeName: place.name || `Địa điểm #${placeOsmId}`,
        rating: Number(newRating),
        comment: newComment.trim(),
        anonymous: newAnonymous
      });
      await loadReviewsData();
      setShowReviewModal(false);
      setNewComment("");
      setNewRating(5);
    } catch (err) {
      console.error("Submit review failed:", err);
      setReviewError(err?.message || (isEn ? "Failed to submit review. Please try again!" : "Không thể gửi đánh giá. Vui lòng thử lại!"));
    } finally {
      setSubmittingReview(false);
    }
  };

  // Category name translated
  const langKey = isEn ? "en" : "vi";
  const categoryCodeUpper = (place.categoryCode || "OTHER").toUpperCase();
  const categoryName = (CATEGORY_NAMES[langKey] && CATEGORY_NAMES[langKey][categoryCodeUpper]) || (isEn ? "Place" : "Địa điểm");

  // Amenities: use real amenities if array, else category-based by language
  const amenitiesList = useMemo(() => {
    if (Array.isArray(place.amenities) && place.amenities.length > 0) {
      return place.amenities;
    }
    const cat = (place.categoryCode || "OTHER").toUpperCase();
    const dict = DEFAULT_AMENITIES[langKey] || DEFAULT_AMENITIES.vi;
    return dict[cat] || dict.OTHER;
  }, [place.amenities, place.categoryCode, langKey]);

  // Review calculations based on real reviews
  const totalReviewsCount = reviewSummary?.totalReviews ?? reviewsList.length;
  const averageRatingScore = useMemo(() => {
    if (reviewSummary?.averageRating && reviewSummary.averageRating > 0 && totalReviewsCount > 0) {
      return reviewSummary.averageRating.toFixed(1);
    }
    if (reviewsList.length > 0) {
      const sum = reviewsList.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
      return (sum / reviewsList.length).toFixed(1);
    }
    if (place.rating && Number(place.rating) > 0) {
      return Number(place.rating).toFixed(1);
    }
    return null;
  }, [reviewSummary, reviewsList, place.rating, totalReviewsCount]);

  const ratingLabel = useMemo(() => {
    if (!averageRatingScore) return null;
    const score = parseFloat(averageRatingScore);
    if (score >= 4.8) return isEn ? "Excellent" : "Xuất sắc";
    if (score >= 4.0) return isEn ? "Very Good" : "Rất tốt";
    if (score >= 3.0) return isEn ? "Good" : "Tốt";
    return isEn ? "Guest rating" : "Đánh giá của khách";
  }, [averageRatingScore, isEn]);

  // Google Maps embed URL using coordinates or name + address
  const googleMapsEmbedUrl = useMemo(() => {
    if (place.latitude && place.longitude) {
      return `https://maps.google.com/maps?q=${place.latitude},${place.longitude}&z=16&output=embed`;
    }
    const query = encodeURIComponent(`${place.name || ""}, ${place.address || ""}`.trim());
    return `https://maps.google.com/maps?q=${query}&z=16&output=embed`;
  }, [place.latitude, place.longitude, place.name, place.address]);

  const googleMapsExternalUrl = useMemo(() => {
    if (place.latitude && place.longitude) {
      return `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
    }
    const query = encodeURIComponent(`${place.name || ""}, ${place.address || ""}`.trim());
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }, [place.latitude, place.longitude, place.name, place.address]);

  if (loading && !place?.name) {
    return (
      <div className="bg-[#f8fafc] dark:bg-slate-950 min-h-screen flex flex-col">
        <AppHeader
          onLogin={() => navigate("/login", { state: { from: location.pathname + location.search } })}
          onRegister={() => navigate("/register", { state: { from: location.pathname + location.search } })}
        />
        <div className="max-w-5xl mx-auto px-4 py-16 flex-grow flex items-center justify-center">
          <div className="animate-pulse space-y-4 w-full max-w-2xl">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full" />
          </div>
        </div>
        <AppFooter />
      </div>
    );
  }

  const mainImage = place.imageUrl || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="bg-[#f8fafc] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans min-h-screen flex flex-col antialiased">
      {/* App Header */}
      <AppHeader
        onLogin={() => navigate("/login", { state: { from: location.pathname + location.search } })}
        onRegister={() => navigate("/register", { state: { from: location.pathname + location.search } })}
      />

      {/* Main Container */}
      <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        
        {/* Navigation & Back Button */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>{t("places.detail.back", isEn ? "Back" : "Quay lại")}</span>
          </button>

          {selectedPlacesList.length > 0 && (
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1 rounded-full">
              {selectedPlacesList.length} {t("places.footer.placesSelected", isEn ? "places selected" : "địa điểm đã chọn")}
            </div>
          )}
        </div>

        {/* Top Header Row: Name, Rating, Address & Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b2545] dark:text-white tracking-tight">
                {place.name}
              </h1>
              {averageRatingScore && (
                <span className="text-sm font-bold text-amber-500">★ {averageRatingScore}</span>
              )}
            </div>
            {place.address && (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {place.address}
              </p>
            )}
          </div>

          {/* Action Buttons: Favorite, Share, Add to Trip */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleFavorite}
              disabled={favLoading}
              className={`w-10 h-10 rounded-full border flex items-center justify-center cursor-pointer shadow-2xs transition-all hover:scale-110 active:scale-95 ${
                isFavorite
                  ? "border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-500"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:border-rose-200"
              }`}
              title={isFavorite ? t("places.detail.unfavorite", isEn ? "Unfavorite" : "Bỏ yêu thích") : t("places.detail.favorite", isEn ? "Favorite" : "Yêu thích")}
              aria-label={isFavorite ? t("places.detail.unfavorite", isEn ? "Unfavorite" : "Bỏ yêu thích") : t("places.detail.favorite", isEn ? "Favorite" : "Yêu thích")}
            >
              {isFavorite ? (
                <svg className="w-5 h-5 fill-rose-500 text-rose-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                alert(t("places.detail.copied", isEn ? "Link copied to clipboard!" : "Đã sao chép liên kết địa điểm!"));
              }}
              className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-sky-500 cursor-pointer shadow-2xs transition-transform hover:scale-105"
              title={t("places.detail.share", isEn ? "Share" : "Chia sẻ")}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-5.967 3 3 0 000 5.967z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleToggleAdd}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
                isAdded
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20"
                  : "bg-[#0b2545] hover:bg-[#102f58] dark:bg-sky-500 dark:hover:bg-sky-600 text-white dark:text-slate-950"
              }`}
            >
              <span>{isAdded ? t("places.detail.addedToTrip", isEn ? "Added ✓" : "Đã thêm ✓") : t("places.detail.addToTrip", isEn ? "Add to trip +" : "Thêm vào lịch trình +")}</span>
            </button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="w-full h-72 sm:h-96 rounded-3xl overflow-hidden shadow-md relative bg-slate-200 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
          {mainImage ? (
            <img src={mainImage} alt={place.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-5xl">📍</div>
          )}
        </div>

        {/* SECTION 1: Description (Styled matching Image 2 & fully translated) */}
        <section aria-label="Mô tả địa điểm" className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {t("places.detail.descriptionTitle", isEn ? "Description" : "Mô tả")}
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
            <strong>{t("places.detail.scaleLabel", isEn ? "Scale / Category:" : "Quy mô / Phân loại:")}</strong> {categoryName} {place.address ? `· ${place.address}` : ""}
          </p>
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl space-y-2">
            {place.description ? (
              <p className={showFullDesc ? "" : "line-clamp-3"}>{place.description}</p>
            ) : isEn ? (
              <p className={showFullDesc ? "" : "line-clamp-3"}>
                {place.name} is a renowned {categoryName.toLowerCase()} located in {place.address || "Vietnam"}.
                {place.openingHours ? ` Opening hours: ${place.openingHours}.` : ""}
                {place.phone ? ` Contact phone: ${place.phone}.` : ""}
                {place.website ? ` For more information, visit: ${place.website}.` : ""}
                {showFullDesc && (
                  <span className="block mt-2 text-slate-500 dark:text-slate-400">
                    {t("places.detail.verifiedLocation")}
                  </span>
                )}
              </p>
            ) : (
              <p className={showFullDesc ? "" : "line-clamp-3"}>
                {place.name} là một địa điểm thuộc danh mục {categoryName.toLowerCase()} nổi bật tại {place.address || "Việt Nam"}.
                {place.openingHours ? ` Địa điểm mở cửa phục vụ trong khung giờ: ${place.openingHours}.` : ""}
                {place.phone ? ` Số điện thoại liên hệ: ${place.phone}.` : ""}
                {place.website ? ` Quý khách có thể xem thêm thông tin tại website: ${place.website}.` : ""}
                {showFullDesc && (
                  <span className="block mt-2 text-slate-500 dark:text-slate-400">
                    {t("places.detail.verifiedLocation")}
                  </span>
                )}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowFullDesc(!showFullDesc)}
            className="inline-block text-xs border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-1.5 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition font-semibold cursor-pointer shadow-2xs"
          >
            {showFullDesc ? t("places.detail.showLess", isEn ? "Show Less" : "Thu gọn") : t("places.detail.showMore", isEn ? "Show More" : "Xem thêm")}
          </button>
        </section>

        {/* SECTION 2: Amenities (2-column layout matching Image 2 & translated) */}
        <section aria-label="Tiện ích địa điểm" className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {t("places.detail.amenitiesTitle", isEn ? "Amenities" : "Tiện ích")}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3.5 max-w-xl text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            {(showFullAmenities ? amenitiesList : amenitiesList.slice(0, 6)).map((item, idx) => (
              <li key={idx} className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          {amenitiesList.length > 6 && (
            <button
              type="button"
              onClick={() => setShowFullAmenities(!showFullAmenities)}
              className="inline-block text-xs border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-1.5 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition font-semibold cursor-pointer shadow-2xs"
            >
              {showFullAmenities ? t("places.detail.showLess", isEn ? "Show Less" : "Thu gọn") : t("places.detail.showAll", isEn ? "Show All" : "Xem tất cả")}
            </button>
          )}
        </section>

        {/* SECTION 3: Location (Real Map Preview matching Image 2 & translated) */}
        <section aria-label="Vị trí trên bản đồ" className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {t("places.detail.locationTitle", isEn ? "Location" : "Vị trí")}
          </h2>
          <div className="w-full max-w-2xl h-72 sm:h-88 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xs bg-slate-100 dark:bg-slate-900 relative">
            <iframe
              title={`Map ${place.name}`}
              src={googleMapsEmbedUrl}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <a
            href={googleMapsExternalUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-xs text-[#064db9] dark:text-sky-400 hover:underline font-medium"
          >
            {t("places.detail.openLargeMap", isEn ? "Open large map ↗" : "Mở bản đồ lớn ↗")}
          </a>
        </section>

        {/* SECTION 4: Reviews (Real reviews with breakdown & cards matching Image 2 & translated) */}
        <section aria-label="Đánh giá từ khách hàng" className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {t("places.detail.reviewsTitle", isEn ? "Reviews" : "Đánh giá")}
            </h2>
            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) {
                  navigate("/login", { state: { from: location.pathname + location.search } });
                } else {
                  setShowReviewModal(true);
                }
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#0b2545] hover:bg-[#102f58] dark:bg-sky-500 dark:hover:bg-sky-600 text-white dark:text-slate-950 text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              {t("places.detail.writeReview", isEn ? "+ Write review" : "+ Viết đánh giá")}
            </button>
          </div>

          {/* Average Star Rating Summary */}
          {averageRatingScore && (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50">
                <span className="text-amber-500 text-sm">★</span>
                <span className="text-sm font-extrabold text-amber-700 dark:text-amber-300">
                  {averageRatingScore}
                </span>
                <span className="text-xs text-slate-400">/ 5.0</span>
              </div>
              {ratingLabel && (
                <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {ratingLabel}
                </span>
              )}
              <span className="text-xs text-slate-400 dark:text-slate-500">
                ({t("places.detail.reviewsCount", { count: totalReviewsCount.toLocaleString(isEn ? "en-US" : "vi-VN") })})
              </span>
            </div>
          )}

          {/* Real Reviews Cards Grid (3 columns matching Image 2) */}
          {reviewsLoading ? (
            <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
              {isEn ? "Loading reviews from system..." : "Đang tải đánh giá từ hệ thống..."}
            </div>
          ) : reviewsList.length === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2 bg-slate-50/50 dark:bg-slate-900/30">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("places.detail.noReviews", isEn ? "No reviews yet for this place." : "Chưa có bài đánh giá nào cho địa điểm này.")}
              </p>
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate("/login", { state: { from: location.pathname + location.search } });
                  } else {
                    setShowReviewModal(true);
                  }
                }}
                className="text-xs text-sky-600 dark:text-sky-400 font-semibold hover:underline cursor-pointer"
              >
                {t("places.detail.firstReview", isEn ? "Be the first to share your experience!" : "Hãy là người đầu tiên để lại đánh giá!")}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {reviewsList.slice(0, 3).map((review) => {
                const reviewId = review.reviewId || review.id;
                const isExpanded = !!expandedReviews[reviewId];
                const authorName = review.anonymous
                  ? (isEn ? "Anonymous user" : "Người dùng ẩn danh")
                  : review.userFullName || (isEn ? "WAYVEE Traveler" : "Du khách WAYVEE");
                const firstChar = authorName.charAt(0).toUpperCase();

                return (
                  <article
                    key={reviewId}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between shadow-2xs space-y-3"
                  >
                    <header className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center text-xs flex-shrink-0">
                        {firstChar}
                      </span>
                      <div className="min-w-0 flex-1">
                        <strong className="block text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {authorName}
                        </strong>
                        <time className="block text-[10px] text-slate-400">
                          {formatReviewDate(review.createdAt, isEn)}
                        </time>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 font-bold text-xs">
                        {(Number(review.rating) || 5).toFixed(1)}
                      </span>
                    </header>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                      “{isExpanded ? review.comment : (review.comment?.length > 100 ? `${review.comment.slice(0, 100)}...` : review.comment)}”
                    </p>

                    {review.comment && review.comment.length > 100 && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedReviews((prev) => ({
                            ...prev,
                            [reviewId]: !isExpanded
                          }))
                        }
                        className="self-end text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {isExpanded ? t("places.detail.showLess", isEn ? "Show Less" : "Thu gọn") : t("places.detail.showMore", isEn ? "Show More" : "Xem thêm")}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {reviewsList.length > 3 && (
            <button
              type="button"
              onClick={() => setShowAllReviewsModal(true)}
              className="inline-block text-xs border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-1.5 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition font-semibold cursor-pointer shadow-2xs"
            >
              {t("places.detail.showAllReviews", { count: reviewsList.length })}
            </button>
          )}
        </section>

        {/* SECTION 5: Policies (Table rows matching Image 2 & translated) */}
        <section aria-label="Chính sách & Quy định" className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {t("places.detail.policiesTitle", isEn ? "Policies & Guidelines" : "Chính sách & Quy định")}
          </h2>
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
            {[
              {
                icon: "◷",
                title: t("places.detail.policies.hoursTitle", isEn ? "Opening hours" : "Giờ mở cửa"),
                desc: place.openingHours || t("places.detail.policies.hoursDefault", isEn ? "07:00 – 22:00 daily" : "07:00 – 22:00 mỗi ngày")
              },
              {
                icon: "🥡",
                title: t("places.detail.policies.outsideFoodTitle", isEn ? "Outside food" : "Mang đồ ăn ngoài"),
                desc: t("places.detail.policies.outsideFoodDesc")
              },
              {
                icon: "💳",
                title: t("places.detail.policies.paymentTitle", isEn ? "Payment" : "Thanh toán"),
                desc: t("places.detail.policies.paymentDesc")
              },
              {
                icon: "♙",
                title: t("places.detail.policies.studyWorkTitle", isEn ? "Work & Study" : "Làm việc và học tập"),
                desc: t("places.detail.policies.studyWorkDesc")
              },
              {
                icon: "⌁",
                title: t("places.detail.policies.wifiTitle", isEn ? "Free Wi-Fi" : "Wi-Fi miễn phí"),
                desc: t("places.detail.policies.wifiDesc")
              },
              {
                icon: "♧",
                title: t("places.detail.policies.etiquetteTitle", isEn ? "Public etiquette" : "Văn minh nơi công cộng"),
                desc: t("places.detail.policies.etiquetteDesc")
              },
              {
                icon: "⊘",
                title: t("places.detail.policies.smokingTitle", isEn ? "Smoking policy" : "Hút thuốc"),
                desc: t("places.detail.policies.smokingDesc")
              },
              {
                icon: "🐾",
                title: t("places.detail.policies.petsTitle", isEn ? "Pet policy" : "Thú cưng"),
                desc: t("places.detail.policies.petsDesc")
              }
            ].map((policy, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-[220px_1fr] p-4 sm:p-4.5 gap-2 sm:gap-4 items-baseline"
              >
                <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="text-base text-slate-400 dark:text-slate-500">{policy.icon}</span>
                  <span>{policy.title}</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {policy.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <AppFooter />

      {/* MODAL: Write Review */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t("places.detail.reviewModalTitle", isEn ? "Review this place" : "Đánh giá địa điểm")}
              </h3>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t("places.detail.ratingStarsLabel", isEn ? "Star rating" : "Đánh giá số sao")}
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="text-2xl transition-transform hover:scale-125 cursor-pointer"
                    >
                      {star <= newRating ? "⭐" : "☆"}
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">
                    {t("places.detail.starsCount", { count: newRating })}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t("places.detail.reviewCommentLabel", isEn ? "Your review" : "Nhận xét của bạn")}
                </label>
                <textarea
                  rows={4}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={t("places.detail.reviewPlaceholder", isEn ? "Share your experience with the ambiance, food, service..." : "Chia sẻ trải nghiệm của bạn về không gian, món ăn, dịch vụ...")}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-sky-500"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymousCheck"
                  checked={newAnonymous}
                  onChange={(e) => setNewAnonymous(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="anonymousCheck" className="text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                  {t("places.detail.anonymousLabel", isEn ? "Post anonymously" : "Đánh giá ẩn danh")}
                </label>
              </div>

              {reviewError && (
                <p className="text-xs text-rose-500">{reviewError}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {t("places.detail.cancel", isEn ? "Cancel" : "Hủy")}
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {submittingReview ? t("places.detail.submitting", isEn ? "Submitting..." : "Đang gửi...") : t("places.detail.submitReview", isEn ? "Submit review" : "Gửi đánh giá")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Show all reviews */}
      {showAllReviewsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t("places.detail.allReviewsTitle", { count: reviewsList.length })}
              </h3>
              <button
                type="button"
                onClick={() => setShowAllReviewsModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {reviewsList.map((review) => {
                const authorName = review.anonymous
                  ? (isEn ? "Anonymous user" : "Người dùng ẩn danh")
                  : review.userFullName || (isEn ? "WAYVEE Traveler" : "Du khách WAYVEE");
                return (
                  <div
                    key={review.reviewId || review.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-800/30"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs font-semibold text-slate-900 dark:text-white">
                        {authorName}
                      </strong>
                      <span className="text-xs font-bold text-amber-500">
                        ★ {(Number(review.rating) || 5).toFixed(1)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                      “{review.comment}”
                    </p>
                    <time className="block text-[10px] text-slate-400">
                      {formatReviewDate(review.createdAt, isEn)}
                    </time>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
