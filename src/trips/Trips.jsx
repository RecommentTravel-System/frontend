import { useState } from 'react';
import { formatDate, readTrips, saveTrip, tripDates, validateTrip } from './tripStore.js';
import './Trips.css';

const newActivity = () => ({ id: crypto.randomUUID(), time: '09:00', title: '', location: '', notes: '' });
const newTrip = initial => ({ id: crypto.randomUUID(), title: '', destination: '', startDate: '', endDate: '', style: '', travelers: 1, budget: '', notes: '', days: [], ...initial });

function Field({ label, children }) {
  return <label className="manual-trip-field"><span>{label}</span>{children}</label>;
}

function Shell({ title, onHome, children }) {
  return <div className="manual-trips-page"><header className="manual-trips-header"><button onClick={onHome}>← Trang chủ</button><strong>WAYVEE</strong></header><main className="manual-trips-main"><h1>{title}</h1>{children}</main></div>;
}

export function TripPlanner({ initial, onHome, onSaved, storage }) {
  const [trip, setTrip] = useState(() => newTrip(initial));
  const [error, setError] = useState('');
  const [discarding, setDiscarding] = useState(false);
  const update = (key, value) => { setTrip(prev => ({ ...prev, [key]: value })); setError(''); };
  const dates = tripDates(trip.startDate, trip.endDate);
  const daysMatch = dates.length > 0 && dates.length === trip.days.length && dates.every((date, i) => date === trip.days[i].date);
  const generateDays = () => {
    if (!dates.length) { setError('Vui lòng chọn ngày đi và ngày về hợp lệ (tối đa 60 ngày).'); return; }
    if (trip.days.some(day => !dates.includes(day.date) && day.activities.some(a => a.title.trim() || a.location.trim() || a.notes.trim()))) {
      setDiscarding(true); return;
    }
    rebuildDays();
  };
  const rebuildDays = () => {
    update('days', dates.map(date => trip.days.find(day => day.date === date) || { date, activities: [newActivity()] }));
    setDiscarding(false);
  };
  const changeDay = (date, activities) => update('days', trip.days.map(day => day.date === date ? { ...day, activities } : day));
  const submit = event => {
    event.preventDefault();
    const validation = validateTrip(trip);
    if (validation) { setError(validation); return; }
    try { onSaved(saveTrip(trip, storage)); }
    catch { setError('Không thể lưu lịch trình. Bộ nhớ trình duyệt có thể bị chặn, đã đầy hoặc dữ liệu cũ không đọc được. Nội dung bạn nhập vẫn được giữ để thử lưu lại.'); }
  };

  return <Shell title={initial?.days?.length ? 'Chỉnh sửa lịch trình' : 'Tạo lịch trình của bạn'} onHome={onHome}>
    <p className="manual-trip-muted">Lên kế hoạch từng ngày, lưu lại và mở từ Profile bất cứ lúc nào trên trình duyệt này.</p>
    <form onSubmit={submit}>
      <section className="manual-trip-panel">
        <h2>Thông tin chuyến đi</h2>
        <div className="manual-trip-grid">
          <Field label="Tên chuyến đi"><input required maxLength={150} value={trip.title} onChange={e => update('title', e.target.value)} placeholder="Cuối tuần ở Đà Lạt" /></Field>
          <Field label="Điểm đến"><input required maxLength={150} value={trip.destination} onChange={e => update('destination', e.target.value)} placeholder="Đà Lạt" /></Field>
          <Field label="Ngày đi"><input required type="date" value={trip.startDate} onChange={e => update('startDate', e.target.value)} /></Field>
          <Field label="Ngày về"><input required type="date" min={trip.startDate} value={trip.endDate} onChange={e => update('endDate', e.target.value)} /></Field>
          <Field label="Phong cách chuyến đi"><input maxLength={150} value={trip.style} onChange={e => update('style', e.target.value)} placeholder="Nghỉ dưỡng, khám phá, ẩm thực…" /></Field>
          <Field label="Số người"><input required type="number" min="1" step="1" value={trip.travelers} onChange={e => update('travelers', e.target.value)} /></Field>
          <Field label="Tổng ngân sách dự kiến (VNĐ)"><input type="number" min="0" step="1" value={trip.budget} onChange={e => update('budget', e.target.value)} placeholder="Không bắt buộc" /></Field>
          <Field label="Ghi chú chuyến đi"><textarea maxLength={5000} value={trip.notes} onChange={e => update('notes', e.target.value)} placeholder="Chỗ ở, phương tiện, những điều cần nhớ…" /></Field>
        </div>
        <button type="button" className="manual-trip-secondary" onClick={generateDays}>{trip.days.length ? 'Cập nhật các ngày' : 'Tạo các ngày trong lịch trình'}</button>
        {!daysMatch && trip.days.length > 0 && <p role="status">Ngày đi hoặc ngày về đã thay đổi. Hãy cập nhật các ngày trước khi lưu.</p>}
        {discarding && <div className="manual-trip-notice" role="alert"><p>Thay đổi này sẽ bỏ các hoạt động nằm ngoài khoảng ngày mới.</p><button type="button" onClick={rebuildDays}>Đồng ý cập nhật</button><button type="button" onClick={() => setDiscarding(false)}>Giữ lại</button></div>}
      </section>
      {trip.days.map((day, index) => <section className="manual-trip-panel" key={day.date}>
        <h2>Ngày {index + 1} · {formatDate(day.date)}</h2>
        {day.activities.map((activity, i) => <fieldset className="manual-trip-activity" key={activity.id}>
          <legend>Hoạt động {i + 1}</legend>
          <div className="manual-trip-grid">
            {[[ 'time', 'Thời gian', 'time' ], [ 'title', 'Hoạt động', 'text' ], [ 'location', 'Địa điểm / địa chỉ', 'text' ]].map(([key, label, type]) => <Field key={key} label={label}><input type={type} required={key === 'title'} maxLength={300} value={activity[key]} onChange={e => changeDay(day.date, day.activities.map(a => a.id === activity.id ? { ...a, [key]: e.target.value } : a))} /></Field>)}
            <Field label="Chi tiết / ghi chú"><textarea maxLength={5000} value={activity.notes} onChange={e => changeDay(day.date, day.activities.map(a => a.id === activity.id ? { ...a, notes: e.target.value } : a))} /></Field>
          </div>
          <button type="button" className="manual-trip-text-button" disabled={day.activities.length === 1} onClick={() => changeDay(day.date, day.activities.filter(a => a.id !== activity.id))}>Bỏ hoạt động</button>
        </fieldset>)}
        <button type="button" className="manual-trip-secondary" onClick={() => changeDay(day.date, [...day.activities, newActivity()])}>+ Thêm hoạt động</button>
      </section>)}
      {error && <p className="manual-trip-error" role="alert">{error}</p>}
      <div className="manual-trip-actions"><button className="manual-trip-primary" type="submit">Lưu lịch trình</button><span className="manual-trip-muted">Lịch trình chỉ được lưu khi bạn bấm nút Lưu.</span></div>
    </form>
  </Shell>;
}

export function Profile({ onHome, onCreate, onOpen, saved, storage }) {
  const [result] = useState(() => {
    try { return { trips: readTrips(storage), error: '' }; }
    catch { return { trips: [], error: 'Không thể đọc lịch trình đã lưu. Hãy kiểm tra quyền lưu trữ của trình duyệt và tải lại trang.' }; }
  });
  return <Shell title="Lịch trình đã lưu của bạn" onHome={onHome}>
    <p className="manual-trip-muted">Lịch trình của tài khoản hiện tại trên trình duyệt này · Chưa đồng bộ giữa các thiết bị.</p>
    {saved && <p className="manual-trip-success" role="status">Đã lưu lịch trình thành công. Bạn có thể xem lại chi tiết bên dưới.</p>}
    <div className="manual-trip-section-heading"><h2>Lịch trình đã lưu ({result.trips.length})</h2><button className="manual-trip-primary" onClick={onCreate}>+ Tạo lịch trình</button></div>
    {result.error ? <p className="manual-trip-error" role="alert">{result.error}</p> : result.trips.length === 0 ? <section className="manual-trip-panel manual-trip-empty"><h2>Bắt đầu chuyến đi đầu tiên</h2><p>Bạn chưa lưu lịch trình nào. Tạo chuyến đi và lưu những kế hoạch của mình tại đây.</p><button className="manual-trip-primary" onClick={onCreate}>Tạo lịch trình ngay</button></section> : <div className="manual-trip-grid">{result.trips.map(trip => <article key={trip.id} className="manual-trip-panel"><span className="manual-trip-tag">{trip.destination}</span><h2>{trip.title}</h2><p>{formatDate(trip.startDate)} – {formatDate(trip.endDate)}</p><p className="manual-trip-muted">{trip.days.length} ngày · {trip.travelers} người</p><button className="manual-trip-secondary" onClick={() => onOpen(trip)}>Xem chi tiết</button></article>)}</div>}
  </Shell>;
}

export function TripDetails({ trip, onHome, onProfile, onEdit }) {
  return <Shell title={trip.title} onHome={onHome}>
    <div className="manual-trip-actions"><button className="manual-trip-secondary" onClick={onProfile}>← Profile</button><button className="manual-trip-primary" onClick={() => onEdit(trip)}>Chỉnh sửa lịch trình</button></div>
    <section className="manual-trip-panel"><h2>{trip.destination}</h2><p>{formatDate(trip.startDate)} – {formatDate(trip.endDate)} · {trip.travelers} người</p><p>Phong cách: {trip.style || 'Chưa chọn'}</p><p>Ngân sách: {trip.budget === '' ? 'Chưa đặt' : `${Number(trip.budget).toLocaleString('vi-VN')} VNĐ`}</p>{trip.notes && <p className="manual-trip-preline">{trip.notes}</p>}</section>
    {trip.days.map((day, i) => <section className="manual-trip-panel" key={day.date}><h2>Ngày {i + 1} · {formatDate(day.date)}</h2>{day.activities.map(activity => <article className="manual-trip-timeline" key={activity.id}><span className="manual-trip-tag">{activity.time || 'Chưa đặt giờ'}</span><h3>{activity.title}</h3>{activity.location && <p>Địa điểm: {activity.location}</p>}{activity.notes && <p className="manual-trip-preline manual-trip-muted">{activity.notes}</p>}</article>)}</section>)}
  </Shell>;
}
