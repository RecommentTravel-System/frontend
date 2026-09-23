# Premium weather preview

Home has a temporary Free/Premium toggle. It only switches the preview UI; it does not change account billing or subscriptions. The selection is saved locally as `wayvee-home-preview`.

Server environment in `.env.local`:

```
PUBLIC_OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/2.5
PUBLIC_OPENWEATHER_API_KEY=your-key
```

Restart Vite after editing environment settings. Despite the PUBLIC prefix supplied for this integration, these settings are read by Node only; they are not exposed to Vite client code.

The weather plugin exposes `GET /api/weather?city=hanoi&type=weather` and `type=forecast`. Supported cities: `hanoi`, `danang`, `hcm`. Responses are cached for 10 minutes; concurrent identical requests share one upstream request. Requests use metric units and Vietnamese descriptions. Forecast data uses 3-hour intervals, displayed in Vietnam time, including dates when the forecast crosses midnight.

The middleware runs with `npm run dev` and `npm run preview`. Vercel uses the included `api/weather.js` server function, sharing the same handler. `vercel.json` serves API routes before the React SPA fallback, so direct links and reloads on `/search`, `/profile`, etc. work too.

## Deploy on Vercel

1. Import `duclase184612-collab/WayVee`, branch `main`. Keep Root Directory at the repository root and use the Vite preset.
2. Open Project Settings → Environment Variables. Set `PUBLIC_OPENWEATHER_API_KEY` to your OpenWeather key for **Production** and **Preview**. Optionally set `PUBLIC_OPENWEATHER_BASE_URL` to `https://api.openweathermap.org/data/2.5` (this is already the server default).
3. Redeploy after saving the variables. `.env.local` is intentionally not in Git, and Vercel does not receive local machine variables automatically.
4. Check `/api/weather?city=hanoi&type=weather` and `/api/weather?city=hanoi&type=forecast` on the deployed domain: both should return JSON. Test `danang` and `hcm` too.
5. Switch Home to Premium. All visitors can use the preview toggle; no login is required for weather. The preview choice is local to each visitor and starts as Free.

Missing configuration returns 503; an invalid/unactivated upstream key returns 502 with an explanatory message; an upstream rate limit returns 429. Do not put the key in `VITE_*`, source code, or `vercel.json`. On other static-only hosts, deploy the same handler in a Node backend.

Official API references: https://openweathermap.org/current and https://openweathermap.org/forecast5.
