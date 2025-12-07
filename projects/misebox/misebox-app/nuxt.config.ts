import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

const baseConfig = createFireuxConfig({
  appName: 'Misebox',
  appShortName: 'Misebox',
  appDescription: 'Workhub for Misebox creative operations and collaborators.',
  ecosystem: 'misebox',
  modules: [
    'fireux-misebox',
    'fireux-ecosystem-controller',
    'fireux-products',
    'fireux-blogs',
  ],
  role: 'global',
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
