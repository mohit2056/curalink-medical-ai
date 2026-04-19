import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['logo.png'], // 🔥 Tera asli logo
      manifest: {
        name: 'Curalink AI Medical Assistant',
        short_name: 'Curalink',
        description: 'Your Calming Medical Assistant',
        theme_color: '#d81b60',
        background_color: '#ffe6ea',
        display: 'standalone',
        icons: [
          {
            src: '/logo.png', // 🔥 SVG hata ke PNG kar diya
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/logo.png', // 🔥 SVG hata ke PNG kar diya
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      devOptions: { 
        enabled: false 
      }
    })
  ],
})