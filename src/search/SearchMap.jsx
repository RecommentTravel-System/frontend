import { useState } from 'react';

export default function SearchMap({ results, selected, onSelect, onClose }) {
  return <aside className="search-map-panel" aria-label="Bản đồ kết quả tìm kiếm"><header><label htmlFor="search-map-place">Địa điểm trên bản đồ</label><button type="button" aria-label="Đóng bản đồ" onClick={onClose}>×</button></header>{selected ? <><select id="search-map-place" value={selected.id} onChange={event => onSelect(event.target.value)}>{results.map(place => <option key={place.id} value={place.id}>{place.name}</option>)}</select><MapFrame key={selected.id} place={selected} /><div className="search-map-caption"><strong>{selected.name}</strong><p>{selected.address}</p><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selected.name}, ${selected.address}`)}`} target="_blank" rel="noreferrer">Mở Google Maps ↗</a><small>Vị trí được tìm theo tên và địa chỉ của dữ liệu minh họa.</small></div></> : <p className="search-map-empty">Không có kết quả để hiển thị trên bản đồ. Hãy điều chỉnh bộ lọc.</p>}</aside>;
}
function MapFrame({ place }) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  return <div className="search-map-frame">{loading && <p className="search-map-loading" role="status">Đang tải bản đồ…</p>}{failed && <p className="search-map-loading" role="alert">Chưa tải được bản đồ. Bạn có thể mở Google Maps bên dưới.</p>}<iframe title={`Bản đồ ${place.name}`} src={`https://maps.google.com/maps?q=${encodeURIComponent(`${place.name}, ${place.address}`)}&z=16&output=embed`} referrerPolicy="no-referrer-when-downgrade" allowFullScreen onLoad={() => setLoading(false)} onError={() => { setLoading(false); setFailed(true); }} /></div>;
}
