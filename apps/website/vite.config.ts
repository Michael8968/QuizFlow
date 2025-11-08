import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
    },
  },
  server: {
    port: 3003,
    // 确保所有路由都返回 index.html（SPA 回退）
    // 防止直接访问源文件路径时出错
    fs: {
      strict: false,
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})

