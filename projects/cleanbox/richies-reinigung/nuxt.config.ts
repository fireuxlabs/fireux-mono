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

  modules: [
    'fireux-core',
    'fireux-jobs',
    'fireux-cleanbox',
    '@nuxt/content',
    [
      '@vite-pwa/nuxt',
      {
        registerType: 'autoUpdate',
        manifest: {
          name: process.env.APP_NAME || 'Richies Reinigung',
          short_name: process.env.APP_SHORT_NAME || 'Rich',
          start_url: '/',
          display: 'standalone',
          theme_color: process.env.APP_PRIMARY_COLOR
            ? `#${process.env.APP_PRIMARY_COLOR}`
            : '#3B82F6',
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

  runtimeConfig: {
    public: {
      tenantId: 'richies-reinigung',
      siteUrl:
        process.env.NUXT_PUBLIC_SITE_URL ||
        'https://richies-reinigung.cleanbox.app',
      app: {
        name: 'Richies Reinigung',
        description: 'Professional Cleaning Services',
        type: 'cleanbox',
      },
    },
  },

  nitro: {
    preset: 'firebase',
    firebase: {
      gen: 2,
    },
  },

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'Richies Reinigung - Professional Cleaning Services',
      meta: [
        {
          name: 'description',
          content:
            'Premium cleaning services with German precision and reliability. Professional cleaners for homes and businesses.',
        },
      ],
    },
  },

  typescript: { typeCheck: false },
})
