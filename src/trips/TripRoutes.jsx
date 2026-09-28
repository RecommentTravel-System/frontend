import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';
import { Profile, TripDetails, TripPlanner } from './Trips.jsx';
import { accountStorage, readTrips } from './tripStore.js';

export default function TripRoutes({ mode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tripId } = useParams();
  const location = useLocation();
  let storage;
  let trip;
  try {
    storage = accountStorage(user.email);
    if (tripId) trip = readTrips(storage).find(item => item.id === tripId);
  } catch {
    return <main className="p-8"><p role="alert">Không thể đọc lịch trình của tài khoản này. Vui lòng kiểm tra bộ nhớ trình duyệt.</p><Link to="/profile">Quay lại Profile</Link></main>;
  }
  if (tripId && !trip) return <main className="p-8"><h1>Không tìm thấy lịch trình</h1><Link to="/saved-trips">Quay lại lịch trình đã lưu</Link></main>;
  const onHome = () => navigate('/');
  const onCreate = () => navigate('/saved-trips/new');
  const params = new URLSearchParams(location.search);
  const initial = Object.fromEntries(['title', 'destination', 'startDate', 'endDate', 'style'].map(key => [key, params.get(key) || '']));
  if (mode === 'new' || mode === 'edit') return <TripPlanner key={`${user.email}:${tripId || 'new'}`} storage={storage} initial={trip || initial} onHome={onHome} onSaved={() => navigate('/saved-trips', { state: { saved: true } })} />;
  if (mode === 'detail') return <TripDetails trip={trip} onHome={onHome} onProfile={() => navigate('/profile')} onEdit={() => navigate(`/saved-trips/${trip.id}/edit`)} />;
  return <><div className="px-6 pt-4"><Link to="/profile">← Profile</Link></div><Profile key={user.email} storage={storage} onHome={onHome} onCreate={onCreate} onOpen={item => navigate(`/saved-trips/${item.id}`)} saved={location.state?.saved} /></>;
}
