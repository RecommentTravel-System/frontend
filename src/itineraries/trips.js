// Sample content for the itinerary UI; replace with the signed-in user's trips API.
export const filters = [
  { id: 'all', label: 'Tất cả', title: 'Tất cả lịch trình' },
  { id: 'ongoing', label: 'Đang diễn ra', title: 'Lịch trình đang diễn ra' },
  { id: 'completed', label: 'Đã hoàn thành', title: 'Lịch trình đã hoàn thành' },
  { id: 'cancelled', label: 'Đã hủy', title: 'Lịch trình đã hủy' },
];

export const trips = [
  {
    id: 'hue-trip-saved', title: 'Khám phá Cố đô Huế', destination: 'Huế, Việt Nam',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=500&q=80',
    status: 'ongoing', confirmed: true, hasItinerary: false, start: '2030-10-05', end: '2030-10-08', time: '08:00 – 17:00', duration: '4N / 3Đ', guests: 2,
    summary: '2 người · Khám phá văn hóa & ẩm thực',
    description: 'Chuyến đi Huế với các địa điểm di tích lịch sử và ẩm thực đặc sản đã được lưu, sẵn sàng để sắp xếp lịch trình chi tiết.',
    places: ['Đại Nội Huế', 'Chùa Thiên Mụ', 'Lăng Khải Định', 'Chợ Đông Ba', 'Sông Hương'],
    placesList: [
      { id: 'h-1', name: 'Đại Nội Huế', location: 'TP. Huế', rating: 4.8, score: '4.8', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=500&q=80' },
      { id: 'h-2', name: 'Chùa Thiên Mụ', location: 'Kim Long, TP. Huế', rating: 4.7, score: '4.7', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=500&q=80' },
      { id: 'h-3', name: 'Lăng Khải Định', location: 'Thủy Bằng, TP. Huế', rating: 4.9, score: '4.9', image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=500&q=80' },
      { id: 'h-4', name: 'Chợ Đông Ba', location: 'Phú Hòa, TP. Huế', rating: 4.5, score: '4.5', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=500&q=80' }
    ],
    amenities: ['WiFi', 'Check-in', 'Bản đồ số', 'Hướng dẫn viên'],
  },
  {
    id: 'da-nang-hoi-an', title: 'Đà Nẵng – Hội An 4N3Đ', destination: 'Đà Nẵng, Việt Nam',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=500&q=80',
    status: 'ongoing', confirmed: true, hasItinerary: true, start: '2030-08-14', end: '2030-08-17', time: '08:00 – 10:00', duration: '4N / 3Đ', guests: 2,
    summary: '2 người · Du lịch khám phá & nghỉ dưỡng',
    description: 'Hành trình kết hợp giữa khám phá thành phố biển năng động và vẻ đẹp yên bình của Hội An. Bao gồm tham quan, ăn uống và thư giãn.',
    places: ['Bà Nà Hills', 'Biển Mỹ Khê', 'Phố cổ Hội An', 'Chợ đêm Hội An'],
    amenities: ['Máy lạnh', 'Dép đi trong nhà', 'Ấm đun nước', 'TV', 'Bể bơi ngoài trời', 'Máy sấy tóc', 'Microwave', 'WiFi', 'Fitness', 'Security Cameras', 'Cổng sạc điện thoại', 'Towels', 'Sofa'],
  },
  {
    id: 'phu-quoc', title: 'Phượt Phú Quốc 3N2Đ', destination: 'Phú Quốc, Việt Nam',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&q=80',
    status: 'ongoing', confirmed: false, hasItinerary: true, start: '2030-09-21', end: '2030-09-23', time: '09:00 – 11:00', duration: '3N / 2Đ', guests: 1,
    summary: '1 người · Khám phá biển đảo',
    description: 'Tận hưởng không gian biển đảo, khám phá những bãi biển và thưởng thức ẩm thực địa phương trong chuyến đi Phú Quốc.',
    places: ['Bãi Sao', 'Dương Đông', 'Chợ đêm Phú Quốc'],
    amenities: ['Máy lạnh', 'TV', 'Bể bơi ngoài trời', 'WiFi', 'Máy sấy tóc', 'Towels'],
  },
];

export function getAllTrips() {
  try {
    const custom = JSON.parse(localStorage.getItem('wayvee_custom_trips') || '[]');
    return [...custom, ...trips];
  } catch {
    return trips;
  }
}

export const shortDate = value => new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
