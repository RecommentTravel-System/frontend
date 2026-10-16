import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AppHeader, AppFooter } from '~/shared/components';
import WayveeTravelLoader from './WayveeTravelLoader.jsx';
import logo from '../assets/Icon.jpg';
import { plans, formatPrice } from './plans.js';
import { paymentService } from './paymentService.js';
import { getQrImageUrl, getQrFallbackUrl } from './qrGenerator.js';
import { useTranslation } from '../providers/i18n-provider.jsx';
import '../components/SiteLayout.css';
import './PaymentCheckout.css';

export default function PaymentCheckout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Find selected plan from navigation state or URL query parameter
  const queryParams = new URLSearchParams(location.search);
  const planIdParam = queryParams.get('plan') || queryParams.get('planId');
  const initialPlan = location.state?.plan || plans.find((p) => String(p.id) === String(planIdParam)) || plans[0];

  const [selectedPlan] = useState(initialPlan);
  const [loading, setLoading] = useState(false);
  const [isCheckingManual, setIsCheckingManual] = useState(false);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState(null); // { paymentId, checkoutUrl, qrCode, amount, paymentLinkId }
  const [isWaitingWebhook, setIsWaitingWebhook] = useState(false); // Only true when explicitly waiting / confirming webhook response
  const [copied, setCopied] = useState(false);
  const [qrImgSrc, setQrImgSrc] = useState('');
  const [qrFailed, setQrFailed] = useState(false);
  const pollingRef = useRef(null);

  const total = selectedPlan.previewTotal ?? selectedPlan.price;
  const packageLabel = selectedPlan.trips === 1
    ? t('paymentPage.oneTimePlan', 'Gói 1 lần')
    : t('paymentPage.packageLabel', { count: selectedPlan.trips, defaultValue: `Gói ${selectedPlan.trips} lần` });

  // Update QR source when paymentData changes
  useEffect(() => {
    if (paymentData?.qrCode || paymentData?.checkoutUrl) {
      setQrImgSrc(getQrImageUrl(paymentData.qrCode || paymentData.checkoutUrl));
      setQrFailed(false);
    } else {
      setQrImgSrc('');
    }
  }, [paymentData]);

  const handleQrError = () => {
    if (!qrFailed && (paymentData?.qrCode || paymentData?.checkoutUrl)) {
      setQrImgSrc(getQrFallbackUrl(paymentData.qrCode || paymentData.checkoutUrl));
      setQrFailed(true);
    }
  };

  // Handle PayOS return redirect query parameters (e.g., /payment/checkout?orderCode=123&status=PAID&code=00)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    const code = params.get('code');
    const orderCode = params.get('orderCode');
    const cancel = params.get('cancel');

    if (status === 'PAID' || code === '00') {
      setIsWaitingWebhook(true);
      setTimeout(() => {
        navigate('/payment/success', {
          replace: true,
          state: {
            orderCode,
            planName: selectedPlan.name,
            amount: total,
            transactionCode: params.get('reference') || `PAYOS-${orderCode}`,
            paidAt: new Date().toISOString(),
          },
        });
      }, 1200);
    } else if (cancel === 'true' || status === 'CANCELLED') {
      setError(t('paymentPage.cancelledNotice', 'Bạn đã hủy giao dịch thanh toán.'));
      setPaymentData(null);
      setIsWaitingWebhook(false);
    }
  }, [location.search, navigate, selectedPlan.name, total, t]);

  // Check payment status function
  const checkPaymentStatus = useCallback(async () => {
    if (!paymentData?.paymentId) return;

    try {
      const res = await paymentService.getPaymentStatus(paymentData.paymentId);
      const payload = res?.data || res?.result || res;
      const status = payload?.status || res?.status;

      if (status === 'PAID') {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setIsWaitingWebhook(true);
        setTimeout(() => {
          navigate('/payment/success', {
            replace: true,
            state: {
              orderCode: paymentData.paymentId,
              planName: selectedPlan.name,
              amount: payload?.amount || paymentData.amount || total,
              transactionCode: payload?.transactionCode || res?.transactionCode,
              paidAt: payload?.paidAt || res?.paidAt || new Date().toISOString(),
            },
          });
        }, 1200);
      } else if (status === 'CANCELLED' || status === 'FAILED') {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setError(t('paymentPage.checkout.cancelledOrFailed', 'Giao dịch đã bị hủy hoặc không thành công.'));
        setPaymentData(null);
        setIsWaitingWebhook(false);
      }
    } catch (err) {
      console.warn('Error polling payment status:', err);
    }
  }, [paymentData, navigate, selectedPlan.name, total, t]);

  // Polling webhook status every 2 seconds when paymentData is present
  useEffect(() => {
    if (!paymentData?.paymentId) return;

    pollingRef.current = setInterval(checkPaymentStatus, 2000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [paymentData, checkPaymentStatus]);

  const handleManualCheck = async () => {
    setIsCheckingManual(true);
    await checkPaymentStatus();
    setTimeout(() => setIsCheckingManual(false), 800);
  };

  const handleStartPayment = async () => {
    setError('');
    setLoading(true);

    try {
      // 1. Create Subscription
      const subRes = await paymentService.createSubscription({
        planName: selectedPlan.name,
        planType: 'PREMIUM',
        price: total,
      });

      const subscriptionId = subRes?.subscriptionId || subRes?.id || subRes?.data?.subscriptionId;
      if (!subscriptionId) {
        throw new Error(t('paymentPage.checkout.subError', 'Không thể khởi tạo gói đăng ký. Vui lòng đăng nhập lại.'));
      }

      // 2. Create PayOS Payment Link
      const payRes = await paymentService.createPaymentLink(subscriptionId);
      const payData = payRes?.data || payRes?.result || payRes;

      if (!payData || (!payData.checkoutUrl && !payData.paymentId)) {
        throw new Error(t('paymentPage.checkout.linkError', 'Không thể khởi tạo liên kết thanh toán PayOS.'));
      }

      setPaymentData({
        paymentId: payData.paymentId,
        checkoutUrl: payData.checkoutUrl,
        qrCode: payData.qrCode,
        amount: payData.amount || total,
        paymentLinkId: payData.paymentLinkId,
      });
    } catch (err) {
      console.error('Payment initialization error:', err);
      setError(err.message || t('paymentPage.checkout.genericError', 'Có lỗi xảy ra khi kết nối cổng thanh toán. Vui lòng thử lại.'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (paymentData?.checkoutUrl) {
      navigator.clipboard.writeText(paymentData.checkoutUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {});
    }
  };

  const handleCancelPayment = async () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (paymentData?.paymentId) {
      try {
        await paymentService.cancelPayment(paymentData.paymentId);
      } catch (e) {
        console.warn('Cancel payment error', e);
      }
    }
    setPaymentData(null);
    setIsWaitingWebhook(false);
    setError('');
  };

  return (
    <div className="payment-checkout-page">
      <AppHeader />

      <main className="checkout-page-container">
        {/* Navigation Breadcrumb */}
        <div className="checkout-breadcrumb">
          <Link to="/payment" className="back-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            <span>{t('paymentPage.viewDetails', 'Quay lại chọn gói')}</span>
          </Link>
        </div>

        <div className="checkout-card-main">
          {/* Header */}
          <div className="checkout-card-header">
            <div>
              <h1>
                {isWaitingWebhook
                  ? t('paymentPage.checkout.processingTitle', 'Đang xác nhận thanh toán')
                  : paymentData
                    ? 'Thanh toán qua PayOS'
                    : t('paymentPage.checkout.title', 'Hoàn tất giao dịch mua')}
              </h1>
            </div>
          </div>

          {/* Case 1: ONLY Show Travel Animation Loader when waiting for Webhook / confirming response */}
          {isWaitingWebhook ? (
            <div className="checkout-waiting-view">
              <WayveeTravelLoader
                title="Đang xác nhận giao dịch"
                subtitle="Đang lắng nghe phản hồi từ ngân hàng và kích hoạt tài khoản của bạn..."
                showQR={false}
              />
            </div>
          ) : paymentData ? (
            /* Case 2: Clean QR & Payment Details view when QR is ready */
            <div className="checkout-qr-view">
              <div className="checkout-qr-layout">
                {/* Left Column: QR Code */}
                <div className="qr-container-card">

                  <div className="qr-image-box">
                    {qrImgSrc ? (
                      <img
                        src={qrImgSrc}
                        alt="VietQR PayOS"
                        className="checkout-qr-code"
                        onError={handleQrError}
                      />
                    ) : (
                      <div className="qr-placeholder-spin">
                        <div className="spinner-dot" />
                      </div>
                    )}
                  </div>

                  <p className="qr-scan-guide">
                    {t('paymentPage.loader.qrHint', 'Mở app Ngân hàng hoặc ví điện tử để quét mã VietQR')}
                  </p>
                </div>

                {/* Right Column: Order Details & Actions */}
                <div className="order-details-card">
                  <div className="order-item-header">
                    <span className="order-label">Mã giao dịch</span>
                    <strong className="order-code-val">#{paymentData.paymentId}</strong>
                  </div>

                  <div className="order-item-header">
                    <span className="order-label">Gói dịch vụ</span>
                    <strong>{selectedPlan.name} ({packageLabel})</strong>
                  </div>

                  <div className="order-item-header order-amount-highlight">
                    <span className="order-label">Số tiền thanh toán</span>
                    <strong className="amount-val">{formatPrice(paymentData.amount || total)}</strong>
                  </div>

                  <div className="qr-action-buttons">
                    <button type="button" className="btn-cancel-checkout-red" onClick={handleCancelPayment}>
                      {t('paymentPage.loader.cancelTx', 'Hủy giao dịch / Chọn gói khác')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Case 3: Initial Checkout Order Review & Submit button */
            <div className="checkout-form-view">
              {/* Product Info Card */}
              <div className="checkout-plan-banner">
                <img className="checkout-logo" src={logo} width="100" height="32" alt="Wayvee" />
                <div className="checkout-plan-info">
                  <h2>{selectedPlan.name}</h2>
                  <span className="checkout-trip-badge">{packageLabel}</span>
                </div>
                {selectedPlan.previewOffer && (
                  <span className="checkout-offer-badge">
                    {t('paymentPage.firstTimeOffer', selectedPlan.previewOffer)}
                  </span>
                )}
              </div>

              {/* Price Breakdown */}
              <dl className="checkout-cost-table">
                <div className="cost-row">
                  <dt>
                    <span>{t('paymentPage.checkout.packageFee', 'Phí gói')}</span>
                    <small>{packageLabel}</small>
                  </dt>
                  <dd>
                    {formatPrice(selectedPlan.price)}
                    <span>{t('paymentPage.checkout.perPackage', '/gói')}</span>
                  </dd>
                </div>
                <div className="cost-row cost-row-total">
                  <dt>{t('paymentPage.checkout.totalAmount', 'Tổng số tiền thanh toán')}</dt>
                  <dd className="total-price">{formatPrice(total)}</dd>
                </div>
              </dl>

              {/* Payment Gateway Method */}
              <section className="checkout-gateway-section" aria-labelledby="gateway-heading">
                <h3 id="gateway-heading">
                  {t('paymentPage.checkout.securePayment', 'Phương thức thanh toán bảo mật')}
                </h3>
                <div className="gateway-card">
                  <div className="gateway-icon-wrap">
                    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#0090e7" strokeWidth="2">
                      <rect x="2" y="5" width="20" height="14" rx="3" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                  </div>
                  <div className="gateway-text">
                    <strong>{t('paymentPage.checkout.gatewayDesc', 'Cổng thanh toán PayOS (VietQR / Napas247 / Thẻ ATM & Quốc tế)')}</strong>
                    <p>{t('paymentPage.checkout.autoActivate', 'Tự động kích hoạt gói ngay sau khi quét mã hoặc chuyển khoản')}</p>
                  </div>
                </div>
              </section>

              {/* Error Notice if any */}
              {error && (
                <div className="checkout-alert-error" role="alert">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="checkout-submit-bar">
                <p className="security-note">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  {t('paymentPage.checkout.secureNote', 'Thanh toán bảo mật chuẩn ngân hàng qua cổng PayOS.')}
                </p>

                <button
                  type="button"
                  className="btn-proceed-pay"
                  disabled={loading}
                  onClick={handleStartPayment}
                >
                  {loading
                    ? t('paymentPage.checkout.creatingTx', 'Đang tạo giao dịch...')
                    : t('paymentPage.checkout.payBtn', 'Thanh toán')}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
