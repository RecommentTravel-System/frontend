import { destinations } from '../search/searchData.js';

export const toursKey = email => `wayvee-tours:${email}`;
export const draftKey = email => `wayvee-tour-draft:${email}`;
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
export function newDraft() {
  const end = new Date(); end.setDate(end.getDate() + 3);
  return { id: crypto.randomUUID(), title: 'Chuyến đi của tôi', start: localDate(), end: localDate(end), destination: '', companions: 'Bạn bè', guests: '2', style: 'Khám phá', placeIds: [], step: 1 };
}
export function validateTour(draft, requirePlaces = false) {
  if (!draft.title?.trim() || draft.title.length > 100) return 'Nhập tên chuyến đi (tối đa 100 ký tự).';
  if (!validDate(draft.start) || !validDate(draft.end)) return 'Vui lòng chọn ngày đi và ngày về hợp lệ.';
  if (draft.end < draft.start) return 'Ngày về phải bằng hoặc sau ngày đi.';
  if (draft.start < localDate()) return 'Ngày đi không được nằm trong quá khứ.';
  if (!draft.destination?.trim() || draft.destination.length > 150) return 'Nhập địa điểm bạn muốn đến (tối đa 150 ký tự).';
  if (!Number.isInteger(Number(draft.guests)) || Number(draft.guests) < 1 || Number(draft.guests) > 100) return 'Số người phải là số nguyên từ 1 đến 100.';
  if (!['Một mình', 'Bạn bè', 'Gia đình', 'Cặp đôi', 'Đồng nghiệp'].includes(draft.companions)) return 'Vui lòng chọn người đồng hành.';
  if (!['Khám phá', 'Nghỉ dưỡng', 'Ẩm thực', 'Văn hóa', 'Phiêu lưu'].includes(draft.style)) return 'Vui lòng chọn phong cách chuyến đi.';
  if (requirePlaces && (!Array.isArray(draft.placeIds) || !draft.placeIds.length || draft.placeIds.some(id => !destinations.some(place => place.id === id)))) return 'Chọn ít nhất một địa điểm trong danh sách.';
  return '';
}
export function readTours(email) {
  const raw = localStorage.getItem(toursKey(email));
  if (!raw) return [];
  const data = JSON.parse(raw);
  if (!Array.isArray(data) || data.some(trip => !trip || typeof trip.id !== 'string' || typeof trip.title !== 'string' || typeof trip.destination !== 'string' || !validDate(trip.start) || !validDate(trip.end) || !Array.isArray(trip.places) || !Array.isArray(trip.amenities))) throw new Error('Không đọc được lịch trình đã lưu.');
  return data;
}
export function readDraft(email) {
  const raw = sessionStorage.getItem(draftKey(email));
  if (!raw) return newDraft();
  const value = JSON.parse(raw);
  if (!value || typeof value !== 'object') return newDraft();
  const draft = newDraft();
  for (const key of ['id', 'title', 'start', 'end', 'destination', 'companions', 'guests', 'style']) if (typeof value[key] === 'string') draft[key] = value[key];
  draft.placeIds = Array.isArray(value.placeIds) ? [...new Set(value.placeIds.filter(id => destinations.some(place => place.id === id)))] : [];
  draft.step = [1, 2, 3].includes(value.step) ? value.step : 1;
  if (validateTour(draft)) draft.step = 1;
  else if (validateTour(draft, true)) draft.step = Math.min(2, draft.step);
  return draft;
}
export function saveTour(email, draft) {
  if (!email) throw new Error('Vui lòng đăng nhập để tạo lịch trình.');
  const error = validateTour(draft, true);
  if (error) throw new Error(error);
  const current = readTours(email);
  const existing = current.find(trip => trip.id === draft.id);
  if (existing) return existing;
  const selected = [...new Set(draft.placeIds)].map(id => destinations.find(place => place.id === id));
  const nights = Math.round((Date.parse(`${draft.end}T00:00:00Z`) - Date.parse(`${draft.start}T00:00:00Z`)) / 86400000);
  const trip = {
    id: draft.id, title: draft.title.trim(), destination: draft.destination.trim(),
    start: draft.start, end: draft.end, guests: Number(draft.guests), companions: draft.companions, style: draft.style,
    image: selected[0].image, status: 'ongoing', confirmed: true, time: 'Chưa đặt giờ', duration: `${nights + 1}N / ${nights}Đ`,
    summary: `${draft.guests} người · ${draft.style} · ${draft.companions}`,
    description: `Hành trình tự tạo với ${selected.length} địa điểm. Thứ tự ghé thăm theo danh sách đã chọn.`,
    places: selected.map(place => place.name), placeIds: selected.map(place => place.id), amenities: [...new Set(selected.flatMap(place => place.amenities))], createdAt: new Date().toISOString(), source: 'created',
  };
  localStorage.setItem(toursKey(email), JSON.stringify([trip, ...current]));
  return trip;
}
