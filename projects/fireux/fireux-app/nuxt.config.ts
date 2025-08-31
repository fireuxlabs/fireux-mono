import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createBaseNuxtConfig } from 'fireux-core/config/app/base-nuxt.config'

const config: NuxtConfig = defineNuxtConfig(
  createBaseNuxtConfig({
    modules: ['fireux-core'],
    ecosystem: 'fireux',
    appName: process.env.APP_NAME ?? 'FireUX',
    appShortName: process.env.APP_SHORT_NAME ?? 'FireUX',
    primaryColor: process.env.APP_PRIMARY_COLOR ?? '#EAB308',
    neutralColor: process.env.APP_NEUTRAL_COLOR,
    port: 3000,
  })
)

export default config
