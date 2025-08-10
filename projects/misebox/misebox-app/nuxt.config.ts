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

  // Explicitly configure SSR to be consistent
  ssr: true,

  modules: [
    'fireux-core',
    'fireux-jobs',
    'fireux-misebox',
    '@nuxt/content',
    '@nuxt/ui',
    [
      '@vite-pwa/nuxt',
      {
        registerType: 'autoUpdate',
        devOptions: {
          enabled: false,
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
          measurementId: process.env.FIREBASE_MEASUREMENT_ID,
        },
        auth: {
          enabled: true,
          ssr: true,
        },
        admin: {
          serviceAccount: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        },
      },
    ],
  ],

  nitro: {
    preset: 'firebase',
    firebase: {
      gen: 2,
    },
  },
})
