import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages sirve el sitio bajo /<repo>/ (no en /)
  // Cambia "Chess-Puzzle" si tu repositorio tiene otro nombre.
  base: '/Chess-Puzzle/',
})
