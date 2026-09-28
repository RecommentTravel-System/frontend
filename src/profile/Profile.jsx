import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Profile.css';
import { AppHeader, AppFooter } from '~/shared/components';
import { LoginCard, RegisterCard } from '~/features/auth';
import { useAuth } from '~/providers/auth-provider';
import { getMyFavorites, deleteFavorite, removeFavoriteByOsmId } from '~/shared/services/favorite-api';
import AccountSidebar from '../components/AccountSidebar.jsx';
import Avatar from '../components/AccountAvatar.jsx';
import Icon from '../components/AccountIcon.jsx';
import { readProfile, profileKey } from './profileStorage.js';
import AvatarEditor from './AvatarEditor.jsx';

export default function Profile({ user: propUser }) {
  const { user: authUser } = useAuth();
  const user = propUser || authUser;
  const [authModal, setAuthModal] = useState(null);

  const [saved, setSaved] = useState(() => readProfile(user));
  const [values, setValues] = useState(saved);
  const [notice, setNotice] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const firstInput = useRef(null);

  useEffect(() => {
    const updated = readProfile(user);
    setSaved(updated);
    setValues(updated);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoadingFavorites(true);
    getMyFavorites()
      .then((res) => {
        if (!cancelled) {
          const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
          setFavorites(list);
        }
      })
      .catch((err) => {
        console.warn("Failed to load profile favorites:", err);
      })
      .finally(() => {
        if (!cancelled) setLoadingFavorites(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleRemoveFavorite = async (fav) => {
    try {
      if (fav.favoriteId) {
        await deleteFavorite(fav.favoriteId);
      } else if (fav.osmId) {
        await removeFavoriteByOsmId(fav.osmId);
      }
      setFavorites((prev) => prev.filter((item) => item.favoriteId !== fav.favoriteId && item.osmId !== fav.osmId));
      setNotice('Đã bỏ yêu thích địa điểm.');
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      console.error("Failed to remove favorite:", err);
    }
  };

  const name = `${saved.firstName || ''} ${saved.lastName || ''}`.trim() || user?.fullName || 'Người dùng';

  const update = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
    setNotice('');
  };

  const save = (event) => {
    event.preventDefault();
    try {
      localStorage.setItem(profileKey(user?.email), JSON.stringify(values));
      setSaved({ ...values });
      setNotice('Đã lưu thay đổi thông tin cá nhân.');
    } catch {
      setNotice('Không thể lưu trên trình duyệt. Vui lòng thử lại.');
    }
  };

  const field = (key, label, type = 'text', placeholder = '', icon) => (
    <label className={`profile-field profile-field-${key}`}>
      <span>{label}</span>
      <div className="profile-input-wrap">
        {icon && <Icon name={icon} />}
        <input
          ref={key === 'firstName' ? firstInput : undefined}
          name={key}
          type={type}
          value={values[key] || ''}
          onChange={update}
          placeholder={placeholder}
          required={key === 'firstName' || key === 'lastName'}
          autoComplete={({ firstName: 'given-name', lastName: 'family-name', email: 'email', phone: 'tel', birthday: 'bday', address: 'street-address' })[key]}
        />
      </div>
    </label>
  );

  return (
    <div className="profile-page">
      <AppHeader
        onLogin={() => setAuthModal('login')}
        onRegister={() => setAuthModal('register')}
      />
      <main className="account-layout">
        <AccountSidebar name={name} onNotice={setNotice} />
        <section className="profile-content" aria-labelledby="profile-heading">
          <div className="profile-summary">
            <Avatar name={name} large />
            <div>
              <h1 id="profile-heading">Thông tin cá nhân</h1>
              <p>Thông tin và các hoạt động theo thời gian thực của bạn.</p>
            </div>
            <button className="profile-edit" onClick={() => firstInput.current?.focus()}>
              <Icon name="camera" />
              Chỉnh sửa
            </button>
          </div>

          <AvatarEditor user={user} name={name} />

          {/* Favorite Places Section */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 my-5" aria-labelledby="favorite-places-heading">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 id="favorite-places-heading" className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="text-rose-500">♥</span> Địa điểm yêu thích
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Các địa điểm bạn đã lưu để lên kế hoạch cho chuyến đi.
                </p>
              </div>
              {favorites.length > 0 && (
                <Link
                  to="/favorites"
                  className="text-xs sm:text-sm font-semibold text-[#00a8e8] hover:underline flex items-center gap-1"
                >
                  Xem tất cả ({favorites.length}) →
                </Link>
              )}
            </div>

            {loadingFavorites ? (
              <div className="py-6 text-center text-xs text-slate-400 animate-pulse">
                Đang tải địa điểm yêu thích...
              </div>
            ) : favorites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
                {favorites.slice(0, 3).map((fav) => {
                  const placeName = fav.placeName || `Địa điểm #${fav.osmId}`;
                  const coordsText = fav.latitude && fav.longitude
                    ? `${fav.latitude.toFixed(3)}, ${fav.longitude.toFixed(3)}`
                    : "Việt Nam";

                  const targetPlace = {
                    id: fav.osmId,
                    osmId: fav.osmId,
                    name: placeName,
                    latitude: fav.latitude,
                    longitude: fav.longitude,
                    imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
                    address: fav.latitude && fav.longitude ? `Tọa độ: ${fav.latitude.toFixed(4)}, ${fav.longitude.toFixed(4)}` : "Việt Nam",
                    categoryCode: "ATTRACTION",
                    description: "Địa điểm yêu thích đã lưu trên hệ thống WAYVEE."
                  };

                  return (
                    <article
                      key={fav.favoriteId || fav.osmId}
                      className="group relative rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-3 flex gap-3 items-center hover:border-sky-200 dark:hover:border-slate-700 transition-all shadow-2xs"
                    >
                      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200 dark:bg-slate-700">
                        <Link to={`/places/${fav.osmId}`} state={{ place: targetPlace }}>
                          <img
                            src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=150&q=80"
                            alt={placeName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                        </Link>
                      </div>
                      <div className="min-w-0 flex-grow">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                          <Link to={`/places/${fav.osmId}`} state={{ place: targetPlace }} className="hover:text-[#00a8e8]">
                            {placeName}
                          </Link>
                        </h3>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          📍 {coordsText}
                        </p>
                        {fav.osmId && (
                          <Link
                            to={`/places/${fav.osmId}`}
                            state={{ place: targetPlace }}
                            className="text-[11px] font-semibold text-[#00a8e8] hover:underline inline-block mt-0.5"
                          >
                            Xem chi tiết →
                          </Link>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFavorite(fav)}
                        className="w-7 h-7 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-rose-500 hover:scale-110 active:scale-95 cursor-pointer shadow-2xs flex-shrink-0"
                        title="Bỏ yêu thích"
                        aria-label="Bỏ yêu thích"
                      >
                        <svg className="w-3.5 h-3.5 fill-rose-500 text-rose-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </button>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="py-5 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <p>Bạn chưa lưu địa điểm yêu thích nào.</p>
                <Link
                  to="/places"
                  className="inline-block mt-2 text-xs font-bold text-[#00a8e8] hover:underline"
                >
                  Khám phá địa điểm ngay →
                </Link>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 p-5 my-5" aria-labelledby="saved-trips-heading">
            <h2 id="saved-trips-heading" className="font-bold text-lg">Lịch trình đã lưu</h2>
            <p className="my-2">Xem lại và chỉnh sửa kế hoạch từng ngày của bạn trên trình duyệt này.</p>
            <div className="flex flex-wrap gap-4">
              <Link className="font-semibold underline" to="/saved-trips">Xem lịch trình đã lưu</Link>
              <Link className="font-semibold underline" to="/saved-trips/new">+ Tạo lịch trình chi tiết</Link>
            </div>
          </section>

          <form className="profile-form" onSubmit={save}>
            <div className="profile-fields">
              {field('firstName', 'Tên', 'text', '', 'user')}
              {field('lastName', 'Họ', 'text', '', 'user')}
              {field('email', 'Email', 'email', 'em***an@gmail.com', 'mail')}
              {field('phone', 'Số điện thoại', 'tel', '(+34) 000 000 000')}
              <div className="profile-personal-row">
                <label className="profile-field">
                  <span>Giới tính</span>
                  <select name="gender" value={values.gender} onChange={update}>
                    <option value="">Gender</option>
                    <option>Nữ</option>
                    <option>Nam</option>
                    <option>Khác</option>
                    <option>Không muốn tiết lộ</option>
                  </select>
                </label>
                {field('birthday', 'Ngày sinh', 'date')}
              </div>
              <label className="profile-field">
                <span>Thành phố</span>
                <select name="city" value={values.city} onChange={update}>
                  {['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Huế', 'Khác'].map((city) => (
                    <option key={city}>{city}</option>
                  ))}
                </select>
              </label>
              {field('address', 'Address')}
            </div>
            <div className="profile-form-bottom">
              <p className="profile-notice" role="status">
                {notice}
              </p>
              <div className="profile-form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setValues({ ...saved });
                    setNotice('Đã hủy các thay đổi chưa lưu.');
                  }}
                >
                  Hủy
                </button>
                <button type="submit">Lưu thay đổi</button>
              </div>
            </div>
          </form>
        </section>
      </main>
      <AppFooter />

      {authModal === 'login' && (
        <LoginCard
          onClose={() => setAuthModal(null)}
          onSubmit={() => setAuthModal(null)}
          onSignUp={() => setAuthModal('register')}
        />
      )}
      {authModal === 'register' && (
        <RegisterCard
          onClose={() => setAuthModal(null)}
          onSubmit={() => setAuthModal(null)}
          onLogin={() => setAuthModal('login')}
        />
      )}
    </div>
  );
}
