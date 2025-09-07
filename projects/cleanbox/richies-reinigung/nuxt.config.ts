import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

export default defineNuxtConfig(<NuxtConfig>{
  ...createFireuxConfig({
    appName: 'Richies',
    appShortName: 'Richies',
    ecosystem: 'cleanbox',
    modules: ['fireux-cleanbox', 'fireux-jobs'],
  }),
})
