import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';
import { Profile, TripDetails, TripPlanner } from './Trips.jsx';
import { accountStorage, readTrips } from './tripStore.js';
import AccountSidebar from '../components/AccountSidebar.jsx';
import SiteHeader from '../components/SiteHeader.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { useState } from 'react';
import './SavedTripsLayout.css';

export default function TripRoutes({ mode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tripId } = useParams();
  const location = useLocation();
  const [notice, setNotice] = useState('');
  let storage;
  let trip;
  try {
    storage = accountStorage(user.email);
    if (tripId) trip = readTrips(storage).find(item => item.id === tripId);
  } catch {
    return (
      <div className="saved-trips-page">
        <SiteHeader />
        <main className="account-layout saved-trips-layout">
          <AccountSidebar onNotice={setNotice} />
          <div className="saved-trips-content">
            <p role="alert">Không thể đọc lịch trình của tài khoản này. Vui lòng kiểm tra bộ nhớ trình duyệt.</p>
            <Link to="/profile">Quay lại Profile</Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (tripId && !trip) {
    return (
      <div className="saved-trips-page">
        <SiteHeader />
        <main className="account-layout saved-trips-layout">
          <AccountSidebar onNotice={setNotice} />
          <div className="saved-trips-content">
            <h1>Không tìm thấy lịch trình</h1>
            <Link to="/saved-trips">Quay lại lịch trình đã lưu</Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const onHome = () => navigate('/');
  // Tạo lịch trình → redirect sang /trip/info (trang khởi tạo lịch trình)
  const onCreate = () => navigate('/trip/info');
  const params = new URLSearchParams(location.search);
  const initial = Object.fromEntries(['title', 'destination', 'startDate', 'endDate', 'style'].map(key => [key, params.get(key) || '']));

  // Tạo mới / chỉnh sửa → dùng TripPlanner standalone
  if (mode === 'new' || mode === 'edit') {
    return (
      <TripPlanner
        key={`${user.email}:${tripId || 'new'}`}
        storage={storage}
        initial={trip || initial}
        onHome={onHome}
        onSaved={() => navigate('/saved-trips', { state: { saved: true } })}
      />
    );
  }

  // Chi tiết lịch trình
  if (mode === 'detail') {
    return (
      <div className="saved-trips-page">
        <SiteHeader />
        <main className="account-layout saved-trips-layout">
          <AccountSidebar onNotice={setNotice} />
          <div className="saved-trips-content">
            <TripDetails
              trip={trip}
              onHome={onHome}
              onProfile={() => navigate('/saved-trips')}
              onEdit={() => navigate(`/saved-trips/${trip.id}/edit`)}
            />
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // Danh sách lịch trình đã lưu (mode === 'list')
  return (
    <div className="saved-trips-page">
      <SiteHeader />
      <main className="account-layout saved-trips-layout">
        <AccountSidebar onNotice={setNotice} />
        <div className="saved-trips-content">
          <Profile
            key={user.email}
            storage={storage}
            onHome={onHome}
            onCreate={onCreate}
            onOpen={item => navigate(`/saved-trips/${item.id}`)}
            saved={location.state?.saved}
          />
        </div>
      </main>
      {notice && <p className="trips-notice" role="status">{notice}</p>}
      <SiteFooter />
    </div>
  );
}
