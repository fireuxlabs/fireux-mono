import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

export default defineNuxtConfig(<NuxtConfig>{
  ...createFireuxConfig({
    appName: 'Richies',
    appShortName: 'Richies',
    ecosystem: 'cleanbox',
    modules: ['fireux-cleanbox', 'fireux-jobs'],
    role: 'tenant',
    pwa: {
      manifest: {
        name: 'Richies Reinigung',
        short_name: 'Richies',
        description:
          'Freelance cleaning partner for Zürich apartments, studios, and office loops.',
        icons: [
          {
            src: '/img/app/pwa/richies-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/img/app/pwa/richies-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    },
    nitro: {
      firebase: {
        serverFunctionName: 'richiesReinigungServer',
      },
    },
  }),
})
