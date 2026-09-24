import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';
import BrandLogo from './BrandLogo.jsx';
import ThemeToggle from '../theme/ThemeToggle.jsx';
import Avatar from './AccountAvatar.jsx';

export default function SiteHeader() {
  const { user } = useAuth();
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <BrandLogo />
        <nav className="site-header-actions" aria-label="Điều hướng chính">
          <Link to="/support" className="site-support" aria-label="Liên hệ hỗ trợ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 14v-3a8 8 0 0 1 16 0v6h-4v-7h4M4 10h4v7H4ZM20 17c0 4-4 4-8 4" /></svg>
          </Link>
          <ThemeToggle />
          {user ? <NavLink to="/profile" className="site-profile-link"><Avatar name={user.email} /><span>Profile</span></NavLink> : <Link to="/login" className="site-login-link">Login</Link>}
        </nav>
      </div>
    </header>
  );
}
