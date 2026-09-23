import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import { cloudinaryDevPlugin } from './server/cloudinary.js'
import { weatherPlugin } from './server/weather.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // This variable is read by Node only. Never expose it via define or VITE_*.
  const env = loadEnv(mode, process.cwd(), ['CLOUDINARY_', 'PUBLIC_OPENWEATHER_']);
  return { plugins: [react(), tailwindcss(), cloudinaryDevPlugin(env.CLOUDINARY_URL), weatherPlugin(env)] };
})
