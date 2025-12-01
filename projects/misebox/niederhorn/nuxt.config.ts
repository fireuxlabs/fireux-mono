import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

export default defineNuxtConfig(<NuxtConfig>{
  ...createFireuxConfig({
    appName: 'Niederhorn',
    appShortName: 'Niederhorn',
    ecosystem: 'misebox',
    modules: ['fireux-misebox'],
    role: 'tenant',
    pwa: {
      manifest: {
        icons: [
          {
            src: '/img/app/pwa/niederhorn-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/img/app/pwa/niederhorn-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    },
    nitro: {
      firebase: {
        serverFunctionName: 'niederhornServer',
      },
    },
  }),
})
