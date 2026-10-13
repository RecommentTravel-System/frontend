import { useEffect, useState } from 'react';
import { useTranslation } from '../providers/i18n-provider.jsx';
import { getQrImageUrl, getQrFallbackUrl } from './qrGenerator.js';
import './WayveeTravelLoader.css';

export default function WayveeTravelLoader({
  title,
  subtitle,
  badgeText,
  showQR = false,
  qrCode = '',
  checkoutUrl = '',
  amount = 0,
  orderCode = '',
  onCancel = null
}) {
  const { t } = useTranslation();
  const [qrImgSrc, setQrImgSrc] = useState('');
  const [qrFailed, setQrFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  // Determine initial QR source: either VietQR payload, image, or checkout URL
  useEffect(() => {
    const rawData = qrCode || checkoutUrl;
    if (rawData) {
      setQrImgSrc(getQrImageUrl(rawData));
      setQrFailed(false);
    } else {
      setQrImgSrc('');
    }
  }, [qrCode, checkoutUrl]);

  const handleQrError = () => {
    const rawData = qrCode || checkoutUrl;
    if (!qrFailed && rawData) {
      // Try fallback service
      setQrImgSrc(getQrFallbackUrl(rawData));
      setQrFailed(true);
    }
  };

  const handleCopyLink = () => {
    if (checkoutUrl) {
      navigator.clipboard.writeText(checkoutUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {});
    }
  };

  const displayTitle = title || t('paymentPage.loader.title', 'Đang chờ xác nhận thanh toán');
  const displaySubtitle = subtitle || t('paymentPage.loader.subtitleGeneric', 'Vui lòng hoàn tất thanh toán trên ứng dụng ngân hàng hoặc cổng PayOS');

  return (
    <div className="wayvee-travel-loader-container">
      {/* Background Travel Scene Animation */}
      <div className="travel-scene">
        {/* Floating Clouds */}
        <div className="cloud cloud-1" aria-hidden="true" />
        <div className="cloud cloud-2" aria-hidden="true" />
        <div className="cloud cloud-3" aria-hidden="true" />

        {/* Pulse Radar Rings */}
        <div className="radar-pulse-ring ring-1" aria-hidden="true" />
        <div className="radar-pulse-ring ring-2" aria-hidden="true" />
        <div className="radar-pulse-ring ring-3" aria-hidden="true" />

        {/* Main Logo & Airplane Orbit */}
        <div className="travel-logo-wrapper">
          {/* Orbiting Plane */}
          <div className="plane-orbit-track" aria-hidden="true">
            <div className="orbiting-airplane">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="#0090E7" className="plane-icon">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
              <div className="contrail-tail" />
            </div>
          </div>

          {/* Wayvee Location Pin + Mountain + Swoosh SVG */}
          <div className="wayvee-pin-logo">
            <svg
              viewBox="0 0 160 160"
              width="130"
              height="130"
              className="wayvee-brand-svg"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer Cyan Map Pin */}
              <defs>
                <linearGradient id="pinGrad" x1="20" y1="20" x2="140" y2="140" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00B4F8" />
                  <stop offset="1" stopColor="#008BE2" />
                </linearGradient>
                <linearGradient id="mountainDark" x1="45" y1="70" x2="115" y2="135" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#07233B" />
                  <stop offset="1" stopColor="#0E3858" />
                </linearGradient>
                <linearGradient id="mountainTeal" x1="75" y1="85" x2="120" y2="130" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#256B85" />
                  <stop offset="1" stopColor="#1E5268" />
                </linearGradient>
              </defs>

              {/* Pin body */}
              <path
                d="M80 18C49.07 18 24 43.07 24 74C24 103.5 67 137.5 77.2 145.2C78.9 146.5 81.1 146.5 82.8 145.2C93 137.5 136 103.5 136 74C136 43.07 110.93 18 80 18Z"
                fill="url(#pinGrad)"
              />

              {/* Pin Inner Cutout circle */}
              <circle cx="80" cy="72" r="34" fill="#ffffff" />

              {/* Mountain Shape Dark (Left peak) */}
              <path
                d="M45 110 L78 72 C79.2 70.6 80.8 70.6 82 72 L115 110 L98 128 L80 144 L62 128 Z"
                fill="url(#mountainDark)"
              />

              {/* Mountain Shape Teal (Right facet) */}
              <path
                d="M80 72 L115 110 L98 128 L80 106 Z"
                fill="url(#mountainTeal)"
              />

              {/* Central Peak Accent */}
              <path
                d="M80 106 L98 128 L80 144 L62 128 Z"
                fill="#00B4F8"
              />

              {/* Arc swoosh trail */}
              <path
                d="M62 76 C65 62 82 52 110 42 C125 36 135 28 140 22"
                stroke="#07233B"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />

              {/* Logo Airplane at top right */}
              <g transform="translate(116, 18) rotate(32) scale(0.95)">
                <path
                  d="M12 2C11.45 2 11 2.45 11 3V7.5L3 11V13.5L11 11.5V17L8.5 18.5V20.5L12 19.5L15.5 20.5V18.5L13 17V11.5L21 13.5V11L13 7.5V3C13 2.45 12.55 2 12 2Z"
                  fill="#07233B"
                />
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Status Header */}
      <div className="loader-info">
        <div className="status-live-badge">
          <span className="live-dot" />
          <span>{badgeText || t('paymentPage.loader.badgeLabel', 'ĐANG CHỜ THANH TOÁN (WEBHOOK)')}</span>
        </div>

        <h3 className="loader-title">{displayTitle}</h3>
        <p className="loader-subtitle">{displaySubtitle}</p>
      </div>

      {/* PayOS QR / Payment Details if available */}
      {showQR && (
        <div className="payment-qr-section">
          {orderCode && (
            <div className="qr-order-info">
              <span>{t('paymentPage.loader.orderCode', 'Mã giao dịch')}: <strong>#{orderCode}</strong></span>
              {amount > 0 && (
                <span>{t('paymentPage.loader.amountLabel', 'Số tiền')}: <strong className="qr-amount">{new Intl.NumberFormat('vi-VN').format(amount)} đ</strong></span>
              )}
            </div>
          )}

          {qrImgSrc ? (
            <div className="qr-box">
              <div className="qr-img-wrapper">
                <img
                  src={qrImgSrc}
                  alt="VietQR PayOS Code"
                  className="payos-qr-image"
                  onError={handleQrError}
                  loading="eager"
                />
              </div>
              <p className="qr-hint">{t('paymentPage.loader.qrHint', 'Mở app Ngân hàng hoặc ví điện tử để quét mã VietQR')}</p>
            </div>
          ) : (
            <div className="qr-box qr-box-placeholder">
              <div className="qr-loading-spinner" />
              <p className="qr-hint">{t('paymentPage.loader.qrHint', 'Mở app Ngân hàng hoặc ví điện tử để quét mã VietQR')}</p>
            </div>
          )}

          <div className="loader-actions">
            {onCancel && (
              <button type="button" className="btn-cancel-loader-red" onClick={onCancel}>
                {t('paymentPage.loader.cancelTx', 'Hủy giao dịch')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
