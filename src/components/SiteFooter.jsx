import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo.jsx';
import { useAuth } from '../auth/useAuth.js';

const columns = [
  { title: 'Điều hướng', links: [['Trang chủ', '/'], ['Điểm đến đang hot', '/#destinations'], ['Blog du lịch', '/#travel-blog'], ['Đánh giá chuyến đi', '/#trip-reviews'], ['Khám phá ngay', '/#explore']] },
  { title: 'Khám phá', links: [['Địa điểm nổi bật', '/#destinations'], ['Thông tin cá nhân', '/profile'], ['Xu hướng du lịch', '/#travel-blog'], ['Gợi ý theo mùa', '/#destinations']] },
];

export default function SiteFooter() {
  const { user } = useAuth();
  return (
    <footer className="site-footer">
      <div className="site-footer-grid">
        <div className="site-footer-brand"><BrandLogo /><p>Tạo hành trình cá nhân hóa nhanh chóng, dễ dàng và hiệu quả.</p></div>
        {columns.map(({ title, links }) => <nav key={title} aria-label={title}><h2>{title}</h2><ul>{links.filter(([, to]) => to !== '/profile' || user).map(([label, to]) => <li key={label}><Link to={to}>{label}</Link></li>)}</ul></nav>)}
        <nav aria-label="Hỗ trợ"><h2>Hỗ trợ</h2><ul><li><Link to="/support?view=help">Trung tâm hỗ trợ</Link></li><li><Link to="/support?view=chat">Trò chuyện ngay</Link></li><li><Link to="/support?view=feedback">Gửi phản hồi</Link></li><li><a href="mailto:wayvee@gmail.com">Liên hệ chúng tôi</a></li></ul></nav>
        <div className="site-footer-contact"><h2>Liên hệ</h2><address><a href="tel:+84817293860">(+84) 817 293 860</a><a href="mailto:wayvee@gmail.com">wayvee@gmail.com</a></address><a className="site-contact-button" href="mailto:wayvee@gmail.com" aria-label="Gửi email cho Wayvee"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 5h18v14H3ZM3 5l9 7 9-7" /></svg></a></div>
      </div>
      <div className="site-footer-bottom">© {new Date().getFullYear()} Wayvee. All rights reserved.</div>
    </footer>
  );
}
