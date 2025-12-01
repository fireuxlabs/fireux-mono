import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

export default defineNuxtConfig(<NuxtConfig>{
  ...createFireuxConfig({
    appName: 'FireUX Tenant',
    appShortName: 'Tenant',
    ecosystem: 'fireux',
    modules: ['fireux-fireux'],
    role: 'tenant',
    pwa: {
      manifest: {
        icons: [
          {
            src: '/img/app/pwa/tennant-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/img/app/pwa/tennant-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    },
    nitro: {
      firebase: {
        serverFunctionName: 'tennantServer',
      },
    },
  }),
})
