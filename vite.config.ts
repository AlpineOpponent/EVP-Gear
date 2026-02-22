import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['evp.logo.dark.svg', 'evp.logo.light.svg', 'evp.logo.nature.svg', 'robots.txt'],
      manifest: {
        name: 'EVP-Gear | Backpacking Database',
        short_name: 'EVP-Gear',
        description: 'A modular, local-first web application designed for precise gear management and pack planning.',
        theme_color: '#0A0A0B',
        background_color: '#0A0A0B',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/evp.logo.dark.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,json,png}'],
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB to accommodate large JS chunks and brand logos
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 3000, // Suppress the 500kb warning since we are a heavy local-first app
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-hook-form', 'zod', 'zustand'],
          pdf: ['@react-pdf/renderer'],
          charts: ['@nivo/pie', '@nivo/core'],
        }
      }
    }
  }
})
