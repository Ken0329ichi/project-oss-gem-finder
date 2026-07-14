import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',  // GitHub Pages デプロイ時のアセット404エラー（絶対パスずれ）を防ぐための相対パス設定
  server: {
    port: 5173,
    host: true
  }
})
