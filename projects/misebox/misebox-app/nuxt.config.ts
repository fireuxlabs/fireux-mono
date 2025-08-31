import { defineNuxtConfig } from 'nuxt/config'
import { createBaseNuxtConfig } from 'fireux-core/config/app/base-nuxt.config'

export default defineNuxtConfig(
  createBaseNuxtConfig({
    modules: ['fireux-misebox', 'fireux-jobs'],
    ecosystem: 'misebox',
    appName: process.env.APP_NAME,
    appShortName: process.env.APP_SHORT_NAME,
    primaryColor: process.env.APP_PRIMARY_COLOR,
    neutralColor: process.env.APP_NEUTRAL_COLOR,
    port: 3001,
  })
)
