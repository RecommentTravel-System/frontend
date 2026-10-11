import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo.jsx';
import { useAuth } from '../auth/useAuth.js';
import { useTranslation } from '../providers/i18n-provider.jsx';

export default function SiteFooter() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const columns = [
    {
      title: t('footer.navigation', 'Điều hướng'),
      links: [
        [t('footer.links.home', 'Trang chủ'), '/'],
        [t('footer.links.hotDestinations', 'Điểm đến đang hot'), '/#destinations'],
        [t('footer.links.blog', 'Blog du lịch'), '/#travel-blog'],
        [t('footer.links.tripReviews', 'Đánh giá chuyến đi'), '/#trip-reviews'],
        [t('footer.links.exploreNow', 'Khám phá ngay'), '/#explore'],
      ],
    },
    {
      title: t('footer.explore', 'Khám phá'),
      links: [
        [t('footer.links.featuredPlaces', 'Địa điểm nổi bật'), '/#destinations'],
        [t('nav.profile', 'Thông tin cá nhân'), '/profile'],
        [t('footer.links.travelTrends', 'Xu hướng du lịch'), '/#travel-blog'],
        [t('footer.links.seasonalSuggestions', 'Gợi ý theo mùa'), '/#destinations'],
      ],
    },
  ];

  return (
    <footer className="site-footer">
      <div className="site-footer-grid">
        <div className="site-footer-brand">
          <BrandLogo />
          <p>{t('footer.description', 'Tạo hành trình cá nhân hóa nhanh chóng, dễ dàng và hiệu quả.')}</p>
        </div>
        {columns.map(({ title, links }) => (
          <nav key={title} aria-label={title}>
            <h2>{title}</h2>
            <ul>
              {links
                .filter(([, to]) => to !== '/profile' || user)
                .map(([label, to]) => (
                  <li key={label}>
                    <Link to={to}>{label}</Link>
                  </li>
                ))}
            </ul>
          </nav>
        ))}
        <nav aria-label={t('footer.support', 'Hỗ trợ')}>
          <h2>{t('footer.support', 'Hỗ trợ')}</h2>
          <ul>
            <li><Link to="/support?view=help">{t('footer.links.supportCenter', 'Trung tâm hỗ trợ')}</Link></li>
            <li><Link to="/support?view=chat">{t('footer.links.chatNow', 'Trò chuyện ngay')}</Link></li>
            <li><Link to="/support?view=feedback">{t('footer.links.sendFeedback', 'Gửi phản hồi')}</Link></li>
            <li><a href="mailto:wayvee@gmail.com">{t('footer.links.contactUs', 'Liên hệ chúng tôi')}</a></li>
          </ul>
        </nav>
        <div className="site-footer-contact">
          <h2>{t('footer.contact', 'Liên hệ')}</h2>
          <address>
            <a href="tel:+84817293860">(+84) 817 293 860</a>
            <a href="mailto:wayvee@gmail.com">wayvee@gmail.com</a>
          </address>
          <a className="site-contact-button" href="mailto:wayvee@gmail.com" aria-label="Gửi email cho Wayvee">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M3 5h18v14H3ZM3 5l9 7 9-7" />
            </svg>
          </a>
        </div>
      </div>
      <div className="site-footer-bottom">
        © {new Date().getFullYear()} Wayvee. {t('footer.rights', 'All rights reserved.')}
      </div>
    </footer>
  );
}
