import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { suggestionsFor } from './locationSuggestions.js';
import './PremiumSuggestions.css';

function SuggestionPhoto({ place }) {
  const [failed, setFailed] = useState(false);
  return failed ? <span className="suggestion-image-fallback">Ảnh chưa khả dụng</span> : <img src={place.image} alt={`Ảnh minh họa ${place.name}`} loading="lazy" onError={() => setFailed(true)} />;
}
function Carousel({ title, items, featured, back }) {
  const track = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const measure = () => setEdges({ start: element.scrollLeft < 2, end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2 });
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    element.addEventListener('scroll', measure, { passive: true });
    return () => { observer.disconnect(); element.removeEventListener('scroll', measure); };
  }, []);
  function slide(direction) {
    const element = track.current;
    const reduced = document.documentElement.dataset.motion === 'off' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    element.scrollBy({ left: direction * element.clientWidth, behavior: reduced ? 'instant' : 'smooth' });
  }
  if (!items.length) return null;
  return <section className={`premium-suggestion-section${featured ? ' featured' : ''}`} aria-label={title}><header><h2>{title}</h2><div className="suggestion-controls"><button type="button" aria-label={`Xem trước: ${title}`} disabled={edges.start} onClick={() => slide(-1)}>‹</button><button type="button" aria-label={`Xem tiếp: ${title}`} disabled={edges.end} onClick={() => slide(1)}>›</button></div></header><div className="suggestion-track" ref={track} tabIndex={0} aria-label={`Danh sách ${title}, có thể cuộn ngang`}>{items.map(item => <article key={item.id} className="suggestion-card"><Link to={`/locations/${item.id}`} state={{ from: back }} className="suggestion-photo-link"><SuggestionPhoto place={item} /></Link><div className="suggestion-card-info"><h3><Link to={`/locations/${item.id}`} state={{ from: back }}>{item.name}</Link></h3>{!featured && <><p className="suggestion-address">⌖ {item.address}</p><p className="suggestion-category">{item.type} · Không gian cho chuyến đi của bạn</p><ul>{item.amenities.slice(0, 3).map(amenity => <li key={amenity}><span aria-hidden="true">✓</span> {amenity}</li>)}</ul><p className="suggestion-rating"><strong>{item.rating.toFixed(1)}</strong> {item.rating >= 4.5 ? 'Excellent' : 'Guest rating'} <small>{item.reviews} reviews</small></p></>}</div></article>)}</div></section>;
}
export default function PremiumSuggestions({ place }) {
  const { state } = useLocation();
  const data = suggestionsFor(place);
  const back = typeof state?.from === 'string' && /^\/search(?:\?|$)/.test(state.from) ? state.from : '/search';
  return <div className="premium-location-suggestions"><Carousel title={`${data.featured.length} địa điểm nổi bật ${data.city ? `tại ${data.city}` : 'gần đây'}`} items={data.featured} featured back={back} /><Carousel title="Địa điểm tương tự" items={data.similar} back={back} />{!data.similar.length && <p className="suggestion-data-note">Chưa có địa điểm cùng loại trong danh sách hiện tại.</p>}<p className="suggestion-data-note">Gợi ý từ dữ liệu minh họa, ưu tiên cùng thành phố và loại địa điểm; chưa tính khoảng cách thực tế.</p></div>;
}
