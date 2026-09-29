# frontend

## Development

## Backend API configuration

Set `VITE_API_URL=https://backend-0xea.onrender.com` in `.env.local` for local builds,
and in Vercel Project Settings → Environment Variables for Production (and Preview if used).
Redeploy after changing the variable: Vite embeds its value at build time.
Do not append `/wayvee` or `/api` to the Render base URL. Restart Vite after changing local environment files.

`src/shared/lib/api.js` is the shared fetch wrapper for authentication, users,
categories, reviews, favorites, analytics, trips, location image uploads and reverse geocoding.
It reads only `VITE_API_URL`; the old `VITE_API_BASE_URL` variable is no longer used.
There is no localhost fallback. Missing configuration produces an explicit error before sending a request.
Login calls `/api/auth/login`. Protected requests retain the existing `wayvee_token`
Bearer header and expired-session behavior; multipart uploads keep their browser-generated boundary.

Separate services keep their existing destinations: `/api/weather` is a Vercel function,
avatar signing `/api/avatar/sign` is currently a Node development middleware (not deployed
as a Vercel function), Cloudinary receives signed avatar uploads, and Nominatim supplies map search.
The Render location-image upload `/api/v1/locations/images` uses the shared wrapper.
Avatar signing requires its own production deployment; do not redirect it to an unimplemented Render endpoint.

The backend must allow the deployed frontend origin via CORS, including OPTIONS preflight,
GET/POST/PUT/PATCH/DELETE and the Authorization and Content-Type request headers.
No secrets belong in `VITE_*` variables. Keep `.env.local` ignored by Git.

## Running locally

Run `npm install` and `npm run dev`. Routes: `/`, `/login`, `/register`, `/profile`, `/payment`.
The old `/#profile` link redirects to `/profile`.

## Demo sign-in

Flow-test mode: click Continue on Login to enter /profile immediately. Email and password are optional and are not checked. This creates a demo@wayvee.test session, retained across refreshes in the same tab when sessionStorage is available. Logout clears the session. The credential-based adapter remains available for later integration but is not used by Continue.

## Shared layout and routing

Home, Profile and Payment share `SiteHeader`, `SiteFooter`, and `SiteLayout.css` under `src/components`.
Profile and Payment share `AccountSidebar` and `AccountLayout.css` with route-aware active navigation.
All brand logos use the original `src/assets/Icon.jpg` without recoloring or distortion.
Footer contact details live in `SiteFooter.jsx`; destination links navigate to Home sections.
Routing uses React Router with browser history. Configure the production host to serve `index.html` for unknown application paths so refreshing `/profile` or `/login` works.

## Payment UI

`src/payment/Payment.jsx` presents the 1-, 2- and 10-trip packages, discount-code entry and an order-summary dialog.
Display prices are configured in `src/payment/plans.js`. Guests can view packages; selecting one sends them to Login and returns to Payment after signing in.
`CheckoutDialog.jsx` matches the checkout mockup, using the original logo and sample Mastercard ending in 2410. The single-trip preview displays a 35,000 VND fee and a 28,000 VND introductory total; these are demo values in `plans.js`, not an eligibility decision or a real card on file.
Payment and coupon validation APIs are not connected. The UI does not generate a bank transfer QR code, charge money or claim successful payment. Clicking “Mua” explains that payment is not connected.

## Itineraries

Signed-in users can open `/itineraries` from the account sidebar. Filters use `?status=all`, `ongoing`, `completed`, or `cancelled`; each trip links to `/itineraries/:tripId` and preserves its list filter on return.
`src/itineraries/trips.js` contains two illustrative trips, not real bookings. Completed and cancelled filters demonstrate the empty state. Trip details include destinations, participants, amenities and a schematic map that links to Google Maps.
“Xuất PDF” opens the browser print dialog; choose Save as PDF. Print styles exclude the navigation and footer.

## Favorites

`/favorites` and `/favorites/:collectionId` require login. The first visit shows three sample collections matching the UI mockup. Data and photos are illustrative; saved changes are persisted per account under `wayvee-favorites:<email>` in localStorage.
Use “Thêm mục yêu thích” to create a named collection and select places, or edit a collection to add places. Heart buttons remove places. Empty collections show the empty state; deleting all collections shows the main empty state. Sharing sends or copies the list text, since these local collections do not have public URLs.

## Reviews

`/reviews` requires login and is linked from “Bài đánh giá” in the account sidebar. Three sample review cards show posted, rejected and pending states, scores, positive/negative comments, helpful counts and a sample property response.
All review content, moderation states, counts, replies and photos are illustrative. The card menu supports local edits and deletion; changes are stored per account under `wayvee-reviews:<email>`. Edited reviews become pending and clear the previous sample reply/helpful count. Removing all reviews displays the empty state. No review is submitted externally.

## Validation

- `npm run build`
- `npm run lint`
- `npm test` (demo authentication tests)
