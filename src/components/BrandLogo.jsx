import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/Icon.jpg';
import './SiteLayout.css';

export default function BrandLogo({ className = '' }) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link to="/" className={`site-brand ${className}`} aria-label="Wayvee — Trang chủ">
      {!imgError ? (
        <img
          src={logo}
          alt="Wayvee"
          width="116"
          height="37"
          onError={() => setImgError(true)}
          style={{ objectFit: 'contain' }}
        />
      ) : (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '1.25rem',
            fontWeight: '800',
            color: '#0b2545',
            letterSpacing: '-0.02em',
            textDecoration: 'none'
          }}
        >
          <span
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0b2545 0%, #00a8e8 100%)',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem',
              fontWeight: '900'
            }}
          >
            W
          </span>
          WAYVEE
        </span>
      )}
    </Link>
  );
}
