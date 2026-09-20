// Demo reviews for the mockup. These are not real guest reviews or property replies.
export const reviewStatuses = {
  posted: { label: 'Review posted', className: 'posted' },
  rejected: { label: 'Review rejected', className: 'rejected' },
  pending: { label: 'Review Pending', className: 'pending' },
};
const image = id => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=400&q=80`;
export const sampleReviews = [
  { id: 'golden-tulip', hotel: 'Via Golden Tulip Hotel', image: image('photo-1566073771259-6a8506099945'), date: '2024-10-24', status: 'posted', score: 3, positive: 'The receptionist was a good guy.', negative: "It doesn't have any daily cleaning or towel changing. It doesn't have any liquid soap; it was empty. The kitchen didn't have any dishwashing liquid.", helpful: 2, response: 'Hi Anna, we are very sorry for this feedback. Our property is a short let house, not a hotel. Therefore, daily cleaning and towel changes are not foreseen in this type of short let. Probably, if you had kept this distinction in mind, you would not have judged our experience so harshly, and please forgive us for any misunderstanding. In any case, advice from our guests is always welcome. We thank you for choosing us!' },
  { id: 'forest-whisper', hotel: 'Via Forest Whisper Cabin', image: image('photo-1449158743715-0a90ebb6d2d8'), date: '2023-07-24', status: 'rejected', score: 3, positive: 'Nothing was good. It was my worst experience.', negative: "It doesn't have any daily cleaning or towel changing. It doesn't have any liquid soap; it was empty. The kitchen didn't have any dishwashing liquid.", helpful: 0, response: '' },
  { id: 'golden-tulip-pool', hotel: 'Via Golden Tulip Hotel', image: image('photo-1571896349842-33c89424de2d'), date: '2023-07-24', status: 'pending', score: 7, positive: 'Nothing was good. It was my worst experience.', negative: '', helpful: 77, response: '' },
];
export const reviewsKey = email => `wayvee-reviews:${email}`;
export function readReviews(email) {
  const raw = localStorage.getItem(reviewsKey(email));
  if (raw === null) return structuredClone(sampleReviews);
  const data = JSON.parse(raw);
  if (!Array.isArray(data) || data.some(item => !item || typeof item.id !== 'string' || typeof item.hotel !== 'string' || typeof item.positive !== 'string' || typeof item.negative !== 'string' || typeof item.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(item.date) || Number.isNaN(Date.parse(item.date)) || !Object.hasOwn(reviewStatuses, item.status) || !Number.isFinite(item.score) || item.score < 1 || item.score > 10)) throw new Error('Không thể đọc bài đánh giá.');
  return data;
}
export const scoreLabel = score => score >= 9 ? 'Wonderful' : score >= 8 ? 'Very good' : score >= 7 ? 'Good' : score >= 5 ? 'Fair' : 'Poor';
