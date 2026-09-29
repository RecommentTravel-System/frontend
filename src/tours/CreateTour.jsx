import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { useAuth } from '../auth/useAuth.js';
import { destinations, filterAndSort } from '../search/searchData.js';
import { shortDate } from '../itineraries/trips.js';
import { draftKey, localDate, newDraft, readDraft, saveTour, validateTour } from './tourStorage.js';
import './CreateTour.css';

function TourPhoto({ place }) {
  const [failed, setFailed] = useState(false);
  return failed ? <span className="tour-photo-fallback">Ảnh địa điểm</span> : <img src={place.image} alt={place.name} loading="lazy" onError={() => setFailed(true)} />;
}
function PlaceCard({ place, compact = false, onRemove }) {
  return <article className={`tour-place${compact ? ' compact' : ''}`}><Link to={`/locations/${place.id}`} aria-label={`Xem ${place.name}`}><TourPhoto place={place} /></Link><div><h3>{place.name} <span className="tour-stars" aria-label={`${place.stars} sao`}>{'★'.repeat(place.stars)}</span></h3><p>{place.address}</p><p className="tour-rating"><b>{place.rating.toFixed(1)}</b> {place.rating >= 4.5 ? 'Excellent' : 'Guest rating'} <small>{place.reviews} reviews</small></p>{!compact && <><p>{place.type} · {place.size} m² · {place.amenities.slice(0, 2).join(' · ')}</p><div className="tour-tags">{place.booking.map(tag => <span key={tag}>{tag}</span>)}</div></>}</div>{onRemove && <button className="tour-remove" type="button" aria-label={`Bỏ ${place.name}`} onClick={onRemove}>×</button>}</article>;
}
function PlacePicker({ ids, onSave, onClose }) {
  const ref = useRef(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(ids);
  useEffect(() => { if (!ref.current.open) ref.current.showModal(); }, []);
  const matches = filterAndSort(destinations, new URLSearchParams({ q: query }));
  return <dialog className="tour-picker" ref={ref} onClose={onClose} aria-labelledby="tour-picker-title"><header><h2 id="tour-picker-title">Thêm địa điểm</h2><button type="button" aria-label="Đóng" onClick={() => ref.current.close()}>×</button></header><label className="tour-field">Tìm theo tên hoặc thành phố<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Ví dụ: Hà Nội" /></label><p className="tour-note">Danh sách địa điểm minh họa · Đã chọn {selected.length}</p><div className="tour-picker-list">{matches.map(place => <label key={place.id}><input type="checkbox" checked={selected.includes(place.id)} onChange={event => setSelected(event.target.checked ? [...selected, place.id] : selected.filter(id => id !== place.id))} /><TourPhoto place={place} /><span><strong>{place.name}</strong><small>{place.address}</small></span></label>)}{!matches.length && <p role="status">Không có địa điểm phù hợp. Thử tên thành phố khác.</p>}</div><footer><button className="tour-outline" type="button" onClick={() => ref.current.close()}>Hủy</button><button className="tour-primary" type="button" onClick={() => { onSave(selected); ref.current.close(); }}>Lưu lựa chọn ({selected.length})</button></footer></dialog>;
}
function Processing() {
  const ref = useRef(null);
  useEffect(() => { ref.current.showModal(); }, []);
  return <dialog ref={ref} className="tour-processing" aria-label="Đang tạo lịch trình" onCancel={event => event.preventDefault()}><span className="tour-spinner" /><strong>Processing</strong><p role="status">Kiểm tra và lưu thông tin…</p></dialog>;
}

export default function CreateTour() {
  const { user } = useAuth();
  return <TourWizard key={user.email} user={user} />;
}
function TourWizard({ user }) {
  const location = useLocation();
  const [initial] = useState(() => {
    try {
      const stored = sessionStorage.getItem(draftKey(user.email));
      const draft = readDraft(user.email);
      const seed = location.state?.tourSeed;
      if (!stored && seed) {
        for (const key of ['destination', 'start', 'end']) if (typeof seed[key] === 'string' && seed[key]) draft[key] = seed[key];
        if (['Khám phá', 'Nghỉ dưỡng', 'Ẩm thực', 'Văn hóa', 'Phiêu lưu'].includes(seed.style)) draft.style = seed.style;
      }
      return { draft, error: '' };
    } catch { return { draft: newDraft(), error: 'Không đọc được bản nháp. Bạn có thể nhập lại thông tin.' }; }
  });
  const [draft, setDraft] = useState(initial.draft);
  const [error, setError] = useState(initial.error);
  const [storageNote, setStorageNote] = useState('');
  const [editing, setEditing] = useState('');
  const [picker, setPicker] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [created, setCreated] = useState(null);
  const [shareText, setShareText] = useState('');
  const [notice, setNotice] = useState('');
  const heading = useRef(null);
  const busy = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); }, [draft.step, created]);
  const selected = draft.placeIds.map(id => destinations.find(place => place.id === id)).filter(Boolean);
  function update(key, value) {
    const nextDraft = { ...draft, [key]: value };
    setDraft(nextDraft); setError('');
    try { sessionStorage.setItem(draftKey(user.email), JSON.stringify(nextDraft)); setStorageNote(''); }
    catch { setStorageNote('Trình duyệt không lưu được bản nháp. Đừng tải lại trang trước khi xác nhận.'); }
  }
  function next(event) {
    event.preventDefault();
    const failure = validateTour(draft, draft.step === 2);
    if (failure) { setError(failure); return; }
    setEditing(''); update('step', draft.step + 1);
  }
  async function confirm() {
    if (busy.current) return;
    const failure = validateTour(draft, true);
    if (failure) { setError(failure); return; }
    busy.current = true; setProcessing(true); setError('');
    // Give the browser a frame to render the modal before local persistence.
    await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
    if (!mounted.current) { busy.current = false; return; }
    try {
      const trip = saveTour(user.email, draft);
      try { sessionStorage.removeItem(draftKey(user.email)); } catch { /* Saved tour remains available. */ }
      setCreated(trip);
    } catch (failure) { setError(failure.message || 'Không thể tạo lịch trình. Vui lòng thử lại.'); }
    finally { busy.current = false; setProcessing(false); }
  }
  async function share() {
    const text = `${created.title}\n${created.destination}\n${shortDate(created.start)} – ${shortDate(created.end)} · ${created.guests} người\n${created.places.map((name, index) => `${index + 1}. ${name}`).join('\n')}`;
    try {
      if (navigator.share) await navigator.share({ title: created.title, text });
      else { await navigator.clipboard.writeText(text); setNotice('Đã sao chép lịch trình để chia sẻ.'); }
    } catch (failure) { if (failure.name !== 'AbortError') { setShareText(text); setNotice('Bạn có thể sao chép lịch trình bên dưới.'); } }
  }
  const textField = (label, key, props = {}) => <label className="tour-field">{label}<input value={draft[key]} onChange={event => update(key, event.target.value)} {...props} /></label>;
  function summary() {
    return <section className="tour-summary"><h2>Thông tin lịch trình</h2><h3>Your trip</h3><div className="tour-summary-row"><div><small>Tên</small><p>{draft.title}</p></div><button type="button" onClick={() => { if (draft.step === 3) update('step', 1); setEditing(editing === 'title' ? '' : 'title'); }}>Edit<span className="tour-sr"> tên chuyến đi</span></button></div>{editing === 'title' && textField('Tên chuyến đi', 'title', { maxLength: 100, required: true })}<div className="tour-summary-row"><div><small>Dates</small><p>{draft.start && draft.end ? `${draft.start} → ${draft.end}` : 'Chọn ngày đi và ngày về'}</p></div><button type="button" onClick={() => { if (draft.step === 3) update('step', 1); setEditing(editing === 'dates' ? '' : 'dates'); }}>Edit<span className="tour-sr"> ngày đi và ngày về</span></button></div>{editing === 'dates' && <div className="tour-field-pair">{textField('Ngày đi', 'start', { type: 'date', min: localDate(), required: true })}{textField('Ngày về', 'end', { type: 'date', min: draft.start || localDate(), required: true })}</div>}</section>;
  }
  return <div className="tour-page"><SiteHeader />{created ? <main className="tour-success"><span className="tour-success-mark" aria-hidden="true">✓</span><h1 ref={heading} tabIndex={-1}>Lịch trình của bạn đã được tạo! Sẵn sàng cho chuyến đi của mình nào!</h1><p>{created.title} · {created.places.length} địa điểm</p><div className="tour-success-actions"><button className="tour-primary" onClick={share}>Share</button><Link className="tour-outline" to={`/itineraries/${created.id}?status=all`}>Xem lịch trình</Link><Link className="tour-outline" to="/itineraries?status=all">Quay lại</Link></div><p role="status">{notice}</p>{shareText && <textarea aria-label="Nội dung chia sẻ lịch trình" readOnly value={shareText} onFocus={event => event.target.select()} rows={7} />}<div className="tour-help"><p>Need help?</p><Link to="/support">Contact Customer Service</Link></div></main> : <main className="tour-wizard">
    <ol className="tour-steps" aria-label="Tiến trình tạo tour">{['Nhập thông tin', 'Tạo lịch trình', 'Hoàn tất'].map((label, index) => <li key={label} className={draft.step === index + 1 ? 'active' : draft.step > index + 1 ? 'complete' : ''} aria-current={draft.step === index + 1 ? 'step' : undefined}><span>{index + 1}</span><small>{label}</small></li>)}</ol>
    <h1 className="tour-sr" ref={heading} tabIndex={-1}>Tạo tour — Bước {draft.step} / 3</h1>
    <form onSubmit={next} noValidate><div className={`tour-workspace${draft.step === 2 ? ' has-places' : ''}`}><div>{summary()}{draft.step < 3 ? <section className="tour-information"><h2>Thông tin địa điểm</h2>{textField('Đi đâu?', 'destination', { placeholder: 'Nhập địa điểm…', maxLength: 150, required: true })}<div className="tour-field-pair"><label className="tour-field">Đi cùng ai?<select value={draft.companions} onChange={event => update('companions', event.target.value)}>{['Một mình', 'Bạn bè', 'Gia đình', 'Cặp đôi', 'Đồng nghiệp'].map(value => <option key={value}>{value}</option>)}</select></label>{textField('Số lượng', 'guests', { type: 'number', min: 1, max: 100, step: 1, required: true })}</div><label className="tour-field">Phong cách chuyến đi?<select value={draft.style} onChange={event => update('style', event.target.value)}>{['Khám phá', 'Nghỉ dưỡng', 'Ẩm thực', 'Văn hóa', 'Phiêu lưu'].map(value => <option key={value}>{value}</option>)}</select></label></section> : <section className="tour-information"><h3>Địa điểm</h3>{[['Nơi', draft.destination], ['Số lượng', `${draft.guests} người · ${draft.companions}`], ['Phong cách', draft.style]].map(([label, value]) => <div className="tour-summary-row" key={label}><div><small>{label}</small><p>{value}</p></div><button type="button" onClick={() => update('step', 1)}>Edit<span className="tour-sr"> {label}</span></button></div>)}</section>}</div>
      {draft.step === 2 && <aside className="tour-selected" aria-label="Các địa điểm đã chọn">{selected.map(place => <PlaceCard key={place.id} place={place} compact onRemove={() => update('placeIds', draft.placeIds.filter(id => id !== place.id))} />)}{!selected.length && <p>Thêm địa điểm bạn muốn ghé trong chuyến đi.</p>}<button className="tour-outline" type="button" onClick={() => setPicker(true)}>＋ Thêm địa điểm</button><p className="tour-note">{selected.length} địa điểm · Theo thứ tự bạn chọn</p></aside>}
    </div>{draft.step === 3 && <section className="tour-review-places" aria-label="Địa điểm trong lịch trình">{selected.map(place => <PlaceCard key={place.id} place={place} />)}<button className="tour-outline" type="button" onClick={() => update('step', 2)}>Chỉnh sửa địa điểm</button></section>}<p role="alert" className="tour-error">{error}</p><p className="tour-note" role="status">{storageNote}</p><div className="tour-navigation">{draft.step > 1 && <button className="tour-outline" type="button" onClick={() => update('step', draft.step - 1)}>Quay lại</button>}{draft.step < 3 ? <button className="tour-primary" type="submit">Next step</button> : <button className="tour-primary" type="button" disabled={processing} onClick={confirm}>Confirm</button>}</div><p className="tour-demo">Chế độ thử nghiệm: lịch trình lưu trên trình duyệt, địa điểm và ảnh minh họa.</p></form>
  </main>}<SiteFooter />{picker && <PlacePicker ids={draft.placeIds} onSave={ids => update('placeIds', ids)} onClose={() => setPicker(false)} />}{processing && <Processing />}</div>;
}
