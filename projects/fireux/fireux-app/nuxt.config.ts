import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2025-06-07',
  srcDir: 'app/',
  dir: {
    public: '../public',
  },
  imports: {
    dirs: ['composables/**', 'models/**', 'utils/**'],
  },
  css: [
    'fireux-core/assets/css/main.css',
    'fireux-core/assets/design-system/main.scss',
  ],
  nitro: {
    preset: 'firebase',
    firebase: {
      gen: 2,
      nodeVersion: '22',
    },
  },
  modules: [
    'fireux-core',
    '@nuxt/content',
    [
      '@vite-pwa/nuxt',
      {
        registerType: 'autoUpdate',
        manifest: {
          name: 'FireUX App',
          short_name: 'FireUX',
          start_url: '/',
          display: 'standalone',
          theme_color: '#1f2937',
          background_color: '#ffffff',
          icons: [
            {
              src: '/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable',
            },
            {
              src: '/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          navigateFallback: '/',
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          globPatterns: ['**/*.{js,css,html,png,svg,ico,json,txt,woff2}'],
        },
        devOptions: {
          enabled: process.env.NODE_ENV === 'development',
          suppressWarnings: true,
          navigateFallbackAllowlist: [/^\/$/],
          type: 'module',
        },
      },
    ],
    [
      'nuxt-vuefire',
      {
        config: {
          apiKey: process.env.FIREBASE_API_KEY,
          authDomain: process.env.FIREBASE_AUTH_DOMAIN,
          projectId: process.env.FIREBASE_PROJECT_ID,
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.FIREBASE_APP_ID,
        },
        auth: { enabled: true },
      },
    ],
    '@nuxt/ui',
  ],
})
