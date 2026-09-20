import { useEffect, useRef } from 'react';
import { Link, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './auth/useAuth.js';
import { registerAccount } from './auth/authService.js';
import Login from './login/Login.jsx';
import Register from './register/Register.jsx';
import Home from './homepage/Home.jsx';
import Payment from './payment/Payment.jsx';
import Profile from './profile/Profile.jsx';
import Itineraries from './itineraries/Itineraries.jsx';
import Favorites from './favorites/Favorites.jsx';
import Reviews from './reviews/Reviews.jsx';

function RequireAuth() {
  const { user } = useAuth();
  const location = useLocation();
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
}

function AccountPage({ register = false }) {
  const { user, loginDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = '/profile';
  if (user) return <Navigate to={destination} replace />;
  const socialLogin = () => { throw new Error('Đăng nhập mạng xã hội chưa được kết nối. Vui lòng dùng email và mật khẩu.'); };
  const shared = { onClose: () => navigate('/'), onGoogle: socialLogin, onApple: socialLogin, onFacebook: socialLogin };
  if (register) return <Register {...shared} onLogin={() => navigate('/login', { state: location.state })} onSubmit={async values => {
    await registerAccount(values);
    navigate('/login', { replace: true, state: { from: destination, message: 'Đăng ký thành công. Hãy đăng nhập để tiếp tục.' } });
  }} />;
  return <Login {...shared} message={location.state?.message} onSignUp={() => navigate('/register', { state: location.state })} onSubmit={() => {
    loginDemo();
    navigate(destination, { replace: true });
  }} />;
}

function ProfilePage() {
  const { user } = useAuth();
  return <Profile key={user.email} user={user} />;
}

export default function App() {
  const location = useLocation();
  const container = useRef(null);
  useEffect(() => {
    const titles = { '/': 'Trang chủ', '/profile': 'Thông tin cá nhân', '/login': 'Đăng nhập', '/register': 'Đăng ký', '/payment': 'Premium', '/reviews': 'Bài đánh giá' };
    document.title = `${titles[location.pathname] || (location.pathname.startsWith('/itineraries') ? 'Lịch trình' : location.pathname.startsWith('/favorites') ? 'Địa điểm yêu thích' : 'Không tìm thấy trang')} | Wayvee`;
    const target = location.hash && document.getElementById(location.hash.slice(1));
    if (target) target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    else window.scrollTo({ top: 0, behavior: 'instant' });
    container.current?.focus({ preventScroll: true });
  }, [location]);

  return <div key={location.pathname} className="route-page" ref={container} tabIndex={-1}>
    <Routes>
      <Route path="/" element={<><Home /><Link to="/payment" className="premium-shortcut">WAYVEE Premium</Link></>} />
      <Route path="/login" element={<AccountPage />} />
      <Route path="/register" element={<AccountPage register />} />
      <Route element={<RequireAuth />}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/itineraries" element={<Itineraries />} />
        <Route path="/itineraries/:tripId" element={<Itineraries />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/favorites/:collectionId" element={<Favorites />} />
        <Route path="/reviews" element={<Reviews />} />
      </Route>
      <Route path="/payment" element={<Payment />} />
      <Route path="*" element={<main className="route-not-found"><h1>Không tìm thấy trang</h1><Link to="/">Quay về trang chủ</Link></main>} />
    </Routes>
  </div>;
}
