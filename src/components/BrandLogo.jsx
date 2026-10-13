import { Link } from 'react-router-dom';
import iconImg from '../assets/icon.png';
import textImg from '../assets/wayvee-text.png';
import textDarkImg from '../assets/wayvee-text-dark.png';
import './SiteLayout.css';

export default function BrandLogo({ className = '' }) {
  return (
    <Link to="/" className={`site-brand group ${className}`} aria-label="Wayvee — Trang chủ">
      <span className="site-brand-icon">
        <img
          src={iconImg}
          alt="Wayvee Icon"
        />
      </span>
      <span className="site-brand-text-img">
        <img src={textImg} alt="WAYVEE" className="brand-text-light" />
        <img src={textDarkImg} alt="WAYVEE" className="brand-text-dark" />
      </span>
    </Link>
  );
}
