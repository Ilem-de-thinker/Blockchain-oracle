import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        tailwindcss(),
        react(),
        VitePWA({
          registerType: 'prompt',
          includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
          devOptions: {
            enabled: true,
            type: 'module',
          },
          manifest: {
            name: 'Blo|kChain Oracle',
            short_name: 'Oracle',
            description: 'Enterprise Blockchain Oracle Platform',
            theme_color: '#111827',
            background_color: '#111827',
            display: 'standalone',
            orientation: 'portrait',
            start_url: '/',
            scope: '/',
            icons: [
              {
                src: '/Logo/favicon/android-chrome-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: '/Logo/favicon/android-chrome-512x512.png',
                sizes: '512x512',
                type: 'image/png'
              },
              {
                src: '/Logo/favicon/android-chrome-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              }
            ]
          },
          workbox: {
            cacheId: 'blockchain-oracle',
            globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,avif,woff2,json}'],
            cleanupOutdatedCaches: true,
            clientsClaim: true,
            skipWaiting: false, // Keep false because we use prompt
            navigateFallback: '/index.html',
            maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'google-fonts-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365
                  },
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              },
              {
                urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'gstatic-fonts-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365
                  },
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              },
              {
                urlPattern: /^https:\/\/cdnjs\.cloudflare\.com\/.*/i,
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'external-resources',
                  expiration: {
                    maxEntries: 20,
                    maxAgeSeconds: 60 * 60 * 24 * 30
                  },
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              }
            ]
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});