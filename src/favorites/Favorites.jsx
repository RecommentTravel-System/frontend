import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';
import AccountSidebar from '../components/AccountSidebar.jsx';
import SiteHeader from '../components/SiteHeader.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import Icon from '../components/AccountIcon.jsx';
import { favoritesKey, places, readFavorites } from './favoritesData.js';
import './Favorites.css';

function PlaceImage({ place }) {
  const [failed, setFailed] = useState(false);
  return failed ? <span className="favorite-photo-fallback"><Icon name="heart" width="30" height="30" /></span> : <img src={place.image} alt={place.name} loading="lazy" onError={() => setFailed(true)} />;
}

function CollectionEditor({ collection, onSave, onClose }) {
  const dialog = useRef(null);
  const [name, setName] = useState(collection?.name || '');
  const [ids, setIds] = useState(collection?.placeIds || []);
  const [error, setError] = useState('');
  useEffect(() => { if (!dialog.current.open) dialog.current.showModal(); }, []);
  function submit(event) {
    event.preventDefault();
    if (!name.trim()) { setError('Vui lòng nhập tên bộ sưu tập.'); return; }
    const failure = onSave({ id: collection?.id || crypto.randomUUID(), name: name.trim(), placeIds: ids });
    if (failure) setError(failure);
    else dialog.current.close();
  }
  return <dialog ref={dialog} className="favorites-editor" onClose={onClose} aria-labelledby="favorites-editor-title"><form onSubmit={submit}>
    <div className="favorites-editor-heading"><h2 id="favorites-editor-title">{collection ? 'Chỉnh sửa bộ sưu tập' : 'Thêm mục yêu thích'}</h2><button type="button" aria-label="Đóng" onClick={() => dialog.current.close()}>×</button></div>
    <label className="favorites-name-label" htmlFor="collection-name">Tên bộ sưu tập</label><input id="collection-name" autoFocus value={name} onChange={event => { setName(event.target.value); setError(''); }} maxLength={60} placeholder="Ví dụ: Ăn uống, Đi chơi cuối tuần" required />
    <fieldset><legend>Chọn địa điểm muốn lưu</legend><p className="favorites-demo-note">Danh sách địa điểm minh họa</p>{places.map(place => <label className="favorites-place-option" key={place.id}><input type="checkbox" checked={ids.includes(place.id)} onChange={event => setIds(event.target.checked ? [...ids, place.id] : ids.filter(id => id !== place.id))} /><span>{place.name}<small>{place.address}</small></span></label>)}</fieldset>
    <p className="favorites-error" role="alert">{error}</p><div className="favorites-editor-actions"><button type="button" onClick={() => dialog.current.close()}>Hủy</button><button type="submit">Lưu bộ sưu tập</button></div>
  </form></dialog>;
}

function EmptyFavorites({ onCreate, insideCollection = false }) {
  return <div className="favorites-empty"><svg width="128" height="128" viewBox="0 0 128 128" fill="none" aria-hidden="true"><path d="M64 92S24 69 24 48c0-23 28-28 40-10 12-18 40-13 40 10 0 21-40 44-40 44Z" stroke="#515c6c" strokeWidth="6" strokeLinejoin="round" /><path d="m84 64-5 7m-7 6-2 1M98 17v-9m9 18 7-7m0 16h10M17 87h10m-3 14 7-7m7 8v11M18 18v9m-4-5h8" stroke="#97a4b6" strokeWidth="4" strokeLinecap="round" /><circle cx="111" cy="105" r="3" stroke="#97a4b6" strokeWidth="3" /></svg>
    <Link to="/#destinations" className="favorites-outline-button">⌕ Bắt đầu khám phá</Link><h2>Bạn chưa có địa điểm yêu thích nào.</h2><p>Khám phá và lưu lại những địa điểm bạn thích để lên kế hoạch<br />dễ dàng hơn.</p><button type="button" className="favorites-text-button" onClick={onCreate}>{insideCollection ? 'Thêm địa điểm' : 'Thêm mục yêu thích'}</button>
  </div>;
}

export default function Favorites() {
  const { user } = useAuth();
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const [initial] = useState(() => { try { return { collections: readFavorites(user.email), error: '' }; } catch { return { collections: [], error: 'Không đọc được dữ liệu đã lưu. Vui lòng kiểm tra quyền lưu trữ của trình duyệt.' }; } });
  const [collections, setCollections] = useState(initial.collections);
  const [notice, setNotice] = useState(initial.error);
  const [editor, setEditor] = useState(null);
  const [shareText, setShareText] = useState('');
  const activeCollection = collections.find(item => item.id === collectionId);

  function persist(next) {
    try { localStorage.setItem(favoritesKey(user.email), JSON.stringify(next)); setCollections(next); return ''; }
    catch { return 'Không thể lưu thay đổi. Vui lòng kiểm tra quyền lưu trữ của trình duyệt.'; }
  }
  function save(collection) {
    if (collections.some(item => item.id !== collection.id && item.name.toLocaleLowerCase('vi') === collection.name.toLocaleLowerCase('vi'))) return 'Tên bộ sưu tập này đã tồn tại.';
    const next = collections.some(item => item.id === collection.id) ? collections.map(item => item.id === collection.id ? collection : item) : [...collections, collection];
    const error = persist(next);
    if (!error) setNotice('Đã lưu bộ sưu tập.');
    return error;
  }
  function removePlace(id) {
    const next = collections.map(item => item.id === collectionId ? { ...item, placeIds: item.placeIds.filter(placeId => placeId !== id) } : item);
    setNotice(persist(next) || 'Đã bỏ địa điểm khỏi bộ sưu tập.');
  }
  function deleteCollection() {
    if (!window.confirm(`Xóa bộ sưu tập “${activeCollection.name}”?`)) return;
    const error = persist(collections.filter(item => item.id !== collectionId));
    if (error) setNotice(error);
    else navigate('/favorites');
  }
  async function share() {
    const text = `${activeCollection.name}\n${activeCollection.placeIds.map(id => { const place = places.find(item => item.id === id); return `${place.name} — ${place.address}`; }).join('\n')}`;
    try {
      if (navigator.share) await navigator.share({ title: activeCollection.name, text });
      else { await navigator.clipboard.writeText(text); setNotice('Đã sao chép danh sách địa điểm để chia sẻ.'); }
    } catch (error) { if (error.name !== 'AbortError') { setShareText(text); setNotice('Bạn có thể sao chép nội dung bên dưới để chia sẻ.'); } }
  }

  return <div className="favorites-page"><SiteHeader /><main className="account-layout favorites-layout"><AccountSidebar onNotice={setNotice} /><div className="favorites-content">
    {collectionId && <Link className="favorites-back" to="/favorites">‹ <span>Quay lại danh sách</span></Link>}
    <section className={`favorites-panel${!collectionId && !collections.length ? ' favorites-panel-empty' : ''}`} aria-label="Địa điểm yêu thích">
      {!collectionId ? collections.length ? <>
        <header className="favorites-heading"><div><h1>Địa điểm yêu thích</h1><p>Lưu lại những điểm đến bạn muốn khám phá.</p></div><button type="button" className="favorites-outline-button" onClick={() => setEditor({})}><span aria-hidden="true">＋</span> Thêm mục yêu thích</button></header>
        <div className="favorites-collections">{collections.map(collection => { const covers = collection.placeIds.slice(0, collection.placeIds.length >= 4 ? 4 : 1).map(id => places.find(place => place.id === id)); return <Link className="favorites-collection" key={collection.id} to={`/favorites/${collection.id}`}><div className={`favorites-cover${covers.length === 4 ? ' favorites-cover-grid' : ''}`}>{covers.length ? covers.map(place => <PlaceImage key={place.id} place={place} />) : <span className="favorite-photo-fallback"><Icon name="heart" width="36" height="36" /></span>}</div><h2>{collection.name}</h2><p>{collection.placeIds.length} địa điểm đã lưu</p></Link>; })}</div><p className="favorites-demo-note">Địa điểm và hình ảnh minh họa</p>
      </> : <EmptyFavorites onCreate={() => setEditor({})} /> : activeCollection ? <>
        <header className="favorites-detail-heading"><h1>{activeCollection.name}</h1><button type="button" onClick={share} className="favorites-share" aria-label="Chia sẻ bộ sưu tập"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m9 10 6-4M9 14l6 4" /></svg></button></header>
        {activeCollection.placeIds.length ? <div className="favorites-places">{activeCollection.placeIds.map(id => { const place = places.find(item => item.id === id); return <article className="favorite-place" key={id}><div className="favorite-place-photo"><PlaceImage place={place} /><button type="button" className="favorite-heart" onClick={() => removePlace(id)} aria-label={`Bỏ yêu thích ${place.name}`} aria-pressed="true"><Icon name="heart" /></button></div><div className="favorite-place-info"><p className="favorite-rating"><strong>{place.rating}</strong><span>Excellent <small>· minh họa</small></span></p><h2>{place.name}</h2><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${place.address}`)}`} target="_blank" rel="noreferrer"><span aria-hidden="true">⌾</span>{place.address}</a><p className="favorite-place-note"><span aria-hidden="true">♧</span>{place.note}</p></div></article>; })}</div> : <EmptyFavorites insideCollection onCreate={() => setEditor(activeCollection)} />}
        <div className="favorites-detail-actions"><button type="button" className="favorites-text-button" onClick={() => setEditor(activeCollection)}>Chỉnh sửa / Thêm địa điểm</button><button type="button" className="favorites-delete" onClick={deleteCollection}>Xóa bộ sưu tập</button></div>
        {shareText && <label className="favorites-share-text">Nội dung chia sẻ<textarea readOnly value={shareText} onFocus={event => event.target.select()} /></label>}
      </> : <div className="favorites-empty"><h1>Không tìm thấy bộ sưu tập.</h1><Link to="/favorites">Quay lại danh sách yêu thích</Link></div>}
      {notice && <p className="favorites-notice" role="status">{notice}</p>}
    </section>
  </div></main><SiteFooter />{editor && <CollectionEditor collection={editor.id ? editor : null} onSave={save} onClose={() => setEditor(null)} />}</div>;
}
