import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'], // Nomes dos seus ícones
      manifest: {
        name: 'Diário Alimentar',
        short_name: 'Diário',
        description: 'Seu app para controle de alimentação',
        theme_color: '#14b8a6', // Cor da barra do topo do celular (Teal do Tailwind)
        background_color: '#f9fafb',
        display: 'standalone', // Faz abrir em tela cheia, como um app nativo
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})