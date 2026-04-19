import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'Curalink AI Medical Assistant',
        short_name: 'Curalink',
        description: 'Your Calming Medical Assistant',
        theme_color: '#ffb6c1',
        background_color: '#ffe6ea',
        display: 'standalone',
        icons: [
          {
            src: '/vite.svg', // Default vite icon use kar rahe hain
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: '/vite.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      },
      // 🔥 THE ROOT CAUSE FIX 🔥
      // Isko false karne se localhost par faltu errors nahi aayengi, 
      // par Vercel par PWA ekdum perfect banegi!
      devOptions: { 
        enabled: false 
      }
    })
  ],
})