import BrandLogo from '../components/BrandLogo.jsx';
import './PremiumSearch.css';

export default function SearchLoading() {
  return <main className="premium-search-loading" role="status" aria-label="Đang tải tìm kiếm"><div><BrandLogo /><p>The way we vivu</p><span className="search-loading-spinner" /><p>Đang tải tìm kiếm…</p></div></main>;
}
