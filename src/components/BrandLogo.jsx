import { Link } from 'react-router-dom';
import logo from '../assets/Icon.jpg';
import './SiteLayout.css';

export default function BrandLogo({ className = '' }) {
  return (
    <Link to="/" className={`site-brand ${className}`} aria-label="Wayvee — Trang chủ">
      <img src={logo} alt="Wayvee" width="116" height="37" />
    </Link>
  );
}
