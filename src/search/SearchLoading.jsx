import WayveeTravelLoader from '../payment/WayveeTravelLoader.jsx';
import './PremiumSearch.css';

export default function SearchLoading() {
  return (
    <main className="premium-search-loading flex items-center justify-center min-h-[60vh] py-12" role="status" aria-label="Đang tải tìm kiếm">
      <div className="w-full max-w-xl mx-auto px-4">
        <WayveeTravelLoader
          badgeText="ĐANG TÌM KIẾM ĐỊA ĐIỂM"
          title="Đang tải dữ liệu tìm kiếm..."
          subtitle="Wayvee đang truy xuất các địa điểm hấp dẫn nhất dành cho bạn."
          showQR={false}
        />
      </div>
    </main>
  );
}
