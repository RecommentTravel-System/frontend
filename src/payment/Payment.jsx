import { useState } from 'react';
import './Payment.css';

const plans = [
  {
    name: 'Daily',
    price: 10000,
    duration: '1 ngày',
  },
  {
    name: 'Monthly',
    price: 99000,
    duration: '1 tháng',
  },
  {
    name: 'Yearly',
    price: 499000,
    duration: '1 năm',
  },
];

export default function Payment() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showQR, setShowQR] = useState(false);

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN').format(price) + 'đ';

  return (
    <div className="payment-page">
      {!showQR ? (
        <>
          <h1>WAYVEE Premium</h1>
          <p>Chọn gói sử dụng</p>

          <div className="plans">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`plan ${
                  selectedPlan?.name === plan.name ? 'selected' : ''
                }`}
                onClick={() => setSelectedPlan(plan)}
              >
                <h2>{plan.name}</h2>

                <div className="price">
                  {formatPrice(plan.price)}
                </div>

                <p>{plan.duration}</p>

                <button>
                  {selectedPlan?.name === plan.name
                    ? 'Đã chọn ✓'
                    : 'Chọn gói'}
                </button>
              </div>
            ))}
          </div>

          {selectedPlan && (
            <button
              className="pay-button"
              onClick={() => setShowQR(true)}
            >
              Thanh toán {formatPrice(selectedPlan.price)}
            </button>
          )}
        </>
      ) : (
        <div className="qr-page">
          <button
            className="back-button"
            onClick={() => setShowQR(false)}
          >
            ← Quay lại
          </button>

          <h1>Thanh toán</h1>

          <h2>{selectedPlan.name}</h2>

          <div className="qr">
            <img
              src={`https://img.vietqr.io/image/970422-0000000000-compact2.png?amount=${selectedPlan.price}&addInfo=WAYVEE`}
              alt="QR Code"
            />
          </div>

          <h2>{formatPrice(selectedPlan.price)}</h2>

          <p>Quét mã QR để thanh toán</p>

          <div className="bank-info">
            <p>Ngân hàng: MB Bank</p>
            <p>Số tài khoản: 0000000000</p>
            <p>Nội dung: WAYVEE</p>
          </div>
        </div>
      )}
    </div>
  );
}