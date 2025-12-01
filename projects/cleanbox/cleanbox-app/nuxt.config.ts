import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

export default defineNuxtConfig(<NuxtConfig>{
  ...createFireuxConfig({
    appName: 'Cleanbox',
    appShortName: 'Cleanbox',
    ecosystem: 'cleanbox',
    modules: ['fireux-cleanbox', 'fireux-jobs'],
    role: 'global',
    pwa: {
      manifest: {
        icons: [
          {
            src: '/img/app/pwa/cleanbox-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/img/app/pwa/cleanbox-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    },
    nitro: {
      firebase: {
        serverFunctionName: 'cleanboxServer',
      },
    },
  }),
})
