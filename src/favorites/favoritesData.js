import { destinations } from '../search/searchData.js';
// Illustrative places for the UI, not a live destination catalog.
const photo = id => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=80`;
export const places = [
  ...destinations.map(place => ({ ...place, rating: place.rating.toFixed(1), note: 'Địa điểm khám phá' })),
  { id: 'pho', name: 'Phở Thìn Bờ Hồ', address: '13 Lò Đúc, Hai Bà Trưng, Hà Nội', rating: '4.7', note: 'Cách hồ Hoàn Kiếm…', image: photo('photo-1571896349842-33c89424de2d') },
  { id: 'banh-mi', name: 'Bánh mì Huỳnh Hoa', address: '26 Lê Thị Riêng, Quận 1, TP.HCM', rating: '4.8', note: 'Ẩm thực địa phương', image: photo('photo-1566073771259-6a8506099945') },
  { id: 'bun-bo', name: 'Bún bò Mỹ Kéo', address: '20 Bạch Đằng, TP. Huế, Thừa Thiên Huế', rating: '4.6', note: 'Ngay trung tâm, vị đậm đà', image: photo('photo-1571896349842-33c89424de2d') },
  { id: 'cafe', name: 'Góc cà phê', address: 'Hà Nội', rating: '4.8', note: 'Không gian thư giãn', image: photo('photo-1501339847302-ac426a4a7cbb') },
  { id: 'restaurant', name: 'Bữa tối bên sông', address: 'Đà Nẵng', rating: '4.7', note: 'Ẩm thực và cảnh đẹp', image: photo('photo-1517248135467-4c7edcad34c4') },
  { id: 'brunch', name: 'Brunch cuối tuần', address: 'Hồ Chí Minh', rating: '4.9', note: 'Hẹn hò cùng bạn bè', image: photo('photo-1414235077428-338989a2e8c0') },
  { id: 'rooftop', name: 'Sân mây Hà Nội', address: 'Hà Nội', rating: '4.8', note: 'Ngắm thành phố từ trên cao', image: photo('photo-1517248135467-4c7edcad34c4') },
  { id: 'mountains', name: 'Săn mây miền Bắc', address: 'Sa Pa, Lào Cai', rating: '4.9', note: 'Bình minh trên núi', image: photo('photo-1528127269322-539801943592') },
  { id: 'saigon', name: 'City vibes Sài Gòn', address: 'Quận 1, Hồ Chí Minh', rating: '4.8', note: 'Khám phá nhịp sống thành phố', image: photo('photo-1519501025264-65ba15a82390') },
];
export const initialCollections = [
  { id: 'an-uong', name: 'Ăn uống', placeIds: ['pho', 'banh-mi', 'bun-bo', 'cafe', 'restaurant', 'brunch'] },
  { id: 'san-may', name: 'Săn mây miền Bắc', placeIds: ['rooftop', 'mountains'] },
  { id: 'city-vibes', name: 'City vibes Sài Gòn', placeIds: ['saigon'] },
];
export const favoritesKey = email => `wayvee-favorites:${email}`;
export function readFavorites(email) {
  const raw = localStorage.getItem(favoritesKey(email));
  if (raw === null) return structuredClone(initialCollections);
  const data = JSON.parse(raw);
  if (!Array.isArray(data) || data.some(item => typeof item?.id !== 'string' || typeof item.name !== 'string' || !Array.isArray(item.placeIds))) throw new Error('Không đọc được bộ sưu tập đã lưu.');
  return data.map(item => ({ ...item, placeIds: [...new Set(item.placeIds.filter(id => places.some(place => place.id === id)))] }));
}
