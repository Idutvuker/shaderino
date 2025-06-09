import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/shaderino/',
  server: {
    port: 80,
    host: true, // Listen on all network interfaces for LAN access
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MB
      },
      manifest: {
        name: 'Shaderino',
        short_name: 'Shaderino',
        start_url: '/shaderino/',
        display: 'fullscreen', // Enable fullscreen PWA mode
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
          {
            src: '/shaderino/vite.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: '/shaderino/vite.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          }
        ]
      }
    })
  ]
});
