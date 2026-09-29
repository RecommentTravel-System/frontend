const cities = { hanoi: [21.0285, 105.8542], danang: [16.0544, 108.2022], hcm: [10.8231, 106.6297] };
const ttl = 10 * 60 * 1000;

export function createWeatherHandler(env, fetchWeather = fetch) {
  const cache = new Map();
  const pending = new Map();
  return async (req, res, next) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname !== '/api/weather') return next();
    const send = (status, body) => { res.statusCode = status; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(body)); };
    if (req.method !== 'GET') return send(405, { error: 'Phương thức không được hỗ trợ.' });
    const city = url.searchParams.get('city');
    const type = url.searchParams.get('type') || 'weather';
    if (!Object.hasOwn(cities, city) || !['weather', 'forecast'].includes(type)) return send(400, { error: 'Thành phố hoặc loại dự báo không hợp lệ.' });
    const key = env.PUBLIC_OPENWEATHER_API_KEY;
    if (!key) return send(503, { error: 'Dịch vụ thời tiết chưa được cấu hình. Quản trị viên cần thêm PUBLIC_OPENWEATHER_API_KEY vào biến môi trường server và triển khai lại.' });
    const base = (env.PUBLIC_OPENWEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5').replace(/\/$/, '');
    if (base !== 'https://api.openweathermap.org/data/2.5') return send(503, { error: 'Địa chỉ OpenWeather không hợp lệ.' });
    const cacheKey = `${city}:${type}`;
    if (cache.has(cacheKey) && Date.now() - cache.get(cacheKey).at < ttl) return send(200, cache.get(cacheKey).data);
    try {
      if (!pending.has(cacheKey)) {
        const task = (async () => {
          const [lat, lon] = cities[city];
          const params = new URLSearchParams({ lat, lon, appid: key, units: 'metric', lang: 'vi' });
          const response = await fetchWeather(`${base}/${type}?${params}`, { signal: AbortSignal.timeout(12000) });
          if (!response.ok) {
            const error = new Error(response.status === 401 ? 'OpenWeather chưa chấp nhận API key. Hãy kiểm tra key hoặc chờ kích hoạt.' : response.status === 429 ? 'Đã đạt giới hạn OpenWeather. Vui lòng thử lại sau.' : 'OpenWeather tạm thời không khả dụng.');
            error.status = response.status === 429 ? 429 : 502; throw error;
          }
          const raw = await response.json();
          const normalize = item => {
            if (!Number.isFinite(item?.main?.temp) || !Number.isFinite(item.dt)) throw new Error('Dữ liệu thời tiết không hợp lệ.');
            return { temp: Math.round(item.main.temp), feelsLike: Number.isFinite(item.main.feels_like) ? Math.round(item.main.feels_like) : null, humidity: item.main.humidity ?? null, description: item.weather?.[0]?.description || '', code: item.weather?.[0]?.id || 800, icon: item.weather?.[0]?.icon || '01d', dt: item.dt };
          };
          const data = type === 'weather' ? normalize(raw) : { list: (Array.isArray(raw.list) ? raw.list : []).map(normalize) };
          if (type === 'forecast' && !data.list.length) throw new Error('Chưa có dữ liệu dự báo.');
          cache.set(cacheKey, { at: Date.now(), data }); return data;
        })();
        pending.set(cacheKey, task);
      }
      const data = await pending.get(cacheKey);
      send(200, data);
    } catch (error) { send(error.status || 502, { error: error.status ? error.message : 'Không tải được thời tiết. Vui lòng thử lại sau.' }); }
    finally { pending.delete(cacheKey); }
  };
}
export function weatherPlugin(env) {
  const handler = createWeatherHandler(env);
  return { name: 'wayvee-weather', configureServer(server) { server.middlewares.use(handler); }, configurePreviewServer(server) { server.middlewares.use(handler); } };
}
