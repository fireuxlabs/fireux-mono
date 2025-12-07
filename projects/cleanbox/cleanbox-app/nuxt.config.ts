import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

export default defineNuxtConfig(<NuxtConfig>{
  ...createFireuxConfig({
    appName: 'Cleanbox',
    appShortName: 'Cleanbox',
    appDescription: 'Operations console for Cleanbox partners and teams.',
    ecosystem: 'cleanbox',
    modules: ['fireux-cleanbox', 'fireux-products', 'fireux-blogs'],
    role: 'global',
    nitro: {
      firebase: {
        serverFunctionName: 'cleanboxServer',
      },
    },
  }),
})
