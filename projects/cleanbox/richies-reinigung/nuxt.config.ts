import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

export default defineNuxtConfig(<NuxtConfig>{
  ...createFireuxConfig({
    appName: 'Richies',
    appShortName: 'Richies',
    appDescription:
      'Freelance cleaning partner for Zürich apartments, studios, and office loops.',
    ecosystem: 'cleanbox',
    modules: ['fireux-cleanbox'],
    role: 'tenant',
    nitro: {
      firebase: {
        serverFunctionName: 'richiesReinigungServer',
      },
    },
  }),
})
