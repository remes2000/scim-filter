import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@scim-filter/jspredicate': path.resolve(__dirname, '../../packages/jspredicate/src/index.ts'),
      '@scim-filter/parse': path.resolve(__dirname, '../../packages/parse/src/index.ts'),
    },
  },
})
