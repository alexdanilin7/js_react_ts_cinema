import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './js_react_ts_cinema/',
  plugins: [react()],
})
