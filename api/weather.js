import { createWeatherHandler } from '../server/weather.js';

// Vercel runs this on the server; environment values never enter the client bundle.
const handler = createWeatherHandler(process.env);
export default function weather(req, res) {
  return handler(req, res, () => {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Không tìm thấy API thời tiết.' }));
  });
}
