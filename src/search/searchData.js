const image = id => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=700&q=80`;
const photos = [image('photo-1571896349842-33c89424de2d'), image('photo-1566073771259-6a8506099945'), image('photo-1517248135467-4c7edcad34c4')];
// Illustrative catalog: all filter attributes and prices are demo data.
export const freeDestinations = [
  ['cong-cafe', 'Cộng Cà Phê Nhà Thờ', '27 Nhà Thờ, Hoàn Kiếm, Hà Nội', 'Café', 65000, .3, 5, 5, 18],
  ['lake-cafe', 'Cà phê bên hồ', 'Tây Hồ, Hà Nội', 'Café', 85000, 2.2, 4.5, 4, 32],
  ['hanoi-hotel', 'Hanoi Garden Hotel', 'Hoàn Kiếm, Hà Nội', 'Hotel', 1200000, .8, 4.8, 5, 45],
  ['saigon-rooftop', 'Sài Gòn Rooftop', 'Quận 1, Hồ Chí Minh', 'Restaurant', 350000, 1.5, 4.2, 4, 28],
  ['danang-resort', 'Đà Nẵng Beach Resort', 'Sơn Trà, Đà Nẵng', 'Resort', 2400000, 4, 4.9, 5, 65],
  ['dalat-home', 'Đà Lạt Pine House', 'Đà Lạt, Lâm Đồng', 'Homestay', 650000, 3.1, 3.8, 3, 36],
  ['old-quarter', 'Old Quarter Stay', 'Hoàn Kiếm, Hà Nội', 'Homestay', 450000, 1.2, 3, 2, 22],
  ['river-kitchen', 'River Kitchen', 'Hội An, Quảng Nam', 'Restaurant', 180000, 6, 4, 0, 50],
].map(([id, name, address, type, price, distance, rating, stars, size], index) => ({
  id, name, address, type, price, distance, rating, stars, size, image: photos[index % photos.length], reviews: 120 + index * 137, recommended: 100 - index,
  bedrooms: index % 3 + 1, beds: index % 4 + 1, bathrooms: index % 2 + 1,
  amenities: index % 2 ? ['Wi-Fi', 'TV', 'Kitchen', 'Washing machine'] : ['Air Conditioning', 'Wi-Fi', 'BBQ Grill', 'Radiant Heating'],
  booking: index % 2 ? ['Free cancellation'] : ['Instant confirmation', 'Free cancellation'],
  payment: index % 2 ? ['Pay at property', 'Credit card'] : ['Credit card'],
  accessibility: index % 2 ? ['Elevator'] : ['Wheelchair access', 'Ground floor'],
}));
// Additional illustrative places are shared with details, favorites and tour creation.
export const premiumDestinations = [
  ['hidden-gem', 'Hidden Gem Coffee', 'Hàng Mắm, Hoàn Kiếm, Hà Nội', 0],
  ['trang-tien', 'Tràng Tiền Coffee', 'Tràng Tiền, Hoàn Kiếm, Hà Nội', 1],
  ['westlake-garden', 'Westlake Garden Stay', 'Tây Hồ, Hà Nội', 2],
  ['hanoi-rooftop', 'Hanoi Sunset Rooftop', 'Hoàn Kiếm, Hà Nội', 3],
  ['danang-garden', 'Đà Nẵng Garden Resort', 'Sơn Trà, Đà Nẵng', 4],
  ['pine-retreat', 'Đà Lạt Pine Retreat', 'Đà Lạt, Lâm Đồng', 5],
  ['heritage-house', 'Hanoi Heritage House', 'Ba Đình, Hà Nội', 6],
  ['hoian-table', 'Hội An Riverside Table', 'Hội An, Quảng Nam', 7],
  ['saigon-coffee', 'Sài Gòn Corner Coffee', 'Quận 1, Hồ Chí Minh', 0],
  ['danang-coffee', 'Đà Nẵng Sea Coffee', 'Ngũ Hành Sơn, Đà Nẵng', 1],
  ['saigon-stay', 'Sài Gòn City Stay', 'Quận 3, Hồ Chí Minh', 2],
  ['dalat-kitchen', 'Đà Lạt Garden Kitchen', 'Đà Lạt, Lâm Đồng', 3],
].map(([id, name, address, base], index) => ({ ...freeDestinations[base], id, name, address, premium: true, price: freeDestinations[base].price + (index + 1) * 5000, distance: (index % 7 + 1) * .6, recommended: 92 - index }));
export const destinations = [...freeDestinations, ...premiumDestinations];
export const searchCatalog = premium => premium ? destinations : freeDestinations;
export const sortOptions = [
  ['recommended', 'Recommended'], ['distance', 'Distance (Near to Far)'], ['reviewed', 'Top Reviewed'],
  ['price-high', 'Highest Price'], ['price-low', 'Lowest Price'], ['stars', 'Star Rating (High to Low)'],
];
export const filterGroups = [
  { key: 'amenities', title: 'Amenities', options: ['Air Conditioning', 'Wi-Fi', 'BBQ Grill', 'Washing machine', 'TV', 'Kitchen', 'Radiant Heating'], chips: true },
  { key: 'booking', title: 'Booking Options', options: ['Free cancellation', 'Instant confirmation'] },
  { key: 'payment', title: 'Payment Options', options: ['Pay at property', 'Credit card'] },
  { key: 'type', title: 'Property Type', options: ['Café', 'Hotel', 'Restaurant', 'Resort', 'Homestay'] },
  { key: 'accessibility', title: 'Accessibility Features', options: ['Wheelchair access', 'Elevator', 'Ground floor'] },
];
const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase();
export const selectedValues = (params, key) => params.getAll(key);
function numeric(params, key, fallback = 0) {
  const value = Number(params.get(key));
  return params.has(key) && Number.isFinite(value) && value >= 0 ? value : fallback;
}
export function filterAndSort(items, params) {
  const query = normalize(params.get('q') || '').trim();
  const sizes = selectedValues(params, 'size');
  const scores = selectedValues(params, 'score').map(Number).filter(value => value >= 1 && value <= 5);
  const stars = selectedValues(params, 'stars').map(Number).filter(value => value >= 0 && value <= 5);
  const result = items.filter(item => {
    if (query && !normalize(`${item.name} ${item.address} ${item.type}`).includes(query)) return false;
    if (item.distance > numeric(params, 'distance', 10) || item.price > numeric(params, 'maxPrice', Infinity)) return false;
    if (['bedrooms', 'beds', 'bathrooms'].some(key => item[key] < numeric(params, key))) return false;
    if (sizes.length && !sizes.some(size => size === 'small' ? item.size <= 25 : size === 'medium' ? item.size > 25 && item.size <= 40 : size === 'large' && item.size > 40)) return false;
    if (scores.length && item.rating < Math.min(...scores)) return false;
    if (stars.length && !stars.includes(item.stars)) return false;
    return filterGroups.every(group => {
      const wanted = selectedValues(params, group.key);
      return !wanted.length || (group.key === 'type' ? wanted.includes(item.type) : wanted.every(value => item[group.key].includes(value)));
    });
  });
  const compare = { recommended: (a, b) => b.recommended - a.recommended, distance: (a, b) => a.distance - b.distance, reviewed: (a, b) => b.rating - a.rating || b.reviews - a.reviews, 'price-high': (a, b) => b.price - a.price, 'price-low': (a, b) => a.price - b.price, stars: (a, b) => b.stars - a.stars };
  return result.sort(compare[params.get('sort')] || compare.recommended);
}
