# Avatar upload during flow testing

1. Rotate the API secret that was shared in chat.
2. In the project root, create `.env.local` containing `CLOUDINARY_URL=cloudinary://YOUR_API_KEY:YOUR_NEW_API_SECRET@YOUR_CLOUD_NAME`.
3. Restart `npm run dev` and open the app through `localhost` or `127.0.0.1`.
4. Login → Continue → Profile → Chọn ảnh → Lưu ảnh.

The original credentials are intentionally not embedded in source or example files. `.env.local` is ignored by Git. Do not use a `VITE_` prefix for secrets.

The development endpoint `/api/avatar/sign` signs server-selected upload parameters using Node crypto. The browser resizes the image, uploads it directly to Cloudinary, and saves the returned HTTPS URL per account locally. Header, sidebar and Profile refresh together. JPG/PNG/WebP up to 5 MB are accepted; output is resized to at most 512 pixels. Failed uploads preserve the previous avatar. Deleting an avatar resets the local profile; it does not delete assets from Cloudinary.

This endpoint only runs in Vite development and only accepts same-origin localhost requests. Production builds need an authenticated backend implementing the same response contract, upload quotas, and persistent per-user profile records. The current Continue flow is a demo session, not real authentication.

Reference: https://cloudinary.com/documentation/authentication_signatures
