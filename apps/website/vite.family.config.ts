import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  root: '.',
  resolve: { alias: { '@': resolve(__dirname, './src') } },
  build: {
    outDir: 'dist/docs/privileged/family/dashboard',
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/family-dashboard/index.html'),
    },
  },
})


