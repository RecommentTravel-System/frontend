import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '~/providers/auth-provider';
import { AppHeader, AppFooter } from '~/shared/components';
import AccountSidebar from '../components/AccountSidebar.jsx';
import Icon from '../components/AccountIcon.jsx';
import { getMyFavorites, deleteFavorite, removeFavoriteByOsmId } from '~/shared/services/favorite-api';
import './Favorites.css';

export default function Favorites() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  const fetchFavorites = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await getMyFavorites();
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setFavorites(list);
    } catch (err) {
      console.error("Failed to load favorites:", err);
      setNotice('Không thể tải danh sách địa điểm yêu thích.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [isAuthenticated]);

  const handleRemove = async (fav) => {
    try {
      if (fav.favoriteId) {
        await deleteFavorite(fav.favoriteId);
      } else if (fav.osmId) {
        await removeFavoriteByOsmId(fav.osmId);
      }
      setFavorites((prev) => prev.filter((item) => item.favoriteId !== fav.favoriteId && item.osmId !== fav.osmId));
      setNotice('Đã xóa địa điểm khỏi danh sách yêu thích.');
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      console.error("Failed to remove favorite:", err);
      setNotice('Lỗi khi xóa địa điểm yêu thích.');
      setTimeout(() => setNotice(''), 3000);
    }
  };

  return (
    <div className="favorites-page">
      <AppHeader />
      <main className="account-layout favorites-layout">
        <AccountSidebar onNotice={setNotice} />
        <div className="favorites-content">
          <section className={`favorites-panel${!favorites.length ? ' favorites-panel-empty' : ''}`} aria-label="Địa điểm yêu thích">
            <header className="favorites-heading">
              <div>
                <h1>Địa điểm yêu thích</h1>
                <p>Danh sách các điểm đến bạn đã lưu từ hệ thống WAYVEE.</p>
              </div>
              <Link to="/places" className="favorites-outline-button">
                <span aria-hidden="true">⌕</span> Khám phá địa điểm mới
              </Link>
            </header>

            {loading ? (
              <div className="py-12 text-center text-slate-500">
                <p>Đang tải danh sách địa điểm yêu thích...</p>
              </div>
            ) : favorites.length > 0 ? (
              <div className="favorites-places">
                {favorites.map((fav) => {
                  const placeName = fav.placeName || `Địa điểm #${fav.osmId}`;
                  const coordsText = fav.latitude && fav.longitude
                    ? `${fav.latitude.toFixed(4)}, ${fav.longitude.toFixed(4)}`
                    : 'Việt Nam';

                  return (
                    <article className="favorite-place" key={fav.favoriteId || fav.osmId}>
                      <div className="favorite-place-photo">
                        <img
                          src={`https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80`}
                          alt={placeName}
                          loading="lazy"
                        />
                        <button
                          type="button"
                          className="favorite-heart"
                          onClick={() => handleRemove(fav)}
                          aria-label={`Bỏ yêu thích ${placeName}`}
                          aria-pressed="true"
                          title="Bỏ yêu thích"
                        >
                          <Icon name="heart" />
                        </button>
                      </div>
                      <div className="favorite-place-info">
                        <h2>{placeName}</h2>
                        {fav.latitude && fav.longitude ? (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${fav.latitude},${fav.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <span aria-hidden="true">⌾</span> Tọa độ: {coordsText}
                          </a>
                        ) : (
                          <span className="text-slate-500 text-xs">
                            <span aria-hidden="true">⌾</span> {coordsText}
                          </span>
                        )}
                        {fav.osmId && (
                          <p className="favorite-place-note">
                            <Link to={`/places/${fav.osmId}`} className="text-[#00a3e0] hover:underline">
                              Xem chi tiết địa điểm trên WAYVEE →
                            </Link>
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="favorites-empty">
                <svg width="128" height="128" viewBox="0 0 128 128" fill="none" aria-hidden="true">
                  <path d="M64 92S24 69 24 48c0-23 28-28 40-10 12-18 40-13 40 10 0 21-40 44-40 44Z" stroke="#515c6c" strokeWidth="6" strokeLinejoin="round" />
                  <path d="m84 64-5 7m-7 6-2 1M98 17v-9m9 18 7-7m0 16h10M17 87h10m-3 14 7-7m7 8v11M18 18v9m-4-5h8" stroke="#97a4b6" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="111" cy="105" r="3" stroke="#97a4b6" strokeWidth="3" />
                </svg>
                <Link to="/places" className="favorites-outline-button">⌕ Bắt đầu khám phá</Link>
                <h2>Bạn chưa có địa điểm yêu thích nào.</h2>
                <p>Khám phá và lưu lại những địa điểm bạn thích để lên kế hoạch<br />dễ dàng hơn.</p>
              </div>
            )}

            {notice && <p className="favorites-notice" role="status">{notice}</p>}
          </section>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
