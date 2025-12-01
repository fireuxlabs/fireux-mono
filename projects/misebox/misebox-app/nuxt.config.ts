import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

const baseConfig = createFireuxConfig({
  appName: 'Misebox',
  appShortName: 'Misebox',
  ecosystem: 'misebox',
  modules: ['fireux-misebox'],
  role: 'global',
  pwa: {
    manifest: {
      icons: [
        {
          src: '/img/app/pwa/misebox-icon-192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable',
        },
        {
          src: '/img/app/pwa/misebox-icon-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    },
  },
  nitro: {
    firebase: {
      serverFunctionName: 'miseboxServer',
    },
  },
})

export default defineNuxtConfig(<NuxtConfig>{
  ...baseConfig,
  css: [...(baseConfig.css ?? []), '@/assets/styles/main.css'],
})
