import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { filters } from '../itineraries/trips.js';
import { useAuth } from '../auth/useAuth.js';
import { readProfile } from '../profile/profileStorage.js';
import { paymentService } from '../payment/paymentService.js';
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
  const [activeSub, setActiveSub] = useState(null);

  const itineraryActive = location.pathname.startsWith('/itineraries');
  const currentFilter = filters.some(item => item.id === params.get('status')) ? params.get('status') : 'ongoing';
  const profile = user ? readProfile(user) : null;
  const displayName = name || (profile ? `${profile.firstName} ${profile.lastName}`.trim() : 'Khách');

  useEffect(() => {
    if (!user) {
      setActiveSub(null);
      return;
    }
    let isMounted = true;
    paymentService
      .getMyActiveSubscription()
      .then((res) => {
        if (!isMounted) return;
        const subData = res?.data !== undefined ? res.data : res;
        if (subData && (subData.status === 'ACTIVE' || subData.subscriptionId)) {
          setActiveSub(subData);
        } else {
          setActiveSub(null);
        }
      })
      .catch(() => {
        if (isMounted) setActiveSub(null);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  function signOut() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <aside className="account-sidebar" aria-label="Account navigation">
      <div className="account-identity">
        <Avatar name={displayName} />
        <div className="account-identity-info">
          <strong>{displayName}</strong>
          {activeSub && (
            <small>{activeSub.planName || 'Thành viên Premium'}</small>
          )}
        </div>
      </div>

      <div className="account-section-heading">
        <span>MENU CHÍNH</span>
      </div>

      <nav aria-label="Tài khoản">
        {menu.filter(item => user || item.to !== '/profile').map(({ icon, label, to, href }) => {
          const isSettings = icon === 'settings';
          const className = `account-nav-item${isSettings ? ' account-settings' : ''}`;

          if (icon === 'calendar') {
            return (
              <div key={icon} className="account-itineraries">
                <Link
                  to="/itineraries?status=ongoing"
                  className={`${className}${itineraryActive ? ' is-active' : ''}`}
                  aria-current={itineraryActive ? 'page' : undefined}
                >
                  <Icon name="calendar" />
                  <span className="account-nav-label">{label}</span>
                  <Icon name="chevron" />
                  {itineraryActive && <span className="account-nav-dot" />}
                </Link>
                {itineraryActive && (
                  <div className="account-subnav" aria-label="Trạng thái lịch trình">
                    {filters.map((filter) => (
                      <Link
                        key={filter.id}
                        to={`/itineraries?status=${filter.id}`}
                        className={currentFilter === filter.id ? 'is-active' : ''}
                        aria-current={currentFilter === filter.id ? 'page' : undefined}
                      >
                        {filter.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          if (to) {
            return (
              <NavLink
                key={icon}
                to={to}
                className={({ isActive }) => `${className}${isActive ? ' is-active' : ''}`}
              >
                {({ isActive }) => (
                  <>
                    <Icon name={icon} />
                    <span className="account-nav-label">{label}</span>
                    {isActive && <span className="account-nav-dot" />}
                  </>
                )}
              </NavLink>
            );
          }

          if (href) {
            return (
              <a key={icon} href={href} className={className}>
                <Icon name={icon} />
                <span className="account-nav-label">{label}</span>
              </a>
            );
          }

          return (
            <button
              key={icon}
              type="button"
              className={className}
              onClick={() => onNotice?.(`${label}: chức năng đang được phát triển.`)}
            >
              <Icon name={icon} />
              <span className="account-nav-label">{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="account-sidebar-footer">
        {user ? (
          <button type="button" className="account-logout" onClick={signOut}>
            <Icon name="logout" />
            <span>Đăng xuất</span>
          </button>
        ) : (
          <Link className="account-logout" to="/login" state={{ from: '/payment' }}>
            <Icon name="user" />
            <span>Đăng nhập</span>
          </Link>
        )}
      </div>
    </aside>
  );
}

