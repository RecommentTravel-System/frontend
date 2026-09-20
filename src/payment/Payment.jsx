import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';
import AccountSidebar from '../components/AccountSidebar.jsx';
import SiteHeader from '../components/SiteHeader.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { plans, formatPrice } from './plans.js';
import './Payment.css';
import CheckoutDialog from './CheckoutDialog.jsx';

export default function Payment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showDiscount, setShowDiscount] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountError, setDiscountError] = useState('');
  const [notice, setNotice] = useState('');
  const discountInput = useRef(null);

  useEffect(() => {
    if (showDiscount) discountInput.current?.focus();
  }, [showDiscount]);

  function choosePlan(plan) {
    if (!user) {
      navigate('/login', { state: { from: '/payment' } });
      return;
    }
    setSelectedPlan(plan);
  }

  function applyDiscount(event) {
    event.preventDefault();
    setDiscountError(discountCode.trim()
      ? 'Chưa thể xác thực mã giảm giá. Vui lòng thử lại khi dịch vụ được kết nối.'
      : 'Vui lòng nhập mã giảm giá.');
  }

  return (
    <div className="payment-page">
      <SiteHeader />
      <main className="account-layout payment-layout">
        <AccountSidebar onNotice={setNotice} />
        <section className="payment-content" aria-labelledby="payment-heading">
          <header className="payment-intro">
            <h1 id="payment-heading">Premium</h1>
            <p>Quản lý thanh toán và nâng cấp gói Premium để tận hưởng trải nghiệm tốt hơn.</p>
          </header>
          <div className="payment-welcome">
            <h2>Sử dụng Wayvee trọn vẹn hơn.</h2>
            <p>Trải nghiệm Wayvee Premium với đa dạng tính năng hơn.</p>
          </div>
          <section className="payment-plans" aria-labelledby="payment-plans-heading">
            <div className="payment-plans-heading">
              <h2 id="payment-plans-heading">Wayvee Premium</h2>
              <p>Mở khóa thêm nhiều gợi ý địa điểm và nhiều tính năng thú vị hơn.</p>
            </div>
            <div className="payment-plan-grid">
              {plans.map((plan, index) => (
                <article key={plan.id} className={`payment-plan${index === 0 ? ' payment-plan-featured' : ''}`}>
                  <h3>{plan.name}</h3>
                  <div className="payment-plan-details">
                    <span>Giá gói</span>
                    <p className="payment-plan-price">{formatPrice(plan.price)}<span> / {plan.trips === 1 ? '1 chuyến đi' : 'gói'}</span></p>
                    {index === 0 && <p className="payment-plan-caption">Khởi đầu hành trình của riêng bạn</p>}
                  </div>
                  <button type="button" onClick={() => choosePlan(plan)} aria-label={`Trải nghiệm ngay — ${plan.name}`}>Trải nghiệm ngay</button>
                </article>
              ))}
            </div>
          </section>
          <section className="payment-discounts" aria-labelledby="payment-discount-heading">
            <div className="payment-section-divider" />
            <h2 id="payment-discount-heading">Mã giảm giá</h2>
            <div className="payment-discount-count"><span>Mã của bạn</span><span aria-label="0 mã giảm giá">0</span></div>
            <div className="payment-discount-action"><button type="button" aria-expanded={showDiscount} aria-controls="payment-discount-form" onClick={() => { setShowDiscount(!showDiscount); setDiscountError(''); }}>{showDiscount ? 'Đóng' : 'Thêm mã giảm giá'}</button></div>
            <form id="payment-discount-form" className="payment-discount-form" onSubmit={applyDiscount} hidden={!showDiscount}>
              <label htmlFor="payment-discount-code">Nhập mã giảm giá</label>
              <div className="payment-discount-input-row"><input id="payment-discount-code" ref={discountInput} value={discountCode} onChange={event => { setDiscountCode(event.target.value); setDiscountError(''); }} placeholder="Mã giảm giá của bạn" maxLength={64} autoComplete="off" aria-invalid={Boolean(discountError)} aria-describedby={discountError ? 'payment-discount-error' : undefined} /><button type="submit">Áp dụng</button></div>
              <p id="payment-discount-error" className="payment-feedback" role="alert">{discountError}</p>
            </form>
            <div className="payment-section-divider" />
          </section>
          <p className="payment-notice" role="status">{notice}</p>
        </section>
      </main>
      <SiteFooter />
      {selectedPlan && <CheckoutDialog plan={selectedPlan} onClose={() => setSelectedPlan(null)} />}
    </div>
  );
}
