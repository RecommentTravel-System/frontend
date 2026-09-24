import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { useAuth } from '../auth/useAuth.js';
import { destinations } from '../search/searchData.js';
import { favoritesKey, readFavorites } from '../favorites/favoritesData.js';
import { amenities, galleryPhotos, policies, reviews } from './locationData.js';
import './LocationDetails.css';
import PremiumSuggestions from './PremiumSuggestions.jsx';
const subscribePreview = callback => { window.addEventListener('storage', callback); return () => window.removeEventListener('storage', callback); };
const readPreview = () => { try { return localStorage.getItem('wayvee-home-preview') === 'premium'; } catch { return false; } };

function Modal({ title, children, onClose }) {
  const ref = useRef(null);
  useEffect(() => { if (!ref.current.open) ref.current.showModal(); }, []);
  return <dialog ref={ref} className="location-dialog" aria-label={title} onClose={onClose}><div className="location-dialog-heading"><h2>{title}</h2><button aria-label="Đóng" onClick={() => ref.current.close()}>×</button></div>{children}</dialog>;
}
function Photo({ src, alt }) {
  const [failed, setFailed] = useState(false);
  return failed ? <span className="location-photo-fallback">Ảnh chưa khả dụng</span> : <img src={src} alt={alt} onError={() => setFailed(true)} loading="lazy" />;
}
function Review({ review }) {
  const [expanded, setExpanded] = useState(false);
  return <article className="location-review"><header><span className="location-review-avatar">{review.name.charAt(0)}</span><div><strong>{review.name}</strong><time>{review.date}</time></div><b>{review.score}</b></header><p>“{review.text}{expanded ? ` ${review.more}` : ''}”</p><button aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? 'Show Less' : 'Show More'}</button></article>;
}

export default function LocationDetails() {
  const { locationId } = useParams();
  const premium = useSyncExternalStore(subscribePreview, readPreview, () => false);
  const { user } = useAuth();
  const location = useLocation();
  const place = destinations.find(item => item.id === locationId);
  const [expanded, setExpanded] = useState(false);
  const [allAmenities, setAllAmenities] = useState(false);
  const [modal, setModal] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [notice, setNotice] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [collections, setCollections] = useState(() => { try { return user ? readFavorites(user.email) : []; } catch { return []; } });
  const [collectionId, setCollectionId] = useState('');
  const [newName, setNewName] = useState('Địa điểm muốn ghé');
  const back = typeof location.state?.from === 'string' && /^\/search(?:\?|$)/.test(location.state.from) ? location.state.from : '/search';
  if (!place) return <><SiteHeader /><main className="location-page"><h1>Không tìm thấy địa điểm</h1><Link to="/search">Quay lại tìm kiếm</Link></main><SiteFooter /></>;
  const cafe = place.id === 'cong-cafe';
  const photos = cafe ? galleryPhotos : [place.image, ...galleryPhotos];
  const saved = collections.some(collection => collection.placeIds.includes(place.id));
  const facilities = cafe ? amenities : place.amenities;
  function savePlace(event) {
    event.preventDefault();
    if (!user) return;
    try {
      const current = readFavorites(user.email);
      let target = current.find(item => item.id === collectionId);
      if (!target) {
        const name = newName.trim();
        if (!name) { setNotice('Vui lòng nhập tên bộ sưu tập.'); return; }
        target = current.find(item => item.name.toLocaleLowerCase('vi') === name.toLocaleLowerCase('vi'));
        if (!target) { target = { id: crypto.randomUUID(), name, placeIds: [] }; current.push(target); }
      }
      if (!target.placeIds.includes(place.id)) target.placeIds.push(place.id);
      localStorage.setItem(favoritesKey(user.email), JSON.stringify(current));
      setCollections(current); setModal(null); setNotice(`Đã thêm vào “${target.name}”. Xem trong mục Yêu thích.`);
    } catch { setNotice('Không thể lưu bộ sưu tập. Hãy kiểm tra quyền lưu trữ của trình duyệt.'); }
  }
  async function share() {
    const url = new URL(`/locations/${place.id}`, window.location.origin).href;
    try {
      if (navigator.share) await navigator.share({ title: place.name, url });
      else { await navigator.clipboard.writeText(url); setNotice('Đã sao chép liên kết địa điểm.'); }
    } catch (error) { if (error.name !== 'AbortError') { setShareUrl(url); setNotice('Sao chép liên kết bên dưới để chia sẻ.'); } }
  }
  return <><SiteHeader /><main className="location-page">
    <Link className="location-back" to={back}>‹ Quay lại tìm kiếm</Link>
    <header className="location-heading"><div><h1>{place.name} <span className="location-stars" aria-label={`${place.stars} sao`}>{'★'.repeat(place.stars)}</span></h1><p>{place.address}</p></div><div className="location-actions"><button aria-label={saved ? 'Đã lưu; thêm vào bộ sưu tập' : 'Lưu địa điểm yêu thích'} aria-pressed={saved} onClick={() => setModal('save')}>{saved ? '♥' : '♡'}</button><button aria-label="Chia sẻ địa điểm" onClick={share}><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m9 10 6-4M9 14l6 4"/></svg></button></div></header>
    <div className="location-add-row"><span className="location-demo">{premium ? 'Premium' : 'Bản free'} · Nội dung và ảnh minh họa</span><button className="location-primary" title="Thêm vào bộ sưu tập yêu thích" onClick={() => setModal('save')}>Thêm +</button></div>
    <p role="status" className="location-notice">{notice}</p>{shareUrl && <label className="location-share">Liên kết chia sẻ<input readOnly value={shareUrl} onFocus={event => event.target.select()} /></label>}
    <div className="location-gallery">{photos.slice(0, 5).map((src, index) => <button key={src} className={index === 0 ? 'location-gallery-main' : ''} aria-label={`Xem ảnh ${index + 1} của ${place.name}`} onClick={() => { setPhotoIndex(index); setModal('gallery'); }}><Photo src={src} alt={`Ảnh minh họa ${place.name} — ${index + 1}`} />{index === 4 && <span className="location-photo-count">▧ {photos.length} ảnh</span>}</button>)}</div>
    <section className="location-section location-description"><h2>Description</h2><p><strong>Quy mô:</strong> {cafe ? '2 tầng · Khoảng 120 chỗ ngồi' : `${place.size} m² · ${place.type}`}</p><p>{cafe ? 'Cộng Cà Phê Nhà Thờ mang phong cách Đông Dương (Indochine) với nội thất gỗ, tường sơn xanh đặc trưng và nhiều vật dụng mang hơi hướng bao cấp. Quán nằm ngay trên phố Nhà Thờ, chỉ cách Nhà thờ Lớn Hà Nội vài bước chân, là địa điểm yêu thích của cả người dân địa phương lẫn du khách quốc tế.' : `${place.name} là một gợi ý trong danh sách khám phá tại ${place.address}. Bạn có thể xem tiện ích và lưu địa điểm vào bộ sưu tập để chuẩn bị cho chuyến đi.`}</p>{expanded && <p id="location-description-more">{cafe ? 'Không gian hoài cổ phù hợp để gặp gỡ bạn bè, thưởng thức cà phê và ngắm phố. Cà phê cốt dừa, đồ uống truyền thống và các góc ngồi bên cửa sổ là những điểm nhấn của bản giới thiệu này.' : 'Các thông tin trong trang này là dữ liệu mẫu phục vụ trải nghiệm giao diện. Hãy xác nhận trực tiếp với địa điểm trước khi ghé thăm.'}</p>}<button className="location-outline" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? 'Show Less' : 'Show More'}</button></section>
    <section className="location-section"><h2>Amenities</h2><ul className="location-amenities">{(allAmenities ? facilities : facilities.slice(0, 6)).map(item => <li key={item}>{item}</li>)}</ul>{facilities.length > 6 && <button className="location-outline" aria-expanded={allAmenities} onClick={() => setAllAmenities(!allAmenities)}>{allAmenities ? 'Show Less' : 'Show All'}</button>}</section>
    <section className="location-section"><h2>Location</h2><iframe className="location-map" title={`Bản đồ ${place.name}`} src={`https://maps.google.com/maps?q=${encodeURIComponent(`${place.name}, ${place.address}`)}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen /><a className="location-map-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name}, ${place.address}`)}`} target="_blank" rel="noreferrer">Mở bản đồ lớn ↗</a></section>
    <section className="location-section"><h2>Reviews</h2><p className="location-review-summary"><strong>{place.rating.toFixed(1)}</strong> {place.rating >= 4.5 ? 'Excellent' : 'Guest rating'} <span>{place.reviews.toLocaleString('vi-VN')} reviews · Minh họa</span></p><div className="location-rating-breakdown"><div><b>Overall Rating</b>{[5, 4, 3, 2, 1].map((value, index) => <div className="location-rating-bar" key={value}><span>{value}</span><span><i style={{ width: `${[90, 65, 30, 15, 5][index]}%` }} /></span></div>)}</div>{['Amenities', 'Cleanliness', 'Communication', 'Location', 'Value'].map((label, index) => <div key={label}><b><span aria-hidden="true">{['♧', '♙', '☏', '⌖', '◎'][index]}</span> {label}</b><strong>{place.rating.toFixed(1)}</strong></div>)}</div><div className="location-review-grid">{reviews.slice(0, 3).map(review => <Review key={review.name} review={review} />)}</div><button className="location-outline" onClick={() => setModal('reviews')}>Show All {reviews.length} Sample Reviews</button></section>
    <section className="location-section"><h2>Policies</h2>{cafe ? <dl className="location-policies">{policies.map(([icon, label, text]) => <div key={label}><dt><span aria-hidden="true">{icon}</span> {label}</dt><dd>{text}</dd></div>)}</dl> : <p>Chính sách của địa điểm chưa được cập nhật. Vui lòng liên hệ trực tiếp để xác nhận.</p>}<p className="location-demo">Thông tin, đánh giá và chính sách là dữ liệu mẫu, chưa kết nối API địa điểm.</p></section>
    {premium && <PremiumSuggestions key={place.id} place={place} />}
  </main><SiteFooter />
    {modal === 'gallery' && <Modal title={`Ảnh ${photoIndex + 1} / ${photos.length}`} onClose={() => setModal(null)}><div className="location-lightbox"><Photo key={photos[photoIndex]} src={photos[photoIndex]} alt={`Ảnh minh họa ${place.name} ${photoIndex + 1}`} /></div><div className="location-gallery-nav"><button className="location-outline" onClick={() => setPhotoIndex((photoIndex + photos.length - 1) % photos.length)}>‹ Ảnh trước</button><button className="location-outline" onClick={() => setPhotoIndex((photoIndex + 1) % photos.length)}>Ảnh tiếp ›</button></div></Modal>}
    {modal === 'reviews' && <Modal title="Đánh giá minh họa" onClose={() => setModal(null)}><div className="location-review-grid">{reviews.map(review => <Review key={review.name} review={review} />)}</div></Modal>}
    {modal === 'save' && <Modal title="Thêm vào yêu thích" onClose={() => setModal(null)}>{user ? <form className="location-save-form" onSubmit={savePlace}><label>Bộ sưu tập<select value={collectionId} onChange={event => setCollectionId(event.target.value)}><option value="">Tạo bộ sưu tập mới</option>{collections.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>{!collectionId && <label>Tên bộ sưu tập<input value={newName} onChange={event => setNewName(event.target.value)} required maxLength={60} /></label>}<p role="status">{notice}</p><button className="location-primary" type="submit">Lưu địa điểm</button></form> : <div className="location-save-form"><p>Đăng nhập để lưu địa điểm vào bộ sưu tập cá nhân.</p><Link className="location-primary" to="/login">Đăng nhập</Link></div>}</Modal>}
  </>;
}
