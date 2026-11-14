import { GlobalLoadingOverlay } from "~/shared/ui/global-loading-overlay";

/**
 * SearchLoading
 * 
 * Reusable loading fallback for the Search Page and Search route.
 * Employs the unified Wayvee Global Loading System (Airplane Orbit).
 */
export default function SearchLoading({
  message = "Đang tìm kiếm địa điểm...",
  submessage = "Wayvee đang truy xuất các địa điểm tốt nhất cho chuyến đi của bạn"
}) {
  return (
    <GlobalLoadingOverlay
      isLoading={true}
      message={message}
      submessage={submessage}
      delay={0}
    />
  );
}
