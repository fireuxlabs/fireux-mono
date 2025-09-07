import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

export default defineNuxtConfig(<NuxtConfig>{
  ...createFireuxConfig({
    appName: 'Niederhorn',
    appShortName: 'Niederhorn',
    ecosystem: 'misebox',
    modules: ['fireux-misebox'],
  }),
})
