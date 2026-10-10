import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/Icon.jpg';
import { formatPrice } from './plans.js';
import { paymentService } from './paymentService.js';
import WayveeTravelLoader from './WayveeTravelLoader.jsx';
import { useTranslation } from '../providers/i18n-provider.jsx';
import './CheckoutDialog.css';

export default function CheckoutDialog({ plan, onClose }) {
  const dialog = useRef(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null); // { paymentId, checkoutUrl, qrCode, amount, paymentLinkId }
  const pollingRef = useRef(null);

  const total = plan.previewTotal ?? plan.price;
  const packageLabel = plan.trips === 1
    ? t('paymentPage.oneTimePlan', 'Gói 1 lần')
    : t('paymentPage.packageLabel', { count: plan.trips, defaultValue: `Gói ${plan.trips} lần` });

  useEffect(() => {
    if (dialog.current && !dialog.current.open) {
      dialog.current.showModal();
    }
  }, []);

  // Polling webhook status when paymentData is present
  useEffect(() => {
    if (!paymentData?.paymentId) return;

    const checkStatus = async () => {
      try {
        const res = await paymentService.getPaymentStatus(paymentData.paymentId);
        const status = res?.status;
        if (status === 'PAID') {
          clearInterval(pollingRef.current);
          if (dialog.current?.open) {
            dialog.current.close();
          }
          navigate('/payment/success', {
            state: {
              orderCode: paymentData.paymentId,
              planName: plan.name,
              amount: paymentData.amount || total,
              transactionCode: res?.transactionCode,
              paidAt: res?.paidAt,
            },
          });
        } else if (status === 'CANCELLED' || status === 'FAILED') {
          clearInterval(pollingRef.current);
          setError(t('paymentPage.checkout.cancelledOrFailed', 'Giao dịch đã bị hủy hoặc không thành công.'));
          setPaymentData(null);
        }
      } catch (err) {
        console.error('Error polling payment status:', err);
      }
    };

    // Poll every 2.5 seconds
    pollingRef.current = setInterval(checkStatus, 2500);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [paymentData, navigate, plan.name, total, t]);

  const handleStartPayment = async () => {
    setError('');
    setLoading(true);

    try {
      // 1. Create Subscription
      const subRes = await paymentService.createSubscription({
        planName: plan.name,
        planType: 'PREMIUM',
        price: total,
      });

      const subscriptionId = subRes?.subscriptionId || subRes?.id;
      if (!subscriptionId) {
        throw new Error(t('paymentPage.checkout.subError', 'Không thể khởi tạo gói đăng ký. Vui lòng đăng nhập lại.'));
      }

      // 2. Create PayOS Payment Link
      const payRes = await paymentService.createPaymentLink(subscriptionId);
      if (!payRes || (!payRes.checkoutUrl && !payRes.paymentId)) {
        throw new Error(t('paymentPage.checkout.linkError', 'Không thể khởi tạo liên kết thanh toán PayOS.'));
      }

      setPaymentData({
        paymentId: payRes.paymentId,
        checkoutUrl: payRes.checkoutUrl,
        qrCode: payRes.qrCode,
        amount: payRes.amount || total,
        paymentLinkId: payRes.paymentLinkId,
      });
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || t('paymentPage.checkout.genericError', 'Có lỗi xảy ra khi kết nối cổng thanh toán. Vui lòng thử lại.'));
    } finally {
      setLoading(false);
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
    setError('');
  };

  return (
    <dialog
      ref={dialog}
      className={`checkout-dialog ${paymentData ? 'checkout-dialog-loading' : ''}`}
      aria-labelledby="checkout-title"
      onClose={onClose}
    >
      <div className="checkout-heading">
        <h2 id="checkout-title">
          {paymentData
            ? t('paymentPage.checkout.processingTitle', 'Đang thực hiện thanh toán')
            : t('paymentPage.checkout.title', 'Hoàn tất giao dịch mua')}
        </h2>
        <button
          type="button"
          className="checkout-close"
          aria-label={t('paymentPage.checkout.closeLabel', 'Đóng thanh toán')}
          onClick={() => {
            handleCancelPayment();
            if (dialog.current) dialog.current.close();
            onClose();
          }}
        >
          ×
        </button>
      </div>

      {/* When waiting for payment / webhook */}
      {paymentData ? (
        <WayveeTravelLoader
          title={t('paymentPage.loader.title', 'Đang chờ xác nhận thanh toán')}
          subtitle={t('paymentPage.loader.subtitle', 'Vui lòng quét mã QR ngân hàng hoặc nhấn nút bên dưới để thanh toán qua PayOS.')}
          showQR={true}
          qrCode={paymentData.qrCode}
          checkoutUrl={paymentData.checkoutUrl}
          amount={paymentData.amount}
          orderCode={paymentData.paymentId}
          onCancel={handleCancelPayment}
        />
      ) : (
        /* Standard Order Summary & Action */
        <>
          <div className="checkout-product">
            <img className="checkout-logo" src={logo} width="116" height="37" alt="Wayvee" />
            <div className="checkout-product-name">
              <h3>Wayvee Premium</h3>
              <p>{packageLabel}</p>
            </div>
            {plan.previewOffer && (
              <span className="checkout-offer">
                {t('paymentPage.firstTimeOffer', plan.previewOffer)}
              </span>
            )}
          </div>

          <dl className="checkout-pricing">
            <div className="checkout-package-row">
              <dt>
                {t('paymentPage.checkout.packageFee', 'Phí gói')}
                <span>{packageLabel}</span>
              </dt>
              <dd>
                {formatPrice(plan.price)}
                <span>{t('paymentPage.checkout.perPackage', '/gói')}</span>
              </dd>
            </div>
            <div className="checkout-total-row">
              <dt>{t('paymentPage.checkout.totalAmount', 'Tổng số tiền thanh toán')}</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>

          <section className="checkout-method" aria-labelledby="checkout-method-heading">
            <h3 id="checkout-method-heading">
              {t('paymentPage.checkout.securePayment', 'Phương thức thanh toán bảo mật')}
            </h3>
            <div className="checkout-gateway-badge">
              <div className="gateway-icon-payos">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#0090e7" strokeWidth="2">
                  <rect x="2" y="5" width="20" height="14" rx="3" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <div className="gateway-details">
                <p>{t('paymentPage.checkout.gatewayDesc', 'Cổng thanh toán PayOS (VietQR / Napas247 / Thẻ ATM & Quốc tế)')}</p>
                <span>{t('paymentPage.checkout.autoActivate', 'Tự động kích hoạt gói ngay sau khi quét mã hoặc chuyển khoản')}</span>
              </div>
            </div>
          </section>

          <div className="checkout-actions">
            <div className="checkout-status">
              <p id="checkout-demo-note">{t('paymentPage.checkout.secureNote', 'Thanh toán bảo mật chuẩn ngân hàng qua cổng PayOS.')}</p>
              {error && <p className="checkout-error" role="alert">{error}</p>}
            </div>
            <button
              type="button"
              className="checkout-buy"
              disabled={loading}
              onClick={handleStartPayment}
            >
              {loading
                ? t('paymentPage.checkout.creatingTx', 'Đang tạo giao dịch...')
                : t('paymentPage.checkout.payBtn', 'Thanh toán')}
            </button>
          </div>
        </>
      )}
    </dialog>
  );
}
