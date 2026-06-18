import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Deployed under https://julio0029.github.io/Axone-dashboard/
export default defineConfig({
  base: '/Axone-dashboard/',
  plugins: [react(), tailwindcss()],
})
