import { useState, useMemo, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { formatPrice } from './plans.js';
import { useTranslation } from '../providers/i18n-provider.jsx';
import '../components/SiteLayout.css';
import './PaymentSuccess.css';

export default function PaymentSuccess({ paymentInfo = null }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language } = useTranslation();

  // Kiểm tra chuyến đi đang chờ tối ưu
  const pendingTrip = useMemo(() => {
    try {
      const saved = sessionStorage.getItem('wayvee_pending_optimization_trip');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, []);

  // Nếu có chuyến đi đang chờ, tự động quay lại trang sắp xếp lịch trình sau 3 giây
  useEffect(() => {
    if (!pendingTrip) return;
    const timer = setTimeout(() => {
      navigate('/trip/plan', {
        replace: true,
        state: {
          tripId: pendingTrip.tripId,
          isUnlocked: pendingTrip.isUnlocked,
          tripName: pendingTrip.tripName,
          tripDates: pendingTrip.tripDates,
          destination: pendingTrip.destination,
          passengerCount: pendingTrip.passengerCount,
          daysSchedule: pendingTrip.daysSchedule,
          wishlist: pendingTrip.wishlist,
        },
      });
    }, 3000);
    return () => clearTimeout(timer);
  }, [pendingTrip, navigate]);

  // Get data from location state or query params or prop
  const stateData = location.state || {};
  const queryParams = new URLSearchParams(location.search);

  const orderCode = stateData.orderCode || queryParams.get('orderCode') || paymentInfo?.paymentId || 'WV' + Math.floor(100000 + Math.random() * 900000);
  const planName = stateData.planName || paymentInfo?.planName || 'Wayvee Premium';
  const amount = stateData.amount || paymentInfo?.amount || 28000;
  const transactionCode = stateData.transactionCode || queryParams.get('reference') || paymentInfo?.transactionCode || `TXN-${orderCode}`;
  const localeStr = language === 'en' ? 'en-US' : 'vi-VN';
  const paidAt = stateData.paidAt || paymentInfo?.paidAt
    ? new Date(paymentInfo?.paidAt || Date.now()).toLocaleString(localeStr)
    : new Date().toLocaleString(localeStr);

  // Confetti particles generator
  const [particles] = useState(() =>
    Array.from({ length: 32 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2.5 + Math.random() * 2,
      color: ['#00B4F8', '#0090E7', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'][Math.floor(Math.random() * 6)],
      size: 6 + Math.random() * 8,
      rotation: Math.random() * 360,
    }))
  );

  return (
    <div className="payment-success-page">
      <SiteHeader />

      {/* Confetti Animation Background */}
      <div className="confetti-container" aria-hidden="true">
        {particles.map((p) => (
          <div
            key={p.id}
            className="confetti-particle"
            style={{
              left: `${p.x}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              backgroundColor: p.color,
              width: `${p.size}px`,
              height: `${p.size * 1.4}px`,
              transform: `rotate(${p.rotation}deg)`,
            }}
          />
        ))}
      </div>

      <main className="success-content-wrapper">
        <div className="success-card">
          {/* Animated Checkmark Circle */}
          <div className="success-icon-wrap">
            <div className="pulse-glow-ring" />
            <svg className="checkmark-svg" viewBox="0 0 52 52">
              <circle className="checkmark-circle" cx="26" cy="26" r="24" fill="none" />
              <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
          </div>

          <div className="success-badge">
            {t('paymentPage.success.badge', 'Giao dịch thành công')}
          </div>
          <h1 className="success-title">
            {t('paymentPage.success.title', 'Thanh toán hoàn tất!')}
          </h1>
          <p
            className="success-subtitle"
            dangerouslySetInnerHTML={{
              __html: t(
                'paymentPage.success.subtitle',
                'Cảm ơn bạn đã lựa chọn <strong>Wayvee</strong>. Gói dịch vụ đã được kích hoạt trên tài khoản của bạn.'
              )
            }}
          />

          {/* Receipt Info Box */}
          <div className="receipt-box">
            <div className="receipt-header">
              <h3>{t('paymentPage.success.receiptTitle', 'Thông tin giao dịch')}</h3>
              <span className="badge-paid">{t('paymentPage.success.paid', 'Đã thanh toán')}</span>
            </div>

            <dl className="receipt-details">
              <div className="receipt-row">
                <dt>{t('paymentPage.success.planLabel', 'Gói dịch vụ')}</dt>
                <dd><strong>{planName}</strong></dd>
              </div>
              <div className="receipt-row">
                <dt>{t('paymentPage.success.orderCodeLabel', 'Mã đơn hàng')}</dt>
                <dd><code>#{orderCode}</code></dd>
              </div>
              {transactionCode && (
                <div className="receipt-row">
                  <dt>{t('paymentPage.success.referenceLabel', 'Mã tham chiếu')}</dt>
                  <dd className="receipt-code">{transactionCode}</dd>
                </div>
              )}
              <div className="receipt-row">
                <dt>{t('paymentPage.success.timeLabel', 'Thời gian')}</dt>
                <dd>{paidAt}</dd>
              </div>
              <div className="receipt-row">
                <dt>{t('paymentPage.success.methodLabel', 'Phương thức')}</dt>
                <dd>{t('paymentPage.success.methodValue', 'PayOS / Chuyển khoản QR')}</dd>
              </div>
              <div className="receipt-row receipt-total">
                <dt>{t('paymentPage.success.totalLabel', 'Tổng thanh toán')}</dt>
                <dd className="receipt-amount">{formatPrice(amount)}</dd>
              </div>
            </dl>
          </div>

          {/* Unlocked Benefits */}
          <div className="unlocked-benefits">
            <h4>{t('paymentPage.success.benefitsTitle', 'Đặc quyền đã sẵn sàng')}</h4>
            <div className="benefits-grid">
              <div className="benefit-item">
                <span className="benefit-icon">✨</span>
                <div>
                  <strong>{t('paymentPage.success.benefit1Title', 'Gợi ý AI thông minh')}</strong>
                  <p>{t('paymentPage.success.benefit1Desc', 'Khám phá các điểm đến độc đáo phù hợp sở thích')}</p>
                </div>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🗺️</span>
                <div>
                  <strong>{t('paymentPage.success.benefit2Title', 'Tạo lịch trình không giới hạn')}</strong>
                  <p>{t('paymentPage.success.benefit2Desc', 'Tối ưu lộ trình và thời gian di chuyển')}</p>
                </div>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">⛅</span>
                <div>
                  <strong>{t('paymentPage.success.benefit3Title', 'Thời tiết & Tiện ích')}</strong>
                  <p>{t('paymentPage.success.benefit3Desc', 'Cập nhật dự báo chi tiết cho từng chặng')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="success-actions">
            {pendingTrip ? (
              <>
                <Link
                  to="/trip/plan"
                  state={{
                    tripId: pendingTrip.tripId,
                    isUnlocked: pendingTrip.isUnlocked,
                    tripName: pendingTrip.tripName,
                    tripDates: pendingTrip.tripDates,
                    destination: pendingTrip.destination,
                    passengerCount: pendingTrip.passengerCount,
                    daysSchedule: pendingTrip.daysSchedule,
                    wishlist: pendingTrip.wishlist,
                  }}
                  className="btn-primary-action"
                >
                  {t('paymentPage.success.returnToTrip', 'Quay lại lịch trình của bạn')}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14" />
                    <path d="M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <p className="auto-redirect-hint">
                  {t('paymentPage.success.autoRedirect', 'Tự động quay lại sau 3 giây...')}
                </p>
              </>
            ) : (
              <Link to="/trip/info" className="btn-primary-action">
                {t('paymentPage.success.startPlanning', 'Bắt đầu lên lịch trình ngay')}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </Link>
            )}
            <div className="secondary-links">
              <Link to="/places" className="btn-secondary-link">
                {t('paymentPage.success.explorePlaces', 'Khám phá địa điểm')}
              </Link>
              <span className="link-divider">•</span>
              <Link to="/profile" className="btn-secondary-link">
                {t('paymentPage.success.myProfile', 'Trang cá nhân')}
              </Link>
              <span className="link-divider">•</span>
              <Link to="/itineraries" className="btn-secondary-link">
                {t('paymentPage.success.myItineraries', 'Lịch trình của tôi')}
              </Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
