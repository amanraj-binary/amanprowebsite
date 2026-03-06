import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false, // 🛡️ यह आपके असली कोड और कमेंट्स को 'Inspect' से पूरी तरह छुपा देगा
  },
})