import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import postsPlugin from './plugins/posts-plugin.ts'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    mdx(),
    react({ include: /\.(jsx|tsx|mdx)$/ }),
    tailwindcss(),
    postsPlugin({ postsPath: './posts' }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
