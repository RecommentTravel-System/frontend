import { useState } from 'react';
import SiteHeader from '../components/SiteHeader.jsx';
import AccountSidebar from '../components/AccountSidebar.jsx';
import CheckoutDialog from './CheckoutDialog.jsx';
import { plans, formatPrice } from './plans.js';
import '../components/SiteLayout.css';
import './Payment.css';

export default function Payment() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [notice, setNotice] = useState('');

  return (
    <div className="payment-page">
      <SiteHeader />
      <main className="payment-layout">
        <AccountSidebar onNotice={setNotice} />
        <section className="payment-content" aria-labelledby="payment-title">
          <header className="payment-summary">
            <div><h1 id="payment-title">Wayvee Premium</h1><p>Gói 1 lần</p></div>
            <button type="button" className="payment-link" aria-expanded={showDetails} aria-controls="premium-details" onClick={() => setShowDetails(!showDetails)}>Xem chi tiết</button>
          </header>
          <div className="payment-intro">
            <h2>Sử dụng Wayvee trọn vẹn hơn.</h2>
            <p>Trải nghiệm Wayvee Premium với đa dạng tính năng hơn.</p>
          </div>
          {showDetails && <section id="premium-details" className="payment-details"><h2>Khám phá cùng Wayvee Premium</h2><p>Lựa chọn gói theo số chuyến đi bạn muốn lên kế hoạch. Xem thông tin gói và tổng số tiền trước khi mua.</p></section>}
          <section className="payment-packages" aria-labelledby="packages-title">
            <div className="payment-packages-heading"><h2 id="packages-title">Wayvee Premium</h2><p>Mở khóa thêm nhiều gợi ý địa điểm và nhiều tính năng thú vị hơn.</p></div>
            <div className="payment-plan-grid">
              {plans.map((plan, index) => <article key={plan.id} className={`payment-plan${index === 0 ? ' payment-plan-featured' : ''}`}>
                <h3>{plan.name}</h3>
                <p className="payment-plan-label">Gói {plan.trips} lần</p>
                <p className="payment-plan-price"><strong>{formatPrice(plan.previewTotal ?? plan.price)}/{plan.trips === 1 ? 'lần' : 'gói'}</strong>{plan.previewTotal != null && <del>{formatPrice(plan.price)}/lần</del>}</p>
                <p className="payment-plan-offer">{plan.previewOffer ? 'Khuyến mãi lần đầu trải nghiệm!' : '\u00a0'}</p>
                <button type="button" onClick={() => setSelectedPlan(plan)} aria-label={`Trải nghiệm ngay: ${plan.name}`}>Trải nghiệm ngay</button>
              </article>)}
            </div>
          </section>
          <section className="payment-coupons" aria-labelledby="coupon-title">
            <h2 id="coupon-title">Mã giảm giá</h2>
            <div className="payment-coupon-count"><span>Mã của bạn</span><span>0</span></div>
            <div className="payment-coupon-actions"><button type="button" className="payment-link" aria-expanded={showCoupon} aria-controls="payment-coupon-form" onClick={() => { setShowCoupon(!showCoupon); setNotice(''); }}>Thêm mã giảm giá</button></div>
            {showCoupon && <form id="payment-coupon-form" className="payment-coupon-form" onSubmit={event => { event.preventDefault(); setNotice(coupon.trim() ? 'Chức năng xác thực mã giảm giá chưa được kết nối. Mã chưa được áp dụng.' : 'Vui lòng nhập mã giảm giá.'); }}>
              <label htmlFor="payment-coupon">Nhập mã giảm giá</label>
              <div><input id="payment-coupon" value={coupon} maxLength={64} onChange={event => setCoupon(event.target.value)} placeholder="Nhập mã của bạn" required /><button type="submit">Áp dụng</button></div>
            </form>}
            <p className="payment-notice" role="status">{notice}</p>
          </section>
        </section>
      </main>
      {selectedPlan && <CheckoutDialog plan={selectedPlan} onClose={() => setSelectedPlan(null)} />}
    </div>
  );
}
