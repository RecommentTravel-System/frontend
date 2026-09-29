import { useEffect, useRef, useState } from 'react';
import logo from '../assets/Icon.jpg';
import { formatPrice } from './plans.js';
import './CheckoutDialog.css';

export default function CheckoutDialog({ plan, onClose }) {
  const dialog = useRef(null);
  const [message, setMessage] = useState('');
  const total = plan.previewTotal ?? plan.price;
  const packageLabel = plan.trips === 1 ? 'Gói 1 lần' : `Gói ${plan.trips} chuyến đi`;

  useEffect(() => {
    if (!dialog.current.open) dialog.current.showModal();
  }, []);

  return (
    <dialog ref={dialog} className="checkout-dialog" aria-labelledby="checkout-title" aria-describedby="checkout-demo-note" onClose={onClose}>
      <div className="checkout-heading">
        <h2 id="checkout-title">Hoàn tất giao dịch mua</h2>
        <form method="dialog"><button type="submit" className="checkout-close" aria-label="Đóng thanh toán">×</button></form>
      </div>

      <div className="checkout-product">
        <img className="checkout-logo" src={logo} width="116" height="37" alt="Wayvee" />
        <div className="checkout-product-name"><h3>Wayvee Premium</h3><p>{packageLabel}</p></div>
        {plan.previewOffer && <span className="checkout-offer">{plan.previewOffer}</span>}
      </div>

      <dl className="checkout-pricing">
        <div className="checkout-package-row"><dt>Phí gói<span>{packageLabel}</span></dt><dd>{formatPrice(plan.price)}<span>/gói</span></dd></div>
        <div className="checkout-total-row"><dt>Tổng số tiền thanh toán</dt><dd>{formatPrice(total)}</dd></div>
      </dl>

      <section className="checkout-method" aria-labelledby="checkout-method-heading">
        <h3 id="checkout-method-heading">Phương thức thanh toán</h3>
        <div className="checkout-card">
          <span className="checkout-card-logo" aria-label="Mastercard"><svg width="34" height="24" viewBox="0 0 34 24" aria-hidden="true"><circle cx="13" cy="12" r="8" fill="#eb001b" /><circle cx="22" cy="12" r="8" fill="#f79e1b" /><path d="M17.5 5.39a8 8 0 0 1 0 13.22 8 8 0 0 1 0-13.22" fill="#ff5f00" /></svg></span>
          <div><p>MasterCard .... 2410</p><span>Ngày hết hạn: 06/2030</span></div>
        </div>
      </section>

      <div className="checkout-actions">
        <div className="checkout-status"><p id="checkout-demo-note">Thông tin thẻ và ưu đãi minh họa.</p><p role="status">{message}</p></div>
        <button type="button" className="checkout-buy" onClick={() => setMessage('Cổng thanh toán chưa được kết nối. Chưa có giao dịch hoặc khoản trừ tiền nào được thực hiện.')}>Mua</button>
      </div>
    </dialog>
  );
}
