import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages sirve el sitio bajo /<repo>/ (no en /)
  // Debe coincidir EXACTAMENTE con el nombre del repositorio.
  base: '/chess-puzzle/',
})
