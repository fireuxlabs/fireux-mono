import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

export default defineNuxtConfig(<NuxtConfig>{
  ...createFireuxConfig({
    appName: 'FireUX',
    appShortName: 'FireUX',
    ecosystem: 'fireux',
    modules: ['fireux-fireux'],
  }),
})
