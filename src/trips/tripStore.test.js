import test from 'node:test';
import assert from 'node:assert/strict';
import { accountStorage, readTrips, saveTrip, STORAGE_KEY, tripDates, validateTrip } from './tripStore.js';

function memoryStorage() {
  const data = new Map();
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
}
const sample = () => ({
  id: 'trip-1', title: 'Đà Lạt cuối tuần', destination: 'Đà Lạt',
  startDate: '2026-10-01', endDate: '2026-10-01', travelers: 2, budget: '2000000', style: 'Khám phá', notes: 'Mang áo ấm',
  days: [{ date: '2026-10-01', activities: [{ id: 'a1', time: '09:00', title: 'Ăn sáng', location: 'Trung tâm', notes: 'Quán yêu thích' }] }],
});

test('saved trips are isolated by signed-in account', () => {
  const storage = memoryStorage();
  saveTrip(sample(), accountStorage('first@example.com', storage));
  assert.equal(readTrips(accountStorage('first@example.com', storage)).length, 1);
  assert.deepEqual(readTrips(accountStorage('second@example.com', storage)), []);
  assert.throws(() => accountStorage('', storage));
});

test('saved details survive rereading, edits replace the same trip and retain other trips', () => {
  const storage = memoryStorage();
  const first = saveTrip(sample(), storage);
  assert.deepEqual(readTrips(storage), [first]);
  saveTrip({ ...sample(), id: 'trip-2' }, storage);
  const edited = sample();
  edited.days[0].activities[0].notes = 'Đổi giờ nếu trời mưa';
  saveTrip(edited, storage);
  assert.equal(readTrips(storage).length, 2);
  assert.equal(readTrips(storage)[0].days[0].activities[0].notes, 'Đổi giờ nếu trời mưa');
});

test('date range includes both endpoints across months and rejects inverted or excessive ranges', () => {
  assert.deepEqual(tripDates('2026-09-30', '2026-10-02'), ['2026-09-30', '2026-10-01', '2026-10-02']);
  assert.deepEqual(tripDates('2026-10-02', '2026-10-01'), []);
  assert.deepEqual(tripDates('', ''), []);
  assert.deepEqual(tripDates('2026-01-01', '2026-12-31'), []);
});

test('rejects blank names, invalid totals, empty activities and outdated days before saving', () => {
  for (const changes of [{ title: ' ' }, { destination: ' ' }, { travelers: 0 }, { travelers: 1.5 }, { budget: -1 }, { days: [] }, { endDate: '2026-10-02' }, { days: [{ date: '2026-10-01', activities: [] }] }]) {
    assert.ok(validateTrip({ ...sample(), ...changes }));
    assert.throws(() => saveTrip({ ...sample(), ...changes }, memoryStorage()));
  }
});

test('corrupted storage is not overwritten and failed writes propagate', () => {
  const storage = memoryStorage();
  for (const raw of ['invalid json', '{}', '[{}]']) {
    storage.setItem(STORAGE_KEY, raw);
    assert.throws(() => readTrips(storage));
    assert.throws(() => saveTrip(sample(), storage));
    assert.equal(storage.getItem(STORAGE_KEY), raw);
  }
  assert.throws(() => saveTrip(sample(), { getItem: () => null, setItem: () => { throw new Error('QuotaExceededError'); } }));
});
