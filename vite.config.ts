import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'VITE_');
  const isProduction = mode === 'production';

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      ...(isProduction ? {} : {
        proxy: {
          '/api': {
            target: 'http://localhost:5000',
            changeOrigin: true,
            configure: (proxy, _options) => {
              proxy.on('error', (err, _req, res) => {
                // Silently return 503 instead of letting it result in a 500/proxy error log
                if (!res.headersSent) {
                  res.writeHead(503, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'Backend server is offline', code: 'ECONNREFUSED' }));
                }
              });
            },
          }
        }
      })
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'pwa-512x512.png'],
        manifest: {
          name: 'Citrus Expense Tracker',
          short_name: 'Citrus',
          description: 'A premium, modern expense tracker with citrus vibes.',
          theme_color: '#ff8c00',
          background_color: '#050505',
          display: 'standalone',
          start_url: '/',
          orientation: 'portrait',
          icons: [
            {
              src: 'pwa-512x512.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
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
                  maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        },
        devOptions: {
          enabled: true,
          type: 'module'
        }
      })
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
      'process.env.API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL || (isProduction ? 'https://citrus-expense-tracker.vercel.app/api' : '/api')),
      'process.env.FIREBASE_API_KEY': JSON.stringify(env.VITE_FIREBASE_API_KEY),
      'process.env.FIREBASE_AUTH_DOMAIN': JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN),
      'process.env.FIREBASE_PROJECT_ID': JSON.stringify(env.VITE_FIREBASE_PROJECT_ID),
      'process.env.FIREBASE_STORAGE_BUCKET': JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET),
      'process.env.FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID),
      'process.env.FIREBASE_APP_ID': JSON.stringify(env.VITE_FIREBASE_APP_ID)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },

    // Production build optimizations
    build: {
      // Target modern browsers for smaller bundles
      target: 'es2020',

      // Enable minification
      minify: 'esbuild',

      // CSS code splitting
      cssCodeSplit: true,

      // Chunk size warnings at 500KB
      chunkSizeWarningLimit: 500,

      // Manual chunk splitting for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks - split large libraries
            'vendor-charts': ['recharts'],
            'vendor-icons': ['lucide-react'],
            'vendor-utils': ['axios', 'react-window', 'react-virtualized-auto-sizer'],
          },
          // Optimize chunk file names
          chunkFileNames: isProduction
            ? 'assets/[name]-[hash].js'
            : 'assets/[name].js',
          entryFileNames: isProduction
            ? 'assets/[name]-[hash].js'
            : 'assets/[name].js',
          assetFileNames: isProduction
            ? 'assets/[name]-[hash].[ext]'
            : 'assets/[name].[ext]',
        },
      },

      // Enable source maps for debugging (disable in prod for smaller bundles)
      sourcemap: !isProduction,
    },

    // Optimize dependencies
    optimizeDeps: {
      include: ['react', 'react-dom', 'recharts', 'lucide-react', 'axios'],
    },

    // Enable CSS minification
    css: {
      devSourcemap: true,
    },
  };
});
