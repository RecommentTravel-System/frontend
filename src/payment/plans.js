// Display prices from the mockup; replace with the product catalog API when connected.
export const plans = [
  { id: 'single', name: '1 chuyến đi', trips: 1, price: 35000, previewTotal: 28000, previewOffer: 'Lần đầu trải nghiệm', description: 'Tạo một lịch trình cá nhân hóa cho chuyến đi của bạn.' },
  { id: 'duo', name: 'Combo 2 chuyến đi', trips: 2, price: 78000, description: 'Lên kế hoạch cho hai chuyến đi theo cách riêng.' },
  { id: 'ten', name: 'Combo 10 chuyến đi', trips: 10, price: 350000, description: 'Khám phá nhiều hơn cùng mười hành trình mới.' },
];

export const formatPrice = value => `${new Intl.NumberFormat('vi-VN').format(value)} đ`;
