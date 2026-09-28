export const STORAGE_KEY = 'wayvee.trips.v1';

export function accountStorage(email, storage = localStorage) {
  if (!email) throw new Error('Vui lòng đăng nhập để lưu lịch trình.');
  const accountKey = `${STORAGE_KEY}:${email.trim().toLowerCase()}`;
  return {
    getItem: () => storage.getItem(accountKey),
    setItem: (_key, value) => storage.setItem(accountKey, value),
  };
}

export function tripDates(start, end) {
  const first = Date.parse(`${start}T00:00:00Z`);
  const last = Date.parse(`${end}T00:00:00Z`);
  const count = (last - first) / 86400000 + 1;
  if (!Number.isInteger(count) || count < 1 || count > 60) return [];
  return Array.from({ length: count }, (_, i) => new Date(first + i * 86400000).toISOString().slice(0, 10));
}

export function validateTrip(trip) {
  if (!trip.title.trim() || !trip.destination.trim()) return 'Vui lòng nhập tên chuyến đi và điểm đến.';
  const dates = tripDates(trip.startDate, trip.endDate);
  if (!dates.length) return 'Ngày về phải từ ngày đi trở đi. Mỗi lịch trình tối đa 60 ngày.';
  if (!Number.isInteger(Number(trip.travelers)) || Number(trip.travelers) < 1) return 'Số người phải là số nguyên lớn hơn 0.';
  if (trip.budget !== '' && (!Number.isFinite(Number(trip.budget)) || Number(trip.budget) < 0)) return 'Ngân sách phải lớn hơn hoặc bằng 0.';
  if (trip.days.length !== dates.length || trip.days.some((day, i) => day.date !== dates[i])) return 'Vui lòng tạo lại các ngày trong lịch trình.';
  if (trip.days.some(day => !day.activities.length || day.activities.some(activity => !activity.title.trim()))) return 'Mỗi ngày cần ít nhất một hoạt động có tên.';
  return '';
}

export function readTrips(storage = localStorage) {
  const raw = storage.getItem(STORAGE_KEY);
  if (raw === null) return [];
  const trips = JSON.parse(raw);
  if (!Array.isArray(trips) || trips.some(trip => {
    try { return typeof trip.id !== 'string' || typeof trip.notes !== 'string' || typeof trip.style !== 'string' || !Array.isArray(trip.days) || Boolean(validateTrip(trip)) || trip.days.some(day => day.activities.some(a => typeof a.time !== 'string' || typeof a.location !== 'string' || typeof a.notes !== 'string')); }
    catch { return true; }
  })) throw new Error('Invalid trip data');
  return trips;
}

export function saveTrip(trip, storage = localStorage) {
  const error = validateTrip(trip);
  if (error) throw new Error(error);
  // Read before writing so an unreadable collection is never silently overwritten.
  const trips = readTrips(storage);
  const saved = { ...trip, updatedAt: new Date().toISOString() };
  storage.setItem(STORAGE_KEY, JSON.stringify([saved, ...trips.filter(item => item.id !== saved.id)]));
  return saved;
}

export const formatDate = date => date.split('-').reverse().join('/');
