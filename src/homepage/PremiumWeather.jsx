import { useEffect, useId, useRef, useState } from 'react';
import './PremiumWeather.css';

const cities = [{ id: 'hanoi', name: 'Hà Nội' }, { id: 'danang', name: 'TP. Đà Nẵng' }, { id: 'hcm', name: 'TP. Hồ Chí Minh' }];
const clientCache = new Map();
async function getWeather(city, type, signal) {
  const key = `${city}:${type}`;
  const cached = clientCache.get(key);
  if (cached && Date.now() - cached.at < 600000) return cached.data;
  const response = await fetch(`/api/weather?city=${city}&type=${type}`, { signal });
  let data;
  try { data = await response.json(); } catch { throw new Error('Dịch vụ thời tiết chưa sẵn sàng. Hãy kiểm tra server.'); }
  if (!response.ok) throw new Error(data.error || 'Không thể tải thời tiết.');
  clientCache.set(key, { data, at: Date.now() }); return data;
}
function useWeather(city, type) {
  const [state, setState] = useState({ loading: true, data: null, error: '' });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    getWeather(city, type, controller.signal).then(data => { if (!controller.signal.aborted) setState({ loading: false, data, error: '' }); }).catch(error => { if (!controller.signal.aborted) setState({ loading: false, data: null, error: error.message }); });
    return () => controller.abort();
  }, [city, type, retry]);
  return { ...state, retry: () => { setState({ loading: true, data: null, error: '' }); setRetry(value => value + 1); } };
}
function WeatherIcon({ data }) {
  const id = useId();
  const code = data?.code || 800;
  const night = data?.icon?.endsWith('n');
  return <svg className="premium-weather-icon" viewBox="0 0 120 90" aria-hidden="true"><defs><linearGradient id={id} x2="0" y2="1"><stop stopColor="#fff"/><stop offset="1" stopColor="#a1d3f2"/></linearGradient></defs>{code === 800 ? (night ? <path d="M75 10a32 32 0 1 0 20 54A35 35 0 0 1 75 10" fill="#fff3bd" /> : <g stroke="#ffbc28" strokeWidth="4" strokeLinecap="round"><circle cx="60" cy="43" r="22" fill="#ffd35b" />{[0,45,90,135,180,225,270,315].map(angle => <path key={angle} d="M60 8v-5" transform={`rotate(${angle} 60 43)`}/>)}</g>) : <><path d="M27 68C4 68 5 39 28 39c0-19 19-28 32-17 15-25 44-9 40 14 25 6 22 32-1 32Z" fill={`url(#${id})`} />{code < 600 && <g stroke="#bae4ff" strokeWidth="4" strokeLinecap="round"><path d="m35 77-4 7m30-7-4 7m29-7-4 7"/></g>}{code >= 600 && code < 700 && <text x="38" y="88" fill="white" fontSize="20">❄ ❄</text>}</>}</svg>;
}
const time = timestamp => new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(timestamp * 1000));
function ForecastDialog({ city, current, onClose }) {
  const ref = useRef(null);
  const [openedAt] = useState(() => Date.now());
  const forecast = useWeather(city.id, 'forecast');
  useEffect(() => { if (!ref.current.open) ref.current.showModal(); }, []);
  const upcoming = forecast.data?.list.filter(item => item.dt * 1000 > openedAt).slice(0, 4) || [];
  return <dialog ref={ref} className="premium-weather-dialog" aria-labelledby="weather-dialog-title" onClose={onClose}><div className="weather-detail-top"><button className="weather-close" aria-label="Đóng" onClick={() => ref.current.close()}>×</button><h3 id="weather-dialog-title">⌖ {city.name}</h3><p>{new Intl.DateTimeFormat('vi-VN', { dateStyle: 'full', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(current.dt * 1000))}</p><strong>{current.temp}°</strong><span>{current.description}</span><small>Cảm giác như {current.feelsLike ?? '—'}° · Độ ẩm {current.humidity ?? '—'}%</small></div><div className="weather-detail-bottom"><h4>Dự báo các giờ tới</h4><p className="weather-interval">Cách nhau 3 giờ · Giờ Việt Nam</p>{forecast.loading ? <p role="status">Đang tải dự báo…</p> : forecast.error ? <div role="alert"><p>{forecast.error}</p><button onClick={forecast.retry}>Thử lại</button></div> : upcoming.length ? <div className="weather-hours">{upcoming.map(item => <div key={item.dt}><WeatherIcon data={item} /><time>{time(item.dt)}<small>{new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(item.dt * 1000))}</small></time><strong>{item.temp}°</strong><span>{item.description}</span></div>)}</div> : <p>Chưa có mốc dự báo tiếp theo.</p>}</div></dialog>;
}
function CityWeather({ city }) {
  const weather = useWeather(city.id, 'weather');
  const [open, setOpen] = useState(false);
  return <><article className={`premium-weather-card${weather.data?.icon.endsWith('n') ? ' is-night' : ''}`}><div className="weather-card-top"><span>{weather.data ? (weather.data.icon.endsWith('n') ? 'Night' : 'Day') : 'Thời tiết'}</span><button disabled={!weather.data} aria-label={`Xem dự báo ${city.name}`} onClick={() => setOpen(true)}>•••</button></div>{weather.loading ? <div className="weather-card-status" role="status">Đang tải…</div> : weather.error ? <div className="weather-card-status" role="alert"><p>{weather.error}</p><button onClick={weather.retry}>Thử lại</button></div> : <button className="weather-card-content" onClick={() => setOpen(true)} aria-label={`${city.name}: ${weather.data.temp} độ C, ${weather.data.description}. Xem dự báo.`}><WeatherIcon data={weather.data} /><strong>{weather.data.temp}<sup>°</sup></strong><span>{weather.data.description}</span></button>}<h3>{city.name}</h3>{weather.data && <small className="weather-updated">Cập nhật {time(weather.data.dt)}</small>}</article>{open && weather.data && <ForecastDialog city={city} current={weather.data} onClose={() => setOpen(false)} />}</>;
}
export default function PremiumWeather() {
  return <section className="premium-weather" aria-labelledby="premium-weather-heading"><h2 id="premium-weather-heading">Thời tiết hôm nay</h2><div className="premium-weather-grid">{cities.map(city => <CityWeather key={city.id} city={city} />)}</div><p className="weather-attribution">Dữ liệu từ <a href="https://openweathermap.org/" target="_blank" rel="noreferrer">OpenWeather</a> · Nhấn vào thẻ để xem dự báo</p></section>;
}
