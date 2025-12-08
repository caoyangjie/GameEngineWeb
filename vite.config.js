import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:18080/gameweb',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    // 保留 source map 方便在 Cursor/浏览器中断点调试
    sourcemap: true
  }
})

