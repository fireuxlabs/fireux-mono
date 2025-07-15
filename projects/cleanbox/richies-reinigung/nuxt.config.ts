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
