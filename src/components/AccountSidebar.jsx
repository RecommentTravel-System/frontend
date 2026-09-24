import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { filters } from '../itineraries/trips.js';
import { useAuth } from '../auth/useAuth.js';
import { readProfile } from '../profile/profileStorage.js';
import Avatar from './AccountAvatar.jsx';
import Icon from './AccountIcon.jsx';
import './AccountLayout.css';

const menu = [
  { icon: 'user', label: 'Thông tin cá nhân', to: '/profile' },
  { icon: 'card', label: 'Premium', to: '/payment' },
  { icon: 'calendar', label: 'Lịch trình' },
  { icon: 'heart', label: 'Yêu thích', to: '/favorites' },
  { icon: 'support', label: 'Hỗ trợ', to: '/support' },
  { icon: 'review', label: 'Bài đánh giá', to: '/reviews' },
  { icon: 'settings', label: 'Cài đặt', to: '/settings' },
];

export default function AccountSidebar({ name, onNotice }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const itineraryActive = location.pathname.startsWith('/itineraries');
  const currentFilter = filters.some(item => item.id === params.get('status')) ? params.get('status') : 'ongoing';
  const profile = user ? readProfile(user) : null;
  const displayName = name || (profile ? `${profile.firstName} ${profile.lastName}`.trim() : 'Khách');

  function signOut() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <aside className="account-sidebar">
      <div className="account-identity"><Avatar name={displayName} /><div><strong>{displayName}</strong><small>{user ? 'Premium' : 'Chào mừng bạn'}</small></div></div>
      <nav aria-label="Tài khoản">
        {menu.filter(item => user || item.to !== '/profile').map(({ icon, label, to, href }) => {
          const content = <><Icon name={icon} /><span>{label}</span>{icon === 'calendar' && <Icon name="chevron" />}</>;
          const className = `account-nav-item${icon === 'settings' ? ' account-settings' : ''}`;
          if (icon === 'calendar') return <div key={icon} className="account-itineraries"><Link to="/itineraries?status=ongoing" className={`${className}${itineraryActive ? ' is-active' : ''}`} aria-current={itineraryActive ? 'true' : undefined}>{content}</Link>{itineraryActive && <div className="account-subnav" aria-label="Trạng thái lịch trình">{filters.map(filter => <Link key={filter.id} to={`/itineraries?status=${filter.id}`} className={currentFilter === filter.id ? 'is-active' : ''} aria-current={currentFilter === filter.id ? 'page' : undefined}>{filter.label}</Link>)}</div>}</div>;
          if (to) return <NavLink key={icon} to={to} className={({ isActive }) => `${className}${isActive ? ' is-active' : ''}`}>{content}</NavLink>;
          if (href) return <a key={icon} href={href} className={className}>{content}</a>;
          return <button key={icon} type="button" className={className} onClick={() => onNotice?.(`${label}: chức năng đang được phát triển.`)}>{content}</button>;
        })}
      </nav>
      {user ? <button type="button" className="account-logout" onClick={signOut}><Icon name="logout" />Đăng xuất</button> : <Link className="account-logout" to="/login" state={{ from: '/payment' }}><Icon name="user" />Đăng nhập</Link>}
    </aside>
  );
}
