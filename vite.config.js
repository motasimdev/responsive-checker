import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Plain static React app: `npm run build` produces dist/, which Vercel serves as-is.
// No server code, no proxy. Port 5199 only matters if you run it locally; it keeps
// 3000 / 5173 free for your own project.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5199 },
  preview: { port: 5199 },
})
