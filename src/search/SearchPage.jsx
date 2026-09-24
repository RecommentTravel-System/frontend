import { useRef, useState, useSyncExternalStore } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import SearchDialog from './SearchDialog.jsx';
import SearchFilters from './SearchFilters.jsx';
import { searchCatalog, filterAndSort, sortOptions } from './searchData.js';
import './Search.css';
import './PremiumSearch.css';
import SearchMap from './SearchMap.jsx';
import MapResize from './MapResize.jsx';
import { useMapResize } from './useMapResize.js';
const subscribePreview = callback => { window.addEventListener('storage', callback); return () => window.removeEventListener('storage', callback); };
const readPreview = () => { try { return localStorage.getItem('wayvee-home-preview') === 'premium'; } catch { return false; } };

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [searchOpen, setSearchOpen] = useState(false);
  const sortMenu = useRef(null);
  const premium = useSyncExternalStore(subscribePreview, readPreview, () => false);
  const map = premium && params.get('view') === 'map';
  const resizeRoot = useRef(null);
  const resize = useMapResize(map, resizeRoot);
  const results = filterAndSort(searchCatalog(premium), params);
  const grid = !map && (params.get('view') === 'grid' || (premium && !params.has('view')));
  const selected = results.find(place => place.id === params.get('place')) || results[0];
  function showOnMap(id) { setParams(previous => { const next = new URLSearchParams(previous); next.set('view', 'map'); if (id) next.set('place', id); return next; }); }
  function closeMap() { setParams(previous => { const next = new URLSearchParams(previous); next.set('view', 'grid'); next.delete('place'); return next; }); }
  const sort = sortOptions.find(([key]) => key === params.get('sort')) || sortOptions[0];
  function change(key, value) {
    setParams(previous => {
      const next = new URLSearchParams(previous);
      next.delete(key);
      for (const entry of Array.isArray(value) ? value : [value]) if (entry !== '') next.append(key, String(entry));
      return next;
    }, { replace: true });
  }
  function clearFilters() {
    setParams(previous => {
      const next = new URLSearchParams();
      for (const key of ['q', 'sort', 'view']) if (previous.has(key)) next.set(key, previous.get(key));
      return next;
    });
  }
  return <><SiteHeader /><main ref={resizeRoot} style={map ? { '--search-list-width': `${resize.width}px` } : undefined} className={`search-page${premium ? ' is-premium' : ''}${map ? ' has-map' : ''}${map && resize.collapsed ? ' map-list-collapsed' : ''}${resize.dragging ? ' is-resizing' : ''}`}>
    <div className="search-sidebar">{premium && <button type="button" className="search-map-launch" onClick={() => map ? closeMap() : showOnMap(selected?.id)}><span>{map ? '▦ Quay lại danh sách' : '⌖ Xem trên bản đồ'}</span></button>}<SearchFilters params={params} onChange={change} onClear={clearFilters} /></div>
    <section id="search-result-panel" hidden={map && resize.collapsed} className="search-main" aria-labelledby="search-title">
      <div className="search-title-row"><div><h1 id="search-title">Khám phá địa điểm “hot”{premium && <span className="search-premium-label">Premium</span>}</h1><p>{params.get('q') ? `Tìm kiếm: ${params.get('q')}` : 'Tìm nơi phù hợp với chuyến đi của bạn.'}</p></div><button className="search-outline" onClick={() => setSearchOpen(true)}>⌕ Tìm kiếm</button></div>
      <div className="search-toolbar"><details className="search-sort" ref={sortMenu}><summary>Sort by: <strong>{sort[1]}</strong>⌄</summary><fieldset><legend className="search-sr-only">Sắp xếp kết quả</legend>{sortOptions.map(([key, label]) => <label key={key}><input type="radio" name="search-sort" value={key} checked={sort[0] === key} onChange={() => { change('sort', key); sortMenu.current.open = false; sortMenu.current.querySelector('summary').focus(); }} /><span>{label}</span><span aria-hidden="true">{sort[0] === key ? '✓' : ''}</span></label>)}</fieldset></details>
        <div className="search-view" role="group" aria-label="Kiểu hiển thị"><button aria-label="Danh sách" aria-pressed={!grid && !map} onClick={() => change('view', 'list')}>☷</button><button aria-label="Lưới" aria-pressed={grid} onClick={() => change('view', 'grid')}>▦</button>{premium && <button aria-label="Bản đồ" aria-pressed={map} onClick={() => showOnMap(selected?.id)}>⌖</button>}</div></div>
      <p className="search-result-count" role="status">{results.length} địa điểm · Dữ liệu, giá và ảnh minh họa{params.has('maxPrice') && ` · Ngân sách tối đa: ${Number(params.get('maxPrice')).toLocaleString('vi-VN')}đ`}</p>
      <div className={`search-results ${grid ? 'is-grid' : ''}`}>{results.map(place => <SearchCard key={place.id} place={place} onMap={premium ? () => showOnMap(place.id) : undefined} selected={map && selected?.id === place.id} />)}</div>
      {!results.length && <div className="search-empty"><h2>Chưa tìm thấy địa điểm phù hợp</h2><p>Thử từ khóa khác hoặc bỏ bớt bộ lọc.</p><button className="search-outline" onClick={clearFilters}>Xóa bộ lọc</button><button className="search-outline" onClick={() => setSearchOpen(true)}>Đổi tìm kiếm</button></div>}
    </section>
    {map && <MapResize controller={resize} />}
    {map && <SearchMap results={results} selected={selected} onSelect={id => change("place", id)} onClose={closeMap} />}
  </main><SiteFooter />{searchOpen && <SearchDialog initialQuery={params.get('q') || ''} initialPrice={params.get('maxPrice') || ''} onClose={() => setSearchOpen(false)} onSearch={values => { setParams(previous => { const next = new URLSearchParams(previous); for (const [key, value] of Object.entries(values)) { next.delete(key); if (value !== '') next.set(key, value); } return next; }); setSearchOpen(false); }} />}</>;
}

function SearchCard({ place, onMap, selected }) {
  const location = useLocation();
  const link = { to: `/locations/${place.id}`, state: { from: location.pathname + location.search } };
  return <article className={`search-card${selected ? " is-selected" : ""}`}><div className="search-card-photo"><Link {...link} aria-label={`Xem chi tiết ${place.name}`}><img src={place.image} alt={`Ảnh minh họa ${place.name}`} loading="lazy" /><span className="search-deal">Getaway Deal</span></Link></div><div className="search-card-body"><div className="search-card-heading"><h2><Link {...link}>{place.name}</Link></h2><span className="search-stars" aria-label={`${place.stars} sao`}>{'★'.repeat(place.stars)}</span></div><p className="search-address">⌖ {place.address} · {place.distance} km</p><div className="search-rating"><strong>{place.rating.toFixed(1)}</strong><span>{place.rating >= 4.5 ? 'Excellent' : 'Guest rating'}<small>{place.reviews} reviews</small></span></div><div className="search-card-bottom"><p>{place.type} · {place.size} m² · {place.amenities.slice(0, 2).join(' · ')}</p><div className="search-tags">{place.booking.map(tag => <span key={tag}>{tag}</span>)}</div><strong className="search-price">Từ {place.price.toLocaleString('vi-VN')}đ</strong>{onMap && <button className="search-card-map-button" type="button" onClick={onMap}>⌖ Xem trên bản đồ</button>}</div></div></article>;
}
