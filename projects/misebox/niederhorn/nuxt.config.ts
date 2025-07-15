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
    // Assets are now automatically included by fireux-core module
  ],
  modules: [
    'fireux-core',
    'fireux-jobs',
    'fireux-misebox',
    '@nuxt/content',
    [
      '@vite-pwa/nuxt',
      {
        registerType: 'autoUpdate',
        manifest: {
          name: process.env.APP_NAME || 'Niederhorn',
          short_name: process.env.APP_SHORT_NAME || 'Niederhorn',
          start_url: '/',
          display: 'standalone',
          theme_color: process.env.APP_PRIMARY_COLOR
            ? `#${process.env.APP_PRIMARY_COLOR}`
            : '#8B5CF6',
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
        admin: {
          serviceAccount: './config/firebase-service-account.json',
        },
        auth: {
          enabled: true,
        },
      },
    ],
    '@nuxt/ui',
  ],
  nitro: {
    preset: 'firebase',
    firebase: {
      gen: 2,
      nodeVersion: '22',
    },
  },
  runtimeConfig: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    public: {
      appName: process.env.APP_NAME || 'Niederhorn',
      appShortName: process.env.APP_SHORT_NAME || 'Niederhorn',
      appDescription:
        process.env.APP_DESCRIPTION || 'Premium culinary marketplace',
      appVersion: process.env.APP_VERSION || '1.0.0',
      primaryColor: process.env.APP_PRIMARY_COLOR || '8B5CF6',
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    },
  },
})
