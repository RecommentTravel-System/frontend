import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import AccountSidebar from '../components/AccountSidebar.jsx';
import { plans, formatPrice } from './plans.js';
import { paymentService } from './paymentService.js';
import { useTranslation } from '../providers/i18n-provider.jsx';
import '../components/SiteLayout.css';
import './Payment.css';

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [notice, setNotice] = useState('');
  const [activeSub, setActiveSub] = useState(null);

  // Handle PayOS return redirect query parameters (e.g., /payment?orderCode=123&status=PAID&code=00)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    const code = params.get('code');
    const orderCode = params.get('orderCode');
    const cancel = params.get('cancel');

    if (status === 'PAID' || code === '00') {
      navigate('/payment/success', {
        replace: true,
        state: {
          orderCode,
          planName: 'Wayvee Premium',
          amount: 28000,
          transactionCode: params.get('reference') || `PAYOS-${orderCode}`,
          paidAt: new Date().toISOString(),
        },
      });
    } else if (cancel === 'true' || status === 'CANCELLED') {
      setNotice(t('paymentPage.cancelledNotice', 'Bạn đã hủy giao dịch thanh toán.'));
    }
  }, [location.search, navigate, t]);

  // Load user's active subscription if logged in
  useEffect(() => {
    let isMounted = true;
    paymentService.getMyActiveSubscription().then((sub) => {
      if (isMounted && sub) {
        setActiveSub(sub);
      }
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectPlan = (plan) => {
    navigate(`/payment/checkout?plan=${plan.id}`, { state: { plan } });
  };

  return (
    <div className="payment-page">
      <SiteHeader />
      <main className="account-layout payment-layout">
        <AccountSidebar onNotice={setNotice} />
        <section className="payment-content" aria-labelledby="payment-title">
          <header className="payment-summary">
            <div>
              <h1 id="payment-title">{t('paymentPage.title', 'Wayvee Premium')}</h1>
              <p>
                {activeSub ? (
                  <span className="active-sub-tag">
                    {t('paymentPage.activePlan', 'Đang hoạt động')}: <strong>{activeSub.planName || 'Gói Premium'}</strong>
                  </span>
                ) : (
                  t('paymentPage.oneTimePlan', 'Gói 1 lần')
                )}
              </p>
            </div>
            <button
              type="button"
              className="payment-link"
              aria-expanded={showDetails}
              aria-controls="premium-details"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? t('paymentPage.collapse', 'Thu gọn') : t('paymentPage.viewDetails', 'Xem chi tiết')}
            </button>
          </header>

          <div className="payment-intro">
            <h2>{t('paymentPage.useWayvee', 'Sử dụng Wayvee trọn vẹn hơn.')}</h2>
            <p>{t('paymentPage.premiumDesc', 'Trải nghiệm Wayvee Premium với đa dạng tính năng và tối ưu hành trình du lịch bằng AI.')}</p>
          </div>

          {showDetails && (
            <section id="premium-details" className="payment-details">
              <h2>{t('paymentPage.discoverPremium', 'Khám phá cùng Wayvee Premium')}</h2>
              <p>
                {t(
                  'paymentPage.discoverPremiumDesc',
                  'Lựa chọn gói theo số chuyến đi bạn muốn lên kế hoạch. Mở khóa toàn bộ gợi ý nhà hàng, khách sạn, điểm tham quan hấp dẫn và tính toán tối ưu lịch trình chỉ trong vài giây.'
                )}
              </p>
            </section>
          )}

          <section className="payment-packages" aria-labelledby="packages-title">
            <div className="payment-packages-heading">
              <h2 id="packages-title">{t('paymentPage.choosePlan', 'Chọn gói phù hợp với bạn')}</h2>
              <p>{t('paymentPage.unlockMore', 'Mở khóa thêm nhiều gợi ý địa điểm và nhiều tính năng thú vị hơn.')}</p>
            </div>

            <div className="payment-plan-grid">
              {plans.map((plan, index) => (
                <article
                  key={plan.id}
                  className={`payment-plan${index === 0 ? ' payment-plan-featured' : ''}`}
                >
                  <h3>{plan.name}</h3>
                  <p className="payment-plan-label">
                    {t('paymentPage.packageLabel', { count: plan.trips, defaultValue: `Gói ${plan.trips} lần` })}
                  </p>
                  <p className="payment-plan-price">
                    <strong>
                      {formatPrice(plan.previewTotal ?? plan.price)}/{plan.trips === 1 ? t('paymentPage.perTime', 'lần') : t('paymentPage.perPackage', 'gói')}
                    </strong>
                    {plan.previewTotal != null && (
                      <del>{formatPrice(plan.price)}/{t('paymentPage.perTime', 'lần')}</del>
                    )}
                  </p>
                  <p className="payment-plan-offer">
                    {plan.previewOffer ? t('paymentPage.firstTimeOffer', plan.previewOffer) : '\u00a0'}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSelectPlan(plan)}
                    aria-label={`${t('paymentPage.tryNow', 'Trải nghiệm ngay')}: ${plan.name}`}
                  >
                    {t('paymentPage.tryNow', 'Trải nghiệm ngay')}
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="payment-coupons" aria-labelledby="coupon-title">
            <h2 id="coupon-title">{t('paymentPage.couponTitle', 'Mã giảm giá')}</h2>
            <div className="payment-coupon-count">
              <span>{t('paymentPage.yourCoupons', 'Mã của bạn')}</span>
              <span>0</span>
            </div>
            <div className="payment-coupon-actions">
              <button
                type="button"
                className="payment-link"
                aria-expanded={showCoupon}
                aria-controls="payment-coupon-form"
                onClick={() => {
                  setShowCoupon(!showCoupon);
                  setNotice('');
                }}
              >
                {t('paymentPage.addCoupon', 'Thêm mã giảm giá')}
              </button>
            </div>
            {showCoupon && (
              <form
                id="payment-coupon-form"
                className="payment-coupon-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  setNotice(
                    coupon.trim()
                      ? t('paymentPage.couponNotConnected', 'Chức năng xác thực mã giảm giá chưa được kết nối. Mã chưa được áp dụng.')
                      : t('paymentPage.enterCouponPlease', 'Vui lòng nhập mã giảm giá.')
                  );
                }}
              >
                <label htmlFor="payment-coupon">{t('paymentPage.enterCoupon', 'Nhập mã giảm giá')}</label>
                <div>
                  <input
                    id="payment-coupon"
                    value={coupon}
                    maxLength={64}
                    onChange={(event) => setCoupon(event.target.value)}
                    placeholder={t('paymentPage.couponPlaceholder', 'Nhập mã của bạn')}
                    required
                  />
                  <button type="submit">{t('paymentPage.applyCoupon', 'Áp dụng')}</button>
                </div>
              </form>
            )}
            {notice && (
              <p className="payment-notice" role="status">
                {notice}
              </p>
            )}
          </section>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
