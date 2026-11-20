import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '~/providers/auth-provider';
import { AppHeader, AppFooter } from '~/shared/components';
import AccountSidebar from '../components/AccountSidebar.jsx';
import { getMyFavorites, deleteFavorite, removeFavoriteByOsmId } from '~/shared/services/favorite-api';
import { EmptyState } from '~/shared/ui/empty-state';
import './Favorites.css';

export default function Favorites() {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  const fetchFavorites = useCallback(async () => {
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
  }, [isAuthenticated]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

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
              </div>
              <Link to="/places" className="favorites-outline-button">
                <span aria-hidden="true">⌕</span> Khám phá địa điểm mới
              </Link>
            </header>

            {loading ? (
              <div className="py-16 text-center text-slate-500">
                <div className="inline-block w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-sm font-medium">Đang tải danh sách địa điểm yêu thích...</p>
              </div>
            ) : favorites.length > 0 ? (
              <div className="favorites-places">
                {favorites.map((fav) => {
                  const placeName = fav.placeName || `Địa điểm #${fav.osmId}`;
                  const coordsText = fav.latitude && fav.longitude
                    ? `${fav.latitude.toFixed(4)}, ${fav.longitude.toFixed(4)}`
                    : 'Việt Nam';

                  const targetPlace = {
                    id: fav.osmId,
                    osmId: fav.osmId,
                    name: placeName,
                    latitude: fav.latitude,
                    longitude: fav.longitude,
                    imageUrl: fav.imageUrl || "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80",
                    address: fav.latitude && fav.longitude ? `Tọa độ: ${fav.latitude.toFixed(4)}, ${fav.longitude.toFixed(4)}` : "Việt Nam",
                    categoryCode: "ATTRACTION",
                    description: "Địa điểm yêu thích đã lưu trên hệ thống WAYVEE."
                  };

                  return (
                    <article className="favorite-place" key={fav.favoriteId || fav.osmId}>
                      <div className="favorite-place-photo">
                        <Link to={`/places/${fav.osmId}`} state={{ place: targetPlace }}>
                          <img
                            src={fav.imageUrl || "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=400&q=80"}
                            alt={placeName}
                            loading="lazy"
                          />
                        </Link>
                        <button
                          type="button"
                          className="favorite-heart"
                          onClick={() => handleRemove(fav)}
                          aria-label={`Bỏ yêu thích ${placeName}`}
                          aria-pressed="true"
                          title="Bỏ yêu thích"
                        >
                          <svg className="w-4 h-4 fill-rose-500 text-rose-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        </button>
                      </div>
                      <div className="favorite-place-info">
                        <h2>
                          <Link to={`/places/${fav.osmId}`} state={{ place: targetPlace }} className="hover:text-[#00a3e0]">
                            {placeName}
                          </Link>
                        </h2>
                        {fav.latitude && fav.longitude ? (
                          <span className="text-slate-500 text-xs">
                            <span aria-hidden="true">⌾</span> Tọa độ: {fav.latitude.toFixed(4)}, {fav.longitude.toFixed(4)}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">
                            <span aria-hidden="true">⌾</span> {coordsText}
                          </span>
                        )}
                        {fav.osmId && (
                          <p className="favorite-place-note">
                            <Link
                              to={`/places/${fav.osmId}`}
                              state={{ place: targetPlace }}
                              className="text-[#00a3e0] hover:underline inline-flex items-center gap-1 font-medium"
                            >
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
              <EmptyState
                icon={
                  <svg className="w-8 h-8 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                }
                title="Bạn chưa có địa điểm yêu thích nào"
                description="Khám phá và lưu lại những điểm đến ấn tượng để dễ dàng lên kế hoạch cho chuyến đi sắp tới."
                actionLabel="Khám phá địa điểm ngay"
                onAction={() => window.location.assign('/places?browse=1')}
              />
            )}

            {notice && <p className="favorites-notice" role="status">{notice}</p>}
          </section>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
