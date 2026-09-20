// Sample content for the itinerary UI; replace with the signed-in user's trips API.
export const filters = [
  { id: 'all', label: 'Tất cả', title: 'Tất cả lịch trình' },
  { id: 'ongoing', label: 'Đang diễn ra', title: 'Lịch trình đang diễn ra' },
  { id: 'completed', label: 'Đã hoàn thành', title: 'Lịch trình đã hoàn thành' },
  { id: 'cancelled', label: 'Đã hủy', title: 'Lịch trình đã hủy' },
];

export const trips = [
  {
    id: 'da-nang-hoi-an', title: 'Đà Nẵng – Hội An 4N3Đ', destination: 'Đà Nẵng, Việt Nam',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=500&q=80',
    status: 'ongoing', confirmed: true, start: '2030-08-14', end: '2030-08-17', time: '08:00 – 10:00', duration: '4N / 3Đ', guests: 2,
    summary: '2 người · Du lịch khám phá & nghỉ dưỡng',
    description: 'Hành trình kết hợp giữa khám phá thành phố biển năng động và vẻ đẹp yên bình của Hội An. Bao gồm tham quan, ăn uống và thư giãn.',
    places: ['Bà Nà Hills', 'Biển Mỹ Khê', 'Phố cổ Hội An', 'Chợ đêm Hội An'],
    amenities: ['Máy lạnh', 'Dép đi trong nhà', 'Ấm đun nước', 'TV', 'Bể bơi ngoài trời', 'Máy sấy tóc', 'Microwave', 'WiFi', 'Fitness', 'Security Cameras', 'Cổng sạc điện thoại', 'Towels', 'Sofa'],
  },
  {
    id: 'phu-quoc', title: 'Phượt Phú Quốc 3N2Đ', destination: 'Phú Quốc, Việt Nam',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&q=80',
    status: 'ongoing', confirmed: false, start: '2030-09-21', end: '2030-09-23', time: '09:00 – 11:00', duration: '3N / 2Đ', guests: 1,
    summary: '1 người · Khám phá biển đảo',
    description: 'Tận hưởng không gian biển đảo, khám phá những bãi biển và thưởng thức ẩm thực địa phương trong chuyến đi Phú Quốc.',
    places: ['Bãi Sao', 'Dương Đông', 'Chợ đêm Phú Quốc'],
    amenities: ['Máy lạnh', 'TV', 'Bể bơi ngoài trời', 'WiFi', 'Máy sấy tóc', 'Towels'],
  },
];

export const shortDate = value => new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
