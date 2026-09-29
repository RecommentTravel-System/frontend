export const feedbackKey = email => `wayvee-feedback:${email || 'guest'}`;
export function validateFeedback(values) {
  if (!Number.isInteger(values.rating) || values.rating < 1 || values.rating > 5) throw new Error('Vui lòng chọn mức đánh giá từ 1 đến 5.');
  const comment = values.comment.trim();
  const email = values.email.trim();
  if (comment.length > 3000) throw new Error('Nội dung phản hồi tối đa 3.000 ký tự.');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Vui lòng nhập email hợp lệ.');
  return { rating: values.rating, comment, email };
}
// Replace this adapter with the feedback API once a backend is available.
// Saving here does not send email or contact the support team.
export async function submitFeedback(ownerEmail, values) {
  const data = validateFeedback(values);
  const key = feedbackKey(ownerEmail);
  let previous;
  try { previous = JSON.parse(localStorage.getItem(key) || '[]'); } catch { throw new Error('Không đọc được phản hồi đã lưu. Vui lòng kiểm tra dữ liệu trình duyệt.'); }
  if (!Array.isArray(previous)) throw new Error('Dữ liệu phản hồi đã lưu không hợp lệ.');
  const record = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString(), delivery: 'local-only' };
  try { localStorage.setItem(key, JSON.stringify([...previous, record])); }
  catch { throw new Error('Không lưu được phản hồi. Vui lòng kiểm tra quyền hoặc dung lượng lưu trữ.'); }
  return record;
}
