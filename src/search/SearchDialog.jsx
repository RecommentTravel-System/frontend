import './Search.css';
import { useEffect, useRef, useState } from 'react';
import FormCard from '../components/FormCard.jsx';
import BrandLogo from '../components/BrandLogo.jsx';

export default function SearchDialog({ initialQuery = '', initialPrice = '', onSearch, onClose }) {
  const dialog = useRef(null);
  const [query, setQuery] = useState(initialQuery);
  const [maxPrice, setMaxPrice] = useState(initialPrice);
  useEffect(() => { if (!dialog.current.open) dialog.current.showModal(); }, []);
  return <dialog ref={dialog} className="search-dialog" aria-labelledby="search-dialog-title" onClose={onClose}><FormCard title="Tìm kiếm địa điểm" titleId="search-dialog-title" onClose={() => dialog.current.close()}><div className="auth-brand"><BrandLogo /></div><h1>Bạn muốn khám phá đâu?</h1><form className="login-form" onSubmit={event => { event.preventDefault(); onSearch({ q: query.trim(), maxPrice }); }}><div className="field-group"><label htmlFor="search-destination">Địa điểm hoặc tên nơi lưu trú</label><input id="search-destination" value={query} onChange={event => setQuery(event.target.value)} placeholder="Ví dụ: Hà Nội, Đà Nẵng, cà phê…" maxLength={150} autoComplete="off" /></div><div className="field-group"><label htmlFor="search-budget">Ngân sách tối đa (VNĐ)</label><input id="search-budget" type="number" min="0" step="1000" value={maxPrice} onChange={event => setMaxPrice(event.target.value)} placeholder="Không giới hạn" /></div><button type="submit" className="primary-btn">Tìm kiếm</button></form><p className="search-demo-note">Tìm kiếm trên danh sách địa điểm minh họa.</p></FormCard></dialog>;
}
