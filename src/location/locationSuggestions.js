import { destinations } from '../search/searchData.js';

const cities = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Đà Lạt', 'Hội An'];
export const cityOf = place => cities.find(city => place.address.includes(city)) || '';
export function suggestionsFor(place) {
  const city = cityOf(place);
  const others = destinations.filter(item => item.id !== place.id);
  return {
    featured: others.filter(item => city && cityOf(item) === city).sort((a, b) => b.rating - a.rating).slice(0, 12),
    similar: others.filter(item => item.type === place.type).sort((a, b) => Number(cityOf(b) === city) - Number(cityOf(a) === city) || b.rating - a.rating),
    city,
  };
}
