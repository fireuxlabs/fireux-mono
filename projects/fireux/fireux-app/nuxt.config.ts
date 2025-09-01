import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core/config/app/fireux-config'

const config: NuxtConfig = defineNuxtConfig({
  ...createFireuxConfig({
    modules: [],
    ecosystem: 'fireux',
    appName: process.env.APP_NAME ?? 'FireUX',
    appShortName: process.env.APP_SHORT_NAME ?? 'FireUX',
    primaryColor: process.env.APP_PRIMARY_COLOR ?? '#EAB308',
    neutralColor: process.env.APP_NEUTRAL_COLOR,
  }),
})

export default config
